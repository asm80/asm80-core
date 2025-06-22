import {CDP1802} from "../cpu/cdp1802.js";
import { Parser } from "../expression-parser.js";

QUnit.config.hidepassed = true;

QUnit.module("ASM CDP1802");

QUnit.test( "Namespace", function() {
	QUnit.assert.notEqual( CDP1802, null, "CDP1802 is defined" );
    QUnit.assert.equal( typeof(CDP1802), "object", "CDP1802 is an object" );
	QUnit.assert.equal( typeof(CDP1802.parseOpcode), "function", "CDP1802.parseOpcode defined" );
});


//QUnit.module("Simple OP tests");
var vars = {"LOOP":0x1234,"SHORT":0x21,"_PC":0x0100};
var s = [], p;

	QUnit.test( "NOP test", function() {
		s = {"opcode":"NOP","addr":0x100,"lens":[],"bytes":0};
		p = CDP1802.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xC4,"Opcode OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});

//QUnit.module("Single param tests");

//// 
	QUnit.test( "ADCI", function() {
		s = {"opcode":"ADCI","params":["$23"],addr:"0x100",lens:[],"bytes":0};
		p = CDP1802.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x7c,"Opcode");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
		QUnit.assert.equal(p.bytes,2,"Length");
		var par = p.lens[1]({});
		QUnit.assert.equal(par,0x23,"Param");

	});

	QUnit.test( "ADCI #23", function() {
		s = {"opcode":"ADCI","params":["#23"],addr:"0x100",lens:[],"bytes":0};
		p = CDP1802.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x7c,"Opcode");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
		QUnit.assert.equal(p.bytes,2,"Length");
		var par = p.lens[1]({});
		QUnit.assert.equal(par,0x23,"Param");

	});

//QUnit.module("Register tests");

	QUnit.test( "SEX 1", function() {
		s = {"opcode":"SEX","params":["1"],addr:"0x100",lens:[],"bytes":0};
		p = CDP1802.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xe1,"Opcode");
		QUnit.assert.equal(p.bytes,1,"Length");
	});

	QUnit.test( "SEX E", function() {
		s = {"opcode":"SEX","params":["e"],addr:"0x100",lens:[],"bytes":0};
		p = CDP1802.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xee,"Opcode");
		QUnit.assert.equal(p.bytes,1,"Length");
	});

	QUnit.test( "SEX R15", function() {
		s = {"opcode":"SEX","params":["R15"],addr:"0x100",lens:[],"bytes":0};
		p = CDP1802.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xef,"Opcode");
		QUnit.assert.equal(p.bytes,1,"Length");
	});

	QUnit.test( "SEX name", function() {
		s = {"opcode":"SEX","params":["VAR"],addr:"0x100",lens:[],"bytes":0};
		p = CDP1802.parseOpcode(s, {'VAR':13}, Parser);
		QUnit.assert.equal(p.lens[0],0xed,"Opcode");
		QUnit.assert.equal(p.bytes,1,"Length");
	});

//QUnit.module("Port tests");

	QUnit.test( "INP 1", function() {
		s = {"opcode":"INP","params":["1"],addr:"0x100",lens:[],"bytes":0};
		p = CDP1802.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x69,"Opcode");
		QUnit.assert.equal(p.bytes,1,"Length");
	});
	QUnit.test( "OUT 1", function() {
		s = {"opcode":"OUT","params":["1"],addr:"0x100",lens:[],"bytes":0};
		p = CDP1802.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x61,"Opcode");
		QUnit.assert.equal(p.bytes,1,"Length");
	});


//QUnit.module("Jump tests");

	QUnit.test( "LBR 1234", function() {
		s = {"opcode":"LBR","params":["$1234"],addr:"0x100",lens:[],"bytes":0};
		p = CDP1802.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xc0,"Opcode");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
		QUnit.assert.equal(p.bytes,3,"Length");
	});

	QUnit.test( "LBR loop", function() {
		s = {"opcode":"LBR","params":["LOOP"],addr:"0x100",lens:[],"bytes":0};
		p = CDP1802.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xc0,"Opcode");
		//check callback
		let ad1 = p.lens[1](vars);
		let ad2 = p.lens[2](vars);
		QUnit.assert.equal(ad2,0x12,"Param");
		QUnit.assert.equal(ad1,0x34,"Param");
		QUnit.assert.equal(p.bytes,3,"Length");
	});


	QUnit.test( "B1 $10", function() {
		s = {"opcode":"B1","params":["$10"],addr:"0x100",lens:[],"bytes":0};
		p = CDP1802.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x34,"Opcode");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
		QUnit.assert.equal(p.bytes,2,"Length");
		var par = p.lens[1]({});
		QUnit.assert.equal(par,0x10,"Param");

	});


	QUnit.test( "B1 lbl", function() {
		s = {"opcode":"B1","params":["LBL"],addr:"0x100",lens:[],"bytes":0};
		var varsLocal = {_PC:0x100,LBL:0x123};
		p = CDP1802.parseOpcode(s,varsLocal, Parser);
		QUnit.assert.equal(p.lens[0],0x34,"Opcode");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
		QUnit.assert.equal(p.bytes,2,"Length");
		var par = p.lens[1](varsLocal);
		QUnit.assert.equal(par,0x23,"Param");

	});


