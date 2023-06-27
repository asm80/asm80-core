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