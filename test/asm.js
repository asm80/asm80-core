import {asm, compile} from "../asm.js"
import { objCode, linkModules } from "../objcode.js"
import { C6502 } from "../cpu/c6502.js"

import fs from "fs";

import { fileSystem } from "./_asyncFilesystem.js";
import { ihex } from "../utils/ihex.js";
import { isrec, isrec28 } from "../utils/srec.js";
import { lst, html } from "../listing.js";


//QUnit test for parser.js

import QUnit from "qunit";


QUnit.module('asm');

let asmREL = fs.readFileSync("./test/suite/relocable.a80","utf-8");
let asmREL1 = fs.readFileSync("./test/suite/relocable1.a80","utf-8");
let asmREL2 = fs.readFileSync("./test/suite/relocable2.a80","utf-8");
let asmLNK = JSON.parse(fs.readFileSync("./test/suite/relocable.lnk","utf-8"));

/*
const test_async = async (ok) => {
    if (ok) return 1
    throw "Not OK"
}
*/
import { asyncThrows } from "./_asyncThrows.js";
/*
QUnit.test('simple async OK', async assert => {
    //const done = assert.async();
    assert.equal(await test_async(true),1)
    //done()
});

QUnit.test('simple async throw', async assert => {
    asyncThrows(assert, ()=>test_async(false))
});
*/

QUnit.test('relocable 8080 - no asm spec', async assert => {
    //const done = assert.async();

    asyncThrows(assert,  ()=>
        
         asm.compile(asmREL, fileSystem, {})

    )
    //done()

    
});

QUnit.test('relocable 8080 - errr', async assert => {
    asyncThrows(assert, ()=>
        asm.compile("Total bullshit", fileSystem, {assembler:"I8080"})
    )
});

QUnit.test('undefined var', async assert => {
    asyncThrows(assert, ()=>
        asm.compile("MVI undef", fileSystem, {assembler:"I8080"})
    )
});


QUnit.test('relocable 8080', async assert => {
    let {obj} = await asm.compile(asmREL, fileSystem, {assembler:"I8080"})
    assert.ok(typeof obj == "object")
    await fileSystem.writeFile("relocable.obj", JSON.stringify(obj,null,2))
    console.log("DT",await fileSystem.mtime("relocable.obj"))
});
QUnit.test('relocable1 8080', async assert => {
    let {obj} = await asm.compile(asmREL1, fileSystem, {assembler:"I8080"})
    assert.ok(typeof obj == "object")
    await fileSystem.writeFile("relocable1.obj", JSON.stringify(obj,null,2))
});

QUnit.test('relocable2 8080', async assert => {
    let {obj} = await asm.compileFromFile("relocable2.a80", fileSystem, {assembler:"I8080"})
    assert.ok(typeof obj == "object")
    await fileSystem.writeFile("relocable2.obj", JSON.stringify(obj,null,2))
});

QUnit.test('relocable2 Z80', async assert => {
    try {
    let {obj} = await asm.compileFromFile("relocable2z.z80", fileSystem, {assembler:"Z80"})
    assert.ok(typeof obj == "object")
    await fileSystem.writeFile("relocable2z.obj", JSON.stringify(obj,null,2))
    } catch (e) {
        console.log(e)
    }
});


QUnit.test('link 8080', async assert => {
    await asm.link(asmLNK, fileSystem, "relocable")
    assert.ok(true)
});

QUnit.test('link 8080 - all segs', async assert => {
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
    await asm.link(lnk, fileSystem, "relocable")
    assert.ok(true)
});

QUnit.test('link 8080 - errr', async assert => {
    asyncThrows(assert, ()=>
        asm.link({modules:["nonexistent"]}, fileSystem, "relocable")
    )
});

QUnit.test('link 8080 - errr2', async assert => {
    asyncThrows(assert, ()=>
        asm.link({modules:["relocable"]}, fileSystem, "relocable")
    )
});

