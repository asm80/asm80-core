import {I8080} from "../cpu/i8080.js";

import fs from "fs";

import { pass1 } from "../pass1.js";

//QUnit test for parser.js

import QUnit from "qunit";

import * as Parser from "../parser.js";

import { asyncThrows } from "./_asyncThrows.js";

QUnit.module('pass1');


let data = fs.readFileSync("./test/suite/test.a80","utf-8");
const fileGet = (filename) => {
    //console.log("INCLUDE", filename)
    return `nop
    .block blk
    oma: dw 1
    .endblock`
}

const doPass = async (data, showError=false) => {
    let opts = {assembler:I8080, fileGet}
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
