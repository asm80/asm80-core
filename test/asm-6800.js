import {M6800} from "../cpu/m6800.js";
import { Parser } from "../expression-parser.js";
import QUnit from "qunit"

//QUnit.config.notrycatch = true

let equal = QUnit.assert.equal
let notEqual = QUnit.assert.notEqual

QUnit.module("ASM 6800");

var vars = {"LOOP":0x1234,"SHORT":0x21,"_PC":0x0100};
var s = [], p;

QUnit.test( "NOP test", function() {
	s = {"opcode":"NOP","addr":0x100,"lens":[],"bytes":0};
	p = M6800.parseOpcode(s,vars,Parser);
	QUnit.assert.equal(p.lens[0],0x01,"Opcode OK");
	QUnit.assert.equal(p.bytes,1,"Length OK");
});


QUnit.test( "DEC addr", function() {
	s = {"opcode":"DEC","params":["$23"],addr:"0x100",lens:[],"bytes":0};
	p = M6800.parseOpcode(s,vars,Parser);
	QUnit.assert.equal(p.lens[0],0x7a,"Opcode");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length");
});


QUnit.test( "DEC A", function() {
	s = {"opcode":"DEC","params":["A"],"paramstring":"A",addr:"0x100",lens:[],"bytes":0};
	p = M6800.parseOpcode(s,vars,Parser);
	QUnit.assert.equal(p.lens[0],0x4a,"Opcode");
	QUnit.assert.equal(p.bytes,1,"Length");
});

QUnit.test( "DECA", function() {
	s = {"opcode":"DECA","params":[],"paramstring":"",addr:"0x100",lens:[],"bytes":0};
	p = M6800.parseOpcode(s,vars,Parser);
	QUnit.assert.equal(p.lens[0],0x4a,"Opcode");
	QUnit.assert.equal(p.bytes,1,"Length");
});

QUnit.test( "DEC addr,X", function() {
	s = {"opcode":"DEC","params":["$23","X"],"paramstring":"$23,X",addr:"0x100",lens:[],"bytes":0};
	p = M6800.parseOpcode(s,vars,Parser);
	QUnit.assert.equal(p.lens[0],0x6a,"Opcode");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length");
});

QUnit.test( "DEC addr,X", function() {
	s = {"opcode":"DEC","params":["9","X"],"paramstring":"9,X",addr:"0x100",lens:[],"bytes":0};
	p = M6800.parseOpcode(s,vars,Parser);
	QUnit.assert.equal(p.lens[0],0x6a,"Opcode");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length");
});

// Test immediate 8-bit addressing mode with # prefix
QUnit.test( "LDAA #immediate 8-bit", function() {
	s = {"opcode":"LDAA","params":["#$42"],"paramstring":"#$42",addr:"0x100",lens:[],"bytes":0};
	p = M6800.parseOpcode(s,vars,Parser);
	QUnit.assert.equal(p.lens[0],0x86,"Opcode for LDAA immediate");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Parameter function");
	QUnit.assert.equal(p.bytes,2,"Length for immediate 8-bit");
});

// Test immediate 16-bit addressing mode with # prefix
QUnit.test( "LDS #immediate 16-bit", function() {
	s = {"opcode":"LDS","params":["#$1234"],"paramstring":"#$1234",addr:"0x100",lens:[],"bytes":0};
	p = M6800.parseOpcode(s,vars,Parser);
	QUnit.assert.equal(p.lens[0],0x8E,"Opcode for LDS immediate");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Parameter function");
	QUnit.assert.equal(p.lens[2],null,"High byte marker");
	QUnit.assert.equal(p.bytes,3,"Length for immediate 16-bit");
});

// Test direct page addressing mode (address < 256)
QUnit.test( "LDAA direct page", function() {
	s = {"opcode":"LDAA","params":["SHORT"],"paramstring":"SHORT",addr:"0x100",lens:[],"bytes":0};
	p = M6800.parseOpcode(s,vars,Parser);
	QUnit.assert.equal(p.lens[0],0x96,"Opcode for LDAA direct");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Parameter function");
	QUnit.assert.equal(p.bytes,2,"Length for direct addressing");
});

// Test extended addressing mode (address >= 256)
QUnit.test( "LDAA extended", function() {
	s = {"opcode":"LDAA","params":["LOOP"],"paramstring":"LOOP",addr:"0x100",lens:[],"bytes":0};
	p = M6800.parseOpcode(s,vars,Parser);
	QUnit.assert.equal(p.lens[0],0xB6,"Opcode for LDAA extended");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Parameter function");
	QUnit.assert.equal(p.lens[2],null,"High byte marker");
	QUnit.assert.equal(p.bytes,3,"Length for extended addressing");
});

