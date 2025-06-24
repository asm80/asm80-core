import {C65816} from "../cpu/c65816.js";
import { Parser } from "../expression-parser.js";

QUnit.config.hidepassed = true;

QUnit.QUnit.module("ASM 65816");

QUnit.QUnit.test( "Namespace", function() {
	QUnit.assert.notEqual( C65816, null, "C65816 is defined" );
    QUnit.assert.equal( typeof(C65816), "object", "C65816 is an object" );
	QUnit.assert.equal( typeof(C65816.parseOpcode), "function", "C65816.parseOpcode defined" );
});
var vars = {"LOOP":0x1234,"SHORT":0x21,"_PC":0x0100};
var varsm16 = {"__MX":16,"_PC":0x0100};
var varsa16 = {"__AX":16,"_PC":0x0100};
var s = [], p;

QUnit.QUnit.test( "NOP test", function() {
	s = {"opcode":"NOP","addr":0x100,"lens":[],"bytes":0};
	p = C65816.parseOpcode(s, vars, Parser);
	QUnit.assert.equal(p.lens[0],0xea,"Opcode OK");
	QUnit.assert.equal(p.bytes,1,"Length OK");
});

QUnit.QUnit.test( "LDA zp", function() {
	s = {"opcode":"LDA","params":["$23"],addr:"0x100",lens:[],"bytes":0};
	p = C65816.parseOpcode(s, vars, Parser);
	QUnit.assert.equal(p.lens[0],0xa5,"Opcode");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length");
});
QUnit.QUnit.test( "LDA zp2", function() {
	s = {"opcode":"LDA","params":["short"],addr:"0x100",lens:[],"bytes":0};
	p = C65816.parseOpcode(s,vars, Parser);
	QUnit.assert.equal(p.lens[0],0xa5,"Opcode");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length");
});
QUnit.QUnit.test( "LDA imm", function() {
	s = {"opcode":"LDA","params":["#$23"],addr:"0x100",lens:[],"bytes":0};
	p = C65816.parseOpcode(s, vars, Parser);
	QUnit.assert.equal(p.lens[0],0xa9,"Opcode");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length");
});

QUnit.QUnit.test( "LDA imm, 16bit acc", function() {
	s = {"opcode":"LDA","params":["#$23"],addr:"0x100",lens:[],"bytes":0};
	p = C65816.parseOpcode(s,varsa16, Parser);
	QUnit.assert.equal(p.lens[0],0xa9,"Opcode");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length");
});

QUnit.test( "LDX imm", function() {
	s = {"opcode":"LDX","params":["#$23"],addr:"0x100",lens:[],"bytes":0};
	p = C65816.parseOpcode(s,varsa16, Parser);
	QUnit.assert.equal(p.lens[0],0xa2,"Opcode");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length");
});

QUnit.test( "LDX imm, 16bit acc", function() {
	s = {"opcode":"LDX","params":["#$23"],addr:"0x100",lens:[],"bytes":0};
	p = C65816.parseOpcode(s,varsm16, Parser);
	QUnit.assert.equal(p.lens[0],0xa2,"Opcode");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length");
});


QUnit.test( "LDA xx,S", function() {
	s = {"opcode":"LDA","params":["$23","S"],addr:"0x100",lens:[],"bytes":0};
	p = C65816.parseOpcode(s, vars, Parser);
	QUnit.assert.equal(p.lens[0],0xa3,"Opcode");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length");
});
QUnit.test( "STA xx,S", function() {
	s = {"opcode":"STA","params":["$23","S"],addr:"0x100",lens:[],"bytes":0};
	p = C65816.parseOpcode(s, vars, Parser);
	QUnit.assert.equal(p.lens[0],0x83,"Opcode");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length");
});

