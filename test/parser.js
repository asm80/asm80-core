/// <reference path="../parser.js" />

import {I8080} from "../cpu/i8080.js";

//QUnit test for parser.js

import QUnit from "qunit";

import * as Parser from "../parser.js";


QUnit.module('parser');
QUnit.config.hidepassed = true;

import { asyncThrows } from "./_asyncThrows.js";

//test suite
let data = `label: nop
 nop
 org 0x100
 va equ 123
 vb: equ 112
 vc .equ va
 .fill 1,2
 fill 2,3
label2: nop
jmp label   
MOV A,C
MvI a, 0x0f
label3: MOv a, C ;with remark as a,b,c  

label5 = 1
defb 1
.byte 1
.db 1
.word 1
.dw 2
defw 3
.dd 22
.df 12,3
.dfzxs 122
.dff 12
defs 1
.res 1
defm 1
.align 4
.incbin test.bin
.if 1
nop
.else
nop
.endif

: nop

@aa: nop

var .set 3 ;test
var := 4 ;test

somelabel nop
.segment code
.pragma 6309

; empty line   
  ; with remark

  .macro xyz
  loop%%M: inr a
     dcr b
     jnz loop%%M
  .endm  

  xyz
  xyz
  xyz

.end`

const dummyreadFile = (filename) => {
    //console.log("INCLUDE", filename)
    return `nop
    .block blk
    dw 1
    .endblock`
}

const doParse = async (data) => {
    try {

    
    let lines = await Parser.parse(data, {assembler:I8080});
    return lines
    } catch (e) {
        console.log(e)
        return e
    }
}

const testParse = async (data, showError=false) => {
    try {

    
    let lines = await Parser.parse(data, {assembler:I8080, readFile:dummyreadFile});
    if (showError) console.log(lines)
    return "OK"
    } catch (e) {
        if (showError) console.log(e)
        throw e
    }
}

QUnit.test('vanilla', assert => {
    const done = assert.async();

  assert.equal(typeof ( doParse(data)), "object", "toLines returns an object");
  done()
});


QUnit.test("Unrecognized instruction", async assert => {

    asyncThrows(assert,() => {
        let data = `haf`
        return Parser.parse(data, {assembler:I8080});
    })
    //done()
})

QUnit.test("Unrecognized instruction 2", async assert => {
    asyncThrows(assert,() => {
        let data = `label: haf`
        return Parser.parse(data, {assembler:I8080});
    })
})
QUnit.test("Unrecognized instruction 3", async assert => {
    asyncThrows(assert,() => {
        let data = `label haf`
        return Parser.parse(data, {assembler:I8080});
    })
})
QUnit.test("Unrecognized instruction 4", async assert => {
    asyncThrows(assert,() => {
        let data = `mov a,t`
        return Parser.parse(data, {assembler:I8080});
    })
})


QUnit.test('Macro params', async assert => {
    assert.equal(await testParse(`.macro test
    db %%1
    dw %%2
   .endm
   
   test $12, $3456
   test {$12,$34,$DE,$Ad}, $3456
   `), "OK")
})

QUnit.test('Macro param string', async assert => {
    assert.equal(await testParse(`.macro test
    db %%1
    dw %%2
   .endm
   
   test {"Hello",'World', "my;i", 'test;i', "string:is=strong"}, $3456
   `), "OK")
})

QUnit.test('Strings', async assert => {
    assert.equal(await testParse(`
    db "Hello",'World', "my;i", 'test;i', "string:is=strong"
    db "Hello, world",'hello, world' ; two strings
    DB 10 DUP (123)
    .error "Hey"
   `), "OK")
})


QUnit.test('Macro params OK', async assert => {
    let o = await Parser.parse(`.macro test, src, dst
    db %%src
    dw %%dst
   .endm
   
   test $12, 34
   `,{assembler:I8080})

    assert.ok(o, "OK")

})


QUnit.test('Macro params too few', async assert => {
    asyncThrows(assert,()=>{
        let o = testParse(`.macro test, src, dst
    db %%src
    dw %%dst
   .endm
   
   test $12
   `)
   return o

})

})

QUnit.test('ENDM without MACRO at line', assert => {
    asyncThrows(assert,()=>{
        let o = testParse(`.endm`)
        return o
}, (err) => err.msg === 'ENDM without MACRO at line 1')

})

QUnit.test('Bad macro name at line', assert => {
    asyncThrows(assert,()=>{
        let o = testParse(`.macro`)
        return o
}, (err) => err.msg === 'Bad macro name at line 1')
})



QUnit.test('Macro nest', async assert => {
    assert.equal(await testParse(`.macro a
    db %%1
    dw %%2
   .endm

   .macro b
   a $12, $3456
    .endm

    b
   
   `), "OK")
})

QUnit.test('macro redefinition', async assert => {
    asyncThrows(assert,()=>{
        let o = testParse(`.macro a
        nop
        .endm
        .macro a
        `)
        return o
}
, (err) => err.msg === 'Macro A redefinition at line 4'
)

})




QUnit.test('REPT', async assert => {
    assert.equal(await testParse(`.rept 3
    db %%1
    dw %%2
   .endm
   
   `), "OK")
})

QUnit.test('REPT named', async assert => {
    assert.equal(await testParse(`label .macro
    db %%1
    dw %%2
   .endm
   
   `), "OK")
})


QUnit.test('INCLUDE', async assert => {
    assert.equal(await testParse(`.include "test.asm"`), "OK")
   
})

QUnit.test('INCLUDE BLOCK', async assert => {
    assert.equal(await testParse(`.include test.asm:blk`), "OK")
   
})

QUnit.test('INCLUDE bad block', async assert => {
    asyncThrows(assert,()=>{
        return  testParse(`.include test.asm:noblock`)
}
, (err) => err.msg === 'Cannot find block noblock in included file'
)
})


QUnit.test('INCLUDE no name given', async assert => {
    asyncThrows(assert,()=>{
        return  testParse(`.include`)
}
, (err) => err.msg === 'No file name given'
)})

QUnit.test('No repeat count given', async assert => {
    asyncThrows(assert,()=>{
        return  testParse(`.rept`, false)
}
, (err) => err.msg === 'No repeat count given'
)})

QUnit.test('Bad repeat count given', async assert => {
    asyncThrows(assert,()=>{
        return  testParse(`.rept -1`, false)
}
, (err) => err.msg === 'Bad repeat count given'
)})

QUnit.test('MACRO *REPT1 has no appropriate ENDM', async assert => {
    asyncThrows(assert,()=>{
        return testParse(`.rept 2`, false)
}
, (err) => err.msg === 'MACRO *REPT1 has no appropriate ENDM'
)})