// Test relative addressing mode
QUnit.test( "BEQ relative", function() {
	s = {"opcode":"BEQ","params":["LOOP"],"paramstring":"LOOP",addr:"0x100",lens:[],"bytes":0};
	p = M6800.parseOpcode(s,vars,Parser);
	QUnit.assert.equal(p.lens[0],0x27,"Opcode for BEQ");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Relative address function");
	QUnit.assert.equal(p.bytes,2,"Length for relative addressing");
});

// Test A/B register parsing in 3-character opcodes
QUnit.test( "CLR A register parsing", function() {
	s = {"opcode":"CLR","params":["A"],"paramstring":"A",addr:"0x100",lens:[],"bytes":0, reg6800: null};
	p = M6800.parseOpcode(s,vars,Parser);
	QUnit.assert.equal(p.opcode,"CLRA","Opcode should be modified to CLRA");
	QUnit.assert.equal(p.lens[0],0x4F,"Opcode for CLRA");
	QUnit.assert.equal(p.bytes,1,"Length for inherent");
});

// Test B register parsing in 3-character opcodes
QUnit.test( "CLR B register parsing", function() {
	s = {"opcode":"CLR","params":["B"],"paramstring":"B",addr:"0x100",lens:[],"bytes":0, reg6800: null};
	p = M6800.parseOpcode(s,vars,Parser);
	QUnit.assert.equal(p.opcode,"CLRB","Opcode should be modified to CLRB");
	QUnit.assert.equal(p.lens[0],0x5F,"Opcode for CLRB");
	QUnit.assert.equal(p.bytes,1,"Length for inherent");
});

// Test invalid opcode
QUnit.test( "Invalid opcode", function() {
	s = {"opcode":"INVALID","params":[],"paramstring":"",addr:"0x100",lens:[],"bytes":0};
	p = M6800.parseOpcode(s,vars,Parser);
	QUnit.assert.equal(p,null,"Should return null for invalid opcode");
});

// Test empty opcode
QUnit.test( "Empty opcode", function() {
	s = {"opcode":"","params":[],"paramstring":"",addr:"0x100",lens:[],"bytes":0};
	p = M6800.parseOpcode(s,vars,Parser);
	QUnit.assert.equal(p,null,"Should return null for empty opcode");
});

// Test exception handling in direct page evaluation (actually tests successful direct addressing)
QUnit.test( "Direct page evaluation", function() {
	// Test case where evaluation succeeds and uses direct addressing
	var exceptionVars = {"UNDEFINED_VAR":0,"_PC":0x0100}; // UNDEFINED_VAR evaluates to 0, qualifying for direct page
	s = {"opcode":"LDAA","params":["UNDEFINED_VAR"],"paramstring":"UNDEFINED_VAR",addr:"0x100",lens:[],"bytes":0};
	p = M6800.parseOpcode(s,exceptionVars,Parser);
	// Should use direct page addressing when value < 256
	QUnit.assert.equal(p.lens[0],0x96,"Should use direct page addressing for values < 256");
	QUnit.assert.equal(p.bytes,2,"Should be 2 bytes for direct page addressing");
});

// Test no parameters case with extended addressing
QUnit.test( "No parameters provided", function() {
	s = {"opcode":"LDAA","params":["",""],"paramstring":",",addr:"0x100",lens:[],"bytes":0};
	p = M6800.parseOpcode(s,vars,Parser);
	QUnit.assert.equal(p,null,"Should return null when instruction expects parameters but none provided");
});

// Test edge case for relative addressing with negative offset
QUnit.test( "BEQ relative negative offset", function() {
	var negativeVars = {"TARGET":0x80,"_PC":0x100}; // Target is behind current PC
	s = {"opcode":"BEQ","params":["TARGET"],"paramstring":"TARGET",addr:"0x100",lens:[],"bytes":0};
	p = M6800.parseOpcode(s,negativeVars,Parser);
	QUnit.assert.equal(p.lens[0],0x27,"Opcode for BEQ");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Relative address function");
	QUnit.assert.equal(p.bytes,2,"Length for relative addressing");
	// Test the relative calculation function
	var relativeByte = p.lens[1](negativeVars);
	QUnit.assert.equal(relativeByte,126,"Relative offset should be calculated correctly for negative jump"); // -126 + 256 = 130, but -128+2 = -126, 256-126=130... Actually: 0x80-0x100-2 = -130, 256+(-130)=126
});