QUnit.module("65816 spec test");
QUnit.test( "MVP", function() {
	s = {"opcode":"MVP","params":["$12","$34"],addr:"0x100",lens:[],"bytes":0};
	p = C65816.parseOpcode(s, vars, Parser);
	QUnit.assert.equal(p.lens[0],0x44,"Opcode");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length");
});
QUnit.test( "MVN", function() {
	s = {"opcode":"MVN","params":["$12","$34"],addr:"0x100",lens:[],"bytes":0};
	p = C65816.parseOpcode(s, vars, Parser);
	QUnit.assert.equal(p.lens[0],0x54,"Opcode");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length");
});
QUnit.test( "PEA", function() {
	s = {"opcode":"PEA","params":["$1234"],addr:"0x100",lens:[],"bytes":0};
	p = C65816.parseOpcode(s, vars, Parser);
	QUnit.assert.equal(p.lens[0],0xF4,"Opcode");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length");
});
QUnit.test( "PEI", function() {
	s = {"opcode":"PEI","params":["($12)"],addr:"0x100",lens:[],"bytes":0};
	p = C65816.parseOpcode(s, vars, Parser);
	QUnit.assert.equal(p.lens[0],0xD4,"Opcode");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length");
});

QUnit.test( "PER", function() {
	s = {"opcode":"PER","params":["$1234"],addr:"0x100",lens:[],"bytes":0};
	p = C65816.parseOpcode(s, vars, Parser);
	QUnit.assert.equal(p.lens[0],0x62,"Opcode");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length");
});

QUnit.test( "PHB test", function() {
	s = {"opcode":"PHB","addr":0x100,"lens":[],"bytes":0};
	p = C65816.parseOpcode(s, vars, Parser);
	QUnit.assert.equal(p.lens[0],0x8B,"Opcode OK");
	QUnit.assert.equal(p.bytes,1,"Length OK");
});

QUnit.test( "PHD test", function() {
	s = {"opcode":"PHD","addr":0x100,"lens":[],"bytes":0};
	p = C65816.parseOpcode(s, vars, Parser);
	QUnit.assert.equal(p.lens[0],0x0B,"Opcode OK");
	QUnit.assert.equal(p.bytes,1,"Length OK");
});

QUnit.test( "PHK test", function() {
	s = {"opcode":"PHK","addr":0x100,"lens":[],"bytes":0};
	p = C65816.parseOpcode(s, vars, Parser);
	QUnit.assert.equal(p.lens[0],0x4B,"Opcode OK");
	QUnit.assert.equal(p.bytes,1,"Length OK");
});
QUnit.test( "PHX test", function() {
	s = {"opcode":"PHX","addr":0x100,"lens":[],"bytes":0};
	p = C65816.parseOpcode(s, vars, Parser);
	QUnit.assert.equal(p.lens[0],0xDA,"Opcode OK");
	QUnit.assert.equal(p.bytes,1,"Length OK");
});
QUnit.test( "PHY test", function() {
	s = {"opcode":"PHY","addr":0x100,"lens":[],"bytes":0};
	p = C65816.parseOpcode(s, vars, Parser);
	QUnit.assert.equal(p.lens[0],0x5A,"Opcode OK");
	QUnit.assert.equal(p.bytes,1,"Length OK");
});

QUnit.test( "PLB test", function() {
	s = {"opcode":"PLB","addr":0x100,"lens":[],"bytes":0};
	p = C65816.parseOpcode(s, vars, Parser);
	QUnit.assert.equal(p.lens[0],0xAB,"Opcode OK");
	QUnit.assert.equal(p.bytes,1,"Length OK");
});

