import QUnit from "qunit";

import { I8080 } from "../cpu/i8080.js";
import * as Parser from "../parser.js";
import { pass1 } from "../pass1.js";
import { pass2 } from "../pass2.js";
import { lst } from "../listing.js";
import { objCode } from "../objcode.js";

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
