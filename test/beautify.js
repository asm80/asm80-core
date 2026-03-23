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

const dummyreadFile = (filename) => {
    //console.log("INCLUDE", filename)
    return `nop
    .block blk
    dw 1
    .endblock`
}

const doBeautify = async (data) => {
    try {

    
    let lines = await beautify(data, {assembler:I8080, readFile:dummyreadFile});
    return lines
    } catch (e) {
        console.log(e)
        return e
    }
}

const testParse = (data, showError=false) => {
    try {

    
    let lines = beautify(data, {assembler:I8080, readFile:dummyreadFile});
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

// --- assembler resolution ---

QUnit.test('assembler given as known string name', async assert => {
  const out = await beautify("nop\n", { assembler: "i8080" });
  assert.ok(out.includes("NOP"), "I8080 NOP recognised via string name");
});

QUnit.test('unknown assembler string falls back to Z80', async assert => {
  const out = await beautify("nop\n", { assembler: "xyzzy_unknown" });
  assert.ok(out.includes("NOP"), "Z80 NOP used as fallback");
});

QUnit.test('no assembler option defaults to Z80', async assert => {
  const out = await beautify("nop\n");
  assert.ok(out.includes("NOP"), "defaults to Z80");
});

// --- _unparsed / catch path ---

QUnit.test('unrecognized opcode for assembler passes through verbatim', async assert => {
  // I8080 does not have LD — parseLine throws → _unparsed=true → verbatim output
  const out = await beautify("LD A,B\n", { assembler: I8080 });
  assert.ok(out.includes("LD A,B"), "verbatim pass-through on parseLine failure");
});

// --- autoCase:false ---

QUnit.test('autoCase:false preserves original label and opcode case', async assert => {
  // _captureOrigTokens: lblM branch (label present) + opcM branch (opcode present)
  // displayLabel/displayOpcode use _origLabel/_origOpcode instead of uppercased values
  const src = "myLabel: Nop\n";
  const out = await beautify(src, { assembler: I8080, autoCase: false });
  assert.ok(out.includes("myLabel"), "original label case preserved");
  assert.ok(out.includes("Nop"), "original opcode case preserved");
});

QUnit.test('autoCase:false - opcode line without label', async assert => {
  // _captureOrigTokens: lblM false branch (no label), opcM true branch
  const src = "  Nop\n";
  const out = await beautify(src, { assembler: I8080, autoCase: false });
  assert.ok(out.includes("Nop"), "opcode-only line: original case preserved");
});

QUnit.test('autoCase:false - pure comment line (early return in _captureOrigTokens)', async assert => {
  // _captureOrigTokens: t[0] === ";" → early return, no _origOpcode set
  const src = "; a comment\n";
  const out = await beautify(src, { assembler: I8080, autoCase: false });
  assert.ok(out.includes("a comment"), "comment passed through");
});

QUnit.test('autoCase:false - = EQU line (t[0]==="=" branch in _captureOrigTokens)', async assert => {
  // line "= 42" has no label, t starts with "=" → _origOpcode="=", early return
  // parseLine likely throws → _unparsed → verbatim pass-through
  const src = "= 42\n";
  const out = await beautify(src, { assembler: I8080, autoCase: false });
  assert.ok(typeof out === "string", "no crash on bare = line");
  assert.ok(out.includes("="), "= line present in output");
});
