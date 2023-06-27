/// <reference path="../parser.js" />

import {I8080} from "../cpu/i8080.js";

//QUnit test for parser.js

import QUnit from "qunit";

import * as Parser from "../parser.js";

QUnit.module('parser');
QUnit.config.hidepassed = true;

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

const dummyFileGet = (filename) => {
    //console.log("INCLUDE", filename)
    return `nop
    .block blk
    dw 1
    .endblock`
}

const doParse = (data) => {
    try {

    
    let lines = Parser.parse(data, {assembler:I8080});
    return lines
    } catch (e) {
        console.log(e)
        return e
    }
}

const testParse = (data, showError=false) => {
    try {

    
    let lines = Parser.parse(data, {assembler:I8080, fileGet:dummyFileGet});
    if (showError) console.log(lines)
    return "OK"
    } catch (e) {
        if (showError) console.log(e)
        throw e
    }
}

QUnit.test('vanilla', assert => {
  assert.equal(typeof doParse(data), "object", "toLines returns an object");
});


QUnit.test("Unrecognized instruction", assert => {
    assert.throws(() => {
        let data = `haf`
        Parser.parse(data, {assembler:I8080});
    })
})

QUnit.test("Unrecognized instruction", assert => {
    assert.throws(() => {
        let data = `label: haf`
        Parser.parse(data, {assembler:I8080});
    })
})
QUnit.test("Unrecognized instruction", assert => {
    assert.throws(() => {
        let data = `label haf`
        Parser.parse(data, {assembler:I8080});
    })
})
QUnit.test("Unrecognized instruction", assert => {
    assert.throws(() => {
        let data = `mov a,t`
        Parser.parse(data, {assembler:I8080});
    })
})


QUnit.test('Macro params', assert => {
    assert.equal(testParse(`.macro test
    db %%1
    dw %%2
   .endm
   
   test $12, $3456
   test {$12,$34,$DE,$Ad}, $3456
   `), "OK")
})

QUnit.test('Macro param string', assert => {
    assert.equal(testParse(`.macro test
    db %%1
    dw %%2
   .endm
   
   test {"Hello",'World', "my;i", 'test;i', "string:is=strong"}, $3456
   `), "OK")
})

QUnit.test('Strings', assert => {
    assert.equal(testParse(`
    db "Hello",'World', "my;i", 'test;i', "string:is=strong"
    db "Hello, world",'hello, world' ; two strings
    DB 10 DUP (123)
    .error "Hey"
   `), "OK")
})


QUnit.test('Macro params OK', assert => {
    let o = Parser.parse(`.macro test, src, dst
    db %%src
    dw %%dst
   .endm
   
   test $12, 34
   `,{assembler:I8080})

    assert.ok(o, "OK")

})


QUnit.test('Macro params too few', assert => {
    assert.throws(()=>{
        let o = testParse(`.macro test, src, dst
    db %%src
    dw %%dst
   .endm
   
   test $12
   `)

}, (err) => err.msg === 'Too few parameters for macro unrolling')

})

QUnit.test('ENDM without MACRO at line', assert => {
    assert.throws(()=>{
        let o = testParse(`.endm`)
}, (err) => err.msg === 'ENDM without MACRO at line 1')

})

QUnit.test('Bad macro name at line', assert => {
    assert.throws(()=>{
        let o = testParse(`.macro`)
}, (err) => err.msg === 'Bad macro name at line 1')
})



QUnit.test('Macro nest', assert => {
    assert.equal(testParse(`.macro a
    db %%1
    dw %%2
   .endm

   .macro b
   a $12, $3456
    .endm

    b
   
   `), "OK")
})

QUnit.test('macro redefinition', assert => {
    assert.throws(()=>{
        let o = testParse(`.macro a
        nop
        .endm
        .macro a
        `)
}
, (err) => err.msg === 'Macro A redefinition at line 4'
)

})




QUnit.test('REPT', assert => {
    assert.equal(testParse(`.rept 3
    db %%1
    dw %%2
   .endm
   
   `), "OK")
})

QUnit.test('INCLUDE', assert => {
    assert.equal(testParse(`.include "test.asm"`), "OK")
   
})

QUnit.test('INCLUDE BLOCK', assert => {
    assert.equal(testParse(`.include test.asm:blk`), "OK")
   
})

QUnit.test('INCLUDE no name given', assert => {
    assert.throws(()=>{
        let o = testParse(`.include`)
}
, (err) => err.msg === 'No file name given'
)

})