QUnit.test( "PLD test", function() {
	s = {"opcode":"PLD","addr":0x100,"lens":[],"bytes":0};
	p = C65816.parseOpcode(s, vars, Parser);
	QUnit.assert.equal(p.lens[0],0x2B,"Opcode OK");
	QUnit.assert.equal(p.bytes,1,"Length OK");
});
QUnit.test( "PLX test", function() {
	s = {"opcode":"PLX","addr":0x100,"lens":[],"bytes":0};
	p = C65816.parseOpcode(s, vars, Parser);
	QUnit.assert.equal(p.lens[0],0xFA,"Opcode OK");
	QUnit.assert.equal(p.bytes,1,"Length OK");
});
QUnit.test( "PLY test", function() {
	s = {"opcode":"PLY","addr":0x100,"lens":[],"bytes":0};
	p = C65816.parseOpcode(s, vars, Parser);
	QUnit.assert.equal(p.lens[0],0x7A,"Opcode OK");
	QUnit.assert.equal(p.bytes,1,"Length OK");
});

QUnit.test( "REP #$12 - imm", function() {
	s = {"opcode":"REP","params":["#$23"],addr:"0x100",lens:[],"bytes":0};
	p = C65816.parseOpcode(s, vars, Parser);
	QUnit.assert.equal(p.lens[0],0xC2,"Opcode");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length");
});




QUnit.module("Addr modes test");

QUnit.test( "ADC (12,X)", function() {
	s = {"opcode":"ADC","params":["($23","X)"],addr:"0x100",lens:[],"bytes":0};
	p = C65816.parseOpcode(s, vars, Parser);
	QUnit.assert.equal(p.lens[0],0x61,"Opcode");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length");
});
QUnit.test( "ADC 12,S", function() {
	s = {"opcode":"ADC","params":["$23","S"],addr:"0x100",lens:[],"bytes":0};
	p = C65816.parseOpcode(s, vars, Parser);
	QUnit.assert.equal(p.lens[0],0x63,"Opcode");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length");
});
QUnit.test( "ADC $12 - dp", function() {
	s = {"opcode":"ADC","params":["$23"],addr:"0x100",lens:[],"bytes":0};
	p = C65816.parseOpcode(s, vars, Parser);
	QUnit.assert.equal(p.lens[0],0x65,"Opcode");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length");
});
QUnit.test( "ADC [$12] - idl", function() {
	s = {"opcode":"ADC","params":["[$23]"],addr:"0x100",lens:[],"bytes":0};
	p = C65816.parseOpcode(s, vars, Parser);
	QUnit.assert.equal(p.lens[0],0x67,"Opcode");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length");
});

QUnit.test( "ADC #$12 - imm", function() {
	s = {"opcode":"ADC","params":["#$23"],addr:"0x100",lens:[],"bytes":0};
	p = C65816.parseOpcode(s, vars, Parser);
	QUnit.assert.equal(p.lens[0],0x69,"Opcode");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length");
});

QUnit.test( "ADC #$12 - imm, acc16", function() {
	s = {"opcode":"ADC","params":["#$23"],addr:"0x100",lens:[],"bytes":0};
	p = C65816.parseOpcode(s,varsa16, Parser);
	QUnit.assert.equal(p.lens[0],0x69,"Opcode");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length");
});


QUnit.test( "ADC $1234 - abs", function() {
	s = {"opcode":"ADC","params":["$1234"],addr:"0x100",lens:[],"bytes":0};
	p = C65816.parseOpcode(s, vars, Parser);
	QUnit.assert.equal(p.lens[0],0x6D,"Opcode");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length");
});
QUnit.test( "ADC $123456 - long", function() {
	s = {"opcode":"ADC","params":["$123456"],addr:"0x100",lens:[],"bytes":0,vars:{}};
	p = C65816.parseOpcode(s,vars, Parser);
	QUnit.assert.equal(p.lens[0],0x6F,"Opcode");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,4,"Length");
});
QUnit.test( "ADC ($12),Y - dp", function() {
	s = {"opcode":"ADC","params":["($23)","Y"],addr:"0x100",lens:[],"bytes":0};
	p = C65816.parseOpcode(s, vars, Parser);
	QUnit.assert.equal(p.lens[0],0x71,"Opcode");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length");
});
QUnit.test( "ADC $12,X - dpidx", function() {
	s = {"opcode":"ADC","params":["$23","X"],addr:"0x100",lens:[],"bytes":0};
	p = C65816.parseOpcode(s, vars, Parser);
	QUnit.assert.equal(p.lens[0],0x75,"Opcode");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length");
});

