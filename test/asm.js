import {asm} from "../asm.js"

import fs from "fs";

import { fileSystem } from "./_filesystem.js";


//QUnit test for parser.js

import QUnit from "qunit";


QUnit.module('asm');

let asmREL = fs.readFileSync("./test/suite/relocable.a80","utf-8");
let asmREL1 = fs.readFileSync("./test/suite/relocable1.a80","utf-8");
let asmREL2 = fs.readFileSync("./test/suite/relocable2.a80","utf-8");
let asmLNK = JSON.parse(fs.readFileSync("./test/suite/relocable.lnk","utf-8"));


const doPass = (data, showError=false, assembler=I8080, name="") => {
    let opts = {assembler, fileGet, PRAGMAS:[], endian:assembler.endian,}
    
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
    //console.log("VARS",vx[1])
    //console.log("XREF",opts.xref)

    if (showError==2) console.log(vx)
    let l = lst(vx[0],vx[1],false, true,opts)
    if (name) fs.writeFileSync("./test/suite/"+name+".lst",l)
    if (name) fs.writeFileSync("./test/suite/"+name+".dump",JSON.stringify(vx[0],null,2))
    let obj = objCode(vx[0],vx[1],opts,name)
    if (name) fs.writeFileSync("./test/suite/"+name+".obj",JSON.stringify(obj,null,2))
    let l2 = lst(vx[0],vx[1], true, false, opts)
    let www = html(vx[0],vx[1],false, true,opts)
    let www2 = html(vx[0],vx[1],true, false,opts)
    if (showError==3)console.log(l)
    return vx
    } catch (e) {
        if (showError)console.log(JSON.stringify(e))
        if (e.e) throw e.e
        throw e
    }
}




const doLink = (data, showError=false, assembler=I8080, name="") => {
    let modules = data.modules.map(m => {
        let f = JSON.parse(fs.readFileSync("./test/suite/"+m+".obj","utf-8"))
        return f
    })
    let library = data.library.map(m => {
        let f = JSON.parse(fs.readFileSync("./test/suite/"+m+".obj","utf-8"))
        return f
    })

    data.endian = assembler.endian

    let out = linkModules(data,modules, library)

    fs.writeFileSync("./test/suite/"+name+".combined",JSON.stringify(out))    
}


QUnit.test('relocable 8080', assert => {
    let {obj} = asm.compile(asmREL, fileSystem, {assembler:"I8080"})
    assert.ok(typeof obj == "object")
    fileSystem.filePut("relocable.obj", JSON.stringify(obj,null,2))
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

QUnit.test('link 8080', assert => {
    asm.link(asmLNK, fileSystem, "relocable")
    assert.ok(true)
});
