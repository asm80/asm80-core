import { Z80 } from "../cpu/z80.js";
import { Parser } from "../expression-parser.js";
import QUnit from "qunit"

import { asyncThrows } from "./_asyncThrows.js";


QUnit.module("ASM - Z80");

//jsHintQUnit.test( "JSHint", "../../lib/z80.js");


var vars = {"LOOP":0x1234,"SHORT":0x21,"_PC":0x0100};
var s = [], p;

	QUnit.test( "LD A,(IX+666)", function() {
		s = {"opcode":"LD","params":["A","(IX+666)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0x7E,"Opcode 1 = 0x7E OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
				QUnit.assert.throws(function(){p.lens[2]({_PC:0x100})},"OK");
      QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "LD C,(1234)", function() {
      s = {"opcode":"LD","params":["C","(1234)"],"addr":0x100,"lens":[],"bytes":0};
      QUnit.assert.throws(function(){ Z80.parseOpcode(s,vars, Parser);},"Throw OK");
    });

	QUnit.test( "LD 123", function() {
      s = {"opcode":"LD","params":["123"],"addr":0x100,"lens":[],"bytes":0};
      QUnit.assert.throws(function(){ Z80.parseOpcode(s,vars, Parser);},"Throw OK");
    });

	QUnit.test( "IM 5", function() {
      s = {"opcode":"IM","params":["5"],"addr":0x100,"lens":[],"bytes":0};
      QUnit.assert.throws(function(){ Z80.parseOpcode(s,vars, Parser);},"Throw OK");
    });

	QUnit.test( "RST 99", function() {
      s = {"opcode":"RST","params":["99"],"addr":0x100,"lens":[],"bytes":0};
      QUnit.assert.throws(function(){ Z80.parseOpcode(s,vars, Parser);},"Throw OK");
    });
	
	QUnit.test( "POP BC,DE", function() {
		s = {"opcode":"POP","params":["BC","DE"],"addr":0x100,"lens":[],"bytes":0};
		QUnit.assert.throws(function(){ Z80.parseOpcode(s,vars, Parser);},"Throw OK");
	  });

	QUnit.test( "POP", function() {
		s = {"opcode":"POP","params":[],"addr":0x100,"lens":[],"bytes":0};
		QUnit.assert.throws(function(){ Z80.parseOpcode(s,vars, Parser);},"Throw OK");
	  });

	QUnit.test( "LD A,IXL", function() {
		s = {"opcode":"LD","params":["A","IXL"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0x7D,"Opcode 1 = 0x7D OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "LD A,IYL", function() {
		s = {"opcode":"LD","params":["A","IYL"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0x7D,"Opcode 1 = 0x7D OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});

//syntaktic sugar
const ssldpp = (rp1,rp2,oc1,oc2) => {
	QUnit.test( `LD ${rp1},${rp2}`, function() {
		s = {"opcode":"LD","params":[rp1,rp2],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],oc1,"Opcode 0 OK");
		QUnit.assert.equal(p.lens[1],oc2,"Opcode 1 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
}

	ssldpp("HL","DE",0x62,0x6b);
	ssldpp("HL","BC",0x60,0x69);
	ssldpp("DE","HL",0x54,0x5d);
	ssldpp("DE","BC",0x50,0x59);
	ssldpp("BC","HL",0x44,0x4d);
	ssldpp("BC","DE",0x42,0x4b);

	QUnit.test( "LD A,(0123)", function() {
		s = {"opcode":"LD","params":["A","(0123)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x3a,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
		QUnit.assert.equal(p.bytes,3,"Length OK");
	});


	QUnit.test( "LD A,IXH", function() {
		s = {"opcode":"LD","params":["A","IXH"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0x7C,"Opcode 1 = 0x7C OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "LD A,IYH", function() {
		s = {"opcode":"LD","params":["A","IYH"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0x7C,"Opcode 1 = 0x7C OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "OUT (254),A", function() {
		s = {"opcode":"OUT","params":["(254)","A"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xD3,"Opcode 0 = 0xD3 OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				p.lens[1]({});
      QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "JR 1234", function() {
		s = {"opcode":"JR","params":["1234"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x18,"Opcode 0 = 0x18 OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				QUnit.assert.throws(function(){p.lens[1]({_PC:0x100})},"OK");
      QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "JR 1", function() {
		s = {"opcode":"JR","params":["1"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x18,"Opcode 0 = 0x18 OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				QUnit.assert.throws(function(){p.lens[1]({_PC:0x100})},"OK");
      QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "JR $", function() {
		s = {"opcode":"JR","params":["$"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x18,"Opcode 0 = 0x18 OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
		let test = p.lens[1]({_PC:0x100})
		QUnit.assert.equal(test,254,"disp val");
      QUnit.assert.equal(p.bytes,2,"Length OK");
	});

	QUnit.test( "JR NC,$", function() {
		s = {"opcode":"JR","params":["NC","$"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x30,"Opcode 0 = 0x30 OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
		let test = p.lens[1]({_PC:0x100})
		QUnit.assert.equal(test,254,"disp val");
      QUnit.assert.equal(p.bytes,2,"Length OK");
	});


	QUnit.test( "JR NC,1234", function() {
		s = {"opcode":"JR","params":["NC","1234"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x30,"Opcode 0 = 0x30 OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				QUnit.assert.throws(function(){p.lens[1]({_PC:0x100})},"OK");
      QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "JR NC,1", function() {
		s = {"opcode":"JR","params":["NC","1"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x30,"Opcode 0 = 0x30 OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
		QUnit.assert.throws(function(){p.lens[1]({_PC:0x100})},"OK");
      QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "LD A,A", function() {
		s = {"opcode":"LD","params":["A","A"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x7F,"Opcode 0 = 0x7F OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD A,B", function() {
		s = {"opcode":"LD","params":["A","B"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x78,"Opcode 0 = 0x78 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD A,C", function() {
		s = {"opcode":"LD","params":["A","C"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x79,"Opcode 0 = 0x79 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD A,D", function() {
		s = {"opcode":"LD","params":["A","D"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x7A,"Opcode 0 = 0x7A OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD A,E", function() {
		s = {"opcode":"LD","params":["A","E"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x7B,"Opcode 0 = 0x7B OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD A,H", function() {
		s = {"opcode":"LD","params":["A","H"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x7C,"Opcode 0 = 0x7C OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD A,L", function() {
		s = {"opcode":"LD","params":["A","L"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x7D,"Opcode 0 = 0x7D OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD A,(HL)", function() {
		s = {"opcode":"LD","params":["A","(HL)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x7E,"Opcode 0 = 0x7E OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD A,(BC)", function() {
		s = {"opcode":"LD","params":["A","(BC)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x0A,"Opcode 0 = 0x0A OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD A,(DE)", function() {
		s = {"opcode":"LD","params":["A","(DE)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x1A,"Opcode 0 = 0x1A OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD A,(0x1234)", function() {
		s = {"opcode":"LD","params":["A","(0x1234)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x3A,"Opcode 0 = 0x3A OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				p.lens[1]({});
      QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "LD A,(IX+0x34)", function() {
		s = {"opcode":"LD","params":["A","(IX+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0x7E,"Opcode 1 = 0x7E OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "LD A,(IX + 0x34) [with spaces]", function() {
		s = {"opcode":"LD","params":["A","(IX + 0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0x7E,"Opcode 1 = 0x7E OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "LD A,(IY+0x34)", function() {
		s = {"opcode":"LD","params":["A","(IY+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0x7E,"Opcode 1 = 0x7E OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "LD A,(IX-0x34)", function() {
		s = {"opcode":"LD","params":["A","(IX-0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0x7E,"Opcode 1 = 0x7E OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "LD A,(IY-0x34)", function() {
		s = {"opcode":"LD","params":["A","(IY-0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0x7E,"Opcode 1 = 0x7E OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "LD B,A", function() {
		s = {"opcode":"LD","params":["B","A"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x47,"Opcode 0 = 0x47 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD B,B", function() {
		s = {"opcode":"LD","params":["B","B"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x40,"Opcode 0 = 0x40 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD B,C", function() {
		s = {"opcode":"LD","params":["B","C"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x41,"Opcode 0 = 0x41 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD B,D", function() {
		s = {"opcode":"LD","params":["B","D"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x42,"Opcode 0 = 0x42 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD B,E", function() {
		s = {"opcode":"LD","params":["B","E"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x43,"Opcode 0 = 0x43 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD B,H", function() {
		s = {"opcode":"LD","params":["B","H"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x44,"Opcode 0 = 0x44 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD B,L", function() {
		s = {"opcode":"LD","params":["B","L"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x45,"Opcode 0 = 0x45 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD B,(HL)", function() {
		s = {"opcode":"LD","params":["B","(HL)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x46,"Opcode 0 = 0x46 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD B,(IX+0x34)", function() {
		s = {"opcode":"LD","params":["B","(IX+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0x46,"Opcode 1 = 0x46 OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "LD B,(IY+0x34)", function() {
		s = {"opcode":"LD","params":["B","(IY+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0x46,"Opcode 1 = 0x46 OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "LD C,A", function() {
		s = {"opcode":"LD","params":["C","A"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x4F,"Opcode 0 = 0x4F OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD C,B", function() {
		s = {"opcode":"LD","params":["C","B"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x48,"Opcode 0 = 0x48 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD C,C", function() {
		s = {"opcode":"LD","params":["C","C"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x49,"Opcode 0 = 0x49 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD C,D", function() {
		s = {"opcode":"LD","params":["C","D"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x4A,"Opcode 0 = 0x4A OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD C,E", function() {
		s = {"opcode":"LD","params":["C","E"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x4B,"Opcode 0 = 0x4B OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD C,H", function() {
		s = {"opcode":"LD","params":["C","H"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x4C,"Opcode 0 = 0x4C OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD C,L", function() {
		s = {"opcode":"LD","params":["C","L"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x4D,"Opcode 0 = 0x4D OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD C,(HL)", function() {
		s = {"opcode":"LD","params":["C","(HL)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x4E,"Opcode 0 = 0x4E OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD C,(IX+0x34)", function() {
		s = {"opcode":"LD","params":["C","(IX+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0x4E,"Opcode 1 = 0x4E OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "LD C,(IY+0x34)", function() {
		s = {"opcode":"LD","params":["C","(IY+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0x4E,"Opcode 1 = 0x4E OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "LD D,A", function() {
		s = {"opcode":"LD","params":["D","A"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x57,"Opcode 0 = 0x57 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD D,B", function() {
		s = {"opcode":"LD","params":["D","B"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x50,"Opcode 0 = 0x50 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD D,C", function() {
		s = {"opcode":"LD","params":["D","C"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x51,"Opcode 0 = 0x51 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD D,D", function() {
		s = {"opcode":"LD","params":["D","D"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x52,"Opcode 0 = 0x52 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD D,E", function() {
		s = {"opcode":"LD","params":["D","E"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x53,"Opcode 0 = 0x53 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD D,H", function() {
		s = {"opcode":"LD","params":["D","H"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x54,"Opcode 0 = 0x54 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD D,L", function() {
		s = {"opcode":"LD","params":["D","L"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x55,"Opcode 0 = 0x55 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD D,(HL)", function() {
		s = {"opcode":"LD","params":["D","(HL)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x56,"Opcode 0 = 0x56 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD D,(IX+0x34)", function() {
		s = {"opcode":"LD","params":["D","(IX+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0x56,"Opcode 1 = 0x56 OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "LD D,(IY+0x34)", function() {
		s = {"opcode":"LD","params":["D","(IY+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0x56,"Opcode 1 = 0x56 OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "LD E,A", function() {
		s = {"opcode":"LD","params":["E","A"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x5F,"Opcode 0 = 0x5F OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD E,B", function() {
		s = {"opcode":"LD","params":["E","B"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x58,"Opcode 0 = 0x58 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD E,C", function() {
		s = {"opcode":"LD","params":["E","C"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x59,"Opcode 0 = 0x59 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD E,D", function() {
		s = {"opcode":"LD","params":["E","D"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x5A,"Opcode 0 = 0x5A OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD E,E", function() {
		s = {"opcode":"LD","params":["E","E"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x5B,"Opcode 0 = 0x5B OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD E,H", function() {
		s = {"opcode":"LD","params":["E","H"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x5C,"Opcode 0 = 0x5C OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD E,L", function() {
		s = {"opcode":"LD","params":["E","L"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x5D,"Opcode 0 = 0x5D OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD E,(HL)", function() {
		s = {"opcode":"LD","params":["E","(HL)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x5E,"Opcode 0 = 0x5E OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD E,(IX+0x34)", function() {
		s = {"opcode":"LD","params":["E","(IX+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0x5E,"Opcode 1 = 0x5E OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "LD E,(IY+0x34)", function() {
		s = {"opcode":"LD","params":["E","(IY+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0x5E,"Opcode 1 = 0x5E OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "LD H,A", function() {
		s = {"opcode":"LD","params":["H","A"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x67,"Opcode 0 = 0x67 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD H,B", function() {
		s = {"opcode":"LD","params":["H","B"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x60,"Opcode 0 = 0x60 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD H,C", function() {
		s = {"opcode":"LD","params":["H","C"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x61,"Opcode 0 = 0x61 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD H,D", function() {
		s = {"opcode":"LD","params":["H","D"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x62,"Opcode 0 = 0x62 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD H,E", function() {
		s = {"opcode":"LD","params":["H","E"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x63,"Opcode 0 = 0x63 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD H,H", function() {
		s = {"opcode":"LD","params":["H","H"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x64,"Opcode 0 = 0x64 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD H,L", function() {
		s = {"opcode":"LD","params":["H","L"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x65,"Opcode 0 = 0x65 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD H,(HL)", function() {
		s = {"opcode":"LD","params":["H","(HL)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x66,"Opcode 0 = 0x66 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD H,(IX+0x34)", function() {
		s = {"opcode":"LD","params":["H","(IX+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0x66,"Opcode 1 = 0x66 OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "LD H,(IY+0x34)", function() {
		s = {"opcode":"LD","params":["H","(IY+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0x66,"Opcode 1 = 0x66 OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "LD L,A", function() {
		s = {"opcode":"LD","params":["L","A"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x6F,"Opcode 0 = 0x6F OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD L,B", function() {
		s = {"opcode":"LD","params":["L","B"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x68,"Opcode 0 = 0x68 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD L,C", function() {
		s = {"opcode":"LD","params":["L","C"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x69,"Opcode 0 = 0x69 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD L,D", function() {
		s = {"opcode":"LD","params":["L","D"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x6A,"Opcode 0 = 0x6A OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD L,E", function() {
		s = {"opcode":"LD","params":["L","E"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x6B,"Opcode 0 = 0x6B OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD L,H", function() {
		s = {"opcode":"LD","params":["L","H"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x6C,"Opcode 0 = 0x6C OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD L,L", function() {
		s = {"opcode":"LD","params":["L","L"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x6D,"Opcode 0 = 0x6D OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD L,(HL)", function() {
		s = {"opcode":"LD","params":["L","(HL)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x6E,"Opcode 0 = 0x6E OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD L,(IX+0x34)", function() {
		s = {"opcode":"LD","params":["L","(IX+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0x6E,"Opcode 1 = 0x6E OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "LD L,(IY+0x34)", function() {
		s = {"opcode":"LD","params":["L","(IY+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0x6E,"Opcode 1 = 0x6E OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "LD (HL),A", function() {
		s = {"opcode":"LD","params":["(HL)","A"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x77,"Opcode 0 = 0x77 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD (HL),B", function() {
		s = {"opcode":"LD","params":["(HL)","B"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x70,"Opcode 0 = 0x70 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD (HL),C", function() {
		s = {"opcode":"LD","params":["(HL)","C"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x71,"Opcode 0 = 0x71 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD (HL),D", function() {
		s = {"opcode":"LD","params":["(HL)","D"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x72,"Opcode 0 = 0x72 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD (HL),E", function() {
		s = {"opcode":"LD","params":["(HL)","E"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x73,"Opcode 0 = 0x73 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD (HL),H", function() {
		s = {"opcode":"LD","params":["(HL)","H"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x74,"Opcode 0 = 0x74 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD (HL),L", function() {
		s = {"opcode":"LD","params":["(HL)","L"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x75,"Opcode 0 = 0x75 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD (IX+0x34),A", function() {
		s = {"opcode":"LD","params":["(IX+0x34)","A"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0x77,"Opcode 1 = 0x77 OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "LD (IX+0x34),B", function() {
		s = {"opcode":"LD","params":["(IX+0x34)","B"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0x70,"Opcode 1 = 0x70 OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "LD (IX+0x34),C", function() {
		s = {"opcode":"LD","params":["(IX+0x34)","C"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0x71,"Opcode 1 = 0x71 OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "LD (IX+0x34),D", function() {
		s = {"opcode":"LD","params":["(IX+0x34)","D"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0x72,"Opcode 1 = 0x72 OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "LD (IX+0x34),E", function() {
		s = {"opcode":"LD","params":["(IX+0x34)","E"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0x73,"Opcode 1 = 0x73 OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "LD (IX+0x34),H", function() {
		s = {"opcode":"LD","params":["(IX+0x34)","H"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0x74,"Opcode 1 = 0x74 OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "LD (IX+0x34),L", function() {
		s = {"opcode":"LD","params":["(IX+0x34)","L"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0x75,"Opcode 1 = 0x75 OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "LD (IY+0x34),A", function() {
		s = {"opcode":"LD","params":["(IY+0x34)","A"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0x77,"Opcode 1 = 0x77 OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "LD (IY+0x34),B", function() {
		s = {"opcode":"LD","params":["(IY+0x34)","B"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0x70,"Opcode 1 = 0x70 OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "LD (IY+0x34),C", function() {
		s = {"opcode":"LD","params":["(IY+0x34)","C"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0x71,"Opcode 1 = 0x71 OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "LD (IY+0x34),D", function() {
		s = {"opcode":"LD","params":["(IY+0x34)","D"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0x72,"Opcode 1 = 0x72 OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "LD (IY+0x34),E", function() {
		s = {"opcode":"LD","params":["(IY+0x34)","E"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0x73,"Opcode 1 = 0x73 OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "LD (IY+0x34),H", function() {
		s = {"opcode":"LD","params":["(IY+0x34)","H"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0x74,"Opcode 1 = 0x74 OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "LD (IY+0x34),L", function() {
		s = {"opcode":"LD","params":["(IY+0x34)","L"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0x75,"Opcode 1 = 0x75 OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "LD A,0x12", function() {
		s = {"opcode":"LD","params":["A","0x12"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x3E,"Opcode 0 = 0x3E OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				p.lens[1]({});
      QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "LD B,0x12", function() {
		s = {"opcode":"LD","params":["B","0x12"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x06,"Opcode 0 = 0x06 OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				p.lens[1]({});
      QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "LD C,0x12", function() {
		s = {"opcode":"LD","params":["C","0x12"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x0E,"Opcode 0 = 0x0E OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				p.lens[1]({});
      QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "LD D,0x12", function() {
		s = {"opcode":"LD","params":["D","0x12"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x16,"Opcode 0 = 0x16 OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				p.lens[1]({});
      QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "LD E,0x12", function() {
		s = {"opcode":"LD","params":["E","0x12"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x1E,"Opcode 0 = 0x1E OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				p.lens[1]({});
      QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "LD H,0x12", function() {
		s = {"opcode":"LD","params":["H","0x12"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x26,"Opcode 0 = 0x26 OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				p.lens[1]({});
      QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "LD L,0x12", function() {
		s = {"opcode":"LD","params":["L","0x12"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x2E,"Opcode 0 = 0x2E OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				p.lens[1]({});
      QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "LD (HL),0x12", function() {
		s = {"opcode":"LD","params":["(HL)","0x12"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x36,"Opcode 0 = 0x36 OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				p.lens[1]({});
      QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "LD (IX+0x34),0x12", function() {
		s = {"opcode":"LD","params":["(IX+0x34)","0x12"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0x36,"Opcode 1 = 0x36 OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(typeof(p.lens[3]),"function","Opcode 3 OK");
				p.lens[3]({});
      QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "LD (IY+0x34),0x12", function() {
		s = {"opcode":"LD","params":["(IY+0x34)","0x12"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0x36,"Opcode 1 = 0x36 OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(typeof(p.lens[3]),"function","Opcode 3 OK");
				p.lens[3]({});
      QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "LD (BC),A", function() {
		s = {"opcode":"LD","params":["(BC)","A"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x02,"Opcode 0 = 0x02 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD (DE),A", function() {
		s = {"opcode":"LD","params":["(DE)","A"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x12,"Opcode 0 = 0x12 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD (0x1234),A", function() {
		s = {"opcode":"LD","params":["(0x1234)","A"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x32,"Opcode 0 = 0x32 OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				p.lens[1]({});
      QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "LD BC,0x1234", function() {
		s = {"opcode":"LD","params":["BC","0x1234"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x01,"Opcode 0 = 0x01 OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				p.lens[1]({});
      QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "LD DE,0x1234", function() {
		s = {"opcode":"LD","params":["DE","0x1234"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x11,"Opcode 0 = 0x11 OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				p.lens[1]({});
      QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "LD HL,0x1234", function() {
		s = {"opcode":"LD","params":["HL","0x1234"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x21,"Opcode 0 = 0x21 OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				p.lens[1]({});
      QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "LD SP,0x1234", function() {
		s = {"opcode":"LD","params":["SP","0x1234"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x31,"Opcode 0 = 0x31 OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				p.lens[1]({});
      QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "LD IX,0x1234", function() {
		s = {"opcode":"LD","params":["IX","0x1234"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0x21,"Opcode 1 = 0x21 OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
				p.lens[2]({});
      QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "LD IY,0x1234", function() {
		s = {"opcode":"LD","params":["IY","0x1234"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0x21,"Opcode 1 = 0x21 OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
				p.lens[2]({});
      QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "LD HL,(0x1234)", function() {
		s = {"opcode":"LD","params":["HL","(0x1234)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x2A,"Opcode 0 = 0x2A OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				p.lens[1]({});
      QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "LD BC,(0x1234)", function() {
		s = {"opcode":"LD","params":["BC","(0x1234)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xED,"Opcode 0 = 0xED OK");
		QUnit.assert.equal(p.lens[1],0x4B,"Opcode 1 = 0x4B OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
				p.lens[2]({});
      QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "LD DE,(0x1234)", function() {
		s = {"opcode":"LD","params":["DE","(0x1234)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xED,"Opcode 0 = 0xED OK");
		QUnit.assert.equal(p.lens[1],0x5B,"Opcode 1 = 0x5B OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
				p.lens[2]({});
      QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "LD SP,(0x1234)", function() {
		s = {"opcode":"LD","params":["SP","(0x1234)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xED,"Opcode 0 = 0xED OK");
		QUnit.assert.equal(p.lens[1],0x7B,"Opcode 1 = 0x7B OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
				p.lens[2]({});
      QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "LD IX,(0x1234)", function() {
		s = {"opcode":"LD","params":["IX","(0x1234)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0x2A,"Opcode 1 = 0x2A OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
				p.lens[2]({});
      QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "LD IY,(0x1234)", function() {
		s = {"opcode":"LD","params":["IY","(0x1234)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0x2A,"Opcode 1 = 0x2A OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
				p.lens[2]({});
      QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "LD (0x1234),HL", function() {
		s = {"opcode":"LD","params":["(0x1234)","HL"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x22,"Opcode 0 = 0x22 OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				p.lens[1]({});
      QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "LD (0x1234),BC", function() {
		s = {"opcode":"LD","params":["(0x1234)","BC"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xED,"Opcode 0 = 0xED OK");
		QUnit.assert.equal(p.lens[1],0x43,"Opcode 1 = 0x43 OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
				p.lens[2]({});
      QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "LD (0x1234),DE", function() {
		s = {"opcode":"LD","params":["(0x1234)","DE"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xED,"Opcode 0 = 0xED OK");
		QUnit.assert.equal(p.lens[1],0x53,"Opcode 1 = 0x53 OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
				p.lens[2]({});
      QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "LD (0x1234),IX", function() {
		s = {"opcode":"LD","params":["(0x1234)","IX"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0x22,"Opcode 1 = 0x22 OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
				p.lens[2]({});
      QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "LD (0x1234),IY", function() {
		s = {"opcode":"LD","params":["(0x1234)","IY"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0x22,"Opcode 1 = 0x22 OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
				p.lens[2]({});
      QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "LD (0x1234),SP", function() {
		s = {"opcode":"LD","params":["(0x1234)","SP"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xED,"Opcode 0 = 0xED OK");
		QUnit.assert.equal(p.lens[1],0x73,"Opcode 1 = 0x73 OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
				p.lens[2]({});
      QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "LD SP,HL", function() {
		s = {"opcode":"LD","params":["SP","HL"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xF9,"Opcode 0 = 0xF9 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "LD SP,IX", function() {
		s = {"opcode":"LD","params":["SP","IX"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0xF9,"Opcode 1 = 0xF9 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "LD SP,IY", function() {
		s = {"opcode":"LD","params":["SP","IY"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0xF9,"Opcode 1 = 0xF9 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "EX DE,HL", function() {
		s = {"opcode":"EX","params":["DE","HL"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xEB,"Opcode 0 = 0xEB OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "EX DE,DE", function() {
		s = {"opcode":"EX","params":["DE","DE"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p,null,"Opcode null OK");
		
	});
	QUnit.test( "EX (SP),HL", function() {
		s = {"opcode":"EX","params":["(SP)","HL"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xE3,"Opcode 0 = 0xE3 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "EX (SP),IX", function() {
		s = {"opcode":"EX","params":["(SP)","IX"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0xE3,"Opcode 1 = 0xE3 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "EX (SP),IY", function() {
		s = {"opcode":"EX","params":["(SP)","IY"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0xE3,"Opcode 1 = 0xE3 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "EX AF,AF'", function() {
		s = {"opcode":"EX","params":["AF","AF'"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x08,"Opcode 0 = 0x08 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "EXX ", function() {
		s = {"opcode":"EXX","params":[],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xD9,"Opcode 0 = 0xD9 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "ADD A,A", function() {
		s = {"opcode":"ADD","params":["A","A"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x87,"Opcode 0 = 0x87 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "ADD A,B", function() {
		s = {"opcode":"ADD","params":["A","B"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x80,"Opcode 0 = 0x80 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "ADD A,C", function() {
		s = {"opcode":"ADD","params":["A","C"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x81,"Opcode 0 = 0x81 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "ADD A,D", function() {
		s = {"opcode":"ADD","params":["A","D"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x82,"Opcode 0 = 0x82 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "ADD A,E", function() {
		s = {"opcode":"ADD","params":["A","E"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x83,"Opcode 0 = 0x83 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "ADD A,H", function() {
		s = {"opcode":"ADD","params":["A","H"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x84,"Opcode 0 = 0x84 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "ADD A,L", function() {
		s = {"opcode":"ADD","params":["A","L"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x85,"Opcode 0 = 0x85 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "ADD A,(HL)", function() {
		s = {"opcode":"ADD","params":["A","(HL)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x86,"Opcode 0 = 0x86 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "ADD A,(IX+0x34)", function() {
		s = {"opcode":"ADD","params":["A","(IX+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0x86,"Opcode 1 = 0x86 OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "ADD A,(IY+0x34)", function() {
		s = {"opcode":"ADD","params":["A","(IY+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0x86,"Opcode 1 = 0x86 OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "ADD A,0x12", function() {
		s = {"opcode":"ADD","params":["A","0x12"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xC6,"Opcode 0 = 0xC6 OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				p.lens[1]({});
      QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "ADC A,A", function() {
		s = {"opcode":"ADC","params":["A","A"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x8F,"Opcode 0 = 0x8F OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "ADC A,B", function() {
		s = {"opcode":"ADC","params":["A","B"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x88,"Opcode 0 = 0x88 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "ADC A,C", function() {
		s = {"opcode":"ADC","params":["A","C"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x89,"Opcode 0 = 0x89 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "ADC A,D", function() {
		s = {"opcode":"ADC","params":["A","D"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x8A,"Opcode 0 = 0x8A OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "ADC A,E", function() {
		s = {"opcode":"ADC","params":["A","E"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x8B,"Opcode 0 = 0x8B OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "ADC A,H", function() {
		s = {"opcode":"ADC","params":["A","H"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x8C,"Opcode 0 = 0x8C OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "ADC A,L", function() {
		s = {"opcode":"ADC","params":["A","L"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x8D,"Opcode 0 = 0x8D OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "ADC A,(HL)", function() {
		s = {"opcode":"ADC","params":["A","(HL)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x8E,"Opcode 0 = 0x8E OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "ADC A,(IX+0x34)", function() {
		s = {"opcode":"ADC","params":["A","(IX+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0x8E,"Opcode 1 = 0x8E OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "ADC A,(IY+0x34)", function() {
		s = {"opcode":"ADC","params":["A","(IY+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0x8E,"Opcode 1 = 0x8E OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "ADC A,0x12", function() {
		s = {"opcode":"ADC","params":["A","0x12"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCE,"Opcode 0 = 0xCE OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				p.lens[1]({});
      QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SUB A", function() {
		s = {"opcode":"SUB","params":["A"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x97,"Opcode 0 = 0x97 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "SUB B", function() {
		s = {"opcode":"SUB","params":["B"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x90,"Opcode 0 = 0x90 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "SUB C", function() {
		s = {"opcode":"SUB","params":["C"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x91,"Opcode 0 = 0x91 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "SUB D", function() {
		s = {"opcode":"SUB","params":["D"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x92,"Opcode 0 = 0x92 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "SUB E", function() {
		s = {"opcode":"SUB","params":["E"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x93,"Opcode 0 = 0x93 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "SUB H", function() {
		s = {"opcode":"SUB","params":["H"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x94,"Opcode 0 = 0x94 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "SUB L", function() {
		s = {"opcode":"SUB","params":["L"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x95,"Opcode 0 = 0x95 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "SUB (HL)", function() {
		s = {"opcode":"SUB","params":["(HL)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x96,"Opcode 0 = 0x96 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "SUB (IX+0x34)", function() {
		s = {"opcode":"SUB","params":["(IX+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0x96,"Opcode 1 = 0x96 OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "SUB (IY+0x34)", function() {
		s = {"opcode":"SUB","params":["(IY+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0x96,"Opcode 1 = 0x96 OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "SUB 0x12", function() {
		s = {"opcode":"SUB","params":["0x12"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xD6,"Opcode 0 = 0xD6 OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				p.lens[1]({});
      QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SBC A,A", function() {
		s = {"opcode":"SBC","params":["A","A"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x9F,"Opcode 0 = 0x9F OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "SBC A,B", function() {
		s = {"opcode":"SBC","params":["A","B"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x98,"Opcode 0 = 0x98 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "SBC A,C", function() {
		s = {"opcode":"SBC","params":["A","C"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x99,"Opcode 0 = 0x99 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "SBC A,D", function() {
		s = {"opcode":"SBC","params":["A","D"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x9A,"Opcode 0 = 0x9A OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "SBC A,E", function() {
		s = {"opcode":"SBC","params":["A","E"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x9B,"Opcode 0 = 0x9B OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "SBC A,H", function() {
		s = {"opcode":"SBC","params":["A","H"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x9C,"Opcode 0 = 0x9C OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "SBC A,L", function() {
		s = {"opcode":"SBC","params":["A","L"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x9D,"Opcode 0 = 0x9D OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "SBC A,(HL)", function() {
		s = {"opcode":"SBC","params":["A","(HL)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x9E,"Opcode 0 = 0x9E OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "SBC A,(IX+0x34)", function() {
		s = {"opcode":"SBC","params":["A","(IX+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0x9E,"Opcode 1 = 0x9E OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "SBC A,(IY+0x34)", function() {
		s = {"opcode":"SBC","params":["A","(IY+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0x9E,"Opcode 1 = 0x9E OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "SBC A,0x12", function() {
		s = {"opcode":"SBC","params":["A","0x12"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDE,"Opcode 0 = 0xDE OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				p.lens[1]({});
      QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "ADD HL,BC", function() {
		s = {"opcode":"ADD","params":["HL","BC"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x09,"Opcode 0 = 0x09 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "ADD HL,DE", function() {
		s = {"opcode":"ADD","params":["HL","DE"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x19,"Opcode 0 = 0x19 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "ADD HL,HL", function() {
		s = {"opcode":"ADD","params":["HL","HL"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x29,"Opcode 0 = 0x29 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "ADD HL,SP", function() {
		s = {"opcode":"ADD","params":["HL","SP"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x39,"Opcode 0 = 0x39 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "ADD IX,BC", function() {
		s = {"opcode":"ADD","params":["IX","BC"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0x09,"Opcode 1 = 0x09 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "ADD IX,DE", function() {
		s = {"opcode":"ADD","params":["IX","DE"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0x19,"Opcode 1 = 0x19 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "ADD IX,IX", function() {
		s = {"opcode":"ADD","params":["IX","IX"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0x29,"Opcode 1 = 0x29 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "ADD IX,SP", function() {
		s = {"opcode":"ADD","params":["IX","SP"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0x39,"Opcode 1 = 0x39 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "ADD IY,BC", function() {
		s = {"opcode":"ADD","params":["IY","BC"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0x09,"Opcode 1 = 0x09 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "ADD IY,DE", function() {
		s = {"opcode":"ADD","params":["IY","DE"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0x19,"Opcode 1 = 0x19 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "ADD IY,IY", function() {
		s = {"opcode":"ADD","params":["IY","IY"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0x29,"Opcode 1 = 0x29 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "ADD IY,SP", function() {
		s = {"opcode":"ADD","params":["IY","SP"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0x39,"Opcode 1 = 0x39 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "ADC HL,BC", function() {
		s = {"opcode":"ADC","params":["HL","BC"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xED,"Opcode 0 = 0xED OK");
		QUnit.assert.equal(p.lens[1],0x4A,"Opcode 1 = 0x4A OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "ADC HL,DE", function() {
		s = {"opcode":"ADC","params":["HL","DE"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xED,"Opcode 0 = 0xED OK");
		QUnit.assert.equal(p.lens[1],0x5A,"Opcode 1 = 0x5A OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "ADC HL,HL", function() {
		s = {"opcode":"ADC","params":["HL","HL"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xED,"Opcode 0 = 0xED OK");
		QUnit.assert.equal(p.lens[1],0x6A,"Opcode 1 = 0x6A OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "ADC HL,SP", function() {
		s = {"opcode":"ADC","params":["HL","SP"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xED,"Opcode 0 = 0xED OK");
		QUnit.assert.equal(p.lens[1],0x7A,"Opcode 1 = 0x7A OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SBC HL,BC", function() {
		s = {"opcode":"SBC","params":["HL","BC"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xED,"Opcode 0 = 0xED OK");
		QUnit.assert.equal(p.lens[1],0x42,"Opcode 1 = 0x42 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SBC HL,DE", function() {
		s = {"opcode":"SBC","params":["HL","DE"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xED,"Opcode 0 = 0xED OK");
		QUnit.assert.equal(p.lens[1],0x52,"Opcode 1 = 0x52 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SBC HL,HL", function() {
		s = {"opcode":"SBC","params":["HL","HL"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xED,"Opcode 0 = 0xED OK");
		QUnit.assert.equal(p.lens[1],0x62,"Opcode 1 = 0x62 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SBC HL,SP", function() {
		s = {"opcode":"SBC","params":["HL","SP"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xED,"Opcode 0 = 0xED OK");
		QUnit.assert.equal(p.lens[1],0x72,"Opcode 1 = 0x72 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "DI ", function() {
		s = {"opcode":"DI","params":[],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xF3,"Opcode 0 = 0xF3 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "EI ", function() {
		s = {"opcode":"EI","params":[],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFB,"Opcode 0 = 0xFB OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "IM 0", function() {
		s = {"opcode":"IM","params":["0"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xED,"Opcode 0 = 0xED OK");
		QUnit.assert.equal(p.lens[1],0x46,"Opcode 1 = 0x46 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "IM 1", function() {
		s = {"opcode":"IM","params":["1"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xED,"Opcode 0 = 0xED OK");
		QUnit.assert.equal(p.lens[1],0x56,"Opcode 1 = 0x56 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "IM 2", function() {
		s = {"opcode":"IM","params":["2"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xED,"Opcode 0 = 0xED OK");
		QUnit.assert.equal(p.lens[1],0x5E,"Opcode 1 = 0x5E OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "LD I,A", function() {
		s = {"opcode":"LD","params":["I","A"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xED,"Opcode 0 = 0xED OK");
		QUnit.assert.equal(p.lens[1],0x47,"Opcode 1 = 0x47 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "LD A,I", function() {
		s = {"opcode":"LD","params":["A","I"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xED,"Opcode 0 = 0xED OK");
		QUnit.assert.equal(p.lens[1],0x57,"Opcode 1 = 0x57 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "LD R,A", function() {
		s = {"opcode":"LD","params":["R","A"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xED,"Opcode 0 = 0xED OK");
		QUnit.assert.equal(p.lens[1],0x4F,"Opcode 1 = 0x4F OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "LD A,R", function() {
		s = {"opcode":"LD","params":["A","R"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xED,"Opcode 0 = 0xED OK");
		QUnit.assert.equal(p.lens[1],0x5F,"Opcode 1 = 0x5F OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "NOP ", function() {
		s = {"opcode":"NOP","params":[],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x00,"Opcode 0 = 0x00 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "HALT ", function() {
		s = {"opcode":"HALT","params":[],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x76,"Opcode 0 = 0x76 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "INC A", function() {
		s = {"opcode":"INC","params":["A"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x3C,"Opcode 0 = 0x3C OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "INC B", function() {
		s = {"opcode":"INC","params":["B"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x04,"Opcode 0 = 0x04 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "INC C", function() {
		s = {"opcode":"INC","params":["C"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x0C,"Opcode 0 = 0x0C OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "INC D", function() {
		s = {"opcode":"INC","params":["D"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x14,"Opcode 0 = 0x14 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "INC E", function() {
		s = {"opcode":"INC","params":["E"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x1C,"Opcode 0 = 0x1C OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "INC H", function() {
		s = {"opcode":"INC","params":["H"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x24,"Opcode 0 = 0x24 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "INC L", function() {
		s = {"opcode":"INC","params":["L"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x2C,"Opcode 0 = 0x2C OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "INC (HL)", function() {
		s = {"opcode":"INC","params":["(HL)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x34,"Opcode 0 = 0x34 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "INC (IX+0x34)", function() {
		s = {"opcode":"INC","params":["(IX+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0x34,"Opcode 1 = 0x34 OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "INC (IY+0x34)", function() {
		s = {"opcode":"INC","params":["(IY+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0x34,"Opcode 1 = 0x34 OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "DEC A", function() {
		s = {"opcode":"DEC","params":["A"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x3D,"Opcode 0 = 0x3D OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "DEC B", function() {
		s = {"opcode":"DEC","params":["B"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x05,"Opcode 0 = 0x05 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "DEC C", function() {
		s = {"opcode":"DEC","params":["C"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x0D,"Opcode 0 = 0x0D OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "DEC D", function() {
		s = {"opcode":"DEC","params":["D"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x15,"Opcode 0 = 0x15 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "DEC E", function() {
		s = {"opcode":"DEC","params":["E"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x1D,"Opcode 0 = 0x1D OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "DEC H", function() {
		s = {"opcode":"DEC","params":["H"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x25,"Opcode 0 = 0x25 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "DEC L", function() {
		s = {"opcode":"DEC","params":["L"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x2D,"Opcode 0 = 0x2D OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "DEC (HL)", function() {
		s = {"opcode":"DEC","params":["(HL)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x35,"Opcode 0 = 0x35 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "DEC (IX+0x34)", function() {
		s = {"opcode":"DEC","params":["(IX+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0x35,"Opcode 1 = 0x35 OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "DEC (IY+0x34)", function() {
		s = {"opcode":"DEC","params":["(IY+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0x35,"Opcode 1 = 0x35 OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "INC BC", function() {
		s = {"opcode":"INC","params":["BC"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x03,"Opcode 0 = 0x03 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "INC DE", function() {
		s = {"opcode":"INC","params":["DE"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x13,"Opcode 0 = 0x13 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "INC HL", function() {
		s = {"opcode":"INC","params":["HL"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x23,"Opcode 0 = 0x23 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "INC SP", function() {
		s = {"opcode":"INC","params":["SP"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x33,"Opcode 0 = 0x33 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "INC IX", function() {
		s = {"opcode":"INC","params":["IX"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0x23,"Opcode 1 = 0x23 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "INC IY", function() {
		s = {"opcode":"INC","params":["IY"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0x23,"Opcode 1 = 0x23 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "DEC BC", function() {
		s = {"opcode":"DEC","params":["BC"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x0B,"Opcode 0 = 0x0B OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "DEC DE", function() {
		s = {"opcode":"DEC","params":["DE"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x1B,"Opcode 0 = 0x1B OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "DEC HL", function() {
		s = {"opcode":"DEC","params":["HL"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x2B,"Opcode 0 = 0x2B OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "DEC SP", function() {
		s = {"opcode":"DEC","params":["SP"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x3B,"Opcode 0 = 0x3B OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "DEC IX", function() {
		s = {"opcode":"DEC","params":["IX"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0x2B,"Opcode 1 = 0x2B OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "DEC IY", function() {
		s = {"opcode":"DEC","params":["IY"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0x2B,"Opcode 1 = 0x2B OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "DAA ", function() {
		s = {"opcode":"DAA","params":[],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x27,"Opcode 0 = 0x27 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "CPL ", function() {
		s = {"opcode":"CPL","params":[],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x2F,"Opcode 0 = 0x2F OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "SCF ", function() {
		s = {"opcode":"SCF","params":[],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x37,"Opcode 0 = 0x37 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "CCF ", function() {
		s = {"opcode":"CCF","params":[],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x3F,"Opcode 0 = 0x3F OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "NEG ", function() {
		s = {"opcode":"NEG","params":[],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xED,"Opcode 0 = 0xED OK");
		QUnit.assert.equal(p.lens[1],0x44,"Opcode 1 = 0x44 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RLCA ", function() {
		s = {"opcode":"RLCA","params":[],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x07,"Opcode 0 = 0x07 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "RRCA ", function() {
		s = {"opcode":"RRCA","params":[],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x0F,"Opcode 0 = 0x0F OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "RLA ", function() {
		s = {"opcode":"RLA","params":[],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x17,"Opcode 0 = 0x17 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "RRA ", function() {
		s = {"opcode":"RRA","params":[],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x1F,"Opcode 0 = 0x1F OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "RLD ", function() {
		s = {"opcode":"RLD","params":[],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xED,"Opcode 0 = 0xED OK");
		QUnit.assert.equal(p.lens[1],0x6F,"Opcode 1 = 0x6F OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RRD ", function() {
		s = {"opcode":"RRD","params":[],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xED,"Opcode 0 = 0xED OK");
		QUnit.assert.equal(p.lens[1],0x67,"Opcode 1 = 0x67 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RLC A", function() {
		s = {"opcode":"RLC","params":["A"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x07,"Opcode 1 = 0x07 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RLC B", function() {
		s = {"opcode":"RLC","params":["B"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x00,"Opcode 1 = 0x00 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RLC C", function() {
		s = {"opcode":"RLC","params":["C"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x01,"Opcode 1 = 0x01 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RLC D", function() {
		s = {"opcode":"RLC","params":["D"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x02,"Opcode 1 = 0x02 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RLC E", function() {
		s = {"opcode":"RLC","params":["E"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x03,"Opcode 1 = 0x03 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RLC H", function() {
		s = {"opcode":"RLC","params":["H"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x04,"Opcode 1 = 0x04 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RLC L", function() {
		s = {"opcode":"RLC","params":["L"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x05,"Opcode 1 = 0x05 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RLC (HL)", function() {
		s = {"opcode":"RLC","params":["(HL)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x06,"Opcode 1 = 0x06 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RLC (IX+0x34)", function() {
		s = {"opcode":"RLC","params":["(IX+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0xCB,"Opcode 1 = 0xCB OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.lens[3],0x06,"Opcode 3 = 0x06 OK");
		QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "RLC (IY+0x34)", function() {
		s = {"opcode":"RLC","params":["(IY+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0xCB,"Opcode 1 = 0xCB OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.lens[3],0x06,"Opcode 3 = 0x06 OK");
		QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "RL A", function() {
		s = {"opcode":"RL","params":["A"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x17,"Opcode 1 = 0x17 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RL B", function() {
		s = {"opcode":"RL","params":["B"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x10,"Opcode 1 = 0x10 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RL C", function() {
		s = {"opcode":"RL","params":["C"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x11,"Opcode 1 = 0x11 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RL D", function() {
		s = {"opcode":"RL","params":["D"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x12,"Opcode 1 = 0x12 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RL E", function() {
		s = {"opcode":"RL","params":["E"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x13,"Opcode 1 = 0x13 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RL H", function() {
		s = {"opcode":"RL","params":["H"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x14,"Opcode 1 = 0x14 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RL L", function() {
		s = {"opcode":"RL","params":["L"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x15,"Opcode 1 = 0x15 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RL (HL)", function() {
		s = {"opcode":"RL","params":["(HL)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x16,"Opcode 1 = 0x16 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RL (IX+0x34)", function() {
		s = {"opcode":"RL","params":["(IX+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0xCB,"Opcode 1 = 0xCB OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.lens[3],0x16,"Opcode 3 = 0x16 OK");
		QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "RL (IY+0x34)", function() {
		s = {"opcode":"RL","params":["(IY+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0xCB,"Opcode 1 = 0xCB OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.lens[3],0x16,"Opcode 3 = 0x16 OK");
		QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "RRC A", function() {
		s = {"opcode":"RRC","params":["A"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x0F,"Opcode 1 = 0x0F OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RRC B", function() {
		s = {"opcode":"RRC","params":["B"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x08,"Opcode 1 = 0x08 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RRC C", function() {
		s = {"opcode":"RRC","params":["C"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x09,"Opcode 1 = 0x09 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RRC D", function() {
		s = {"opcode":"RRC","params":["D"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x0A,"Opcode 1 = 0x0A OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RRC E", function() {
		s = {"opcode":"RRC","params":["E"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x0B,"Opcode 1 = 0x0B OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RRC H", function() {
		s = {"opcode":"RRC","params":["H"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x0C,"Opcode 1 = 0x0C OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RRC L", function() {
		s = {"opcode":"RRC","params":["L"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x0D,"Opcode 1 = 0x0D OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RRC (HL)", function() {
		s = {"opcode":"RRC","params":["(HL)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x0E,"Opcode 1 = 0x0E OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RRC (IX+0x34)", function() {
		s = {"opcode":"RRC","params":["(IX+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0xCB,"Opcode 1 = 0xCB OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.lens[3],0x0E,"Opcode 3 = 0x0E OK");
		QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "RRC (IY+0x34)", function() {
		s = {"opcode":"RRC","params":["(IY+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0xCB,"Opcode 1 = 0xCB OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.lens[3],0x0E,"Opcode 3 = 0x0E OK");
		QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "RR A", function() {
		s = {"opcode":"RR","params":["A"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x1F,"Opcode 1 = 0x1F OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RR B", function() {
		s = {"opcode":"RR","params":["B"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x18,"Opcode 1 = 0x18 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RR C", function() {
		s = {"opcode":"RR","params":["C"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x19,"Opcode 1 = 0x19 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RR D", function() {
		s = {"opcode":"RR","params":["D"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x1A,"Opcode 1 = 0x1A OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RR E", function() {
		s = {"opcode":"RR","params":["E"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x1B,"Opcode 1 = 0x1B OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RR H", function() {
		s = {"opcode":"RR","params":["H"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x1C,"Opcode 1 = 0x1C OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RR L", function() {
		s = {"opcode":"RR","params":["L"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x1D,"Opcode 1 = 0x1D OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RR (HL)", function() {
		s = {"opcode":"RR","params":["(HL)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x1E,"Opcode 1 = 0x1E OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RR (IX+0x34)", function() {
		s = {"opcode":"RR","params":["(IX+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0xCB,"Opcode 1 = 0xCB OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.lens[3],0x1E,"Opcode 3 = 0x1E OK");
		QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "RR (IY+0x34)", function() {
		s = {"opcode":"RR","params":["(IY+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0xCB,"Opcode 1 = 0xCB OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.lens[3],0x1E,"Opcode 3 = 0x1E OK");
		QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "AND A", function() {
		s = {"opcode":"AND","params":["A"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xA7,"Opcode 0 = 0xA7 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "AND B", function() {
		s = {"opcode":"AND","params":["B"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xA0,"Opcode 0 = 0xA0 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "AND C", function() {
		s = {"opcode":"AND","params":["C"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xA1,"Opcode 0 = 0xA1 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "AND D", function() {
		s = {"opcode":"AND","params":["D"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xA2,"Opcode 0 = 0xA2 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "AND E", function() {
		s = {"opcode":"AND","params":["E"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xA3,"Opcode 0 = 0xA3 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "AND H", function() {
		s = {"opcode":"AND","params":["H"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xA4,"Opcode 0 = 0xA4 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "AND L", function() {
		s = {"opcode":"AND","params":["L"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xA5,"Opcode 0 = 0xA5 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "AND (HL)", function() {
		s = {"opcode":"AND","params":["(HL)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xA6,"Opcode 0 = 0xA6 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "AND (IX+0x34)", function() {
		s = {"opcode":"AND","params":["(IX+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0xA6,"Opcode 1 = 0xA6 OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "AND (IY+0x34)", function() {
		s = {"opcode":"AND","params":["(IY+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0xA6,"Opcode 1 = 0xA6 OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "AND 0x12", function() {
		s = {"opcode":"AND","params":["0x12"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xE6,"Opcode 0 = 0xE6 OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				p.lens[1]({});
      QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "XOR A", function() {
		s = {"opcode":"XOR","params":["A"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xAF,"Opcode 0 = 0xAF OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "XOR B", function() {
		s = {"opcode":"XOR","params":["B"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xA8,"Opcode 0 = 0xA8 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "XOR C", function() {
		s = {"opcode":"XOR","params":["C"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xA9,"Opcode 0 = 0xA9 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "XOR D", function() {
		s = {"opcode":"XOR","params":["D"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xAA,"Opcode 0 = 0xAA OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "XOR E", function() {
		s = {"opcode":"XOR","params":["E"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xAB,"Opcode 0 = 0xAB OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "XOR H", function() {
		s = {"opcode":"XOR","params":["H"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xAC,"Opcode 0 = 0xAC OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "XOR L", function() {
		s = {"opcode":"XOR","params":["L"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xAD,"Opcode 0 = 0xAD OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "XOR (HL)", function() {
		s = {"opcode":"XOR","params":["(HL)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xAE,"Opcode 0 = 0xAE OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "XOR (IX+0x34)", function() {
		s = {"opcode":"XOR","params":["(IX+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0xAE,"Opcode 1 = 0xAE OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "XOR (IY+0x34)", function() {
		s = {"opcode":"XOR","params":["(IY+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0xAE,"Opcode 1 = 0xAE OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "XOR 0x12", function() {
		s = {"opcode":"XOR","params":["0x12"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xEE,"Opcode 0 = 0xEE OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				p.lens[1]({});
      QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "OR A", function() {
		s = {"opcode":"OR","params":["A"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xB7,"Opcode 0 = 0xB7 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "OR B", function() {
		s = {"opcode":"OR","params":["B"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xB0,"Opcode 0 = 0xB0 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "OR C", function() {
		s = {"opcode":"OR","params":["C"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xB1,"Opcode 0 = 0xB1 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "OR D", function() {
		s = {"opcode":"OR","params":["D"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xB2,"Opcode 0 = 0xB2 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "OR E", function() {
		s = {"opcode":"OR","params":["E"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xB3,"Opcode 0 = 0xB3 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "OR H", function() {
		s = {"opcode":"OR","params":["H"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xB4,"Opcode 0 = 0xB4 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "OR L", function() {
		s = {"opcode":"OR","params":["L"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xB5,"Opcode 0 = 0xB5 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "OR (HL)", function() {
		s = {"opcode":"OR","params":["(HL)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xB6,"Opcode 0 = 0xB6 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "OR (IX+0x34)", function() {
		s = {"opcode":"OR","params":["(IX+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0xB6,"Opcode 1 = 0xB6 OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "OR (IY+0x34)", function() {
		s = {"opcode":"OR","params":["(IY+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0xB6,"Opcode 1 = 0xB6 OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "OR 0x12", function() {
		s = {"opcode":"OR","params":["0x12"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xF6,"Opcode 0 = 0xF6 OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				p.lens[1]({});
      QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "CP A", function() {
		s = {"opcode":"CP","params":["A"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xBF,"Opcode 0 = 0xBF OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "CP B", function() {
		s = {"opcode":"CP","params":["B"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xB8,"Opcode 0 = 0xB8 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "CP C", function() {
		s = {"opcode":"CP","params":["C"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xB9,"Opcode 0 = 0xB9 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "CP D", function() {
		s = {"opcode":"CP","params":["D"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xBA,"Opcode 0 = 0xBA OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "CP E", function() {
		s = {"opcode":"CP","params":["E"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xBB,"Opcode 0 = 0xBB OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "CP H", function() {
		s = {"opcode":"CP","params":["H"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xBC,"Opcode 0 = 0xBC OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "CP L", function() {
		s = {"opcode":"CP","params":["L"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xBD,"Opcode 0 = 0xBD OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "CP (HL)", function() {
		s = {"opcode":"CP","params":["(HL)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xBE,"Opcode 0 = 0xBE OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "CP (IX+0x34)", function() {
		s = {"opcode":"CP","params":["(IX+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0xBE,"Opcode 1 = 0xBE OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "CP (IY+0x34)", function() {
		s = {"opcode":"CP","params":["(IY+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0xBE,"Opcode 1 = 0xBE OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "CP 0x12", function() {
		s = {"opcode":"CP","params":["0x12"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFE,"Opcode 0 = 0xFE OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				p.lens[1]({});
      QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "CPI ", function() {
		s = {"opcode":"CPI","params":[],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xED,"Opcode 0 = 0xED OK");
		QUnit.assert.equal(p.lens[1],0xA1,"Opcode 1 = 0xA1 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "CPIR ", function() {
		s = {"opcode":"CPIR","params":[],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xED,"Opcode 0 = 0xED OK");
		QUnit.assert.equal(p.lens[1],0xB1,"Opcode 1 = 0xB1 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "CPD ", function() {
		s = {"opcode":"CPD","params":[],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xED,"Opcode 0 = 0xED OK");
		QUnit.assert.equal(p.lens[1],0xA9,"Opcode 1 = 0xA9 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "CPDR ", function() {
		s = {"opcode":"CPDR","params":[],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xED,"Opcode 0 = 0xED OK");
		QUnit.assert.equal(p.lens[1],0xB9,"Opcode 1 = 0xB9 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "JP 0x5678", function() {
		s = {"opcode":"JP","params":["0x5678"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xC3,"Opcode 0 = 0xC3 OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				p.lens[1]({});
      QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "JP NZ,0x5678", function() {
		s = {"opcode":"JP","params":["NZ","0x5678"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xC2,"Opcode 0 = 0xC2 OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				p.lens[1]({});
      QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "JP Z,0x5678", function() {
		s = {"opcode":"JP","params":["Z","0x5678"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCA,"Opcode 0 = 0xCA OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				p.lens[1]({});
      QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "JP NC,0x5678", function() {
		s = {"opcode":"JP","params":["NC","0x5678"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xD2,"Opcode 0 = 0xD2 OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				p.lens[1]({});
      QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "JP C,0x5678", function() {
		s = {"opcode":"JP","params":["C","0x5678"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDA,"Opcode 0 = 0xDA OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				p.lens[1]({});
      QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "JP PO,0x5678", function() {
		s = {"opcode":"JP","params":["PO","0x5678"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xE2,"Opcode 0 = 0xE2 OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				p.lens[1]({});
      QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "JP PE,0x5678", function() {
		s = {"opcode":"JP","params":["PE","0x5678"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xEA,"Opcode 0 = 0xEA OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				p.lens[1]({});
      QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "JP P,0x5678", function() {
		s = {"opcode":"JP","params":["P","0x5678"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xF2,"Opcode 0 = 0xF2 OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				p.lens[1]({});
      QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "JP M,0x5678", function() {
		s = {"opcode":"JP","params":["M","0x5678"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFA,"Opcode 0 = 0xFA OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				p.lens[1]({});
      QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "JP (HL)", function() {
		s = {"opcode":"JP","params":["(HL)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xE9,"Opcode 0 = 0xE9 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "JP (IX)", function() {
		s = {"opcode":"JP","params":["(IX)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0xE9,"Opcode 1 = 0xE9 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "JP (IY)", function() {
		s = {"opcode":"JP","params":["(IY)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0xE9,"Opcode 1 = 0xE9 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "JR 0x12", function() {
		s = {"opcode":"JR","params":["0x12"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x18,"Opcode 0 = 0x18 OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				p.lens[1]({});
      QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "JR NZ,0x12", function() {
		s = {"opcode":"JR","params":["NZ","0x12"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x20,"Opcode 0 = 0x20 OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				p.lens[1]({});
      QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "JR Z,0x12", function() {
		s = {"opcode":"JR","params":["Z","0x12"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x28,"Opcode 0 = 0x28 OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				p.lens[1]({});
      QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "JR NC,0x12", function() {
		s = {"opcode":"JR","params":["NC","0x12"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x30,"Opcode 0 = 0x30 OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				p.lens[1]({});
      QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "JR C,0x12", function() {
		s = {"opcode":"JR","params":["C","0x12"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x38,"Opcode 0 = 0x38 OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				p.lens[1]({});
      QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "DJNZ 0x12", function() {
		s = {"opcode":"DJNZ","params":["0x12"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0x10,"Opcode 0 = 0x10 OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				p.lens[1]({});
      QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "CALL 0x5678", function() {
		s = {"opcode":"CALL","params":["0x5678"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCD,"Opcode 0 = 0xCD OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				p.lens[1]({});
      QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "CALL NZ,0x5678", function() {
		s = {"opcode":"CALL","params":["NZ","0x5678"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xC4,"Opcode 0 = 0xC4 OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				p.lens[1]({});
      QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "CALL Z,0x5678", function() {
		s = {"opcode":"CALL","params":["Z","0x5678"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCC,"Opcode 0 = 0xCC OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				p.lens[1]({});
      QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "CALL NC,0x5678", function() {
		s = {"opcode":"CALL","params":["NC","0x5678"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xD4,"Opcode 0 = 0xD4 OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				p.lens[1]({});
      QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "CALL C,0x5678", function() {
		s = {"opcode":"CALL","params":["C","0x5678"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDC,"Opcode 0 = 0xDC OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				p.lens[1]({});
      QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "CALL PO,0x5678", function() {
		s = {"opcode":"CALL","params":["PO","0x5678"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xE4,"Opcode 0 = 0xE4 OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				p.lens[1]({});
      QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "CALL PE,0x5678", function() {
		s = {"opcode":"CALL","params":["PE","0x5678"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xEC,"Opcode 0 = 0xEC OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				p.lens[1]({});
      QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "CALL P,0x5678", function() {
		s = {"opcode":"CALL","params":["P","0x5678"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xF4,"Opcode 0 = 0xF4 OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				p.lens[1]({});
      QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "CALL M,0x5678", function() {
		s = {"opcode":"CALL","params":["M","0x5678"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFC,"Opcode 0 = 0xFC OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				p.lens[1]({});
      QUnit.assert.equal(p.bytes,3,"Length OK");
	});
	QUnit.test( "RET ", function() {
		s = {"opcode":"RET","params":[],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xC9,"Opcode 0 = 0xC9 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "RET NZ", function() {
		s = {"opcode":"RET","params":["NZ"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xC0,"Opcode 0 = 0xC0 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "RET Z", function() {
		s = {"opcode":"RET","params":["Z"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xC8,"Opcode 0 = 0xC8 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "RET NC", function() {
		s = {"opcode":"RET","params":["NC"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xD0,"Opcode 0 = 0xD0 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "RET C", function() {
		s = {"opcode":"RET","params":["C"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xD8,"Opcode 0 = 0xD8 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "RET PO", function() {
		s = {"opcode":"RET","params":["PO"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xE0,"Opcode 0 = 0xE0 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "RET PE", function() {
		s = {"opcode":"RET","params":["PE"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xE8,"Opcode 0 = 0xE8 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "RET P", function() {
		s = {"opcode":"RET","params":["P"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xF0,"Opcode 0 = 0xF0 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "RET M", function() {
		s = {"opcode":"RET","params":["M"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xF8,"Opcode 0 = 0xF8 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "RETI ", function() {
		s = {"opcode":"RETI","params":[],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xED,"Opcode 0 = 0xED OK");
		QUnit.assert.equal(p.lens[1],0x4D,"Opcode 1 = 0x4D OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RETN ", function() {
		s = {"opcode":"RETN","params":[],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xED,"Opcode 0 = 0xED OK");
		QUnit.assert.equal(p.lens[1],0x45,"Opcode 1 = 0x45 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RST 0", function() {
		s = {"opcode":"RST","params":["0"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xC7,"Opcode 0 = 0xC7 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "RST 8", function() {
		s = {"opcode":"RST","params":["8"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCF,"Opcode 0 = 0xCF OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "RST 10H", function() {
		s = {"opcode":"RST","params":["10H"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xD7,"Opcode 0 = 0xD7 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "RST 18H", function() {
		s = {"opcode":"RST","params":["18H"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDF,"Opcode 0 = 0xDF OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "RST 20H", function() {
		s = {"opcode":"RST","params":["20H"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xE7,"Opcode 0 = 0xE7 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "RST 28H", function() {
		s = {"opcode":"RST","params":["28H"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xEF,"Opcode 0 = 0xEF OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "RST 30H", function() {
		s = {"opcode":"RST","params":["30H"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xF7,"Opcode 0 = 0xF7 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "RST 38H", function() {
		s = {"opcode":"RST","params":["38H"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFF,"Opcode 0 = 0xFF OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "PUSH BC", function() {
		s = {"opcode":"PUSH","params":["BC"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xC5,"Opcode 0 = 0xC5 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "PUSH DE", function() {
		s = {"opcode":"PUSH","params":["DE"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xD5,"Opcode 0 = 0xD5 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "PUSH HL", function() {
		s = {"opcode":"PUSH","params":["HL"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xE5,"Opcode 0 = 0xE5 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "PUSH AF", function() {
		s = {"opcode":"PUSH","params":["AF"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xF5,"Opcode 0 = 0xF5 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "PUSH IX", function() {
		s = {"opcode":"PUSH","params":["IX"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0xE5,"Opcode 1 = 0xE5 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "PUSH IY", function() {
		s = {"opcode":"PUSH","params":["IY"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0xE5,"Opcode 1 = 0xE5 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "POP BC", function() {
		s = {"opcode":"POP","params":["BC"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xC1,"Opcode 0 = 0xC1 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "POP DE", function() {
		s = {"opcode":"POP","params":["DE"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xD1,"Opcode 0 = 0xD1 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "POP HL", function() {
		s = {"opcode":"POP","params":["HL"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xE1,"Opcode 0 = 0xE1 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "POP AF", function() {
		s = {"opcode":"POP","params":["AF"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xF1,"Opcode 0 = 0xF1 OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});
	QUnit.test( "POP IX", function() {
		s = {"opcode":"POP","params":["IX"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0xE1,"Opcode 1 = 0xE1 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "POP IY", function() {
		s = {"opcode":"POP","params":["IY"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0xE1,"Opcode 1 = 0xE1 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "IN A,(0x12)", function() {
		s = {"opcode":"IN","params":["A","(0x12)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDB,"Opcode 0 = 0xDB OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode 1 OK");
				p.lens[1]({});
      QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "IN A,(C)", function() {
		s = {"opcode":"IN","params":["A","(C)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xED,"Opcode 0 = 0xED OK");
		QUnit.assert.equal(p.lens[1],0x78,"Opcode 1 = 0x78 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "IN B,(C)", function() {
		s = {"opcode":"IN","params":["B","(C)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xED,"Opcode 0 = 0xED OK");
		QUnit.assert.equal(p.lens[1],0x40,"Opcode 1 = 0x40 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "IN C,(C)", function() {
		s = {"opcode":"IN","params":["C","(C)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xED,"Opcode 0 = 0xED OK");
		QUnit.assert.equal(p.lens[1],0x48,"Opcode 1 = 0x48 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "IN D,(C)", function() {
		s = {"opcode":"IN","params":["D","(C)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xED,"Opcode 0 = 0xED OK");
		QUnit.assert.equal(p.lens[1],0x50,"Opcode 1 = 0x50 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "IN E,(C)", function() {
		s = {"opcode":"IN","params":["E","(C)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xED,"Opcode 0 = 0xED OK");
		QUnit.assert.equal(p.lens[1],0x58,"Opcode 1 = 0x58 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "IN H,(C)", function() {
		s = {"opcode":"IN","params":["H","(C)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xED,"Opcode 0 = 0xED OK");
		QUnit.assert.equal(p.lens[1],0x60,"Opcode 1 = 0x60 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "IN L,(C)", function() {
		s = {"opcode":"IN","params":["L","(C)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xED,"Opcode 0 = 0xED OK");
		QUnit.assert.equal(p.lens[1],0x68,"Opcode 1 = 0x68 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "INI ", function() {
		s = {"opcode":"INI","params":[],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xED,"Opcode 0 = 0xED OK");
		QUnit.assert.equal(p.lens[1],0xA2,"Opcode 1 = 0xA2 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "INIR ", function() {
		s = {"opcode":"INIR","params":[],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xED,"Opcode 0 = 0xED OK");
		QUnit.assert.equal(p.lens[1],0xB2,"Opcode 1 = 0xB2 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "IND ", function() {
		s = {"opcode":"IND","params":[],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xED,"Opcode 0 = 0xED OK");
		QUnit.assert.equal(p.lens[1],0xAA,"Opcode 1 = 0xAA OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "INDR ", function() {
		s = {"opcode":"INDR","params":[],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xED,"Opcode 0 = 0xED OK");
		QUnit.assert.equal(p.lens[1],0xBA,"Opcode 1 = 0xBA OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "OUT (C),A", function() {
		s = {"opcode":"OUT","params":["(C)","A"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xED,"Opcode 0 = 0xED OK");
		QUnit.assert.equal(p.lens[1],0x79,"Opcode 1 = 0x79 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "OUT (C),B", function() {
		s = {"opcode":"OUT","params":["(C)","B"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xED,"Opcode 0 = 0xED OK");
		QUnit.assert.equal(p.lens[1],0x41,"Opcode 1 = 0x41 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "OUT (C),C", function() {
		s = {"opcode":"OUT","params":["(C)","C"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xED,"Opcode 0 = 0xED OK");
		QUnit.assert.equal(p.lens[1],0x49,"Opcode 1 = 0x49 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "OUT (C),D", function() {
		s = {"opcode":"OUT","params":["(C)","D"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xED,"Opcode 0 = 0xED OK");
		QUnit.assert.equal(p.lens[1],0x51,"Opcode 1 = 0x51 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "OUT (C),E", function() {
		s = {"opcode":"OUT","params":["(C)","E"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xED,"Opcode 0 = 0xED OK");
		QUnit.assert.equal(p.lens[1],0x59,"Opcode 1 = 0x59 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "OUT (C),H", function() {
		s = {"opcode":"OUT","params":["(C)","H"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xED,"Opcode 0 = 0xED OK");
		QUnit.assert.equal(p.lens[1],0x61,"Opcode 1 = 0x61 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "OUT (C),L", function() {
		s = {"opcode":"OUT","params":["(C)","L"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xED,"Opcode 0 = 0xED OK");
		QUnit.assert.equal(p.lens[1],0x69,"Opcode 1 = 0x69 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "OUTI ", function() {
		s = {"opcode":"OUTI","params":[],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xED,"Opcode 0 = 0xED OK");
		QUnit.assert.equal(p.lens[1],0xA3,"Opcode 1 = 0xA3 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "OTIR ", function() {
		s = {"opcode":"OTIR","params":[],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xED,"Opcode 0 = 0xED OK");
		QUnit.assert.equal(p.lens[1],0xB3,"Opcode 1 = 0xB3 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "OUTD ", function() {
		s = {"opcode":"OUTD","params":[],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xED,"Opcode 0 = 0xED OK");
		QUnit.assert.equal(p.lens[1],0xAB,"Opcode 1 = 0xAB OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "OTDR ", function() {
		s = {"opcode":"OTDR","params":[],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xED,"Opcode 0 = 0xED OK");
		QUnit.assert.equal(p.lens[1],0xBB,"Opcode 1 = 0xBB OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "LDI ", function() {
		s = {"opcode":"LDI","params":[],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xED,"Opcode 0 = 0xED OK");
		QUnit.assert.equal(p.lens[1],0xA0,"Opcode 1 = 0xA0 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "LDIR ", function() {
		s = {"opcode":"LDIR","params":[],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xED,"Opcode 0 = 0xED OK");
		QUnit.assert.equal(p.lens[1],0xB0,"Opcode 1 = 0xB0 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "LDD ", function() {
		s = {"opcode":"LDD","params":[],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xED,"Opcode 0 = 0xED OK");
		QUnit.assert.equal(p.lens[1],0xA8,"Opcode 1 = 0xA8 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "LDDR ", function() {
		s = {"opcode":"LDDR","params":[],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xED,"Opcode 0 = 0xED OK");
		QUnit.assert.equal(p.lens[1],0xB8,"Opcode 1 = 0xB8 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "BIT 0,A", function() {
		s = {"opcode":"BIT","params":["0","A"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x47,"Opcode 1 = 0x47 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "BIT 0,B", function() {
		s = {"opcode":"BIT","params":["0","B"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x40,"Opcode 1 = 0x40 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "BIT 0,C", function() {
		s = {"opcode":"BIT","params":["0","C"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x41,"Opcode 1 = 0x41 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "BIT 0,D", function() {
		s = {"opcode":"BIT","params":["0","D"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x42,"Opcode 1 = 0x42 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "BIT 0,E", function() {
		s = {"opcode":"BIT","params":["0","E"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x43,"Opcode 1 = 0x43 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "BIT 0,H", function() {
		s = {"opcode":"BIT","params":["0","H"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x44,"Opcode 1 = 0x44 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "BIT 0,L", function() {
		s = {"opcode":"BIT","params":["0","L"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x45,"Opcode 1 = 0x45 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "BIT 0,(HL)", function() {
		s = {"opcode":"BIT","params":["0","(HL)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x46,"Opcode 1 = 0x46 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "BIT 0,(IX+0x34)", function() {
		s = {"opcode":"BIT","params":["0","(IX+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0xCB,"Opcode 1 = 0xCB OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.lens[3],0x46,"Opcode 3 = 0x46 OK");
		QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "BIT 0,(IY+0x34)", function() {
		s = {"opcode":"BIT","params":["0","(IY+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0xCB,"Opcode 1 = 0xCB OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.lens[3],0x46,"Opcode 3 = 0x46 OK");
		QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "BIT 1,A", function() {
		s = {"opcode":"BIT","params":["1","A"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x4F,"Opcode 1 = 0x4F OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "BIT 1,B", function() {
		s = {"opcode":"BIT","params":["1","B"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x48,"Opcode 1 = 0x48 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "BIT 1,C", function() {
		s = {"opcode":"BIT","params":["1","C"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x49,"Opcode 1 = 0x49 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "BIT 1,D", function() {
		s = {"opcode":"BIT","params":["1","D"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x4A,"Opcode 1 = 0x4A OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "BIT 1,E", function() {
		s = {"opcode":"BIT","params":["1","E"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x4B,"Opcode 1 = 0x4B OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "BIT 1,H", function() {
		s = {"opcode":"BIT","params":["1","H"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x4C,"Opcode 1 = 0x4C OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "BIT 1,L", function() {
		s = {"opcode":"BIT","params":["1","L"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x4D,"Opcode 1 = 0x4D OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "BIT 1,(HL)", function() {
		s = {"opcode":"BIT","params":["1","(HL)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x4E,"Opcode 1 = 0x4E OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "BIT 1,(IX+0x34)", function() {
		s = {"opcode":"BIT","params":["1","(IX+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0xCB,"Opcode 1 = 0xCB OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.lens[3],0x4E,"Opcode 3 = 0x4E OK");
		QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "BIT 1,(IY+0x34)", function() {
		s = {"opcode":"BIT","params":["1","(IY+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0xCB,"Opcode 1 = 0xCB OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.lens[3],0x4E,"Opcode 3 = 0x4E OK");
		QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "BIT 2,A", function() {
		s = {"opcode":"BIT","params":["2","A"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x57,"Opcode 1 = 0x57 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "BIT 2,B", function() {
		s = {"opcode":"BIT","params":["2","B"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x50,"Opcode 1 = 0x50 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "BIT 2,C", function() {
		s = {"opcode":"BIT","params":["2","C"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x51,"Opcode 1 = 0x51 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "BIT 2,D", function() {
		s = {"opcode":"BIT","params":["2","D"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x52,"Opcode 1 = 0x52 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "BIT 2,E", function() {
		s = {"opcode":"BIT","params":["2","E"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x53,"Opcode 1 = 0x53 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "BIT 2,H", function() {
		s = {"opcode":"BIT","params":["2","H"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x54,"Opcode 1 = 0x54 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "BIT 2,L", function() {
		s = {"opcode":"BIT","params":["2","L"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x55,"Opcode 1 = 0x55 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "BIT 2,(HL)", function() {
		s = {"opcode":"BIT","params":["2","(HL)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x56,"Opcode 1 = 0x56 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "BIT 2,(IX+0x34)", function() {
		s = {"opcode":"BIT","params":["2","(IX+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0xCB,"Opcode 1 = 0xCB OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.lens[3],0x56,"Opcode 3 = 0x56 OK");
		QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "BIT 2,(IY+0x34)", function() {
		s = {"opcode":"BIT","params":["2","(IY+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0xCB,"Opcode 1 = 0xCB OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.lens[3],0x56,"Opcode 3 = 0x56 OK");
		QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "BIT 3,A", function() {
		s = {"opcode":"BIT","params":["3","A"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x5F,"Opcode 1 = 0x5F OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "BIT 3,B", function() {
		s = {"opcode":"BIT","params":["3","B"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x58,"Opcode 1 = 0x58 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "BIT 3,C", function() {
		s = {"opcode":"BIT","params":["3","C"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x59,"Opcode 1 = 0x59 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "BIT 3,D", function() {
		s = {"opcode":"BIT","params":["3","D"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x5A,"Opcode 1 = 0x5A OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "BIT 3,E", function() {
		s = {"opcode":"BIT","params":["3","E"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x5B,"Opcode 1 = 0x5B OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "BIT 3,H", function() {
		s = {"opcode":"BIT","params":["3","H"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x5C,"Opcode 1 = 0x5C OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "BIT 3,L", function() {
		s = {"opcode":"BIT","params":["3","L"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x5D,"Opcode 1 = 0x5D OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "BIT 3,(HL)", function() {
		s = {"opcode":"BIT","params":["3","(HL)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x5E,"Opcode 1 = 0x5E OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "BIT 3,(IX+0x34)", function() {
		s = {"opcode":"BIT","params":["3","(IX+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0xCB,"Opcode 1 = 0xCB OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.lens[3],0x5E,"Opcode 3 = 0x5E OK");
		QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "BIT 3,(IY+0x34)", function() {
		s = {"opcode":"BIT","params":["3","(IY+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0xCB,"Opcode 1 = 0xCB OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.lens[3],0x5E,"Opcode 3 = 0x5E OK");
		QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "BIT 4,A", function() {
		s = {"opcode":"BIT","params":["4","A"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x67,"Opcode 1 = 0x67 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "BIT 4,B", function() {
		s = {"opcode":"BIT","params":["4","B"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x60,"Opcode 1 = 0x60 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "BIT 4,C", function() {
		s = {"opcode":"BIT","params":["4","C"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x61,"Opcode 1 = 0x61 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "BIT 4,D", function() {
		s = {"opcode":"BIT","params":["4","D"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x62,"Opcode 1 = 0x62 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "BIT 4,E", function() {
		s = {"opcode":"BIT","params":["4","E"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x63,"Opcode 1 = 0x63 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "BIT 4,H", function() {
		s = {"opcode":"BIT","params":["4","H"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x64,"Opcode 1 = 0x64 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "BIT 4,L", function() {
		s = {"opcode":"BIT","params":["4","L"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x65,"Opcode 1 = 0x65 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "BIT 4,(HL)", function() {
		s = {"opcode":"BIT","params":["4","(HL)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x66,"Opcode 1 = 0x66 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "BIT 4,(IX+0x34)", function() {
		s = {"opcode":"BIT","params":["4","(IX+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0xCB,"Opcode 1 = 0xCB OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.lens[3],0x66,"Opcode 3 = 0x66 OK");
		QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "BIT 4,(IY+0x34)", function() {
		s = {"opcode":"BIT","params":["4","(IY+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0xCB,"Opcode 1 = 0xCB OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.lens[3],0x66,"Opcode 3 = 0x66 OK");
		QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "BIT 5,A", function() {
		s = {"opcode":"BIT","params":["5","A"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x6F,"Opcode 1 = 0x6F OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "BIT 5,B", function() {
		s = {"opcode":"BIT","params":["5","B"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x68,"Opcode 1 = 0x68 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "BIT 5,C", function() {
		s = {"opcode":"BIT","params":["5","C"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x69,"Opcode 1 = 0x69 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "BIT 5,D", function() {
		s = {"opcode":"BIT","params":["5","D"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x6A,"Opcode 1 = 0x6A OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "BIT 5,E", function() {
		s = {"opcode":"BIT","params":["5","E"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x6B,"Opcode 1 = 0x6B OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "BIT 5,H", function() {
		s = {"opcode":"BIT","params":["5","H"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x6C,"Opcode 1 = 0x6C OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "BIT 5,L", function() {
		s = {"opcode":"BIT","params":["5","L"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x6D,"Opcode 1 = 0x6D OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "BIT 5,(HL)", function() {
		s = {"opcode":"BIT","params":["5","(HL)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x6E,"Opcode 1 = 0x6E OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "BIT 5,(IX+0x34)", function() {
		s = {"opcode":"BIT","params":["5","(IX+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0xCB,"Opcode 1 = 0xCB OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.lens[3],0x6E,"Opcode 3 = 0x6E OK");
		QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "BIT 5,(IY+0x34)", function() {
		s = {"opcode":"BIT","params":["5","(IY+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0xCB,"Opcode 1 = 0xCB OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.lens[3],0x6E,"Opcode 3 = 0x6E OK");
		QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "BIT 6,A", function() {
		s = {"opcode":"BIT","params":["6","A"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x77,"Opcode 1 = 0x77 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "BIT 6,B", function() {
		s = {"opcode":"BIT","params":["6","B"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x70,"Opcode 1 = 0x70 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "BIT 6,C", function() {
		s = {"opcode":"BIT","params":["6","C"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x71,"Opcode 1 = 0x71 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "BIT 6,D", function() {
		s = {"opcode":"BIT","params":["6","D"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x72,"Opcode 1 = 0x72 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "BIT 6,E", function() {
		s = {"opcode":"BIT","params":["6","E"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x73,"Opcode 1 = 0x73 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "BIT 6,H", function() {
		s = {"opcode":"BIT","params":["6","H"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x74,"Opcode 1 = 0x74 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "BIT 6,L", function() {
		s = {"opcode":"BIT","params":["6","L"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x75,"Opcode 1 = 0x75 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "BIT 6,(HL)", function() {
		s = {"opcode":"BIT","params":["6","(HL)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x76,"Opcode 1 = 0x76 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "BIT 6,(IX+0x34)", function() {
		s = {"opcode":"BIT","params":["6","(IX+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0xCB,"Opcode 1 = 0xCB OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.lens[3],0x76,"Opcode 3 = 0x76 OK");
		QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "BIT 6,(IY+0x34)", function() {
		s = {"opcode":"BIT","params":["6","(IY+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0xCB,"Opcode 1 = 0xCB OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.lens[3],0x76,"Opcode 3 = 0x76 OK");
		QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "BIT 7,A", function() {
		s = {"opcode":"BIT","params":["7","A"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x7F,"Opcode 1 = 0x7F OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "BIT 7,B", function() {
		s = {"opcode":"BIT","params":["7","B"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x78,"Opcode 1 = 0x78 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "BIT 7,C", function() {
		s = {"opcode":"BIT","params":["7","C"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x79,"Opcode 1 = 0x79 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "BIT 7,D", function() {
		s = {"opcode":"BIT","params":["7","D"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x7A,"Opcode 1 = 0x7A OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "BIT 7,E", function() {
		s = {"opcode":"BIT","params":["7","E"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x7B,"Opcode 1 = 0x7B OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "BIT 7,H", function() {
		s = {"opcode":"BIT","params":["7","H"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x7C,"Opcode 1 = 0x7C OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "BIT 7,L", function() {
		s = {"opcode":"BIT","params":["7","L"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x7D,"Opcode 1 = 0x7D OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "BIT 7,(HL)", function() {
		s = {"opcode":"BIT","params":["7","(HL)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x7E,"Opcode 1 = 0x7E OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "BIT 7,(IX+0x34)", function() {
		s = {"opcode":"BIT","params":["7","(IX+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0xCB,"Opcode 1 = 0xCB OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.lens[3],0x7E,"Opcode 3 = 0x7E OK");
		QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "BIT 7,(IY+0x34)", function() {
		s = {"opcode":"BIT","params":["7","(IY+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0xCB,"Opcode 1 = 0xCB OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.lens[3],0x7E,"Opcode 3 = 0x7E OK");
		QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "RES 0,A", function() {
		s = {"opcode":"RES","params":["0","A"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x87,"Opcode 1 = 0x87 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RES 0,B", function() {
		s = {"opcode":"RES","params":["0","B"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x80,"Opcode 1 = 0x80 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RES 0,C", function() {
		s = {"opcode":"RES","params":["0","C"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x81,"Opcode 1 = 0x81 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RES 0,D", function() {
		s = {"opcode":"RES","params":["0","D"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x82,"Opcode 1 = 0x82 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RES 0,E", function() {
		s = {"opcode":"RES","params":["0","E"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x83,"Opcode 1 = 0x83 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RES 0,H", function() {
		s = {"opcode":"RES","params":["0","H"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x84,"Opcode 1 = 0x84 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RES 0,L", function() {
		s = {"opcode":"RES","params":["0","L"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x85,"Opcode 1 = 0x85 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RES 0,(HL)", function() {
		s = {"opcode":"RES","params":["0","(HL)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x86,"Opcode 1 = 0x86 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RES 0,(IX+0x34)", function() {
		s = {"opcode":"RES","params":["0","(IX+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0xCB,"Opcode 1 = 0xCB OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.lens[3],0x86,"Opcode 3 = 0x86 OK");
		QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "RES 0,(IY+0x34)", function() {
		s = {"opcode":"RES","params":["0","(IY+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0xCB,"Opcode 1 = 0xCB OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.lens[3],0x86,"Opcode 3 = 0x86 OK");
		QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "RES 1,A", function() {
		s = {"opcode":"RES","params":["1","A"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x8F,"Opcode 1 = 0x8F OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RES 1,B", function() {
		s = {"opcode":"RES","params":["1","B"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x88,"Opcode 1 = 0x88 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RES 1,C", function() {
		s = {"opcode":"RES","params":["1","C"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x89,"Opcode 1 = 0x89 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RES 1,D", function() {
		s = {"opcode":"RES","params":["1","D"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x8A,"Opcode 1 = 0x8A OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RES 1,E", function() {
		s = {"opcode":"RES","params":["1","E"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x8B,"Opcode 1 = 0x8B OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RES 1,H", function() {
		s = {"opcode":"RES","params":["1","H"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x8C,"Opcode 1 = 0x8C OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RES 1,L", function() {
		s = {"opcode":"RES","params":["1","L"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x8D,"Opcode 1 = 0x8D OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RES 1,(HL)", function() {
		s = {"opcode":"RES","params":["1","(HL)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x8E,"Opcode 1 = 0x8E OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RES 1,(IX+0x34)", function() {
		s = {"opcode":"RES","params":["1","(IX+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0xCB,"Opcode 1 = 0xCB OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.lens[3],0x8E,"Opcode 3 = 0x8E OK");
		QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "RES 1,(IY+0x34)", function() {
		s = {"opcode":"RES","params":["1","(IY+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0xCB,"Opcode 1 = 0xCB OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.lens[3],0x8E,"Opcode 3 = 0x8E OK");
		QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "RES 2,A", function() {
		s = {"opcode":"RES","params":["2","A"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x97,"Opcode 1 = 0x97 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RES 2,B", function() {
		s = {"opcode":"RES","params":["2","B"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x90,"Opcode 1 = 0x90 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RES 2,C", function() {
		s = {"opcode":"RES","params":["2","C"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x91,"Opcode 1 = 0x91 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RES 2,D", function() {
		s = {"opcode":"RES","params":["2","D"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x92,"Opcode 1 = 0x92 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RES 2,E", function() {
		s = {"opcode":"RES","params":["2","E"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x93,"Opcode 1 = 0x93 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RES 2,H", function() {
		s = {"opcode":"RES","params":["2","H"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x94,"Opcode 1 = 0x94 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RES 2,L", function() {
		s = {"opcode":"RES","params":["2","L"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x95,"Opcode 1 = 0x95 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RES 2,(HL)", function() {
		s = {"opcode":"RES","params":["2","(HL)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x96,"Opcode 1 = 0x96 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RES 2,(IX+0x34)", function() {
		s = {"opcode":"RES","params":["2","(IX+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0xCB,"Opcode 1 = 0xCB OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.lens[3],0x96,"Opcode 3 = 0x96 OK");
		QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "RES 2,(IY+0x34)", function() {
		s = {"opcode":"RES","params":["2","(IY+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0xCB,"Opcode 1 = 0xCB OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.lens[3],0x96,"Opcode 3 = 0x96 OK");
		QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "RES 3,A", function() {
		s = {"opcode":"RES","params":["3","A"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x9F,"Opcode 1 = 0x9F OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RES 3,B", function() {
		s = {"opcode":"RES","params":["3","B"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x98,"Opcode 1 = 0x98 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RES 3,C", function() {
		s = {"opcode":"RES","params":["3","C"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x99,"Opcode 1 = 0x99 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RES 3,D", function() {
		s = {"opcode":"RES","params":["3","D"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x9A,"Opcode 1 = 0x9A OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RES 3,E", function() {
		s = {"opcode":"RES","params":["3","E"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x9B,"Opcode 1 = 0x9B OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RES 3,H", function() {
		s = {"opcode":"RES","params":["3","H"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x9C,"Opcode 1 = 0x9C OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RES 3,L", function() {
		s = {"opcode":"RES","params":["3","L"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x9D,"Opcode 1 = 0x9D OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RES 3,(HL)", function() {
		s = {"opcode":"RES","params":["3","(HL)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x9E,"Opcode 1 = 0x9E OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RES 3,(IX+0x34)", function() {
		s = {"opcode":"RES","params":["3","(IX+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0xCB,"Opcode 1 = 0xCB OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.lens[3],0x9E,"Opcode 3 = 0x9E OK");
		QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "RES 3,(IY+0x34)", function() {
		s = {"opcode":"RES","params":["3","(IY+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0xCB,"Opcode 1 = 0xCB OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.lens[3],0x9E,"Opcode 3 = 0x9E OK");
		QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "RES 4,A", function() {
		s = {"opcode":"RES","params":["4","A"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xA7,"Opcode 1 = 0xA7 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RES 4,B", function() {
		s = {"opcode":"RES","params":["4","B"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xA0,"Opcode 1 = 0xA0 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RES 4,C", function() {
		s = {"opcode":"RES","params":["4","C"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xA1,"Opcode 1 = 0xA1 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RES 4,D", function() {
		s = {"opcode":"RES","params":["4","D"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xA2,"Opcode 1 = 0xA2 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RES 4,E", function() {
		s = {"opcode":"RES","params":["4","E"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xA3,"Opcode 1 = 0xA3 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RES 4,H", function() {
		s = {"opcode":"RES","params":["4","H"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xA4,"Opcode 1 = 0xA4 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RES 4,L", function() {
		s = {"opcode":"RES","params":["4","L"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xA5,"Opcode 1 = 0xA5 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RES 4,(HL)", function() {
		s = {"opcode":"RES","params":["4","(HL)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xA6,"Opcode 1 = 0xA6 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RES 4,(IX+0x34)", function() {
		s = {"opcode":"RES","params":["4","(IX+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0xCB,"Opcode 1 = 0xCB OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.lens[3],0xA6,"Opcode 3 = 0xA6 OK");
		QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "RES 4,(IY+0x34)", function() {
		s = {"opcode":"RES","params":["4","(IY+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0xCB,"Opcode 1 = 0xCB OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.lens[3],0xA6,"Opcode 3 = 0xA6 OK");
		QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "RES 5,A", function() {
		s = {"opcode":"RES","params":["5","A"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xAF,"Opcode 1 = 0xAF OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RES 5,B", function() {
		s = {"opcode":"RES","params":["5","B"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xA8,"Opcode 1 = 0xA8 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RES 5,C", function() {
		s = {"opcode":"RES","params":["5","C"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xA9,"Opcode 1 = 0xA9 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RES 5,D", function() {
		s = {"opcode":"RES","params":["5","D"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xAA,"Opcode 1 = 0xAA OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RES 5,E", function() {
		s = {"opcode":"RES","params":["5","E"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xAB,"Opcode 1 = 0xAB OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RES 5,H", function() {
		s = {"opcode":"RES","params":["5","H"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xAC,"Opcode 1 = 0xAC OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RES 5,L", function() {
		s = {"opcode":"RES","params":["5","L"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xAD,"Opcode 1 = 0xAD OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RES 5,(HL)", function() {
		s = {"opcode":"RES","params":["5","(HL)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xAE,"Opcode 1 = 0xAE OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RES 5,(IX+0x34)", function() {
		s = {"opcode":"RES","params":["5","(IX+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0xCB,"Opcode 1 = 0xCB OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.lens[3],0xAE,"Opcode 3 = 0xAE OK");
		QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "RES 5,(IY+0x34)", function() {
		s = {"opcode":"RES","params":["5","(IY+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0xCB,"Opcode 1 = 0xCB OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.lens[3],0xAE,"Opcode 3 = 0xAE OK");
		QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "RES 6,A", function() {
		s = {"opcode":"RES","params":["6","A"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xB7,"Opcode 1 = 0xB7 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RES 6,B", function() {
		s = {"opcode":"RES","params":["6","B"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xB0,"Opcode 1 = 0xB0 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RES 6,C", function() {
		s = {"opcode":"RES","params":["6","C"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xB1,"Opcode 1 = 0xB1 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RES 6,D", function() {
		s = {"opcode":"RES","params":["6","D"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xB2,"Opcode 1 = 0xB2 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RES 6,E", function() {
		s = {"opcode":"RES","params":["6","E"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xB3,"Opcode 1 = 0xB3 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RES 6,H", function() {
		s = {"opcode":"RES","params":["6","H"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xB4,"Opcode 1 = 0xB4 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RES 6,L", function() {
		s = {"opcode":"RES","params":["6","L"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xB5,"Opcode 1 = 0xB5 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RES 6,(HL)", function() {
		s = {"opcode":"RES","params":["6","(HL)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xB6,"Opcode 1 = 0xB6 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RES 6,(IX+0x34)", function() {
		s = {"opcode":"RES","params":["6","(IX+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0xCB,"Opcode 1 = 0xCB OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.lens[3],0xB6,"Opcode 3 = 0xB6 OK");
		QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "RES 6,(IY+0x34)", function() {
		s = {"opcode":"RES","params":["6","(IY+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0xCB,"Opcode 1 = 0xCB OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.lens[3],0xB6,"Opcode 3 = 0xB6 OK");
		QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "RES 7,A", function() {
		s = {"opcode":"RES","params":["7","A"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xBF,"Opcode 1 = 0xBF OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RES 7,B", function() {
		s = {"opcode":"RES","params":["7","B"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xB8,"Opcode 1 = 0xB8 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RES 7,C", function() {
		s = {"opcode":"RES","params":["7","C"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xB9,"Opcode 1 = 0xB9 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RES 7,D", function() {
		s = {"opcode":"RES","params":["7","D"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xBA,"Opcode 1 = 0xBA OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RES 7,E", function() {
		s = {"opcode":"RES","params":["7","E"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xBB,"Opcode 1 = 0xBB OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RES 7,H", function() {
		s = {"opcode":"RES","params":["7","H"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xBC,"Opcode 1 = 0xBC OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RES 7,L", function() {
		s = {"opcode":"RES","params":["7","L"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xBD,"Opcode 1 = 0xBD OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RES 7,(HL)", function() {
		s = {"opcode":"RES","params":["7","(HL)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xBE,"Opcode 1 = 0xBE OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "RES 7,(IX+0x34)", function() {
		s = {"opcode":"RES","params":["7","(IX+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0xCB,"Opcode 1 = 0xCB OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.lens[3],0xBE,"Opcode 3 = 0xBE OK");
		QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "RES 7,(IY+0x34)", function() {
		s = {"opcode":"RES","params":["7","(IY+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0xCB,"Opcode 1 = 0xCB OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.lens[3],0xBE,"Opcode 3 = 0xBE OK");
		QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "SET 0,A", function() {
		s = {"opcode":"SET","params":["0","A"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xC7,"Opcode 1 = 0xC7 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SET 0,B", function() {
		s = {"opcode":"SET","params":["0","B"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xC0,"Opcode 1 = 0xC0 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SET 0,C", function() {
		s = {"opcode":"SET","params":["0","C"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xC1,"Opcode 1 = 0xC1 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SET 0,D", function() {
		s = {"opcode":"SET","params":["0","D"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xC2,"Opcode 1 = 0xC2 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SET 0,E", function() {
		s = {"opcode":"SET","params":["0","E"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xC3,"Opcode 1 = 0xC3 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SET 0,H", function() {
		s = {"opcode":"SET","params":["0","H"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xC4,"Opcode 1 = 0xC4 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SET 0,L", function() {
		s = {"opcode":"SET","params":["0","L"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xC5,"Opcode 1 = 0xC5 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SET 0,(HL)", function() {
		s = {"opcode":"SET","params":["0","(HL)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xC6,"Opcode 1 = 0xC6 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SET 0,(IX+0x34)", function() {
		s = {"opcode":"SET","params":["0","(IX+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0xCB,"Opcode 1 = 0xCB OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.lens[3],0xC6,"Opcode 3 = 0xC6 OK");
		QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "SET 0,(IY+0x34)", function() {
		s = {"opcode":"SET","params":["0","(IY+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0xCB,"Opcode 1 = 0xCB OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.lens[3],0xC6,"Opcode 3 = 0xC6 OK");
		QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "SET 1,A", function() {
		s = {"opcode":"SET","params":["1","A"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xCF,"Opcode 1 = 0xCF OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SET 1,B", function() {
		s = {"opcode":"SET","params":["1","B"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xC8,"Opcode 1 = 0xC8 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SET 1,C", function() {
		s = {"opcode":"SET","params":["1","C"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xC9,"Opcode 1 = 0xC9 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SET 1,D", function() {
		s = {"opcode":"SET","params":["1","D"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xCA,"Opcode 1 = 0xCA OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SET 1,E", function() {
		s = {"opcode":"SET","params":["1","E"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xCB,"Opcode 1 = 0xCB OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SET 1,H", function() {
		s = {"opcode":"SET","params":["1","H"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xCC,"Opcode 1 = 0xCC OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SET 1,L", function() {
		s = {"opcode":"SET","params":["1","L"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xCD,"Opcode 1 = 0xCD OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SET 1,(HL)", function() {
		s = {"opcode":"SET","params":["1","(HL)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xCE,"Opcode 1 = 0xCE OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SET 1,(IX+0x34)", function() {
		s = {"opcode":"SET","params":["1","(IX+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0xCB,"Opcode 1 = 0xCB OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.lens[3],0xCE,"Opcode 3 = 0xCE OK");
		QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "SET 1,(IY+0x34)", function() {
		s = {"opcode":"SET","params":["1","(IY+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0xCB,"Opcode 1 = 0xCB OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.lens[3],0xCE,"Opcode 3 = 0xCE OK");
		QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "SET 2,A", function() {
		s = {"opcode":"SET","params":["2","A"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xD7,"Opcode 1 = 0xD7 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SET 2,B", function() {
		s = {"opcode":"SET","params":["2","B"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xD0,"Opcode 1 = 0xD0 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SET 2,C", function() {
		s = {"opcode":"SET","params":["2","C"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xD1,"Opcode 1 = 0xD1 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SET 2,D", function() {
		s = {"opcode":"SET","params":["2","D"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xD2,"Opcode 1 = 0xD2 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SET 2,E", function() {
		s = {"opcode":"SET","params":["2","E"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xD3,"Opcode 1 = 0xD3 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SET 2,H", function() {
		s = {"opcode":"SET","params":["2","H"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xD4,"Opcode 1 = 0xD4 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SET 2,L", function() {
		s = {"opcode":"SET","params":["2","L"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xD5,"Opcode 1 = 0xD5 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SET 2,(HL)", function() {
		s = {"opcode":"SET","params":["2","(HL)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xD6,"Opcode 1 = 0xD6 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SET 2,(IX+0x34)", function() {
		s = {"opcode":"SET","params":["2","(IX+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0xCB,"Opcode 1 = 0xCB OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.lens[3],0xD6,"Opcode 3 = 0xD6 OK");
		QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "SET 2,(IY+0x34)", function() {
		s = {"opcode":"SET","params":["2","(IY+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0xCB,"Opcode 1 = 0xCB OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.lens[3],0xD6,"Opcode 3 = 0xD6 OK");
		QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "SET 3,A", function() {
		s = {"opcode":"SET","params":["3","A"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xDF,"Opcode 1 = 0xDF OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SET 3,B", function() {
		s = {"opcode":"SET","params":["3","B"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xD8,"Opcode 1 = 0xD8 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SET 3,C", function() {
		s = {"opcode":"SET","params":["3","C"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xD9,"Opcode 1 = 0xD9 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SET 3,D", function() {
		s = {"opcode":"SET","params":["3","D"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xDA,"Opcode 1 = 0xDA OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SET 3,E", function() {
		s = {"opcode":"SET","params":["3","E"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xDB,"Opcode 1 = 0xDB OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SET 3,H", function() {
		s = {"opcode":"SET","params":["3","H"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xDC,"Opcode 1 = 0xDC OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SET 3,L", function() {
		s = {"opcode":"SET","params":["3","L"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xDD,"Opcode 1 = 0xDD OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SET 3,(HL)", function() {
		s = {"opcode":"SET","params":["3","(HL)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xDE,"Opcode 1 = 0xDE OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SET 3,(IX+0x34)", function() {
		s = {"opcode":"SET","params":["3","(IX+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0xCB,"Opcode 1 = 0xCB OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.lens[3],0xDE,"Opcode 3 = 0xDE OK");
		QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "SET 3,(IY+0x34)", function() {
		s = {"opcode":"SET","params":["3","(IY+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0xCB,"Opcode 1 = 0xCB OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.lens[3],0xDE,"Opcode 3 = 0xDE OK");
		QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "SET 4,A", function() {
		s = {"opcode":"SET","params":["4","A"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xE7,"Opcode 1 = 0xE7 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SET 4,B", function() {
		s = {"opcode":"SET","params":["4","B"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xE0,"Opcode 1 = 0xE0 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SET 4,C", function() {
		s = {"opcode":"SET","params":["4","C"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xE1,"Opcode 1 = 0xE1 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SET 4,D", function() {
		s = {"opcode":"SET","params":["4","D"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xE2,"Opcode 1 = 0xE2 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SET 4,E", function() {
		s = {"opcode":"SET","params":["4","E"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xE3,"Opcode 1 = 0xE3 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SET 4,H", function() {
		s = {"opcode":"SET","params":["4","H"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xE4,"Opcode 1 = 0xE4 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SET 4,L", function() {
		s = {"opcode":"SET","params":["4","L"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xE5,"Opcode 1 = 0xE5 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SET 4,(HL)", function() {
		s = {"opcode":"SET","params":["4","(HL)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xE6,"Opcode 1 = 0xE6 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SET 4,(IX+0x34)", function() {
		s = {"opcode":"SET","params":["4","(IX+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0xCB,"Opcode 1 = 0xCB OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.lens[3],0xE6,"Opcode 3 = 0xE6 OK");
		QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "SET 4,(IY+0x34)", function() {
		s = {"opcode":"SET","params":["4","(IY+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0xCB,"Opcode 1 = 0xCB OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.lens[3],0xE6,"Opcode 3 = 0xE6 OK");
		QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "SET 5,A", function() {
		s = {"opcode":"SET","params":["5","A"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xEF,"Opcode 1 = 0xEF OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SET 5,B", function() {
		s = {"opcode":"SET","params":["5","B"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xE8,"Opcode 1 = 0xE8 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SET 5,C", function() {
		s = {"opcode":"SET","params":["5","C"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xE9,"Opcode 1 = 0xE9 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SET 5,D", function() {
		s = {"opcode":"SET","params":["5","D"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xEA,"Opcode 1 = 0xEA OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SET 5,E", function() {
		s = {"opcode":"SET","params":["5","E"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xEB,"Opcode 1 = 0xEB OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SET 5,H", function() {
		s = {"opcode":"SET","params":["5","H"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xEC,"Opcode 1 = 0xEC OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SET 5,L", function() {
		s = {"opcode":"SET","params":["5","L"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xED,"Opcode 1 = 0xED OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SET 5,(HL)", function() {
		s = {"opcode":"SET","params":["5","(HL)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xEE,"Opcode 1 = 0xEE OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SET 5,(IX+0x34)", function() {
		s = {"opcode":"SET","params":["5","(IX+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0xCB,"Opcode 1 = 0xCB OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.lens[3],0xEE,"Opcode 3 = 0xEE OK");
		QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "SET 5,(IY+0x34)", function() {
		s = {"opcode":"SET","params":["5","(IY+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0xCB,"Opcode 1 = 0xCB OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.lens[3],0xEE,"Opcode 3 = 0xEE OK");
		QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "SET 6,A", function() {
		s = {"opcode":"SET","params":["6","A"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xF7,"Opcode 1 = 0xF7 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SET 6,B", function() {
		s = {"opcode":"SET","params":["6","B"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xF0,"Opcode 1 = 0xF0 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SET 6,C", function() {
		s = {"opcode":"SET","params":["6","C"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xF1,"Opcode 1 = 0xF1 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SET 6,D", function() {
		s = {"opcode":"SET","params":["6","D"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xF2,"Opcode 1 = 0xF2 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SET 6,E", function() {
		s = {"opcode":"SET","params":["6","E"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xF3,"Opcode 1 = 0xF3 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SET 6,H", function() {
		s = {"opcode":"SET","params":["6","H"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xF4,"Opcode 1 = 0xF4 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SET 6,L", function() {
		s = {"opcode":"SET","params":["6","L"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xF5,"Opcode 1 = 0xF5 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SET 6,(HL)", function() {
		s = {"opcode":"SET","params":["6","(HL)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xF6,"Opcode 1 = 0xF6 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SET 6,(IX+0x34)", function() {
		s = {"opcode":"SET","params":["6","(IX+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0xCB,"Opcode 1 = 0xCB OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.lens[3],0xF6,"Opcode 3 = 0xF6 OK");
		QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "SET 6,(IY+0x34)", function() {
		s = {"opcode":"SET","params":["6","(IY+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0xCB,"Opcode 1 = 0xCB OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.lens[3],0xF6,"Opcode 3 = 0xF6 OK");
		QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "SET 7,A", function() {
		s = {"opcode":"SET","params":["7","A"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xFF,"Opcode 1 = 0xFF OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SET 7,B", function() {
		s = {"opcode":"SET","params":["7","B"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xF8,"Opcode 1 = 0xF8 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SET 7,C", function() {
		s = {"opcode":"SET","params":["7","C"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xF9,"Opcode 1 = 0xF9 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SET 7,D", function() {
		s = {"opcode":"SET","params":["7","D"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xFA,"Opcode 1 = 0xFA OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SET 7,E", function() {
		s = {"opcode":"SET","params":["7","E"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xFB,"Opcode 1 = 0xFB OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SET 7,H", function() {
		s = {"opcode":"SET","params":["7","H"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xFC,"Opcode 1 = 0xFC OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SET 7,L", function() {
		s = {"opcode":"SET","params":["7","L"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xFD,"Opcode 1 = 0xFD OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SET 7,(HL)", function() {
		s = {"opcode":"SET","params":["7","(HL)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0xFE,"Opcode 1 = 0xFE OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SET 7,(IX+0x34)", function() {
		s = {"opcode":"SET","params":["7","(IX+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0xCB,"Opcode 1 = 0xCB OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.lens[3],0xFE,"Opcode 3 = 0xFE OK");
		QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "SET 7,(IY+0x34)", function() {
		s = {"opcode":"SET","params":["7","(IY+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0xCB,"Opcode 1 = 0xCB OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.lens[3],0xFE,"Opcode 3 = 0xFE OK");
		QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "SLA A", function() {
		s = {"opcode":"SLA","params":["A"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x27,"Opcode 1 = 0x27 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SLA B", function() {
		s = {"opcode":"SLA","params":["B"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x20,"Opcode 1 = 0x20 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SLA C", function() {
		s = {"opcode":"SLA","params":["C"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x21,"Opcode 1 = 0x21 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SLA D", function() {
		s = {"opcode":"SLA","params":["D"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x22,"Opcode 1 = 0x22 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SLA E", function() {
		s = {"opcode":"SLA","params":["E"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x23,"Opcode 1 = 0x23 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SLA H", function() {
		s = {"opcode":"SLA","params":["H"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x24,"Opcode 1 = 0x24 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SLA L", function() {
		s = {"opcode":"SLA","params":["L"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x25,"Opcode 1 = 0x25 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SLA (HL)", function() {
		s = {"opcode":"SLA","params":["(HL)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x26,"Opcode 1 = 0x26 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SLA (IX+0x34)", function() {
		s = {"opcode":"SLA","params":["(IX+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0xCB,"Opcode 1 = 0xCB OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.lens[3],0x26,"Opcode 3 = 0x26 OK");
		QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "SLA (IY+0x34)", function() {
		s = {"opcode":"SLA","params":["(IY+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0xCB,"Opcode 1 = 0xCB OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.lens[3],0x26,"Opcode 3 = 0x26 OK");
		QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "SRA A", function() {
		s = {"opcode":"SRA","params":["A"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x2F,"Opcode 1 = 0x2F OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SRA B", function() {
		s = {"opcode":"SRA","params":["B"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x28,"Opcode 1 = 0x28 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SRA C", function() {
		s = {"opcode":"SRA","params":["C"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x29,"Opcode 1 = 0x29 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SRA D", function() {
		s = {"opcode":"SRA","params":["D"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x2A,"Opcode 1 = 0x2A OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SRA E", function() {
		s = {"opcode":"SRA","params":["E"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x2B,"Opcode 1 = 0x2B OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SRA H", function() {
		s = {"opcode":"SRA","params":["H"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x2C,"Opcode 1 = 0x2C OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SRA L", function() {
		s = {"opcode":"SRA","params":["L"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x2D,"Opcode 1 = 0x2D OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SRA (HL)", function() {
		s = {"opcode":"SRA","params":["(HL)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x2E,"Opcode 1 = 0x2E OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SRA (IX+0x34)", function() {
		s = {"opcode":"SRA","params":["(IX+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0xCB,"Opcode 1 = 0xCB OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.lens[3],0x2E,"Opcode 3 = 0x2E OK");
		QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "SRA (IY+0x34)", function() {
		s = {"opcode":"SRA","params":["(IY+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0xCB,"Opcode 1 = 0xCB OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.lens[3],0x2E,"Opcode 3 = 0x2E OK");
		QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "SRL A", function() {
		s = {"opcode":"SRL","params":["A"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x3F,"Opcode 1 = 0x3F OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SRL B", function() {
		s = {"opcode":"SRL","params":["B"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x38,"Opcode 1 = 0x38 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SRL C", function() {
		s = {"opcode":"SRL","params":["C"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x39,"Opcode 1 = 0x39 OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SRL D", function() {
		s = {"opcode":"SRL","params":["D"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x3A,"Opcode 1 = 0x3A OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SRL E", function() {
		s = {"opcode":"SRL","params":["E"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x3B,"Opcode 1 = 0x3B OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SRL H", function() {
		s = {"opcode":"SRL","params":["H"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x3C,"Opcode 1 = 0x3C OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SRL L", function() {
		s = {"opcode":"SRL","params":["L"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x3D,"Opcode 1 = 0x3D OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SRL (HL)", function() {
		s = {"opcode":"SRL","params":["(HL)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xCB,"Opcode 0 = 0xCB OK");
		QUnit.assert.equal(p.lens[1],0x3E,"Opcode 1 = 0x3E OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});
	QUnit.test( "SRL (IX+0x34)", function() {
		s = {"opcode":"SRL","params":["(IX+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xDD,"Opcode 0 = 0xDD OK");
		QUnit.assert.equal(p.lens[1],0xCB,"Opcode 1 = 0xCB OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.lens[3],0x3E,"Opcode 3 = 0x3E OK");
		QUnit.assert.equal(p.bytes,4,"Length OK");
	});
	QUnit.test( "SRL (IY+0x34)", function() {
		s = {"opcode":"SRL","params":["(IY+0x34)"],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
		QUnit.assert.equal(p.lens[0],0xFD,"Opcode 0 = 0xFD OK");
		QUnit.assert.equal(p.lens[1],0xCB,"Opcode 1 = 0xCB OK");
		QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode 2 OK");
					p.lens[2]({});
            QUnit.assert.equal(p.lens[3],0x3E,"Opcode 3 = 0x3E OK");
		QUnit.assert.equal(p.bytes,4,"Length OK");
	});

// Additional tests for uncovered Z80 areas

// Test uncovered R16 alternative branch (line 334-335)
QUnit.test( "DEC with undefined R16 mapping", function() {
	// Create mock instruction that doesn't have R16 mapping
	s = {"opcode":"TEST_R16","params":["BC"],"addr":0x100,"lens":[],"bytes":0};
	// This should trigger the else branch at lines 333-335
	p = Z80.parseOpcode(s,vars, Parser);
	QUnit.assert.equal(p,null,"Should return null for undefined instruction");
});

// Test uncovered LD A,(addr) instruction (lines 596-599) 
QUnit.test( "LD A,(address) special case", function() {
	s = {"opcode":"LD","params":["A","(0x1234)"],"addr":0x100,"lens":[],"bytes":0};
	p = Z80.parseOpcode(s,vars, Parser);
	QUnit.assert.equal(p.lens[0],0x3A,"Opcode for LD A,(addr)");
	QUnit.assert.equal(typeof(p.lens[1]),"function","Parameter function");
	QUnit.assert.equal(p.lens[2],null,"High byte marker");
	QUnit.assert.equal(p.bytes,3,"Length for LD A,(addr)");
});

// Test error handling in safeparse function (lines 741-747)
QUnit.test( "Error handling with invalid expression", function() {
	// Test with undefined variable to trigger exception
	var errorVars = {"_PC":0x0100}; // Missing required variable
	s = {"opcode":"LD","params":["A","UNDEFINED_VAR"],"addr":0x100,"lens":[],"bytes":0};
	// This should not throw but handle the error gracefully
	p = Z80.parseOpcode(s,errorVars, Parser);
	QUnit.assert.notEqual(p,null,"Should handle parsing errors gracefully");
});




// Test empty parameters case (lines around 1837, 1846)
QUnit.test('Empty parameters handling', assert => {
	assert.throws(()=>{
		s = {"opcode":"LD","params":[],"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
	})
});


// Test null parameters
QUnit.test( "Null parameters handling", assert => {
	assert.throws(()=>{
		s = {"opcode":"LD","params":null,"addr":0x100,"lens":[],"bytes":0};
		p = Z80.parseOpcode(s,vars, Parser);
	})
});

// Test invalid JR instruction to trigger return null  
QUnit.test( "Invalid JR instruction", function() {
	s = {"opcode":"JR","params":["INVALID","EXTRA"],"addr":0x100,"lens":[],"bytes":0};
	QUnit.assert.throws(function(){ Z80.parseOpcode(s,vars, Parser);},"Should throw for invalid JR");
});

// Test invalid CALL instruction
QUnit.test( "Invalid CALL instruction", function() {
	s = {"opcode":"CALL","params":["TOO","MANY","PARAMS"],"addr":0x100,"lens":[],"bytes":0};
	QUnit.assert.throws(function(){ Z80.parseOpcode(s,vars, Parser);},"Should throw for invalid CALL");
});

// Test index out of range for displacement (lines 2290, 2386, 2391)
QUnit.test( "Index out of range positive", function() {
	s = {"opcode":"LD","params":["A","(IX+200)"],"addr":0x100,"lens":[],"bytes":0};
	p = Z80.parseOpcode(s,vars, Parser);
	QUnit.assert.throws(function(){p.lens[2]({});},"Should throw for displacement > 127");
});

QUnit.test( "Index out of range negative", function() {
	s = {"opcode":"LD","params":["A","(IX-200)"],"addr":0x100,"lens":[],"bytes":0};
	p = Z80.parseOpcode(s,vars, Parser);
	QUnit.assert.throws(function(){p.lens[2]({});},"Should throw for displacement < -128");
});

// Test multiple indexed parameters (should trigger branch at line 2185)
QUnit.test( "Multiple indexed parameters", function() {
	s = {"opcode":"LD","params":["(IX+1)","(IY+2)"],"addr":0x100,"lens":[],"bytes":0};
	QUnit.assert.throws(function(){ Z80.parseOpcode(s,vars, Parser);},"Should throw for multiple indexed params");
});

// Test multiple prefixes (should trigger branch at line 2187)
QUnit.test( "Multiple prefixes detected", function() {
	// This is harder to trigger directly, but we can test with conflicting IX/IY usage
	s = {"opcode":"LD","params":["IXH","IYL"],"addr":0x100,"lens":[],"bytes":0};
	QUnit.assert.throws(function(){ Z80.parseOpcode(s,vars, Parser);},"Should throw for conflicting prefixes");
});

// Test edge case for 16-bit register handling without R16 mapping
QUnit.test( "16-bit register without R16 mapping", function() {
	s = {"opcode":"UNKNOWN","params":["HL"],"addr":0x100,"lens":[],"bytes":0};
	p = Z80.parseOpcode(s,vars, Parser);
	QUnit.assert.equal(p,null,"Should return null for unknown 16-bit instruction");
});

// Test parameter validation for single parameter instructions
QUnit.test( "Invalid parameter for single param instruction", function() {
	s = {"opcode":"DEC","params":["INVALID_REG"],"addr":0x100,"lens":[],"bytes":0};
	
	QUnit.assert.throws(function(){p = Z80.parseOpcode(s,vars, Parser);},"Should throw for invalid register");
});

// Test boundary conditions for relative addressing
QUnit.test( "Relative addressing boundary positive", function() {
	var boundaryVars = {"TARGET":0x017F,"_PC":0x0100}; // +127 offset
	s = {"opcode":"JR","params":["TARGET"],"addr":0x100,"lens":[],"bytes":0};
	p = Z80.parseOpcode(s,boundaryVars, Parser);
	QUnit.assert.equal(p.lens[0],0x18,"Opcode for JR");
	var offset = p.lens[1](boundaryVars);
	QUnit.assert.equal(offset,125,"Should handle max positive offset"); // 0x17F - 0x100 - 2 = 125
});

QUnit.test( "Relative addressing boundary negative", function() {
	var boundaryVars = {"TARGET":0x0081,"_PC":0x0100}; // -127 offset  
	s = {"opcode":"JR","params":["TARGET"],"addr":0x100,"lens":[],"bytes":0};
	p = Z80.parseOpcode(s,boundaryVars, Parser);
	QUnit.assert.equal(p.lens[0],0x18,"Opcode for JR");
	QUnit.assert.throws(function(){p.lens[1](boundaryVars);},"Should throw for negative offset"); // -127 + 256 = 129
});
