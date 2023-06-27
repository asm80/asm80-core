import {I8080} from "../cpu/i8080.js";

import fs from "fs";

import { pass1 } from "../pass1.js";

//QUnit test for parser.js

import QUnit from "qunit";

import * as Parser from "../parser.js";

QUnit.module('pass1');

let data = fs.readFileSync("./test/suite/test.a80","utf-8");
const fileGet = (filename) => {
    //console.log("INCLUDE", filename)
    return `nop
    .block blk
    oma: dw 1
    .endblock`
}

const doPass = (data, showError=false) => {
    let opts = {assembler:I8080, fileGet}
    try {
        let o = Parser.parse(data, opts);
    //console.log("BEUAbc",o)
    let vx = pass1(o, null, opts)
    vx = pass1(vx[0], vx[1], opts);
    vx = pass1(vx[0], vx[1], opts);
    vx = pass1(vx[0], vx[1], opts);
    vx = pass1(vx[0], vx[1], opts);
    if (showError)console.log(vx)
    return vx
    } catch (e) {
        if (showError)console.log(e)
        throw e
    }
}

QUnit.test('basic', assert => {
    doPass(data)
    assert.ok(true)
});

QUnit.test('ENDIF without IF', assert => {
    assert.throws(() => {
        doPass(`.endif`)
    },  (err) => err.msg === "ENDIF without IF")
});

QUnit.test('ELSE without IF', assert => {
    assert.throws(() => {
        doPass(`.else`)
    },  (err) => err.msg === "ELSE without IF")
});

QUnit.test('PHASE cannot be nested', assert => {
    assert.throws(() => {
        doPass(`.phase 100
        .phase 200
        .dephase
        .dephase`)
    },  (err) => err.msg === "PHASE cannot be nested")
});

QUnit.test('Delimiters does not match', assert => {
    assert.throws(() => {
        doPass(`FCC .HELLO!`)
    }, (err) => err.msg === "Delimiters does not match")
});

QUnit.test('DS / RMB needs a numerical parameter', assert => {
    assert.throws(() => {
        doPass(`ds "hello"`)
    }, (err) => err.msg === "DS / RMB needs a numerical parameter")
});

/*
QUnit.test('Redefine label', assert => {
    assert.throws(() => {
        doPass(`.org 0
        label1: DB 1
        nop
        label1: FCC .HELLO.`, true)
    },  console.log)
});
*/