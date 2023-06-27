import {I8080} from "../cpu/i8080.js";
import {M6800} from "../cpu/m6800.js";
import { DUMMY, DUMMYE } from "../cpu/dummy.js";

import fs from "fs";

import { pass1 } from "../pass1.js";
import {pass2} from "../pass2.js";

//QUnit test for parser.js

import QUnit from "qunit";

import * as Parser from "../parser.js";

QUnit.module('pass2');

let asmI8080 = fs.readFileSync("./test/suite/test.a80","utf-8");
let asmM6800 = fs.readFileSync("./test/suite/test.a68","utf-8");
let asmDUMMY = fs.readFileSync("./test/suite/test.dummy","utf-8");
const fileGet = (filename) => {
    //console.log("INCLUDE", filename)
    return `nop
    .block blk
    oma: dw 1
    .endblock`
}

const doPass = (data, showError=false, assembler=I8080) => {
    let opts = {assembler, fileGet, PRAGMAS:[], endian:false}
    try {
        let o = Parser.parse(data, opts);
    //console.log("BEUAbc",o)
    let vx = pass1(o, null, opts)
    vx = pass1(vx[0], vx[1], opts);
    vx = pass1(vx[0], vx[1], opts);
    vx = pass1(vx[0], vx[1], opts);
    vx = pass1(vx[0], vx[1], opts);

    vx[1]["__PRAGMAS"] = opts.PRAGMAS;
    //console.log(ASM.PRAGMAS,vx[1])
    vx = pass2(vx, opts);

    if (showError==2) console.log(vx)
    return vx
    } catch (e) {
        if (showError)console.log(e)
        if (e.e) throw e.e
        throw e
    }
}

QUnit.test('basic 8080', assert => {
    doPass(asmI8080, true, I8080)
    assert.ok(true)
});

QUnit.test('basic 6800', assert => {
    doPass(asmM6800, true, M6800)
    assert.ok(true)
});


QUnit.test('basic dummy', assert => {
    doPass(asmDUMMY, true, DUMMY)
    assert.ok(true)
});

QUnit.test('basic dummy-endian', assert => {
    doPass(asmDUMMY, true, DUMMYE)
    assert.ok(true)
});

QUnit.test('EQU without label', assert => {
    assert.throws(() => {
        doPass(`equ 123`, false, DUMMY)
    },(err) => err.msg === "EQU without label")
});
