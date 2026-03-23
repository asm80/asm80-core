import {I8080} from "../cpu/i8080.js";

import fs from "fs";

import { pass1 } from "../pass1.js";

//QUnit test for parser.js

import QUnit from "qunit";

import * as Parser from "../parser.js";

import { asyncThrows } from "./_asyncThrows.js";

QUnit.module('pass1');


let data = fs.readFileSync("./test/suite/test.a80","utf-8");
const readFile = (filename) => {
    //console.log("INCLUDE", filename)
    return `nop
    .block blk
    oma: dw 1
    .endblock`
}

const doPass = async (data, showError=false) => {
    let opts = {assembler:I8080, readFile}
    try {
        
        let o = await Parser.parse(data, opts);
    //console.log("BEUAbc",o)
    let vx = await pass1(o, null, opts)
    vx = await pass1(vx[0], vx[1], opts);
    vx = await pass1(vx[0], vx[1], opts);
    vx = await pass1(vx[0], vx[1], opts);
    vx = await pass1(vx[0], vx[1], opts);
    if (showError==2)console.log(vx)
    return vx
    } catch (e) {
        if (showError)console.log(e)
        throw e
    }
}

QUnit.test('basic', async assert => {
    await doPass(data)
    assert.ok(true)
});

QUnit.test('ENDIF without IF', async assert => {
    asyncThrows(assert,() => {
        return doPass(`.endif`)
    },  (err) => err.msg === "ENDIF without IF")
});

QUnit.test('ELSE without IF', async assert => {
    asyncThrows(assert,() => {
        return doPass(`.else`)
    },  (err) => err.msg === "ELSE without IF")
});

QUnit.test('PHASE cannot be nested', async assert => {
    asyncThrows(assert,() => {
        return doPass(`.phase 100
        .phase 200
        .dephase
        .dephase`)
    },  (err) => err.msg === "PHASE cannot be nested")
});

QUnit.test('Delimiters does not match', async assert => {
    asyncThrows(assert,() => {
        return doPass(`FCC .HELLO!`)
    }, (err) => err.msg === "Delimiters does not match")
});

QUnit.test('DS / RMB needs a numerical parameter', async assert => {
    asyncThrows(assert,() => {
        return doPass(`ds "hello"`)
    }, (err) => err.msg === "DS / RMB needs a numerical parameter")
});
QUnit.test('DB in BSS', async assert => {
    asyncThrows(assert,() => {
        return doPass(`.bsseg
        db "hello"`)
    }, (err) => err.msg === "DB is not allowed in BSSEG")
});

/*
QUnit.test('IF NaN', async assert => {
    asyncThrows(assert,() => {
        return doPass(`.if nofu(3)
        db "hello
        .endif"`, 2)
    }, (err) => err.msg === "DB is not allowed in BSSEG")
});
*/


QUnit.test('Redefine label', async assert => {
    asyncThrows(assert, () => {
        return doPass(`.org 0
        label1: DB 1
        nop
        label1: FCC .HELLO.`, false)
    },  (err) => err.msg === "Redefine label LABEL1 at line 4")
});

// ─── Module-related tests ───────────────────────────────────────────────────

const MODULE_OPTS = { assembler: I8080, readFile, PRAGMAS: ["MODULE"] };

const doPassOpts = async (src, opts, showError = false) => {
    try {
        let o = await Parser.parse(src, opts);
        let vx = await pass1(o, null, opts);
        vx = await pass1(vx[0], vx[1], opts);
        return vx;
    } catch (e) {
        if (showError) console.log(e);
        throw e;
    }
};

QUnit.test('.EXPORT is valid inside a module', async assert => {
    const vx = await doPassOpts(
        `.pragma module\n.export MYFUNC\nMYFUNC: nop`,
        MODULE_OPTS
    );
    assert.ok(vx, '.EXPORT accepted in module context');
});

QUnit.test('.EXPORT throws outside a module', async assert => {
    // needs opts.PRAGMAS to be set but not contain "MODULE"
    asyncThrows(assert, () => doPassOpts(`.export MYFUNC`, { assembler: I8080, readFile, PRAGMAS: [] }),
        (err) => err.msg === '.EXPORT is not allowed out of modules');
});

QUnit.test('.EXTERN is valid inside a module', async assert => {
    const vx = await doPassOpts(
        `.pragma module\n.extern EXTFUNC\nnop`,
        MODULE_OPTS
    );
    assert.ok(vx, '.EXTERN accepted in module context');
});

QUnit.test('.EXTERN throws outside a module', async assert => {
    asyncThrows(assert, () => doPassOpts(`.extern EXTFUNC`, { assembler: I8080, readFile, PRAGMAS: [] }),
        (err) => err.msg === '.EXTERN is not allowed out of modules');
});

QUnit.test('.PHASE throws inside a module (notInModule)', async assert => {
    asyncThrows(assert, () => doPassOpts(
        `.pragma module\n.phase 100\nnop\n.dephase`,
        MODULE_OPTS
    ), (err) => err.msg === 'Not allowed in modules');
});

QUnit.test('ALIGN throws inside a module (notInModule)', async assert => {
    asyncThrows(assert, () => doPassOpts(
        `.pragma module\nnop\n.align 4`,
        MODULE_OPTS
    ), (err) => err.msg === 'Not allowed in modules');
});

QUnit.test('ORG throws inside a module', async assert => {
    asyncThrows(assert, () => doPassOpts(
        `.pragma module\n.org 0x100`,
        MODULE_OPTS
    ), (err) => err.msg === 'ORG is not allowed in modules');
});

QUnit.test('EQU with unsatisfied forward ref sets label to null', async assert => {
    // On the first pass, UNKNOWN_SYM is not yet defined → Parser.evaluate throws
    // → catch sets vars[label] = null (forward-reference placeholder)
    const src = `MYVAL: equ UNKNOWN_SYM\nnop`;
    const o = await Parser.parse(src, { assembler: I8080, readFile });
    const vx = await pass1(o, null, { assembler: I8080, readFile });
    // MYVAL should be null (unsatisfied) after first pass
    assert.strictEqual(vx[1]['MYVAL'], null, 'unsatisfied EQU → null on first pass');
});

// ─── .INCBIN error paths ────────────────────────────────────────────────────

QUnit.test('.INCBIN without filename throws', async assert => {
    asyncThrows(assert, () => doPass(`.incbin`),
        (err) => /No file name given/.test(err.msg));
});

QUnit.test('.INCBIN with missing file throws', async assert => {
    const opts = {
        assembler: I8080,
        readFile: (_name, binary) => binary ? null : ''   // binary file not found → null
    };
    asyncThrows(assert, () => doPassOpts(`.incbin notexist.bin`, opts),
        (err) => /Cannot find file/.test(err.msg));
});

// ─── "No opcode, possible missing" ─────────────────────────────────────────

QUnit.test('params without opcode throws "No opcode"', async assert => {
    // A line with only a label and params but no recognisable opcode triggers this
    asyncThrows(assert, () => doPass(`nop\n 0x42, 0x43`),
        (err) => /No opcode/.test(err.msg));
});