QUnit.test( "ADC $1234,X - abx", function() {
	s = {"opcode":"ADC","params":["$1234","X"],addr:"0x100",lens:[],"bytes":0};
	p = C65816.parseOpcode(s, vars, Parser);
	QUnit.assert.equal(p.lens[0],0x7D,"Opcode");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length");
});
QUnit.test( "ADC $1234,Y - aby", function() {
	s = {"opcode":"ADC","params":["$1234","Y"],addr:"0x100",lens:[],"bytes":0};
	p = C65816.parseOpcode(s, vars, Parser);
	QUnit.assert.equal(p.lens[0],0x79,"Opcode");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length");
});

//65816
//

QUnit.test( "ADC ($12) - dpind", function() {
	s = {"opcode":"ADC","params":["($22)"],addr:"0x100",lens:[],"bytes":0};
	p = C65816.parseOpcode(s, vars, Parser);
	QUnit.assert.equal(p.lens[0],0x72,"Opcode");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length");
});
QUnit.test( "ADC [$12],Y - idl", function() {
	s = {"opcode":"ADC","params":["[$23]","Y"],addr:"0x100",lens:[],"bytes":0};
	p = C65816.parseOpcode(s, vars, Parser);
	QUnit.assert.equal(p.lens[0],0x77,"Opcode");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length");
});

QUnit.test( "ADC ($12,S),Y - dp", function() {
	s = {"opcode":"ADC","params":["($23","S)","Y"],addr:"0x100",lens:[],"bytes":0};
	p = C65816.parseOpcode(s, vars, Parser);
	QUnit.assert.equal(p.lens[0],0x73,"Opcode");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length");
});

QUnit.test( "ADC $123456,X - abx", function() {
	s = {"opcode":"ADC","params":["$123456","X"],addr:"0x100",lens:[],"bytes":0};
	p = C65816.parseOpcode(s, vars, Parser);
	QUnit.assert.equal(p.lens[0],0x7F,"Opcode");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,4,"Length");
});
QUnit.module("JMP modes test");
QUnit.test( "JMP", function() {
	s = {"opcode":"JMP","params":["$1234"],addr:"0x100",lens:[],"bytes":0};
	p = C65816.parseOpcode(s, vars, Parser);
	QUnit.assert.equal(p.lens[0],0x4c,"Opcode");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length");
});

QUnit.test( "JMP (abs)", function() {
	s = {"opcode":"JMP","params":["($1234)"],addr:"0x100",lens:[],"bytes":0};
	p = C65816.parseOpcode(s, vars, Parser);
	QUnit.assert.equal(p.lens[0],0x6c,"Opcode");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length");
});

QUnit.test( "JMP (abs,X)", function() {
	s = {"opcode":"JMP","params":["($1234","X)"],addr:"0x100",lens:[],"bytes":0};
	p = C65816.parseOpcode(s, vars, Parser);
	QUnit.assert.equal(p.lens[0],0x7c,"Opcode");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length");
});

QUnit.test( "JMP long", function() {
	s = {"opcode":"JMP","params":["$123457"],addr:"0x100",lens:[],"bytes":0};
	p = C65816.parseOpcode(s,vars, Parser);
	QUnit.assert.equal(p.lens[0],0x5c,"Opcode");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,4,"Length");
});

QUnit.test( "JMP [abs]", function() {
	s = {"opcode":"JMP","params":["[$1234]"],addr:"0x100",lens:[],"bytes":0};
	p = C65816.parseOpcode(s, vars, Parser);
	QUnit.assert.equal(p.lens[0],0xDC,"Opcode");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length");
});


