import { C6502 } from "../cpu/c6502.js";
import { Parser } from "../expression-parser.js";
import QUnit from "qunit"



QUnit.module("ASM-6502");

QUnit.test( "Namespace", function() {
	QUnit.assert.notEqual( C6502, null, "C6502 is defined" );
    QUnit.assert.equal( typeof(C6502), "object", "C6502 is an object" );
	QUnit.assert.equal( typeof(C6502.parseOpcode), "function", "C6502.parseOpcode defined" );
});

var vars = {"LOOP":0x1234,"SHORT":0x21,"_PC":0x0100};
var s = [], p;

QUnit.test( "Mode zpg $12", function() {
	s = {"opcode":"LDA",params:["$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xa5,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});
QUnit.test( "Mode zpg *short", function() {
	s = {"opcode":"LDA",params:["*short"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xa5,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});



QUnit.test("STA Y,22", function() {
  QUnit.assert.throws(function(){
    vars = {"LOOP":0x1234,"SHORT":0x21,"NEAR":0x0105,"BEAR":0xf0,"_PC":0x0100};
    s = {"opcode":"STA","params":["Y","$22"],addr:"0x100",lens:[],"bytes":0};
    p = C6502.parseOpcode(s,vars);
    //p.lens[1](vars);
  });
});
/*
QUnit.test("STU 22", function() {
  QUnit.assert.throws(function(){
    vars = {"LOOP":0x1234,"SHORT":0x21,"NEAR":0x0105,"BEAR":0xf0,"_PC":0x0100};
    s = {"opcode":"STU","params":["$22"],addr:"0x100",lens:[],"bytes":0};
    p = C6502.parseOpcode(s,vars);
    //p.lens[1](vars);
  });
});
*/



QUnit.test( "SLO test, mode abs", function() {
	s = {"opcode":"SLO",params:["$1234"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xf,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "SLO test, mode abx", function() {
	s = {"opcode":"SLO",params:["$1234","X"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x1f,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "SLO test, mode aby", function() {
	s = {"opcode":"SLO",params:["$1234","Y"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x1b,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "SLO test, mode zpg", function() {
	s = {"opcode":"SLO",params:["$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x7,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "SLO test, mode zpx", function() {
	s = {"opcode":"SLO",params:["$12","X"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x17,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "SLO test, mode ixz", function() {
	s = {"opcode":"SLO",params:["($12","X)"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x3,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "SLO test, mode izy", function() {
	s = {"opcode":"SLO",params:["($12)","Y"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x13,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "RLA test, mode abs", function() {
	s = {"opcode":"RLA",params:["$1234"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x2f,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "RLA test, mode abx", function() {
	s = {"opcode":"RLA",params:["$1234","X"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x3f,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "RLA test, mode aby", function() {
	s = {"opcode":"RLA",params:["$1234","Y"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x3b,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "RLA test, mode zpg", function() {
	s = {"opcode":"RLA",params:["$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x27,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "RLA test, mode zpx", function() {
	s = {"opcode":"RLA",params:["$12","X"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x37,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "RLA test, mode ixz", function() {
	s = {"opcode":"RLA",params:["($12","X)"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x23,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "RLA test, mode izy", function() {
	s = {"opcode":"RLA",params:["($12)","Y"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x33,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "SRE test, mode abs", function() {
	s = {"opcode":"SRE",params:["$1234"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x4f,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "SRE test, mode abx", function() {
	s = {"opcode":"SRE",params:["$1234","X"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x5f,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "SRE test, mode aby", function() {
	s = {"opcode":"SRE",params:["$1234","Y"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x5b,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "SRE test, mode zpg", function() {
	s = {"opcode":"SRE",params:["$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x47,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "SRE test, mode zpx", function() {
	s = {"opcode":"SRE",params:["$12","X"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x57,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "SRE test, mode ixz", function() {
	s = {"opcode":"SRE",params:["($12","X)"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x43,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "SRE test, mode izy", function() {
	s = {"opcode":"SRE",params:["($12)","Y"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x53,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "RRA test, mode abs", function() {
	s = {"opcode":"RRA",params:["$1234"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x6f,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "RRA test, mode abx", function() {
	s = {"opcode":"RRA",params:["$1234","X"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x7f,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "RRA test, mode aby", function() {
	s = {"opcode":"RRA",params:["$1234","Y"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x7b,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "RRA test, mode zpg", function() {
	s = {"opcode":"RRA",params:["$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x67,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "RRA test, mode zpx", function() {
	s = {"opcode":"RRA",params:["$12","X"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x77,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "RRA test, mode ixz", function() {
	s = {"opcode":"RRA",params:["($12","X)"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x63,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "RRA test, mode izy", function() {
	s = {"opcode":"RRA",params:["($12)","Y"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x73,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "SAX test, mode abs", function() {
	s = {"opcode":"SAX",params:["$1234"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x8f,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "SAX test, mode zpg", function() {
	s = {"opcode":"SAX",params:["$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x87,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "SAX test, mode zpy", function() {
	s = {"opcode":"SAX",params:["$12","Y"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x97,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "SAX test, mode ixz", function() {
	s = {"opcode":"SAX",params:["($12","X)"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x83,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "LAX test, mode imm", function() {
	s = {"opcode":"LAX",params:["#$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xab,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "LAX test, mode abs", function() {
	s = {"opcode":"LAX",params:["$1234"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xaf,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "LAX test, mode aby", function() {
	s = {"opcode":"LAX",params:["$1234","Y"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xbf,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "LAX test, mode zpg", function() {
	s = {"opcode":"LAX",params:["$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xa7,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "LAX test, mode zpy", function() {
	s = {"opcode":"LAX",params:["$12","Y"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xb7,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "LAX test, mode ixz", function() {
	s = {"opcode":"LAX",params:["($12","X)"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xa3,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "LAX test, mode izy", function() {
	s = {"opcode":"LAX",params:["($12)","Y"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xb3,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "DCP test, mode abs", function() {
	s = {"opcode":"DCP",params:["$1234"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xcf,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "DCP test, mode abx", function() {
	s = {"opcode":"DCP",params:["$1234","X"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xdf,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "DCP test, mode aby", function() {
	s = {"opcode":"DCP",params:["$1234","Y"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xdb,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "DCP test, mode zpg", function() {
	s = {"opcode":"DCP",params:["$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xc7,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "DCP test, mode zpx", function() {
	s = {"opcode":"DCP",params:["$12","X"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xd7,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "DCP test, mode ixz", function() {
	s = {"opcode":"DCP",params:["($12","X)"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xc3,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "DCP test, mode izy", function() {
	s = {"opcode":"DCP",params:["($12)","Y"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xd3,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "ISC test, mode abs", function() {
	s = {"opcode":"ISC",params:["$1234"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xef,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "ISC test, mode abx", function() {
	s = {"opcode":"ISC",params:["$1234","X"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xff,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "ISC test, mode aby", function() {
	s = {"opcode":"ISC",params:["$1234","Y"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xfb,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "ISC test, mode zpg", function() {
	s = {"opcode":"ISC",params:["$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xe7,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "ISC test, mode zpx", function() {
	s = {"opcode":"ISC",params:["$12","X"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xf7,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "ISC test, mode ixz", function() {
	s = {"opcode":"ISC",params:["($12","X)"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xe3,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "ISC test, mode izy", function() {
	s = {"opcode":"ISC",params:["($12)","Y"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xf3,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "ANC test, mode imm", function() {
	s = {"opcode":"ANC",params:["#$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xb,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "ALR test, mode imm", function() {
	s = {"opcode":"ALR",params:["#$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x4b,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "ARR test, mode imm", function() {
	s = {"opcode":"ARR",params:["#$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x6b,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "XAA test, mode imm", function() {
	s = {"opcode":"XAA",params:["#$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x8b,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "AXS test, mode imm", function() {
	s = {"opcode":"AXS",params:["#$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xcb,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "AHX test, mode aby", function() {
	s = {"opcode":"AHX",params:["$1234","Y"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x9f,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "AHX test, mode izy", function() {
	s = {"opcode":"AHX",params:["($12)","Y"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x93,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "SHY test, mode abx", function() {
	s = {"opcode":"SHY",params:["$1234","X"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x9c,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "SHX test, mode aby", function() {
	s = {"opcode":"SHX",params:["$1234","Y"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x9e,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "TAS test, mode aby", function() {
	s = {"opcode":"TAS",params:["$1234","Y"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x9b,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "LAS test, mode aby", function() {
	s = {"opcode":"LAS",params:["$1234","Y"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xbb,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "BRA test, mode rel", function() {
	s = {"opcode":"BRA",params:["$123"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x80,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "PHX test, mode imp", function() {
	s = {"opcode":"PHX","addr":0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xda,"Opcode OK");
	QUnit.assert.equal(p.bytes,1,"Length OK");
});

QUnit.test( "PHY test, mode imp", function() {
	s = {"opcode":"PHY","addr":0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x5a,"Opcode OK");
	QUnit.assert.equal(p.bytes,1,"Length OK");
});

QUnit.test( "PLX test, mode imp", function() {
	s = {"opcode":"PLX","addr":0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xfa,"Opcode OK");
	QUnit.assert.equal(p.bytes,1,"Length OK");
});

QUnit.test( "PLY test, mode imp", function() {
	s = {"opcode":"PLY","addr":0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x7a,"Opcode OK");
	QUnit.assert.equal(p.bytes,1,"Length OK");
});

QUnit.test( "RMB0 test, mode zpg", function() {
	s = {"opcode":"RMB0",params:["$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x7,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "RMB1 test, mode zpg", function() {
	s = {"opcode":"RMB1",params:["$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x17,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "RMB2 test, mode zpg", function() {
	s = {"opcode":"RMB2",params:["$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x27,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "RMB3 test, mode zpg", function() {
	s = {"opcode":"RMB3",params:["$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x37,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "RMB4 test, mode zpg", function() {
	s = {"opcode":"RMB4",params:["$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x47,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "RMB5 test, mode zpg", function() {
	s = {"opcode":"RMB5",params:["$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x57,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "RMB6 test, mode zpg", function() {
	s = {"opcode":"RMB6",params:["$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x67,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "RMB7 test, mode zpg", function() {
	s = {"opcode":"RMB7",params:["$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x77,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "SMB0 test, mode zpg", function() {
	s = {"opcode":"SMB0",params:["$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x87,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "SMB1 test, mode zpg", function() {
	s = {"opcode":"SMB1",params:["$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x97,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "SMB2 test, mode zpg", function() {
	s = {"opcode":"SMB2",params:["$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xa7,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "SMB3 test, mode zpg", function() {
	s = {"opcode":"SMB3",params:["$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xb7,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "SMB4 test, mode zpg", function() {
	s = {"opcode":"SMB4",params:["$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xc7,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "SMB5 test, mode zpg", function() {
	s = {"opcode":"SMB5",params:["$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xd7,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "SMB6 test, mode zpg", function() {
	s = {"opcode":"SMB6",params:["$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xe7,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "SMB7 test, mode zpg", function() {
	s = {"opcode":"SMB7",params:["$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xf7,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "BBR0 test, mode rel", function() {
	s = {"opcode":"BBR0",params:["$123"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xf,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "BBR1 test, mode rel", function() {
	s = {"opcode":"BBR1",params:["$123"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x1f,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "BBR2 test, mode rel", function() {
	s = {"opcode":"BBR2",params:["$123"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x2f,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "BBR3 test, mode rel", function() {
	s = {"opcode":"BBR3",params:["$123"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x3f,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "BBR4 test, mode rel", function() {
	s = {"opcode":"BBR4",params:["$123"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x4f,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "BBR5 test, mode rel", function() {
	s = {"opcode":"BBR5",params:["$123"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x5f,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "BBR6 test, mode rel", function() {
	s = {"opcode":"BBR6",params:["$123"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x6f,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "BBR7 test, mode rel", function() {
	s = {"opcode":"BBR7",params:["$123"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x7f,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "BBS0 test, mode rel", function() {
	s = {"opcode":"BBS0",params:["$123"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x8f,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "BBS1 test, mode rel", function() {
	s = {"opcode":"BBS1",params:["$123"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x9f,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "BBS2 test, mode rel", function() {
	s = {"opcode":"BBS2",params:["$123"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xaf,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "BBS3 test, mode rel", function() {
	s = {"opcode":"BBS3",params:["$123"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xbf,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "BBS4 test, mode rel", function() {
	s = {"opcode":"BBS4",params:["$123"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xcf,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "BBS5 test, mode rel", function() {
	s = {"opcode":"BBS5",params:["$123"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xdf,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "BBS6 test, mode rel", function() {
	s = {"opcode":"BBS6",params:["$123"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xef,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "BBS7 test, mode rel", function() {
	s = {"opcode":"BBS7",params:["$123"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xff,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "TRB test, mode abs", function() {
	s = {"opcode":"TRB",params:["$1234"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x1c,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "TRB test, mode zpg", function() {
	s = {"opcode":"TRB",params:["$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x14,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "TSB test, mode abs", function() {
	s = {"opcode":"TSB",params:["$1234"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xc,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "TSB test, mode zpg", function() {
	s = {"opcode":"TSB",params:["$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x4,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "STZ test, mode abs", function() {
	s = {"opcode":"STZ",params:["$1234"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x9c,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "STZ test, mode abx", function() {
	s = {"opcode":"STZ",params:["$1234","X"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x9e,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "STZ test, mode zpg", function() {
	s = {"opcode":"STZ",params:["$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x64,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "STZ test, mode zpx", function() {
	s = {"opcode":"STZ",params:["$12","X"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x74,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "ADC test, mode imm", function() {
	s = {"opcode":"ADC",params:["#$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x69,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "ADC test, mode abs", function() {
	s = {"opcode":"ADC",params:["$1234"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x6d,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "ADC test, mode abx", function() {
	s = {"opcode":"ADC",params:["$1234","X"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x7d,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "ADC test, mode aby", function() {
	s = {"opcode":"ADC",params:["$1234","Y"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x79,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "ADC test, mode zpg", function() {
	s = {"opcode":"ADC",params:["$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x65,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "ADC test, mode zpx", function() {
	s = {"opcode":"ADC",params:["$12","X"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x75,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "ADC test, mode ixz", function() {
	s = {"opcode":"ADC",params:["($12","X)"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x61,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "ADC test, mode izy", function() {
	s = {"opcode":"ADC",params:["($12)","Y"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x71,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "ADC test, mode izp", function() {
	s = {"opcode":"ADC",params:["($12)"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x72,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "AND test, mode imm", function() {
	s = {"opcode":"AND",params:["#$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x29,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "AND test, mode abs", function() {
	s = {"opcode":"AND",params:["$1234"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x2d,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "AND test, mode abx", function() {
	s = {"opcode":"AND",params:["$1234","X"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x3d,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "AND test, mode aby", function() {
	s = {"opcode":"AND",params:["$1234","Y"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x39,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "AND test, mode zpg", function() {
	s = {"opcode":"AND",params:["$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x25,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "AND test, mode zpx", function() {
	s = {"opcode":"AND",params:["$12","X"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x35,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "AND test, mode ixz", function() {
	s = {"opcode":"AND",params:["($12","X)"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x21,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "AND test, mode izy", function() {
	s = {"opcode":"AND",params:["($12)","Y"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x31,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "AND test, mode izp", function() {
	s = {"opcode":"AND",params:["($12)"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x32,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "ASL test, mode ima", function() {
	s = {"opcode":"ASL",params:["A"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xa,"Opcode OK");
	QUnit.assert.equal(p.bytes,1,"Length OK");
});

QUnit.test( "ASL test, mode abs", function() {
	s = {"opcode":"ASL",params:["$1234"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xe,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "ASL test, mode abx", function() {
	s = {"opcode":"ASL",params:["$1234","X"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x1e,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "ASL test, mode zpg", function() {
	s = {"opcode":"ASL",params:["$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x6,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "ASL test, mode zpx", function() {
	s = {"opcode":"ASL",params:["$12","X"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x16,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "BCC test, mode rel", function() {
	s = {"opcode":"BCC",params:["$123"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x90,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "BCS test, mode rel", function() {
	s = {"opcode":"BCS",params:["$123"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xb0,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "BEQ test, mode rel", function() {
	s = {"opcode":"BEQ",params:["$123"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xf0,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "BIT test, mode imm", function() {
	s = {"opcode":"BIT",params:["#$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x89,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "BIT test, mode abs", function() {
	s = {"opcode":"BIT",params:["$1234"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x2c,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "BIT test, mode abx", function() {
	s = {"opcode":"BIT",params:["$1234","X"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x3c,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "BIT test, mode zpg", function() {
	s = {"opcode":"BIT",params:["$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x24,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "BIT test, mode zpx", function() {
	s = {"opcode":"BIT",params:["$12","X"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x34,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "BMI test, mode rel", function() {
	s = {"opcode":"BMI",params:["$123"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x30,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "BNE test, mode rel", function() {
	s = {"opcode":"BNE",params:["$123"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xd0,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "BPL test, mode rel", function() {
	s = {"opcode":"BPL",params:["$123"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x10,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "BRK test, mode imp", function() {
	s = {"opcode":"BRK","addr":0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x0,"Opcode OK");
	QUnit.assert.equal(p.bytes,1,"Length OK");
});

QUnit.test( "BVC test, mode rel", function() {
	s = {"opcode":"BVC",params:["$123"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x50,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "BVS test, mode rel", function() {
	s = {"opcode":"BVS",params:["$123"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x70,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "CLC test, mode imp", function() {
	s = {"opcode":"CLC","addr":0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x18,"Opcode OK");
	QUnit.assert.equal(p.bytes,1,"Length OK");
});

QUnit.test( "CLD test, mode imp", function() {
	s = {"opcode":"CLD","addr":0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xd8,"Opcode OK");
	QUnit.assert.equal(p.bytes,1,"Length OK");
});

QUnit.test( "CLI test, mode imp", function() {
	s = {"opcode":"CLI","addr":0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x58,"Opcode OK");
	QUnit.assert.equal(p.bytes,1,"Length OK");
});

QUnit.test( "CLV test, mode imp", function() {
	s = {"opcode":"CLV","addr":0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xb8,"Opcode OK");
	QUnit.assert.equal(p.bytes,1,"Length OK");
});

QUnit.test( "CMP test, mode imm", function() {
	s = {"opcode":"CMP",params:["#$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xc9,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "CMP test, mode abs", function() {
	s = {"opcode":"CMP",params:["$1234"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xcd,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "CMP test, mode abx", function() {
	s = {"opcode":"CMP",params:["$1234","X"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xdd,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "CMP test, mode aby", function() {
	s = {"opcode":"CMP",params:["$1234","Y"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xd9,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "CMP test, mode zpg", function() {
	s = {"opcode":"CMP",params:["$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xc5,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "CMP test, mode zpx", function() {
	s = {"opcode":"CMP",params:["$12","X"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xd5,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "CMP test, mode ixz", function() {
	s = {"opcode":"CMP",params:["($12","X)"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xc1,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "CMP test, mode izy", function() {
	s = {"opcode":"CMP",params:["($12)","Y"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xd1,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "CMP test, mode izp", function() {
	s = {"opcode":"CMP",params:["($12)"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xd2,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "CPX test, mode imm", function() {
	s = {"opcode":"CPX",params:["#$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xe0,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "CPX test, mode abs", function() {
	s = {"opcode":"CPX",params:["$1234"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xec,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "CPX test, mode zpg", function() {
	s = {"opcode":"CPX",params:["$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xe4,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "CPY test, mode imm", function() {
	s = {"opcode":"CPY",params:["#$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xc0,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "CPY test, mode abs", function() {
	s = {"opcode":"CPY",params:["$1234"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xcc,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "CPY test, mode zpg", function() {
	s = {"opcode":"CPY",params:["$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xc4,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "DEC test, mode imp", function() {
	s = {"opcode":"DEC","addr":0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x3a,"Opcode OK");
	QUnit.assert.equal(p.bytes,1,"Length OK");
});

QUnit.test( "DEC test, mode abs", function() {
	s = {"opcode":"DEC",params:["$1234"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xce,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "DEC test, mode abx", function() {
	s = {"opcode":"DEC",params:["$1234","X"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xde,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "DEC test, mode zpg", function() {
	s = {"opcode":"DEC",params:["$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xc6,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "DEC test, mode zpx", function() {
	s = {"opcode":"DEC",params:["$12","X"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xd6,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "DEX test, mode imp", function() {
	s = {"opcode":"DEX","addr":0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xca,"Opcode OK");
	QUnit.assert.equal(p.bytes,1,"Length OK");
});

QUnit.test( "DEY test, mode imp", function() {
	s = {"opcode":"DEY","addr":0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x88,"Opcode OK");
	QUnit.assert.equal(p.bytes,1,"Length OK");
});

QUnit.test( "EOR test, mode imm", function() {
	s = {"opcode":"EOR",params:["#$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x49,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "EOR test, mode abs", function() {
	s = {"opcode":"EOR",params:["$1234"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x4d,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "EOR test, mode abx", function() {
	s = {"opcode":"EOR",params:["$1234","X"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x5d,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "EOR test, mode aby", function() {
	s = {"opcode":"EOR",params:["$1234","Y"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x59,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "EOR test, mode zpg", function() {
	s = {"opcode":"EOR",params:["$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x45,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "EOR test, mode zpx", function() {
	s = {"opcode":"EOR",params:["$12","X"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x55,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "EOR test, mode ixz", function() {
	s = {"opcode":"EOR",params:["($12","X)"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x41,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "EOR test, mode izy", function() {
	s = {"opcode":"EOR",params:["($12)","Y"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x51,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "EOR test, mode izp", function() {
	s = {"opcode":"EOR",params:["($12)"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x52,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "INC test, mode imp", function() {
	s = {"opcode":"INC","addr":0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x1a,"Opcode OK");
	QUnit.assert.equal(p.bytes,1,"Length OK");
});

QUnit.test( "INC test, mode abs", function() {
	s = {"opcode":"INC",params:["$1234"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xee,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "INC test, mode abx", function() {
	s = {"opcode":"INC",params:["$1234","X"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xfe,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "INC test, mode zpg", function() {
	s = {"opcode":"INC",params:["$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xe6,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "INC test, mode zpx", function() {
	s = {"opcode":"INC",params:["$12","X"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xf6,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "INX test, mode imp", function() {
	s = {"opcode":"INX","addr":0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xe8,"Opcode OK");
	QUnit.assert.equal(p.bytes,1,"Length OK");
});

QUnit.test( "INY test, mode imp", function() {
	s = {"opcode":"INY","addr":0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xc8,"Opcode OK");
	QUnit.assert.equal(p.bytes,1,"Length OK");
});

QUnit.test( "JMP test, mode abs", function() {
	s = {"opcode":"JMP",params:["$1234"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x4c,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "JMP test, mode ind", function() {
	s = {"opcode":"JMP",params:["($1234)"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x6c,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "JMP test, mode iax", function() {
	s = {"opcode":"JMP",params:["($1234","X)"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x7c,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "JSR test, mode abs", function() {
	s = {"opcode":"JSR",params:["$1234"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x20,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "LDA test, mode imm", function() {
	s = {"opcode":"LDA",params:["#$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xa9,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "LDA test, mode abs", function() {
	s = {"opcode":"LDA",params:["$1234"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xad,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "LDA test, mode abx", function() {
	s = {"opcode":"LDA",params:["$1234","X"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xbd,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "LDA test, mode aby", function() {
	s = {"opcode":"LDA",params:["$1234","Y"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xb9,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "LDA test, mode zpg", function() {
	s = {"opcode":"LDA",params:["$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xa5,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "LDA test, mode zpx", function() {
	s = {"opcode":"LDA",params:["$12","X"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xb5,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "LDA test, mode ixz", function() {
	s = {"opcode":"LDA",params:["($12","X)"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xa1,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "LDA test, mode izy", function() {
	s = {"opcode":"LDA",params:["($12)","Y"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xb1,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "LDA test, mode izp", function() {
	s = {"opcode":"LDA",params:["($12)"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xb2,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "LDX test, mode imm", function() {
	s = {"opcode":"LDX",params:["#$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xa2,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "LDX test, mode abs", function() {
	s = {"opcode":"LDX",params:["$1234"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xae,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "LDX test, mode aby", function() {
	s = {"opcode":"LDX",params:["$1234","Y"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xbe,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "LDX test, mode zpg", function() {
	s = {"opcode":"LDX",params:["$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xa6,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "LDX test, mode zpy", function() {
	s = {"opcode":"LDX",params:["$12","Y"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xb6,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "LDY test, mode imm", function() {
	s = {"opcode":"LDY",params:["#$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xa0,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "LDY test, mode abs", function() {
	s = {"opcode":"LDY",params:["$1234"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xac,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "LDY test, mode abx", function() {
	s = {"opcode":"LDY",params:["$1234","X"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xbc,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "LDY test, mode zpg", function() {
	s = {"opcode":"LDY",params:["$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xa4,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "LDY test, mode zpx", function() {
	s = {"opcode":"LDY",params:["$12","X"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xb4,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "LSR test, mode ima", function() {
	s = {"opcode":"LSR",params:["A"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x4a,"Opcode OK");
	QUnit.assert.equal(p.bytes,1,"Length OK");
});

QUnit.test( "LSR test, mode abs", function() {
	s = {"opcode":"LSR",params:["$1234"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x4e,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "LSR test, mode abx", function() {
	s = {"opcode":"LSR",params:["$1234","X"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x5e,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "LSR test, mode zpg", function() {
	s = {"opcode":"LSR",params:["$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x46,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "LSR test, mode zpx", function() {
	s = {"opcode":"LSR",params:["$12","X"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x56,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "NOP test, mode imp", function() {
	s = {"opcode":"NOP","addr":0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xea,"Opcode OK");
	QUnit.assert.equal(p.bytes,1,"Length OK");
});

QUnit.test( "ORA test, mode imm", function() {
	s = {"opcode":"ORA",params:["#$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x9,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "ORA test, mode abs", function() {
	s = {"opcode":"ORA",params:["$1234"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xd,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "ORA test, mode abx", function() {
	s = {"opcode":"ORA",params:["$1234","X"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x1d,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "ORA test, mode aby", function() {
	s = {"opcode":"ORA",params:["$1234","Y"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x19,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "ORA test, mode zpg", function() {
	s = {"opcode":"ORA",params:["$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x5,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "ORA test, mode zpx", function() {
	s = {"opcode":"ORA",params:["$12","X"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x15,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "ORA test, mode ixz", function() {
	s = {"opcode":"ORA",params:["($12","X)"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x1,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "ORA test, mode izy", function() {
	s = {"opcode":"ORA",params:["($12)","Y"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x11,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "ORA test, mode izp", function() {
	s = {"opcode":"ORA",params:["($12)"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x12,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "PHA test, mode imp", function() {
	s = {"opcode":"PHA","addr":0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x48,"Opcode OK");
	QUnit.assert.equal(p.bytes,1,"Length OK");
});

QUnit.test( "PHP test, mode imp", function() {
	s = {"opcode":"PHP","addr":0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x8,"Opcode OK");
	QUnit.assert.equal(p.bytes,1,"Length OK");
});

QUnit.test( "PLA test, mode imp", function() {
	s = {"opcode":"PLA","addr":0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x68,"Opcode OK");
	QUnit.assert.equal(p.bytes,1,"Length OK");
});

QUnit.test( "PLP test, mode imp", function() {
	s = {"opcode":"PLP","addr":0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x28,"Opcode OK");
	QUnit.assert.equal(p.bytes,1,"Length OK");
});

QUnit.test( "ROL test, mode ima", function() {
	s = {"opcode":"ROL",params:["A"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x2a,"Opcode OK");
	QUnit.assert.equal(p.bytes,1,"Length OK");
});

QUnit.test( "ROL test, mode abs", function() {
	s = {"opcode":"ROL",params:["$1234"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x2e,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "ROL test, mode abx", function() {
	s = {"opcode":"ROL",params:["$1234","X"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x3e,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "ROL test, mode zpg", function() {
	s = {"opcode":"ROL",params:["$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x26,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "ROL test, mode zpx", function() {
	s = {"opcode":"ROL",params:["$12","X"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x36,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "ROR test, mode ima", function() {
	s = {"opcode":"ROR",params:["A"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x6a,"Opcode OK");
	QUnit.assert.equal(p.bytes,1,"Length OK");
});

QUnit.test( "ROR test, mode abs", function() {
	s = {"opcode":"ROR",params:["$1234"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x6e,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "ROR test, mode abx", function() {
	s = {"opcode":"ROR",params:["$1234","X"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x7e,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "ROR test, mode zpg", function() {
	s = {"opcode":"ROR",params:["$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x66,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "ROR test, mode zpx", function() {
	s = {"opcode":"ROR",params:["$12","X"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x76,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "RTI test, mode imp", function() {
	s = {"opcode":"RTI","addr":0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x40,"Opcode OK");
	QUnit.assert.equal(p.bytes,1,"Length OK");
});

QUnit.test( "RTS test, mode imp", function() {
	s = {"opcode":"RTS","addr":0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x60,"Opcode OK");
	QUnit.assert.equal(p.bytes,1,"Length OK");
});

QUnit.test( "SBC test, mode imm", function() {
	s = {"opcode":"SBC",params:["#$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xe9,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "SBC test, mode abs", function() {
	s = {"opcode":"SBC",params:["$1234"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xed,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "SBC test, mode abx", function() {
	s = {"opcode":"SBC",params:["$1234","X"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xfd,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "SBC test, mode aby", function() {
	s = {"opcode":"SBC",params:["$1234","Y"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xf9,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "SBC test, mode zpg", function() {
	s = {"opcode":"SBC",params:["$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xe5,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "SBC test, mode zpx", function() {
	s = {"opcode":"SBC",params:["$12","X"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xf5,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "SBC test, mode ixz", function() {
	s = {"opcode":"SBC",params:["($12","X)"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xe1,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "SBC test, mode izy", function() {
	s = {"opcode":"SBC",params:["($12)","Y"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xf1,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "SBC test, mode izp", function() {
	s = {"opcode":"SBC",params:["($12)"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xf2,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "SEC test, mode imp", function() {
	s = {"opcode":"SEC","addr":0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x38,"Opcode OK");
	QUnit.assert.equal(p.bytes,1,"Length OK");
});

QUnit.test( "SED test, mode imp", function() {
	s = {"opcode":"SED","addr":0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xf8,"Opcode OK");
	QUnit.assert.equal(p.bytes,1,"Length OK");
});

QUnit.test( "SEI test, mode imp", function() {
	s = {"opcode":"SEI","addr":0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x78,"Opcode OK");
	QUnit.assert.equal(p.bytes,1,"Length OK");
});

QUnit.test( "STA test, mode abs", function() {
	s = {"opcode":"STA",params:["$1234"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x8d,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "STA test, mode abx", function() {
	s = {"opcode":"STA",params:["$1234","X"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x9d,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "STA test, mode aby", function() {
	s = {"opcode":"STA",params:["$1234","Y"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x99,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "STA test, mode zpg", function() {
	s = {"opcode":"STA",params:["$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x85,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "STA test, mode zpx", function() {
	s = {"opcode":"STA",params:["$12","X"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x95,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "STA test, mode ixz", function() {
	s = {"opcode":"STA",params:["($12","X)"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x81,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "STA test, mode izy", function() {
	s = {"opcode":"STA",params:["($12)","Y"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x91,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "STA test, mode izp", function() {
	s = {"opcode":"STA",params:["($12)"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x92,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "STX test, mode abs", function() {
	s = {"opcode":"STX",params:["$1234"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x8e,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "STX test, mode zpg", function() {
	s = {"opcode":"STX",params:["$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x86,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "STX test, mode zpy", function() {
	s = {"opcode":"STX",params:["$12","Y"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x96,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "STY test, mode abs", function() {
	s = {"opcode":"STY",params:["$1234"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x8c,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length OK");
});

QUnit.test( "STY test, mode zpg", function() {
	s = {"opcode":"STY",params:["$12"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x84,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "STY test, mode zpx", function() {
	s = {"opcode":"STY",params:["$12","X"],addr:0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x94,"Opcode OK");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length OK");
});

QUnit.test( "TAX test, mode imp", function() {
	s = {"opcode":"TAX","addr":0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xaa,"Opcode OK");
	QUnit.assert.equal(p.bytes,1,"Length OK");
});

QUnit.test( "TAY test, mode imp", function() {
	s = {"opcode":"TAY","addr":0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xa8,"Opcode OK");
	QUnit.assert.equal(p.bytes,1,"Length OK");
});

QUnit.test( "TSX test, mode imp", function() {
	s = {"opcode":"TSX","addr":0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0xba,"Opcode OK");
	QUnit.assert.equal(p.bytes,1,"Length OK");
});

QUnit.test( "TXA test, mode imp", function() {
	s = {"opcode":"TXA","addr":0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x8a,"Opcode OK");
	QUnit.assert.equal(p.bytes,1,"Length OK");
});

QUnit.test( "TXS test, mode imp", function() {
	s = {"opcode":"TXS","addr":0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x9a,"Opcode OK");
	QUnit.assert.equal(p.bytes,1,"Length OK");
});

QUnit.test( "TYA test, mode imp", function() {
	s = {"opcode":"TYA","addr":0x100,"lens":[],"bytes":0};
	p = C6502.parseOpcode(s);
	QUnit.assert.equal(p.lens[0],0x98,"Opcode OK");
	QUnit.assert.equal(p.bytes,1,"Length OK");
});