//QUnit.module("Bad tests");

	QUnit.test( "B1 over the boundary", function() {
		try {
			s = {"opcode":"B1","params":["LBL"],addr:"0x100",lens:[],"bytes":0};
			var varsLocal = {_PC:0x100,LBL:0x223};
			p = CDP1802.parseOpcode(s,varsLocal, Parser);
			var par = p.lens[1](varsLocal);
		} catch (e) {
			p = e;
		}
		QUnit.assert.equal(p,"Cross page jump","Cross page jump detected");
	});

	QUnit.test( "Bad port number", function() {
		try {
			s = {"opcode":"INP","params":["0"],addr:"0x100",lens:[],"bytes":0};
			p = CDP1802.parseOpcode(s, vars, Parser);
		} catch (e) {
			p = e;
		}
		QUnit.assert.equal(p,"Unrecognized port: 0","Bad port number detected");
	});

	QUnit.test( "Register evaluation error handling", function() {
		try {
			s = {"opcode":"SEX","params":["UNDEFINED_VAR"],addr:"0x100",lens:[],"bytes":0};
			p = CDP1802.parseOpcode(s, {}, Parser);
		} catch (e) {
			p = e;
		}
		QUnit.assert.equal(p,"Unrecognized register: UNDEFINED_VAR","Register evaluation error detected");
	});

	QUnit.test( "Register out of range - too high", function() {
		try {
			s = {"opcode":"SEX","params":["16"],addr:"0x100",lens:[],"bytes":0};
			p = CDP1802.parseOpcode(s, vars, Parser);
		} catch (e) {
			p = e;
		}
		QUnit.assert.equal(p,"Unrecognized register: 16","Register too high detected");
	});

	QUnit.test( "Register out of range - negative", function() {
		try {
			s = {"opcode":"SEX","params":["-1"],addr:"0x100",lens:[],"bytes":0};
			p = CDP1802.parseOpcode(s, vars, Parser);
		} catch (e) {
			p = e;
		}
		QUnit.assert.equal(p,"Unrecognized register: -1","Negative register detected");
	});

	QUnit.test( "Port evaluation error handling", function() {
		try {
			s = {"opcode":"INP","params":["UNDEFINED_VAR"],addr:"0x100",lens:[],"bytes":0};
			p = CDP1802.parseOpcode(s, {}, Parser);
		} catch (e) {
			p = e;
		}
		QUnit.assert.equal(p,"Unrecognized port: UNDEFINED_VAR","Port evaluation error detected");
	});

	QUnit.test( "Port out of range - too high", function() {
		try {
			s = {"opcode":"INP","params":["8"],addr:"0x100",lens:[],"bytes":0};
			p = CDP1802.parseOpcode(s, vars, Parser);
		} catch (e) {
			p = e;
		}
		QUnit.assert.equal(p,"Unrecognized port: 8","Port too high detected");
	});

	QUnit.test( "Unrecognized opcode returns null", function() {
		s = {"opcode":"INVALID","params":["1"],addr:"0x100",lens:[],"bytes":0};
		p = CDP1802.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p, null, "Unrecognized opcode returns null");
	});

	QUnit.test( "Endian property", function() {
		QUnit.assert.equal(CDP1802.endian, true, "CDP1802 is big-endian");
	});


/*
test( "EXG A", function() {
		throws(function(){
		s = {"opcode":"EXG","params":["A"],addr:"0x100",lens:[],"bytes":0};
		p = CDP1802.parseOpcode(s);
	});
});
test( "EXG A,B,C", function() {
		throws(function(){
		s = {"opcode":"EXG","params":["A","B","C"],addr:"0x100",lens:[],"bytes":0};
		p = CDP1802.parseOpcode(s);
	});
});
test( "EXG A,C", function() {
		throws(function(){
		s = {"opcode":"EXG","params":["A","C"],addr:"0x100",lens:[],"bytes":0};
		p = CDP1802.parseOpcode(s);
	});
});
*/