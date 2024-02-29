import {I8080} from "../cpu/i8080.js";
import {M6800} from "../cpu/m6800.js";
import { DUMMY, DUMMYE } from "../cpu/dummy.js";
import {lst, html} from "../listing.js"

import fs from "fs";

import { pass1 } from "../pass1.js";
import {pass2} from "../pass2.js";
import { fileSystem} from "./_asyncFilesystem.js";
//console.log("FILE",fileSystem.fileGet)

//QUnit test for parser.js

import QUnit from "qunit";

const asyncThrows = (assert,fn) => {
    let done = assert.async();
    return new Promise((resolve, reject) => {
        fn().then(()=>{
            assert.ok(false)
            resolve()
            done()
        })
        .catch(e=>{
            assert.ok(true)
            resolve()
            done()
        })
    })

}

import * as Parser from "../parser.js";

QUnit.module('pass2');

let asmI8080 = fs.readFileSync("./test/suite/test.a80","utf-8");
let asmM6800 = fs.readFileSync("./test/suite/test.a68","utf-8");
let asmDUMMY = fs.readFileSync("./test/suite/test.dummy","utf-8");
let asmRELOCABLE = fs.readFileSync("./test/suite/relocable.a80","utf-8");



const doPass = async (data, showError=false, assembler=I8080, name="") => {
    let opts = {assembler, fileGet:fileSystem.fileGet , PRAGMAS:[], endian:assembler.endian,}
    
    try {
        let o = await Parser.parse(data, opts);
    //console.log("BEUAbc",o)
    let vx = await pass1(o, null, opts)
    vx = await pass1(vx[0], vx[1], opts);
    vx = await pass1(vx[0], vx[1], opts);
    vx = await pass1(vx[0], vx[1], opts);
    vx = await pass1(vx[0], vx[1], opts);

    vx[1]["__PRAGMAS"] = opts.PRAGMAS;
    //console.log(ASM.PRAGMAS,vx[1])
    vx = pass2(vx, opts);
    //console.log("VARS",vx[1])
    //console.log("XREF",opts.xref)

    if (showError==2) console.log(vx)
    let l = lst({dump:vx[0],vars:vx[1],opts:opts},false, true)
    if (name) fs.writeFileSync("./test/suite/"+name+".lst",l)
    if (name) fs.writeFileSync("./test/suite/"+name+".obj",JSON.stringify(vx[0],null,2))
    //let l2 = lst(vx[0],vx[1], true, false, opts)
    //let www = html(vx[0],vx[1],false, true,opts)
    //let www2 = html(vx[0],vx[1],true, false,opts)
    if (showError==3)console.log(l)
    return vx
    } catch (e) {
        if (showError)console.log(JSON.stringify(e))
        if (e.e) throw e.e
        throw e
    }
}

QUnit.test('basic 8080', async assert => {
    await doPass(asmI8080, true, I8080, "test-a80")
    assert.ok(true)
});

QUnit.test('basic 6800', async assert => {
    await doPass(asmM6800, true, M6800, "test-a68")
    assert.ok(true)
});

/*
QUnit.test('IF NaN', async assert => {
    assert.throws(() => {
        await doPass(`n: equ A+1`, true, DUMMY)
    }, (err) => err.msg === "DB is not allowed in BSSEG")
});
*/


QUnit.test('basic dummy', async assert => {
    await doPass(asmDUMMY, false, DUMMY, "test-dummy")
    assert.ok(true)
});

QUnit.test('basic dummy-endian', async assert => {
    await doPass(asmDUMMY, false, DUMMYE, "test-dummye")
    assert.ok(true)
});

/*
QUnit.test('relocable 8080', async assert => {
    doPass(asmRELOCABLE, true, I8080, "relocable")
    assert.ok(true)
});
*/

QUnit.test('ORG in module', async assert => {
    asyncThrows(assert,() => {
        return doPass(`.pragma module\n.org 100`, false, I8080)
    },(err) => err.msg == "ORG is not allowed in modules")
});


QUnit.test('EQU without label', async assert => {
    asyncThrows(assert,() => {
        return doPass(`equ 123`, false, DUMMY)
    },(err) => err.msg === "EQU without label")
});


QUnit.test('.ERROR', async assert => {
    asyncThrows(assert,() => {
        return doPass(`.error someError`, false, DUMMY)
    },(err) => err.msg === "someError")
});

QUnit.test('.IF nonsense', async assert => {
    asyncThrows(assert,() => {
        return doPass(`.if nnn`, false, DUMMY)
    },(err) => err.msg === "IF condition mismatched")
});
QUnit.test('.IFN nonsense', async assert => {
    asyncThrows(assert,() => {
        return doPass(`.ifn nnn`, false, DUMMY)
    },(err) => err.msg === "IF condition mismatched")
});
