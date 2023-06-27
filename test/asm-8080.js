import {I8080} from "../cpu/i8080.js";
import { Parser } from "../expression-parser.js";

QUnit.config.hidepassed = true;

QUnit.module("ASM 8080");

QUnit.test( "Namespace", function() {
	QUnit.assert.notEqual( I8080, null, "I8080 is defined" );
    QUnit.assert.equal( typeof(I8080), "object", "I8080 is an object" );
	QUnit.assert.equal( typeof(I8080.parseOpcode), "function", "I8080.parseOpcode defined" );
});


//QUnit.module("Simple OP tests");
var vars = {"LOOP":0x1234,"SHORT":0x21,"_PC":0x0100};
var s = [], p;

	QUnit.test( "MOV A,A", function() {
		s = {"opcode":"MOV","params":["A","A"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x7F,"Opcode 0 = 0x7F OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "MOV A,B", function() {
		s = {"opcode":"MOV","params":["A","B"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x78,"Opcode 0 = 0x78 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "MOV A,C", function() {
		s = {"opcode":"MOV","params":["A","C"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x79,"Opcode 0 = 0x79 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "MOV A,D", function() {
		s = {"opcode":"MOV","params":["A","D"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x7A,"Opcode 0 = 0x7A OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "MOV A,E", function() {
		s = {"opcode":"MOV","params":["A","E"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x7B,"Opcode 0 = 0x7B OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "MOV A,H", function() {
		s = {"opcode":"MOV","params":["A","H"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x7C,"Opcode 0 = 0x7C OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "MOV A,L", function() {
		s = {"opcode":"MOV","params":["A","L"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x7D,"Opcode 0 = 0x7D OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "MOV A,M", function() {
		s = {"opcode":"MOV","params":["A","M"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x7E,"Opcode 0 = 0x7E OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LDAX B", function() {
		s = {"opcode":"LDAX","params":["B"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x0A,"Opcode 0 = 0x0A OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LDAX D", function() {
		s = {"opcode":"LDAX","params":["D"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x1A,"Opcode 0 = 0x1A OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LDA 0x1234", function() {
		s = {"opcode":"LDA","params":["0x1234"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x3A,"Opcode 0 = 0x3A OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "MOV B,A", function() {
		s = {"opcode":"MOV","params":["B","A"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x47,"Opcode 0 = 0x47 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "MOV B,B", function() {
		s = {"opcode":"MOV","params":["B","B"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x40,"Opcode 0 = 0x40 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "MOV B,C", function() {
		s = {"opcode":"MOV","params":["B","C"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x41,"Opcode 0 = 0x41 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "MOV B,D", function() {
		s = {"opcode":"MOV","params":["B","D"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x42,"Opcode 0 = 0x42 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "MOV B,E", function() {
		s = {"opcode":"MOV","params":["B","E"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x43,"Opcode 0 = 0x43 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "MOV B,H", function() {
		s = {"opcode":"MOV","params":["B","H"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x44,"Opcode 0 = 0x44 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "MOV B,L", function() {
		s = {"opcode":"MOV","params":["B","L"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x45,"Opcode 0 = 0x45 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "MOV B,M", function() {
		s = {"opcode":"MOV","params":["B","M"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x46,"Opcode 0 = 0x46 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "MOV C,A", function() {
		s = {"opcode":"MOV","params":["C","A"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x4F,"Opcode 0 = 0x4F OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "MOV C,B", function() {
		s = {"opcode":"MOV","params":["C","B"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x48,"Opcode 0 = 0x48 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "MOV C,C", function() {
		s = {"opcode":"MOV","params":["C","C"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x49,"Opcode 0 = 0x49 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "MOV C,D", function() {
		s = {"opcode":"MOV","params":["C","D"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x4A,"Opcode 0 = 0x4A OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "MOV C,E", function() {
		s = {"opcode":"MOV","params":["C","E"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x4B,"Opcode 0 = 0x4B OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "MOV C,H", function() {
		s = {"opcode":"MOV","params":["C","H"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x4C,"Opcode 0 = 0x4C OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "MOV C,L", function() {
		s = {"opcode":"MOV","params":["C","L"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x4D,"Opcode 0 = 0x4D OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "MOV C,M", function() {
		s = {"opcode":"MOV","params":["C","M"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x4E,"Opcode 0 = 0x4E OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "MOV D,A", function() {
		s = {"opcode":"MOV","params":["D","A"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x57,"Opcode 0 = 0x57 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "MOV D,B", function() {
		s = {"opcode":"MOV","params":["D","B"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x50,"Opcode 0 = 0x50 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "MOV D,C", function() {
		s = {"opcode":"MOV","params":["D","C"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x51,"Opcode 0 = 0x51 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "MOV D,D", function() {
		s = {"opcode":"MOV","params":["D","D"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x52,"Opcode 0 = 0x52 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "MOV D,E", function() {
		s = {"opcode":"MOV","params":["D","E"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x53,"Opcode 0 = 0x53 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "MOV D,H", function() {
		s = {"opcode":"MOV","params":["D","H"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x54,"Opcode 0 = 0x54 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "MOV D,L", function() {
		s = {"opcode":"MOV","params":["D","L"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x55,"Opcode 0 = 0x55 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "MOV D,M", function() {
		s = {"opcode":"MOV","params":["D","M"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x56,"Opcode 0 = 0x56 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "MOV E,A", function() {
		s = {"opcode":"MOV","params":["E","A"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x5F,"Opcode 0 = 0x5F OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "MOV E,B", function() {
		s = {"opcode":"MOV","params":["E","B"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x58,"Opcode 0 = 0x58 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "MOV E,C", function() {
		s = {"opcode":"MOV","params":["E","C"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x59,"Opcode 0 = 0x59 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "MOV E,D", function() {
		s = {"opcode":"MOV","params":["E","D"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x5A,"Opcode 0 = 0x5A OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "MOV E,E", function() {
		s = {"opcode":"MOV","params":["E","E"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x5B,"Opcode 0 = 0x5B OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "MOV E,H", function() {
		s = {"opcode":"MOV","params":["E","H"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x5C,"Opcode 0 = 0x5C OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "MOV E,L", function() {
		s = {"opcode":"MOV","params":["E","L"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x5D,"Opcode 0 = 0x5D OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "MOV E,M", function() {
		s = {"opcode":"MOV","params":["E","M"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x5E,"Opcode 0 = 0x5E OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "MOV H,A", function() {
		s = {"opcode":"MOV","params":["H","A"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x67,"Opcode 0 = 0x67 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "MOV H,B", function() {
		s = {"opcode":"MOV","params":["H","B"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x60,"Opcode 0 = 0x60 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "MOV H,C", function() {
		s = {"opcode":"MOV","params":["H","C"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x61,"Opcode 0 = 0x61 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "MOV H,D", function() {
		s = {"opcode":"MOV","params":["H","D"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x62,"Opcode 0 = 0x62 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "MOV H,E", function() {
		s = {"opcode":"MOV","params":["H","E"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x63,"Opcode 0 = 0x63 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "MOV H,H", function() {
		s = {"opcode":"MOV","params":["H","H"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x64,"Opcode 0 = 0x64 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "MOV H,L", function() {
		s = {"opcode":"MOV","params":["H","L"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x65,"Opcode 0 = 0x65 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "MOV H,M", function() {
		s = {"opcode":"MOV","params":["H","M"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x66,"Opcode 0 = 0x66 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "MOV L,A", function() {
		s = {"opcode":"MOV","params":["L","A"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x6F,"Opcode 0 = 0x6F OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "MOV L,B", function() {
		s = {"opcode":"MOV","params":["L","B"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x68,"Opcode 0 = 0x68 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "MOV L,C", function() {
		s = {"opcode":"MOV","params":["L","C"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x69,"Opcode 0 = 0x69 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "MOV L,D", function() {
		s = {"opcode":"MOV","params":["L","D"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x6A,"Opcode 0 = 0x6A OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "MOV L,E", function() {
		s = {"opcode":"MOV","params":["L","E"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x6B,"Opcode 0 = 0x6B OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "MOV L,H", function() {
		s = {"opcode":"MOV","params":["L","H"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x6C,"Opcode 0 = 0x6C OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "MOV L,L", function() {
		s = {"opcode":"MOV","params":["L","L"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x6D,"Opcode 0 = 0x6D OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "MOV L,M", function() {
		s = {"opcode":"MOV","params":["L","M"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x6E,"Opcode 0 = 0x6E OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "MOV M,A", function() {
		s = {"opcode":"MOV","params":["M","A"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x77,"Opcode 0 = 0x77 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "MOV M,B", function() {
		s = {"opcode":"MOV","params":["M","B"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x70,"Opcode 0 = 0x70 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "MOV M,C", function() {
		s = {"opcode":"MOV","params":["M","C"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x71,"Opcode 0 = 0x71 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "MOV M,D", function() {
		s = {"opcode":"MOV","params":["M","D"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x72,"Opcode 0 = 0x72 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "MOV M,E", function() {
		s = {"opcode":"MOV","params":["M","E"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x73,"Opcode 0 = 0x73 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "MOV M,H", function() {
		s = {"opcode":"MOV","params":["M","H"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x74,"Opcode 0 = 0x74 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "MOV M,L", function() {
		s = {"opcode":"MOV","params":["M","L"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x75,"Opcode 0 = 0x75 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "MVI A,0x12", function() {
		s = {"opcode":"MVI","params":["A","0x12"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x3E,"Opcode 0 = 0x3E OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "MVI B,0x12", function() {
		s = {"opcode":"MVI","params":["B","0x12"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x06,"Opcode 0 = 0x06 OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "MVI C,0x12", function() {
		s = {"opcode":"MVI","params":["C","0x12"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x0E,"Opcode 0 = 0x0E OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "MVI D,0x12", function() {
		s = {"opcode":"MVI","params":["D","0x12"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x16,"Opcode 0 = 0x16 OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "MVI E,0x12", function() {
		s = {"opcode":"MVI","params":["E","0x12"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x1E,"Opcode 0 = 0x1E OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "MVI H,0x12", function() {
		s = {"opcode":"MVI","params":["H","0x12"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x26,"Opcode 0 = 0x26 OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "MVI L,0x12", function() {
		s = {"opcode":"MVI","params":["L","0x12"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x2E,"Opcode 0 = 0x2E OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "MVI M,0x12", function() {
		s = {"opcode":"MVI","params":["M","0x12"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x36,"Opcode 0 = 0x36 OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "STAX B", function() {
		s = {"opcode":"STAX","params":["B"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x02,"Opcode 0 = 0x02 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "STAX D", function() {
		s = {"opcode":"STAX","params":["D"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x12,"Opcode 0 = 0x12 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "STA 0x1234", function() {
		s = {"opcode":"STA","params":["0x1234"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x32,"Opcode 0 = 0x32 OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "LXI B,0x1234", function() {
		s = {"opcode":"LXI","params":["B","0x1234"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x01,"Opcode 0 = 0x01 OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "LXI D,0x1234", function() {
		s = {"opcode":"LXI","params":["D","0x1234"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x11,"Opcode 0 = 0x11 OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "LXI H,0x1234", function() {
		s = {"opcode":"LXI","params":["H","0x1234"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x21,"Opcode 0 = 0x21 OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "LXI SP,0x1234", function() {
		s = {"opcode":"LXI","params":["SP","0x1234"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x31,"Opcode 0 = 0x31 OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "LHLD 0x1234", function() {
		s = {"opcode":"LHLD","params":["0x1234"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x2A,"Opcode 0 = 0x2A OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "SHLD 0x1234", function() {
		s = {"opcode":"SHLD","params":["0x1234"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x22,"Opcode 0 = 0x22 OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "SPHL ", function() {
		s = {"opcode":"SPHL","params":[],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xF9,"Opcode 0 = 0xF9 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "XCHG ", function() {
		s = {"opcode":"XCHG","params":[],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xEB,"Opcode 0 = 0xEB OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "XTHL ", function() {
		s = {"opcode":"XTHL","params":[],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xE3,"Opcode 0 = 0xE3 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "ADD A", function() {
		s = {"opcode":"ADD","params":["A"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x87,"Opcode 0 = 0x87 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "ADD B", function() {
		s = {"opcode":"ADD","params":["B"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x80,"Opcode 0 = 0x80 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "ADD C", function() {
		s = {"opcode":"ADD","params":["C"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x81,"Opcode 0 = 0x81 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "ADD D", function() {
		s = {"opcode":"ADD","params":["D"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x82,"Opcode 0 = 0x82 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "ADD E", function() {
		s = {"opcode":"ADD","params":["E"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x83,"Opcode 0 = 0x83 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "ADD H", function() {
		s = {"opcode":"ADD","params":["H"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x84,"Opcode 0 = 0x84 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "ADD L", function() {
		s = {"opcode":"ADD","params":["L"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x85,"Opcode 0 = 0x85 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "ADD M", function() {
		s = {"opcode":"ADD","params":["M"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x86,"Opcode 0 = 0x86 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "ADI 0x12", function() {
		s = {"opcode":"ADI","params":["0x12"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xC6,"Opcode 0 = 0xC6 OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "ADC A", function() {
		s = {"opcode":"ADC","params":["A"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x8F,"Opcode 0 = 0x8F OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "ADC B", function() {
		s = {"opcode":"ADC","params":["B"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x88,"Opcode 0 = 0x88 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "ADC C", function() {
		s = {"opcode":"ADC","params":["C"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x89,"Opcode 0 = 0x89 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "ADC D", function() {
		s = {"opcode":"ADC","params":["D"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x8A,"Opcode 0 = 0x8A OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "ADC E", function() {
		s = {"opcode":"ADC","params":["E"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x8B,"Opcode 0 = 0x8B OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "ADC H", function() {
		s = {"opcode":"ADC","params":["H"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x8C,"Opcode 0 = 0x8C OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "ADC L", function() {
		s = {"opcode":"ADC","params":["L"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x8D,"Opcode 0 = 0x8D OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "ADC M", function() {
		s = {"opcode":"ADC","params":["M"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x8E,"Opcode 0 = 0x8E OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "ACI 0x12", function() {
		s = {"opcode":"ACI","params":["0x12"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCE,"Opcode 0 = 0xCE OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SUB A", function() {
		s = {"opcode":"SUB","params":["A"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x97,"Opcode 0 = 0x97 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "SUB B", function() {
		s = {"opcode":"SUB","params":["B"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x90,"Opcode 0 = 0x90 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "SUB C", function() {
		s = {"opcode":"SUB","params":["C"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x91,"Opcode 0 = 0x91 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "SUB D", function() {
		s = {"opcode":"SUB","params":["D"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x92,"Opcode 0 = 0x92 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "SUB E", function() {
		s = {"opcode":"SUB","params":["E"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x93,"Opcode 0 = 0x93 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "SUB H", function() {
		s = {"opcode":"SUB","params":["H"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x94,"Opcode 0 = 0x94 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "SUB L", function() {
		s = {"opcode":"SUB","params":["L"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x95,"Opcode 0 = 0x95 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "SUB M", function() {
		s = {"opcode":"SUB","params":["M"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x96,"Opcode 0 = 0x96 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "SUI 0x12", function() {
		s = {"opcode":"SUI","params":["0x12"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xD6,"Opcode 0 = 0xD6 OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SBB A", function() {
		s = {"opcode":"SBB","params":["A"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x9F,"Opcode 0 = 0x9F OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "SBB B", function() {
		s = {"opcode":"SBB","params":["B"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x98,"Opcode 0 = 0x98 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "SBB C", function() {
		s = {"opcode":"SBB","params":["C"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x99,"Opcode 0 = 0x99 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "SBB D", function() {
		s = {"opcode":"SBB","params":["D"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x9A,"Opcode 0 = 0x9A OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "SBB E", function() {
		s = {"opcode":"SBB","params":["E"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x9B,"Opcode 0 = 0x9B OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "SBB H", function() {
		s = {"opcode":"SBB","params":["H"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x9C,"Opcode 0 = 0x9C OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "SBB L", function() {
		s = {"opcode":"SBB","params":["L"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x9D,"Opcode 0 = 0x9D OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "SBB M", function() {
		s = {"opcode":"SBB","params":["M"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x9E,"Opcode 0 = 0x9E OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "SBI 0x12", function() {
		s = {"opcode":"SBI","params":["0x12"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDE,"Opcode 0 = 0xDE OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "DAD B", function() {
		s = {"opcode":"DAD","params":["B"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x09,"Opcode 0 = 0x09 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "DAD D", function() {
		s = {"opcode":"DAD","params":["D"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x19,"Opcode 0 = 0x19 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "DAD H", function() {
		s = {"opcode":"DAD","params":["H"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x29,"Opcode 0 = 0x29 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "DAD SP", function() {
		s = {"opcode":"DAD","params":["SP"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x39,"Opcode 0 = 0x39 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "DI ", function() {
		s = {"opcode":"DI","params":[],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xF3,"Opcode 0 = 0xF3 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "EI ", function() {
		s = {"opcode":"EI","params":[],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFB,"Opcode 0 = 0xFB OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "NOP ", function() {
		s = {"opcode":"NOP","params":[],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x00,"Opcode 0 = 0x00 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "HLT ", function() {
		s = {"opcode":"HLT","params":[],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x76,"Opcode 0 = 0x76 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "INR A", function() {
		s = {"opcode":"INR","params":["A"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x3C,"Opcode 0 = 0x3C OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "INR B", function() {
		s = {"opcode":"INR","params":["B"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x04,"Opcode 0 = 0x04 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "INR C", function() {
		s = {"opcode":"INR","params":["C"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x0C,"Opcode 0 = 0x0C OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "INR D", function() {
		s = {"opcode":"INR","params":["D"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x14,"Opcode 0 = 0x14 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "INR E", function() {
		s = {"opcode":"INR","params":["E"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x1C,"Opcode 0 = 0x1C OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "INR H", function() {
		s = {"opcode":"INR","params":["H"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x24,"Opcode 0 = 0x24 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "INR L", function() {
		s = {"opcode":"INR","params":["L"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x2C,"Opcode 0 = 0x2C OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "INR M", function() {
		s = {"opcode":"INR","params":["M"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x34,"Opcode 0 = 0x34 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "DCR A", function() {
		s = {"opcode":"DCR","params":["A"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x3D,"Opcode 0 = 0x3D OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "DCR B", function() {
		s = {"opcode":"DCR","params":["B"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x05,"Opcode 0 = 0x05 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "DCR C", function() {
		s = {"opcode":"DCR","params":["C"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x0D,"Opcode 0 = 0x0D OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "DCR D", function() {
		s = {"opcode":"DCR","params":["D"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x15,"Opcode 0 = 0x15 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "DCR E", function() {
		s = {"opcode":"DCR","params":["E"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x1D,"Opcode 0 = 0x1D OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "DCR H", function() {
		s = {"opcode":"DCR","params":["H"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x25,"Opcode 0 = 0x25 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "DCR L", function() {
		s = {"opcode":"DCR","params":["L"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x2D,"Opcode 0 = 0x2D OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "DCR M", function() {
		s = {"opcode":"DCR","params":["M"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x35,"Opcode 0 = 0x35 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "INX B", function() {
		s = {"opcode":"INX","params":["B"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x03,"Opcode 0 = 0x03 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "INX D", function() {
		s = {"opcode":"INX","params":["D"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x13,"Opcode 0 = 0x13 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "INX H", function() {
		s = {"opcode":"INX","params":["H"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x23,"Opcode 0 = 0x23 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "INX SP", function() {
		s = {"opcode":"INX","params":["SP"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x33,"Opcode 0 = 0x33 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "DCX B", function() {
		s = {"opcode":"DCX","params":["B"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x0B,"Opcode 0 = 0x0B OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "DCX D", function() {
		s = {"opcode":"DCX","params":["D"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x1B,"Opcode 0 = 0x1B OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "DCX H", function() {
		s = {"opcode":"DCX","params":["H"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x2B,"Opcode 0 = 0x2B OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "DCX SP", function() {
		s = {"opcode":"DCX","params":["SP"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x3B,"Opcode 0 = 0x3B OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "DAA ", function() {
		s = {"opcode":"DAA","params":[],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x27,"Opcode 0 = 0x27 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "CMA ", function() {
		s = {"opcode":"CMA","params":[],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x2F,"Opcode 0 = 0x2F OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "STC ", function() {
		s = {"opcode":"STC","params":[],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x37,"Opcode 0 = 0x37 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "CMC ", function() {
		s = {"opcode":"CMC","params":[],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x3F,"Opcode 0 = 0x3F OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "RLC ", function() {
		s = {"opcode":"RLC","params":[],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x07,"Opcode 0 = 0x07 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "RRC ", function() {
		s = {"opcode":"RRC","params":[],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x0F,"Opcode 0 = 0x0F OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "RAL ", function() {
		s = {"opcode":"RAL","params":[],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x17,"Opcode 0 = 0x17 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "RAR ", function() {
		s = {"opcode":"RAR","params":[],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x1F,"Opcode 0 = 0x1F OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "ANA A", function() {
		s = {"opcode":"ANA","params":["A"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xA7,"Opcode 0 = 0xA7 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "ANA B", function() {
		s = {"opcode":"ANA","params":["B"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xA0,"Opcode 0 = 0xA0 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "ANA C", function() {
		s = {"opcode":"ANA","params":["C"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xA1,"Opcode 0 = 0xA1 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "ANA D", function() {
		s = {"opcode":"ANA","params":["D"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xA2,"Opcode 0 = 0xA2 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "ANA E", function() {
		s = {"opcode":"ANA","params":["E"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xA3,"Opcode 0 = 0xA3 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "ANA H", function() {
		s = {"opcode":"ANA","params":["H"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xA4,"Opcode 0 = 0xA4 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "ANA L", function() {
		s = {"opcode":"ANA","params":["L"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xA5,"Opcode 0 = 0xA5 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "ANA M", function() {
		s = {"opcode":"ANA","params":["M"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xA6,"Opcode 0 = 0xA6 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "ANI 0x12", function() {
		s = {"opcode":"ANI","params":["0x12"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xE6,"Opcode 0 = 0xE6 OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "XRA A", function() {
		s = {"opcode":"XRA","params":["A"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xAF,"Opcode 0 = 0xAF OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "XRA B", function() {
		s = {"opcode":"XRA","params":["B"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xA8,"Opcode 0 = 0xA8 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "XRA C", function() {
		s = {"opcode":"XRA","params":["C"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xA9,"Opcode 0 = 0xA9 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "XRA D", function() {
		s = {"opcode":"XRA","params":["D"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xAA,"Opcode 0 = 0xAA OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "XRA E", function() {
		s = {"opcode":"XRA","params":["E"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xAB,"Opcode 0 = 0xAB OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "XRA H", function() {
		s = {"opcode":"XRA","params":["H"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xAC,"Opcode 0 = 0xAC OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "XRA L", function() {
		s = {"opcode":"XRA","params":["L"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xAD,"Opcode 0 = 0xAD OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "XRA M", function() {
		s = {"opcode":"XRA","params":["M"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xAE,"Opcode 0 = 0xAE OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "XRI 0x12", function() {
		s = {"opcode":"XRI","params":["0x12"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xEE,"Opcode 0 = 0xEE OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "ORA A", function() {
		s = {"opcode":"ORA","params":["A"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xB7,"Opcode 0 = 0xB7 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "ORA B", function() {
		s = {"opcode":"ORA","params":["B"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xB0,"Opcode 0 = 0xB0 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "ORA C", function() {
		s = {"opcode":"ORA","params":["C"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xB1,"Opcode 0 = 0xB1 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "ORA D", function() {
		s = {"opcode":"ORA","params":["D"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xB2,"Opcode 0 = 0xB2 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "ORA E", function() {
		s = {"opcode":"ORA","params":["E"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xB3,"Opcode 0 = 0xB3 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "ORA H", function() {
		s = {"opcode":"ORA","params":["H"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xB4,"Opcode 0 = 0xB4 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "ORA L", function() {
		s = {"opcode":"ORA","params":["L"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xB5,"Opcode 0 = 0xB5 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "ORA M", function() {
		s = {"opcode":"ORA","params":["M"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xB6,"Opcode 0 = 0xB6 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "ORI 0x12", function() {
		s = {"opcode":"ORI","params":["0x12"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xF6,"Opcode 0 = 0xF6 OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "CMP A", function() {
		s = {"opcode":"CMP","params":["A"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xBF,"Opcode 0 = 0xBF OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "CMP B", function() {
		s = {"opcode":"CMP","params":["B"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xB8,"Opcode 0 = 0xB8 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "CMP C", function() {
		s = {"opcode":"CMP","params":["C"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xB9,"Opcode 0 = 0xB9 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "CMP D", function() {
		s = {"opcode":"CMP","params":["D"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xBA,"Opcode 0 = 0xBA OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "CMP E", function() {
		s = {"opcode":"CMP","params":["E"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xBB,"Opcode 0 = 0xBB OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "CMP H", function() {
		s = {"opcode":"CMP","params":["H"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xBC,"Opcode 0 = 0xBC OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "CMP L", function() {
		s = {"opcode":"CMP","params":["L"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xBD,"Opcode 0 = 0xBD OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "CMP M", function() {
		s = {"opcode":"CMP","params":["M"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xBE,"Opcode 0 = 0xBE OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "CPI 0x12", function() {
		s = {"opcode":"CPI","params":["0x12"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFE,"Opcode 0 = 0xFE OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "JMP 0x5678", function() {
		s = {"opcode":"JMP","params":["0x5678"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xC3,"Opcode 0 = 0xC3 OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "JNZ 0x5678", function() {
		s = {"opcode":"JNZ","params":["0x5678"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xC2,"Opcode 0 = 0xC2 OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "JZ 0x5678", function() {
		s = {"opcode":"JZ","params":["0x5678"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCA,"Opcode 0 = 0xCA OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "JNC 0x5678", function() {
		s = {"opcode":"JNC","params":["0x5678"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xD2,"Opcode 0 = 0xD2 OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "JC 0x5678", function() {
		s = {"opcode":"JC","params":["0x5678"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDA,"Opcode 0 = 0xDA OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "JPO 0x5678", function() {
		s = {"opcode":"JPO","params":["0x5678"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xE2,"Opcode 0 = 0xE2 OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "JPE 0x5678", function() {
		s = {"opcode":"JPE","params":["0x5678"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xEA,"Opcode 0 = 0xEA OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "JP 0x5678", function() {
		s = {"opcode":"JP","params":["0x5678"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xF2,"Opcode 0 = 0xF2 OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "JM 0x5678", function() {
		s = {"opcode":"JM","params":["0x5678"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFA,"Opcode 0 = 0xFA OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "PCHL ", function() {
		s = {"opcode":"PCHL","params":[],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xE9,"Opcode 0 = 0xE9 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "CALL 0x5678", function() {
		s = {"opcode":"CALL","params":["0x5678"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCD,"Opcode 0 = 0xCD OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "CNZ 0x5678", function() {
		s = {"opcode":"CNZ","params":["0x5678"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xC4,"Opcode 0 = 0xC4 OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "CZ 0x5678", function() {
		s = {"opcode":"CZ","params":["0x5678"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCC,"Opcode 0 = 0xCC OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "CNC 0x5678", function() {
		s = {"opcode":"CNC","params":["0x5678"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xD4,"Opcode 0 = 0xD4 OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "CC 0x5678", function() {
		s = {"opcode":"CC","params":["0x5678"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDC,"Opcode 0 = 0xDC OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "CPO 0x5678", function() {
		s = {"opcode":"CPO","params":["0x5678"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xE4,"Opcode 0 = 0xE4 OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "CPE 0x5678", function() {
		s = {"opcode":"CPE","params":["0x5678"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xEC,"Opcode 0 = 0xEC OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "CP 0x5678", function() {
		s = {"opcode":"CP","params":["0x5678"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xF4,"Opcode 0 = 0xF4 OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "CM 0x5678", function() {
		s = {"opcode":"CM","params":["0x5678"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFC,"Opcode 0 = 0xFC OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "RET ", function() {
		s = {"opcode":"RET","params":[],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xC9,"Opcode 0 = 0xC9 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "RNZ ", function() {
		s = {"opcode":"RNZ","params":[],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xC0,"Opcode 0 = 0xC0 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "RZ ", function() {
		s = {"opcode":"RZ","params":[],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xC8,"Opcode 0 = 0xC8 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "RNC ", function() {
		s = {"opcode":"RNC","params":[],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xD0,"Opcode 0 = 0xD0 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "RC ", function() {
		s = {"opcode":"RC","params":[],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xD8,"Opcode 0 = 0xD8 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "RPO ", function() {
		s = {"opcode":"RPO","params":[],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xE0,"Opcode 0 = 0xE0 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "RPE ", function() {
		s = {"opcode":"RPE","params":[],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xE8,"Opcode 0 = 0xE8 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "RP ", function() {
		s = {"opcode":"RP","params":[],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xF0,"Opcode 0 = 0xF0 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "RM ", function() {
		s = {"opcode":"RM","params":[],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xF8,"Opcode 0 = 0xF8 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "RST 0", function() {
		s = {"opcode":"RST","params":["0"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xC7,"Opcode 0 = 0xC7 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "RST 1", function() {
		s = {"opcode":"RST","params":["1"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCF,"Opcode 0 = 0xCF OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "RST 2", function() {
		s = {"opcode":"RST","params":["2"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xD7,"Opcode 0 = 0xD7 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "RST 3", function() {
		s = {"opcode":"RST","params":["3"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDF,"Opcode 0 = 0xDF OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "RST 4", function() {
		s = {"opcode":"RST","params":["4"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xE7,"Opcode 0 = 0xE7 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "RST 5", function() {
		s = {"opcode":"RST","params":["5"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xEF,"Opcode 0 = 0xEF OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "RST 6", function() {
		s = {"opcode":"RST","params":["6"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xF7,"Opcode 0 = 0xF7 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "RST 7", function() {
		s = {"opcode":"RST","params":["7"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFF,"Opcode 0 = 0xFF OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "PUSH B", function() {
		s = {"opcode":"PUSH","params":["B"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xC5,"Opcode 0 = 0xC5 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "PUSH D", function() {
		s = {"opcode":"PUSH","params":["D"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xD5,"Opcode 0 = 0xD5 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "PUSH H", function() {
		s = {"opcode":"PUSH","params":["H"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xE5,"Opcode 0 = 0xE5 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "PUSH PSW", function() {
		s = {"opcode":"PUSH","params":["PSW"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xF5,"Opcode 0 = 0xF5 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "POP B", function() {
		s = {"opcode":"POP","params":["B"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xC1,"Opcode 0 = 0xC1 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "POP D", function() {
		s = {"opcode":"POP","params":["D"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xD1,"Opcode 0 = 0xD1 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "POP H", function() {
		s = {"opcode":"POP","params":["H"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xE1,"Opcode 0 = 0xE1 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "POP PSW", function() {
		s = {"opcode":"POP","params":["PSW"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xF1,"Opcode 0 = 0xF1 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "IN 0x12", function() {
		s = {"opcode":"IN","params":["0x12"],"addr":0x100,"lens":[],"bytes":0};
		p = I8080.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDB,"Opcode 0 = 0xDB OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				QUnit.assert.equal(p.bytes,2,"Length OK");
	});
