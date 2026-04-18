import QUnit from "qunit";

import { asm } from "../asm.js";
import { I8080 } from "../cpu/i8080.js";
import * as Parser from "../parser.js";
import { pass1 } from "../pass1.js";
import { pass2 } from "../pass2.js";
import { lst } from "../listing.js";
import { objCode, linkModules } from "../objcode.js";

QUnit.module("debug-loc");

const readFile = () => "";

const compileAssembly = async (source) => {
    const opts = {
        assembler: I8080,
        readFile,
        PRAGMAS: [],
        endian: I8080.endian,
        xref: {}
    };

    let parsed = await Parser.parse(source, opts);
    let vx = await pass1(parsed, null, opts);
    vx = await pass1(vx[0], vx[1], opts);
    vx = await pass1(vx[0], vx[1], opts);
    vx = await pass1(vx[0], vx[1], opts);
    vx = await pass1(vx[0], vx[1], opts);
    vx[1].__PRAGMAS = opts.PRAGMAS;
    vx = pass2(vx, opts);

    return { dump: vx[0], vars: vx[1], opts };
};

const compileListing = async (source, compact = false) => {
    const assembled = await compileAssembly(source);
    return lst(assembled, false, compact);
};

QUnit.test("lst renders .loc marker with comment on tagged emitted line", async assert => {
    const listing = await compileListing(`.file 1 "main.c"
.loc 1 9 ; i = 1
nop`);

    const line = listing.split("\n").find((entry) => entry.includes("NOP"));
    assert.ok(line, "instruction line rendered");
    assert.true(line.includes(".loc 1 9 ; i = 1"), "listing shows visible .loc marker");
});

QUnit.test("compact lst also renders .loc marker and keeps opcode visible", async assert => {
    const listing = await compileListing(`.file 1 "main.c"
.loc 1 12 ; once
nop`, true);

    const line = listing.split("\n").find((entry) => entry.includes("NOP"));
    assert.ok(line, "compact instruction line rendered");
    assert.true(line.includes("NOP"), "opcode remains present");
    assert.true(line.includes(".loc 1 12 ; once"), "compact listing shows .loc marker");
});

QUnit.test("objCode emits debug.files and merged dbg offsets", async assert => {
    const assembled = await compileAssembly(`.file 1 "main.c"
.loc 1 9 ; first
nop
.loc 1 12 ; second
nop`);
    const obj = objCode(assembled.dump, assembled.vars, assembled.opts, "debug-loc");

    assert.deepEqual(obj.debug, {
        files: [
            { id: 1, path: "main.c" }
        ]
    }, "object includes debug file table");
    assert.equal(obj.code.length, 1, "pure code instructions still merge");
    assert.deepEqual(obj.code[0].dbg, [
        { off: 0, fileId: 1, line: 9, comment: "first" },
        { off: 1, fileId: 1, line: 12, comment: "second" }
    ], "merged code item keeps shifted debug locations");
});

QUnit.test("linkModules emits absolute debug line starts", async assert => {
    const moduleA = await compileAssembly(`.pragma module
.file 1 "main.c"
.export main
main:
.loc 1 9 ; first
nop
.loc 1 12 ; second
nop`);
    const moduleB = await compileAssembly(`.pragma module
.file 4 "lib.c"
.export helper
helper:
.loc 4 27 ; helper
nop`);

    const objA = objCode(moduleA.dump, moduleA.vars, moduleA.opts, "module-a");
    const objB = objCode(moduleB.dump, moduleB.vars, moduleB.opts, "module-b");
    const linked = linkModules({
        endian: false,
        segments: { CSEG: "0x2000" },
        vars: {},
        entrypoint: "main"
    }, [objA, objB], []);

    assert.deepEqual(linked.debug, {
        files: [
            { id: 1, path: "main.c" },
            { id: 4, path: "lib.c" }
        ],
        lineStarts: [
            { addr: 0x2000, fileId: 1, line: 9, comment: "first" },
            { addr: 0x2001, fileId: 1, line: 12, comment: "second" },
            { addr: 0x2002, fileId: 4, line: 27, comment: "helper" }
        ]
    }, "linked debug contains absolute addresses with preserved file ids and lines");
});

