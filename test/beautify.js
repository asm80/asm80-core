/// <reference path="../parser.js" />

import {I8080} from "../cpu/i8080.js";

//QUnit test for parser.js

import QUnit from "qunit";

import * as Parser from "../parser.js";

import { beautify } from "../beautify.js";

QUnit.module('beautify');
//QUnit.config.hidepassed = true;

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

const doBeautify = async (data) => {
    try {

    
    let lines = await beautify(data, {assembler:I8080, fileGet:dummyFileGet});
    return lines
    } catch (e) {
        console.log(e)
        return e
    }
}

const testParse = (data, showError=false) => {
    try {

    
    let lines = beautify(data, {assembler:I8080, fileGet:dummyFileGet});
    if (showError) console.log(lines)
    return "OK"
    } catch (e) {
        if (showError) console.log(e)
        throw e
    }
}

QUnit.test('basic beautify', async assert => {
    let o = await doBeautify(data, true)
    //console.log("BEUA",o)
  assert.ok(o, "beautify returns something");
});
