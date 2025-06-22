import {I8008} from "../cpu/i8008.js";
import { Parser } from "../expression-parser.js";

QUnit.config.hidepassed = true;

QUnit.module("ASM I8008");

QUnit.test( "Namespace", function() {
	QUnit.assert.notEqual( I8008, null, "I8008 is defined" );
    QUnit.assert.equal( typeof(I8008), "object", "I8008 is an object" );
	QUnit.assert.equal( typeof(I8008.parseOpcode), "function", "I8008.parseOpcode defined" );
});


//QUnit.module("Simple OP tests");
var vars = {"LOOP":0x1234,"SHORT":0x21,"_PC":0x0100};
var s = [], p;

	QUnit.test( "Invalid instruction", function() {
		s = {"opcode":"INVALID","params":["A","B"],"addr":0x100,"lens":[],"bytes":0};
		p = I8008.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p,null,"Error detected");
	});


	QUnit.test( "NOP test", function() {
		s = {"opcode":"NOP","addr":0x100,"lens":[],"bytes":0};
		p = I8008.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xc0,"Opcode OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});

	QUnit.test( "RST7 test", function() {
		s = {"opcode":"RST","params":["7"],"addr":0x100,"lens":[],"bytes":0};
		p = I8008.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x3d,"Opcode OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});

	QUnit.test( "INP7 test", function() {
		s = {"opcode":"INP","params":["7"],"addr":0x100,"lens":[],"bytes":0};
		p = I8008.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x4f,"Opcode OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});

	QUnit.test( "OUT $1f test", function() {
		s = {"opcode":"OUT","params":["$1F"],"addr":0x100,"lens":[],"bytes":0};
		p = I8008.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x7f,"Opcode OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});

	QUnit.test( "LLI $1f test", function() {
		s = {"opcode":"LLI","params":["$1F"],"addr":0x100,"lens":[],"bytes":0};
		p = I8008.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x36,"Opcode OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});


	QUnit.test( "JMP", function() {
		s = {"opcode":"JMP","params":["$1234"],addr:"0x100",lens:[],"bytes":0};
		p = I8008.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x44,"Opcode");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
		QUnit.assert.equal(p.bytes,3,"Length");
	});

	QUnit.test( "MOV test", function() {
		s = {"opcode":"MOV","params":["A","B"],"addr":0x100,"lens":[],"bytes":0};
		p = I8008.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xc1,"Opcode OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});

	QUnit.test( "CPE test 1", function() {
		s = {"opcode":"CPE","params":["$1234"],"addr":0x100,"lens":[],"bytes":0};
		p = I8008.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x7a,"Opcode OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Opcode");
		QUnit.assert.equal(p.bytes,3,"Length OK");
	});

	QUnit.test( "CPE test 2", function() {
		s = {"opcode":"CPE","params":[],"addr":0x100,"lens":[],"bytes":0};
		p = I8008.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xbc,"Opcode OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});

	QUnit.test( "XRA test 1", function() {
		s = {"opcode":"XRA","params":["B"],"addr":0x100,"lens":[],"bytes":0};
		p = I8008.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xa9,"Opcode OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});

	QUnit.test( "XRA test 2", function() {
		s = {"opcode":"XRA","params":[],"addr":0x100,"lens":[],"bytes":0};
		p = I8008.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xa8,"Opcode OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});

	QUnit.test( "ORA test 1", function() {
		s = {"opcode":"ORA","params":["B"],"addr":0x100,"lens":[],"bytes":0};
		p = I8008.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xb1,"Opcode OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});

	QUnit.test( "ORA test 2", function() {
		s = {"opcode":"ORA","params":[],"addr":0x100,"lens":[],"bytes":0};
		p = I8008.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0xb0,"Opcode OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});

	QUnit.test( "ADC test 1", function() {
		s = {"opcode":"ADC","params":["B"],"addr":0x100,"lens":[],"bytes":0};
		p = I8008.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x89,"Opcode OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});

	QUnit.test( "ADC test 2", function() {
		s = {"opcode":"ADC","params":[],"addr":0x100,"lens":[],"bytes":0};
		p = I8008.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x82,"Opcode OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});

	QUnit.test( "INR test - increment register", function() {
		s = {"opcode":"INR","params":["B"],"addr":0x100,"lens":[],"bytes":0};
		p = I8008.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x08,"Opcode OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});

	QUnit.test( "INR test - cannot use A register", function() {
		try {
			s = {"opcode":"INR","params":["A"],"addr":0x100,"lens":[],"bytes":0};
			p = I8008.parseOpcode(s, vars, Parser);
		} catch (e) {
			p = e;
		}
		QUnit.assert.equal(p,"Cannot use A register here","Error detected");
	});

	QUnit.test( "DCR test - decrement register", function() {
		s = {"opcode":"DCR","params":["C"],"addr":0x100,"lens":[],"bytes":0};
		p = I8008.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x11,"Opcode OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});

	QUnit.test( "MVI test - move immediate", function() {
		s = {"opcode":"MVI","params":["B","$42"],"addr":0x100,"lens":[],"bytes":0};
		p = I8008.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x0e,"Opcode OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Function OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
		var par = p.lens[1]({});
		QUnit.assert.equal(par,0x42,"Param OK");
	});

	QUnit.test( "Unknown register error in RR function", function() {
		try {
			s = {"opcode":"DCR","params":["X"],"addr":0x100,"lens":[],"bytes":0};
			p = I8008.parseOpcode(s, vars, Parser);
		} catch (e) {
			p = e;
		}
		QUnit.assert.equal(p,"Unknown register X","Error detected");
	});

	QUnit.test( "Unknown register error in RR- function", function() {
		try {
			s = {"opcode":"INR","params":["Z"],"addr":0x100,"lens":[],"bytes":0};
			p = I8008.parseOpcode(s, vars, Parser);
		} catch (e) {
			p = e;
		}
		QUnit.assert.equal(p,"Unknown register Z","Error detected");
	});

	QUnit.test( "Unknown register error in RB function", function() {
		try {
			s = {"opcode":"MVI","params":["Q","$10"],"addr":0x100,"lens":[],"bytes":0};
			p = I8008.parseOpcode(s, vars, Parser);
		} catch (e) {
			p = e;
		}
		QUnit.assert.equal(p,"Unknown register Q","Error detected");
	});

	QUnit.test( "Missing second register in MOV", function() {
		try {
			s = {"opcode":"MOV","params":["A"],"addr":0x100,"lens":[],"bytes":0};
			p = I8008.parseOpcode(s, vars, Parser);
		} catch (e) {
			p = e;
		}
		QUnit.assert.equal(p,"Missing second register","Error detected");
	});

	QUnit.test( "Unknown second register in MOV", function() {
		try {
			s = {"opcode":"MOV","params":["A","Q"],"addr":0x100,"lens":[],"bytes":0};
			p = I8008.parseOpcode(s, vars, Parser);
		} catch (e) {
			p = e;
		}
		QUnit.assert.equal(p,"Unknown register Q","Error detected");
	});

	QUnit.test( "INP address out of range - negative", function() {
		try {
			s = {"opcode":"INP","params":["-1"],"addr":0x100,"lens":[],"bytes":0};
			p = I8008.parseOpcode(s, vars, Parser);
		} catch (e) {
			p = e;
		}
		QUnit.assert.equal(p,"INP address out of limit (0-7): -1","Error detected");
	});

	QUnit.test( "INP address out of range - too high", function() {
		try {
			s = {"opcode":"INP","params":["8"],"addr":0x100,"lens":[],"bytes":0};
			p = I8008.parseOpcode(s, vars, Parser);
		} catch (e) {
			p = e;
		}
		QUnit.assert.equal(p,"INP address out of limit (0-7): 8","Error detected");
	});

	QUnit.test( "OUT address out of range - too low", function() {
		try {
			s = {"opcode":"OUT","params":["7"],"addr":0x100,"lens":[],"bytes":0};
			p = I8008.parseOpcode(s, vars, Parser);
		} catch (e) {
			p = e;
		}
		QUnit.assert.equal(p,"OUT address out of limit (8-31): 7","Error detected");
	});

	QUnit.test( "OUT address out of range - too high", function() {
		try {
			s = {"opcode":"OUT","params":["32"],"addr":0x100,"lens":[],"bytes":0};
			p = I8008.parseOpcode(s, vars, Parser);
		} catch (e) {
			p = e;
		}
		QUnit.assert.equal(p,"OUT address out of limit (8-31): 32","Error detected");
	});

	QUnit.test( "Endian property", function() {
		QUnit.assert.equal(I8008.endian, false, "I8008 is little-endian");
	});

	QUnit.test( "CPU property", function() {
		QUnit.assert.equal(I8008.cpu, "i8008", "CPU identifier correct");
	});

	QUnit.test( "Extension property", function() {
		QUnit.assert.equal(I8008.ext, "a08", "File extension correct");
	});

	// Tests for RDD function (lines 286-288)
	QUnit.test( "RDD register test - valid registers", function() {
		var rdd = I8008.lens.RDD;
		QUnit.assert.equal(rdd("B"), 0, "B register index correct");
		QUnit.assert.equal(rdd("D"), 1, "D register index correct");
		QUnit.assert.equal(rdd("H"), 2, "H register index correct");
		QUnit.assert.equal(rdd("S"), 3, "S register index correct");
		QUnit.assert.equal(rdd("P"), 4, "P register index correct");
	});

	// Tests for RBD function (lines 289-291)
	QUnit.test( "RBD register test - valid registers", function() {
		var rbd = I8008.lens.RBD;
		QUnit.assert.equal(rbd("B"), 0, "B register index correct");
		QUnit.assert.equal(rbd("D"), 1, "D register index correct");
	});

	// Tests for RQQ function (lines 292-294)
	QUnit.test( "RQQ register test - valid registers", function() {
		var rqq = I8008.lens.RQQ;
		QUnit.assert.equal(rqq("B"), 0, "B register index correct");
		QUnit.assert.equal(rqq("D"), 1, "D register index correct");
		QUnit.assert.equal(rqq("H"), 2, "H register index correct");
		QUnit.assert.equal(rqq("P"), 3, "P register index correct");
		QUnit.assert.equal(rqq("S"), 4, "S register index correct");
		QUnit.assert.equal(rqq("W"), 5, "W register index correct");
	});

	QUnit.test( "RR0 function test", function() {
		s = {"opcode":"ADD","params":["A"],"addr":0x100,"lens":[],"bytes":0};
		p = I8008.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x80,"Opcode OK");
		QUnit.assert.equal(p.bytes,1,"Length OK");
	});

	QUnit.test( "RR0 bad register", function() {
		try {
			s = {"opcode":"ADD","params":["X"],"addr":0x100,"lens":[],"bytes":0};
			p = I8008.parseOpcode(s, vars, Parser);
		} catch (e) {
			p = e;
		}
		QUnit.assert.equal(p,"Unknown register X","Error detected");
	});

	QUnit.test( "RRR bad register", function() {
		try {
			s = {"opcode":"MOV","params":["X","A"],"addr":0x100,"lens":[],"bytes":0};
			p = I8008.parseOpcode(s, vars, Parser);
		} catch (e) {
			p = e;
		}
		QUnit.assert.equal(p,"Unknown register X","Error detected");
	});

	// Test to cover RDD function usage (lines 286-288) - I8008 doesn't have INX, use proper test
	QUnit.test( "RDD function usage test", function() {
		// Direct test of RDD function
		var rdd = I8008.lens.RDD;
		QUnit.assert.equal(rdd("B"), 0, "B register RDD test");
		QUnit.assert.equal(rdd("D"), 1, "D register RDD test");
		QUnit.assert.equal(rdd("H"), 2, "H register RDD test");
		QUnit.assert.equal(rdd("S"), 3, "S register RDD test");
		QUnit.assert.equal(rdd("P"), 4, "P register RDD test");
	});

	// Test to cover RBD function usage (lines 289-291)
	QUnit.test( "RBD function usage test", function() {
		// Direct test of RBD function
		var rbd = I8008.lens.RBD;
		QUnit.assert.equal(rbd("B"), 0, "B register RBD test");
		QUnit.assert.equal(rbd("D"), 1, "D register RBD test");
		QUnit.assert.equal(rbd("Z"), -1, "Invalid register RBD test");
	});

	// Test to cover RQQ function usage (lines 292-294) 
	QUnit.test( "RQQ function usage test", function() {
		// Direct test of RQQ function
		var rqq = I8008.lens.RQQ;
		QUnit.assert.equal(rqq("B"), 0, "B register RQQ test");
		QUnit.assert.equal(rqq("D"), 1, "D register RQQ test");
		QUnit.assert.equal(rqq("H"), 2, "H register RQQ test");
		QUnit.assert.equal(rqq("P"), 3, "P register RQQ test");
		QUnit.assert.equal(rqq("S"), 4, "S register RQQ test");
		QUnit.assert.equal(rqq("W"), 5, "W register RQQ test");
		QUnit.assert.equal(rqq("X"), -1, "Invalid register RQQ test");
	});

	// Test to cover RB function (lines 295-304)
	QUnit.test( "RB function - LAI instruction with immediate", function() {
		s = {"opcode":"LAI","params":["$42"],"addr":0x100,"lens":[],"bytes":0};
		p = I8008.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x06,"Opcode OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Function OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
	});

	// Test to cover RR function (lines 314-318)
	QUnit.test( "RR function - direct register operation", function() {
		try {
			// Direct test of RR function via DCR
			s = {"opcode":"DCR","params":["B"],"addr":0x100,"lens":[],"bytes":0};
			p = I8008.parseOpcode(s, vars, Parser);
			QUnit.assert.equal(p.lens[0],0x09,"Opcode OK");
			QUnit.assert.equal(p.bytes,1,"Length OK");
		} catch (e) {
			QUnit.assert.ok(false, "Should not throw error: " + e);
		}
	});

	// Test to cover RR- function (lines 320-325) 
	QUnit.test( "RR- function - exclude A register test", function() {
		try {
			// Test with valid register (not A)
			s = {"opcode":"INR","params":["C"],"addr":0x100,"lens":[],"bytes":0};
			p = I8008.parseOpcode(s, vars, Parser);
			QUnit.assert.equal(p.lens[0],0x10,"Opcode OK with C register");
			QUnit.assert.equal(p.bytes,1,"Length OK");
		} catch (e) {
			QUnit.assert.ok(false, "Should not throw error: " + e);
		}
	});

	// Test for RPW function complete coverage (lines 341-352) - I8008 doesn't have LXI
	QUnit.test( "RPW function direct test", function() {
		// Direct test of RPW function with mock parameters
		try {
			var rpw = I8008.lens.RPW;
			var result = rpw.call(I8008.lens, 0x01, ["B", "$1234"], Parser);
			QUnit.assert.equal(result[0], 0x01, "Opcode calculation OK");
			QUnit.assert.equal(typeof(result[1]), "function", "Function parameter OK");
			QUnit.assert.equal(result[2], null, "Null value OK");
			QUnit.assert.equal(result.length, 3, "Array length OK");
		} catch (e) {
			QUnit.assert.ok(false, "RPW function should not throw: " + e);
		}
	});

	// Test for RPWD function complete coverage (lines 353-358) - I8008 doesn't have DAD
	QUnit.test( "RPWD function direct test", function() {
		// Direct test of RPWD function with mock parameters
		try {
			var rpwd = I8008.lens.RPWD;
			var result = rpwd.call(I8008.lens, 0x03, ["B"], Parser);
			QUnit.assert.equal(result[0], 0x03, "Opcode calculation OK");
			QUnit.assert.equal(result.length, 1, "Array length OK");
		} catch (e) {
			QUnit.assert.ok(false, "RPWD function should not throw: " + e);
		}
	});

	// Test for BD function complete coverage (lines 359-364) - I8008 doesn't have LDAX
	QUnit.test( "BD function direct test", function() {
		// Direct test of BD function with mock parameters
		try {
			var bd = I8008.lens.BD;
			var result = bd.call(I8008.lens, 0x0a, ["B"], Parser);
			QUnit.assert.equal(result[0], 0x0a, "Opcode calculation OK");
			QUnit.assert.equal(result.length, 1, "Array length OK");
			
			// Test with D register
			var result2 = bd.call(I8008.lens, 0x0a, ["D"], Parser);
			QUnit.assert.equal(result2[0], 0x1a, "Opcode calculation with D register OK");
		} catch (e) {
			QUnit.assert.ok(false, "BD function should not throw: " + e);
		}
	});

	// Test for RQW function complete coverage (lines 365-369) - I8008 doesn't have PUSH
	QUnit.test( "RQW function direct test", function() {
		// Direct test of RQW function with mock parameters
		try {
			var rqw = I8008.lens.RQW;
			var result = rqw.call(I8008.lens, 0xc5, ["B"], Parser);
			QUnit.assert.equal(result[0], 0xc5, "Opcode calculation OK");
			QUnit.assert.equal(result.length, 1, "Array length OK");
			
			// Test with D register
			var result2 = rqw.call(I8008.lens, 0xc5, ["D"], Parser);
			QUnit.assert.equal(result2[0], 0xd5, "Opcode calculation with D register OK");
		} catch (e) {
			QUnit.assert.ok(false, "RQW function should not throw: " + e);
		}
	});

	// Test invalid register for RQW function error handling
	QUnit.test( "RQW error test - invalid register range", function() {
		try {
			var rqw = I8008.lens.RQW;
			var result = rqw.call(I8008.lens, 0xc5, ["Z"], Parser);
		} catch (e) {
			p = e;
		}
		QUnit.assert.equal(p,"Unknown register Z","Error detected for invalid RQW register");
	});

	// Test error handling for register range validation
	QUnit.test( "RPW error test - register out of range", function() {
		try {
			var rpw = I8008.lens.RPW;
			var result = rpw.call(I8008.lens, 0x01, ["X"], Parser);
		} catch (e) {
			p = e;
		}
		QUnit.assert.equal(p,"Unknown register X","Error detected for invalid RPW register");
	});

	// Test error handling for RPWD function
	QUnit.test( "RPWD error test - register out of range", function() {
		try {
			var rpwd = I8008.lens.RPWD;
			var result = rpwd.call(I8008.lens, 0x03, ["Y"], Parser);
		} catch (e) {
			p = e;
		}
		QUnit.assert.equal(p,"Unknown register Y","Error detected for invalid RPWD register");
	});

	// Test error handling for BD function
	QUnit.test( "BD error test - register out of range", function() {
		try {
			var bd = I8008.lens.BD;
			var result = bd.call(I8008.lens, 0x0a, ["C"], Parser);
		} catch (e) {
			p = e;
		}
		QUnit.assert.equal(p,"Unknown register C","Error detected for invalid BD register");
	});

	// Test to execute function closure in B lens function (line 310)
	QUnit.test( "B function closure execution test", function() {
		s = {"opcode":"ADI","params":["$42"],"addr":0x100,"lens":[],"bytes":0};
		p = I8008.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x04,"Opcode OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Function OK");
		QUnit.assert.equal(p.bytes,2,"Length OK");
		// Execute the closure function to cover line 310
		var result = p.lens[1]({});
		QUnit.assert.equal(result,0x42,"Function execution result OK");
	});

	// Test to execute function closure in RPW lens function (line 348)
	QUnit.test( "RPW function closure execution test", function() {
		// Direct test to create RPW result and execute closure
		var rpw = I8008.lens.RPW;
		var result = rpw.call(I8008.lens, 0x01, ["B", "$5678"], Parser);
		QUnit.assert.equal(result[0], 0x01, "Opcode calculation OK");
		QUnit.assert.equal(typeof(result[1]), "function", "Function parameter OK");
		QUnit.assert.equal(result[2], null, "Null value OK");
		// Execute the closure function to cover line 348
		var evaluated = result[1]({});
		QUnit.assert.equal(evaluated, 0x5678, "Function execution result OK");
	});

	// Test to execute function closure in IW lens function (line 375)
	QUnit.test( "IW function closure execution test", function() {
		s = {"opcode":"JMP","params":["$1234"],"addr":0x100,"lens":[],"bytes":0};
		p = I8008.parseOpcode(s, vars, Parser);
		QUnit.assert.equal(p.lens[0],0x44,"Opcode OK");
		QUnit.assert.equal(typeof(p.lens[1]),"function","Function OK");
		QUnit.assert.equal(p.lens[2],null,"Null value OK");
		QUnit.assert.equal(p.bytes,3,"Length OK");
		// Execute the closure function to cover line 375
		var result = p.lens[1]({});
		QUnit.assert.equal(result,0x1234,"Function execution result OK");
	});

