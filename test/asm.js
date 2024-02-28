import {asm} from "../asm.js"

import fs from "fs";

import { fileSystem } from "./_filesystem.js";
import { ihex } from "../utils/ihex.js";
import { lst, html } from "../listing.js";


//QUnit test for parser.js

import QUnit from "qunit";


QUnit.module('asm');

let asmREL = fs.readFileSync("./test/suite/relocable.a80","utf-8");
let asmREL1 = fs.readFileSync("./test/suite/relocable1.a80","utf-8");
let asmREL2 = fs.readFileSync("./test/suite/relocable2.a80","utf-8");
let asmLNK = JSON.parse(fs.readFileSync("./test/suite/relocable.lnk","utf-8"));




QUnit.test('relocable 8080 - no asm spec', assert => {
    
    assert.throws(()=>{
        asm.compile(asmREL, fileSystem, {})
    })
});

QUnit.test('relocable 8080 - errr', assert => {
    assert.throws(()=>{
        asm.compile("Total bullshit", fileSystem, {assembler:"I8080"})
    })
});

QUnit.test('undefined var', assert => {
    assert.throws(()=>{
        asm.compile("MVI undef", fileSystem, {assembler:"I8080"})
    })
});


QUnit.test('relocable 8080', assert => {
    let {obj} = asm.compile(asmREL, fileSystem, {assembler:"I8080"})
    assert.ok(typeof obj == "object")
    fileSystem.filePut("relocable.obj", JSON.stringify(obj,null,2))
    console.log("DT",fileSystem.fileChanged("relocable.obj"))
});
QUnit.test('relocable1 8080', assert => {
    let {obj} = asm.compile(asmREL1, fileSystem, {assembler:"I8080"})
    assert.ok(typeof obj == "object")
    fileSystem.filePut("relocable1.obj", JSON.stringify(obj,null,2))
});

QUnit.test('relocable2 8080', assert => {
    let {obj} = asm.compileFromFile("relocable2.a80", fileSystem, {assembler:"I8080"})
    assert.ok(typeof obj == "object")
    fileSystem.filePut("relocable2.obj", JSON.stringify(obj,null,2))
});

QUnit.test('relocable2 Z80', assert => {
    try {
    let {obj} = asm.compileFromFile("relocable2z.z80", fileSystem, {assembler:"Z80"})
    assert.ok(typeof obj == "object")
    fileSystem.filePut("relocable2z.obj", JSON.stringify(obj,null,2))
    } catch (e) {
        console.log(e)
    }
});


QUnit.test('link 8080', assert => {
    asm.link(asmLNK, fileSystem, "relocable")
    assert.ok(true)
});

QUnit.test('link 8080 - all segs', assert => {
    let lnk = {
        "segments": {
            "CSEG":"10",
            "DSEG":"20",
            "ESEG":"30",
            "BSSEG":"40",
        },
        "vars": {
            "BIOS_PRINT":"0x5"
        },
        "modules": ["relocable"],
        "library": ["relocable1","relocable2"],
    
        "entrypoint":"main"
    }
    asm.link(lnk, fileSystem, "relocable")
    assert.ok(true)
});

QUnit.test('link 8080 - errr', assert => {
    assert.throws(()=>{
        asm.link({modules:["nonexistent"]}, fileSystem, "relocable")
    })
});

QUnit.test('link 8080 - errr2', assert => {
    assert.throws(()=>{
        asm.link({modules:["relocable"]}, fileSystem, "relocable")
    })
});

QUnit.test('link 8080+Z80', assert => {
    assert.throws(()=>{
        asm.link({modules:["relocable","relocable2z"]}, fileSystem, "relocable")
    })
});

QUnit.test('link 8080+Z80', assert => {
    assert.throws(()=>{
        asm.link({modules:["relocable"],library:["relocable2z"]}, fileSystem, "relocable")
    })
});

QUnit.test('link 8080 - errr3', assert => {
    assert.throws(()=>{
        asm.link({modules:["relocable"], library:["nonexistent"]}, fileSystem, "relocable")
    })
});

QUnit.test('link 8080 - errr4', assert => {
    assert.throws(()=>{
        asm.link({modules:["relocable"], library:["relocable"]}, fileSystem, "relocable")
    })
});



QUnit.test('link 8080 - errr5', assert => {
    let lnk = {
        "segments": {
            "CSEG":"10"
        },
        "vars": {
            "BIOS_PRINT":"0x5"
        },
        "modules": ["relocable1", "relocable1"],
        "library": ["relocable2"],
    
        "entrypoint":"main"
    }
    assert.throws(()=>{
        asm.link(lnk, fileSystem, "relocable")
    })
});


QUnit.test('hex', assert => {
    let result = asm.compileFromFile("test.a80", fileSystem, {assembler:"I8080"})
    assert.ok(typeof result.dump == "object")
    let listing = lst(result, true, false)
    fileSystem.filePut("test.a80.lst", listing) 
    let htmlList = html(result, true, false)
    fileSystem.filePut("test.a80.html", htmlList) 
    let hex = ihex(result)
    fileSystem.filePut("test.a80.hex", hex)
    //check
    let hexmaster = fileSystem.fileGet("test.a80.master.hex")
    assert.equal(hex, hexmaster)

});

QUnit.test('hex2', assert => {
    let result = asm.compileFromFile("tinybasic.a80", fileSystem, {assembler:"I8080"})
    assert.ok(typeof result.dump == "object")
    let hex = ihex(result)
    fileSystem.filePut("tinybasic.a80.hex", hex)
    //check
    let hexmaster = fileSystem.fileGet("tinybasic.a80.master.hex")
    assert.equal(hex, hexmaster)

});