QUnit.test('link 8080+Z80', async assert => {
    asyncThrows(assert, ()=>{
        return asm.link({modules:["relocable","relocable2z"]}, fileSystem, "relocable")
    })
});

QUnit.test('link 8080+Z80', async assert => {
    asyncThrows(assert, ()=>{
        return asm.link({modules:["relocable"],library:["relocable2z"]}, fileSystem, "relocable")
    })
});

QUnit.test('link 8080 - errr3', async assert => {
    asyncThrows(assert, ()=>{
        return asm.link({modules:["relocable"], library:["nonexistent"]}, fileSystem, "relocable")
    })
});

QUnit.test('link 8080 - errr4', async assert => {
    asyncThrows(assert, ()=>{
        return asm.link({modules:["relocable"], library:["relocable"]}, fileSystem, "relocable")
    })
});



QUnit.test('link 8080 - errr5', async assert => {
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
    asyncThrows(assert, ()=>{
        return asm.link(lnk, fileSystem, "relocable")
    })
});


QUnit.test('hex', async assert => {
    let result = await asm.compileFromFile("test.a80", fileSystem, {assembler:"I8080"})
    assert.ok(typeof result.dump == "object")
    let listing = lst(result, true, false)
    await fileSystem.writeFile("test.a80.lst", listing) 
    let htmlList = html(result, true, false)
    await fileSystem.writeFile("test.a80.html", htmlList) 
    let hex = ihex(result)
    await fileSystem.writeFile("test.a80.hex", hex)
    //check
    let hexmaster = await fileSystem.readFile("test.a80.master.hex")
    assert.equal(hex, hexmaster)

});

QUnit.test('hex2', async assert => {
    let result = await asm.compileFromFile("tinybasic.a80", fileSystem, {assembler:"I8080"})
    //fileSystem.writeFile("tinybasic.a80.obj", JSON.stringify(result,null,2))
    assert.ok(typeof result.dump == "object")
    let hex = ihex(result)
    let srec = isrec(result)
    let srec28 = isrec28(result)
    await fileSystem.writeFile("tinybasic.a80.hex", hex)
    //check
    let hexmaster = await fileSystem.readFile("tinybasic.a80.master.hex")
    assert.equal(hex, hexmaster)

});

QUnit.test('srec checksum uses ones complement', assert => {
    const result = {
        dump: [{ addr: 0x1000, lens: [0x12, 0x34], segment: "CSEG" }],
        entry: { address: 0 },
        opts: { ENT: 0 }
    };
    const srec = isrec(result).split('\n')[0];
    assert.equal(srec, "S10510001234A4");
});

QUnit.test('link 6502 - EQU ZP constants not relocated', async assert => {
    const src = `
  .pragma module
  PTR  EQU 2
  CNT  EQU 3
  .export MYSTART
  MYSTART:
  LDX #0
  LDY #0
  LDA #$61
  STA (PTR),Y
  INC CNT
  BNE MYSTART
  JSR $E020
  RTS
`;
    const result = await compile(src, {readFile:()=>null}, {assembler: C6502});
    const obj = objCode(result.dump, result.vars, {endian:false, assembler:C6502});
    const linked = linkModules({endian:false, segments:{CSEG:"0xE000"}, vars:{}}, [obj], []);
    const hex = ihex(linked);
    // All code should be in a single contiguous record (no torn/overlapping records)
    const dataRecords = hex.split('\n').filter(l => l.startsWith(':') && !l.startsWith(':00000001'));
    assert.equal(dataRecords.length, 1, "linked hex should be one contiguous record");
    // STA (PTR),Y: ZP address 02 must not be relocated to E002
    assert.ok(hex.includes('9102'), "STA (PTR),Y should use ZP addr 02, not relocated");
    // INC CNT: ZP address 03 must not be relocated to E003
    assert.ok(hex.toUpperCase().includes('E603'), "INC CNT should use ZP addr 03, not relocated");
});