QUnit.test( "JMP bad mode", function() {
	s = {"opcode":"JMP","params":["#$1234"],addr:"0x100",lens:[],"bytes":0,"numline":23};
	try {
		p = C65816.parseOpcode(s, vars, Parser);
	} catch (e) {
		p = e;
	}
	QUnit.assert.equal(p,"Bad addressing mode at line 23","Bad mode detected");
});


QUnit.module("JSR modes test");
QUnit.test( "JSR", function() {
	s = {"opcode":"JSR","params":["$1234"],addr:"0x100",lens:[],"bytes":0};
	p = C65816.parseOpcode(s, vars, Parser);
	QUnit.assert.equal(p.lens[0],0x20,"Opcode");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length");
});

QUnit.test( "JSR (abs,X)", function() {
	s = {"opcode":"JSR","params":["($1234","X)"],addr:"0x100",lens:[],"bytes":0};
	p = C65816.parseOpcode(s, vars, Parser);
	QUnit.assert.equal(p.lens[0],0xFc,"Opcode");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length");
});

QUnit.test( "JSR long", function() {
	s = {"opcode":"JSR","params":["$123457"],addr:"0x100",lens:[],"bytes":0};
	p = C65816.parseOpcode(s,vars, Parser);
	QUnit.assert.equal(p.lens[0],0x22,"Opcode");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,4,"Length");
});

QUnit.module("Additional coverage tests");

QUnit.test( "ASL A - accumulator mode", function() {
	s = {"opcode":"ASL","params":["A"],addr:"0x100",lens:[],"bytes":0};
	p = C65816.parseOpcode(s, vars, Parser);
	QUnit.assert.equal(p.lens[0],0x0a,"Opcode");
	QUnit.assert.equal(p.bytes,1,"Length");
});

QUnit.test( "LDA *$12 - force zero page", function() {
	s = {"opcode":"LDA","params":["*$12"],addr:"0x100",lens:[],"bytes":0};
	p = C65816.parseOpcode(s, vars, Parser);
	QUnit.assert.equal(p.lens[0],0xa5,"Opcode");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length");
});

QUnit.test( "BRA $0102 - relative jump", function() {
	s = {"opcode":"BRA","params":["$0102"],addr:"0x100",lens:[],"bytes":0};
	p = C65816.parseOpcode(s, vars, Parser);
	QUnit.assert.equal(p.lens[0],0x80,"Opcode");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length");
});

QUnit.test( "LDA *$12,X - force zero page indexed", function() {
	s = {"opcode":"LDA","params":["*$12","X"],addr:"0x100",lens:[],"bytes":0};
	p = C65816.parseOpcode(s, vars, Parser);
	QUnit.assert.equal(p.lens[0],0xb5,"Opcode");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length");
});

QUnit.test( "LDX *$12,Y - force zero page indexed Y", function() {
	s = {"opcode":"LDX","params":["*$12","Y"],addr:"0x100",lens:[],"bytes":0};
	p = C65816.parseOpcode(s, vars, Parser);
	QUnit.assert.equal(p.lens[0],0xb6,"Opcode");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length");
});

QUnit.test( "LDA SHORT,X - auto zero page X", function() {
	s = {"opcode":"LDA","params":["SHORT","X"],addr:"0x100",lens:[],"bytes":0};
	p = C65816.parseOpcode(s, vars, Parser);
	QUnit.assert.equal(p.lens[0],0xb5,"Opcode");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length");
});

QUnit.test( "LDX SHORT,Y - auto zero page Y", function() {
	s = {"opcode":"LDX","params":["SHORT","Y"],addr:"0x100",lens:[],"bytes":0};
	p = C65816.parseOpcode(s, vars, Parser);
	QUnit.assert.equal(p.lens[0],0xb6,"Opcode");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
	QUnit.assert.equal(p.bytes,2,"Length");
});