QUnit.test("linkModules always returns debug envelope", async assert => {
    const moduleNoDebug = await compileAssembly(`.pragma module
.export main
main:
nop`);
    const obj = objCode(moduleNoDebug.dump, moduleNoDebug.vars, moduleNoDebug.opts, "module-nodbg");
    const linked = linkModules({
        endian: false,
        segments: { CSEG: "0x1000" },
        vars: {},
        entrypoint: "main"
    }, [obj], []);

    assert.deepEqual(linked.debug, {
        files: [],
        lineStarts: []
    }, "debug envelope exists even when there are no debug records");
});

QUnit.test("linkModules deduplicates debug files by file id", async assert => {
    const moduleA = await compileAssembly(`.pragma module
.file 1 "a.c"
.export main
main:
.loc 1 1
nop`);
    const moduleB = await compileAssembly(`.pragma module
.file 1 "b.c"
.export helper
helper:
.loc 1 2
nop`);
    const objA = objCode(moduleA.dump, moduleA.vars, moduleA.opts, "module-a");
    const objB = objCode(moduleB.dump, moduleB.vars, moduleB.opts, "module-b");
    const linked = linkModules({
        endian: false,
        segments: { CSEG: "0x3000" },
        vars: {},
        entrypoint: "main"
    }, [objA, objB], []);

    assert.deepEqual(linked.debug.files, [
        { id: 1, path: "a.c" }
    ], "file table keeps a single entry per file id");
    assert.equal(linked.debug.lineStarts.length, 2, "line starts from both modules are preserved");
});

QUnit.test("linkModules includes debug files from library modules pulled by extern resolution", async assert => {
    const mainModule = await compileAssembly(`.pragma module
.file 1 "main.c"
.extern helper
.export main
main:
.loc 1 1
nop
jmp helper`);
    const libModule = await compileAssembly(`.pragma module
.file 7 "lib.c"
.export helper
helper:
.loc 7 20
nop`);
    const mainObj = objCode(mainModule.dump, mainModule.vars, mainModule.opts, "main-module");
    const libObj = objCode(libModule.dump, libModule.vars, libModule.opts, "lib-module");
    const linked = linkModules({
        endian: false,
        segments: { CSEG: "0x4000" },
        vars: {},
        entrypoint: "main"
    }, [mainObj], [libObj]);

    assert.deepEqual(linked.debug.files, [
        { id: 1, path: "main.c" },
        { id: 7, path: "lib.c" }
    ], "debug file table includes library-provided module file");
    assert.deepEqual(linked.debug.lineStarts, [
        { addr: 0x4000, fileId: 1, line: 1 },
        { addr: 0x4004, fileId: 7, line: 20 }
    ], "line starts include both main and pulled library module");
});

QUnit.test("asm.lmap exports linked debug data as sidecar text", async assert => {
    const moduleA = await compileAssembly(`.pragma module
.file 1 "main.c"
.export main
main:
.loc 1 9 ; first
nop
.loc 1 12 ; second
nop`);
    const moduleB = await compileAssembly(`.pragma module
.file 4 "lib.c"
.export helper
helper:
.loc 4 27 ; helper
nop`);
    const linked = linkModules({
        endian: false,
        segments: { CSEG: "0x20A0" },
        vars: {},
        entrypoint: "main"
    }, [
        objCode(moduleA.dump, moduleA.vars, moduleA.opts, "module-a"),
        objCode(moduleB.dump, moduleB.vars, moduleB.opts, "module-b")
    ], []);

    assert.equal(asm.lmap(linked), `# files
file_id,path
1,main.c
4,lib.c

# lines
addr,file_id,line,comment
0x20A0,1,9,first
0x20A1,1,12,second
0x20A2,4,27,helper`, "lmap matches the expected sidecar text format");
});

QUnit.test("asm.lmap escapes commas and quotes in path and comment", assert => {
    const linked = {
        debug: {
            files: [
                { id: 7, path: 'src,"main".c' }
            ],
            lineStarts: [
                { addr: 0x4ABC, fileId: 7, line: 42, comment: 'call "puts", now' }
            ]
        }
    };

    assert.equal(asm.lmap(linked), `# files
file_id,path
7,"src,""main"".c"

# lines
addr,file_id,line,comment
0x4ABC,7,42,"call ""puts"", now"`, "CSV output escapes quotes and commas");
});

QUnit.test("asm.lmap emits headers when debug arrays are empty", assert => {
    const linked = {
        debug: {
            files: [],
            lineStarts: []
        }
    };

    assert.equal(asm.lmap(linked), `# files
file_id,path

# lines
addr,file_id,line,comment`, "empty debug still produces a valid envelope");
});
