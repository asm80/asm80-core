import {M6809} from "../cpu/m6809.js";
import { Parser } from "../expression-parser.js";

QUnit.config.hidepassed = true;

QUnit.module("ASM M6809");


QUnit.test("Namespace", function () {
  QUnit.assert.notEqual(M6809, null, "M6809 is defined");
  QUnit.assert.equal(typeof M6809, "object", "M6809 is an object");
  QUnit.assert.equal(
    typeof M6809.parseOpcode,
    "function",
    "M6809.parseOpcode defined"
  );
});

QUnit.module("6809 Adhoc tests");
var vars = { LOOP: 0x1234, SHORT: 0x21, NEAR: 0x0105, BEAR: 0xf0, _PC: 0x0100 };
var s = [],
  p;

QUnit.test("LBEQ rel16", function () {
  vars = { LOOP: 0x1234, SHORT: 0x21, NEAR: 0x0105, BEAR: 0xf0, _PC: 0x0100 };
  s = { opcode: "LBEQ", params: ["NEAR"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x10, "Opcode OK");
  QUnit.assert.equal(p.lens[1], 0x27, "Opcode OK");
  QUnit.assert.equal(typeof p.lens[2], "function", "Opcode");
  QUnit.assert.equal(p.bytes, 4, "Length OK");
  QUnit.assert.equal(p.lens[2](vars), 0x1, "Value");
});

QUnit.test("LBEQ rel16 negative", function () {
  vars = { LOOP: 0x1234, SHORT: 0x21, NEAR: 0x0105, BEAR: 0xf0, _PC: 0x0100 };
  s = { opcode: "LBEQ", params: ["BEAR"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x10, "Opcode OK");
  QUnit.assert.equal(p.lens[1], 0x27, "Opcode OK");
  QUnit.assert.equal(typeof p.lens[2], "function", "Opcode");
  QUnit.assert.equal(p.bytes, 4, "Length OK");
  QUnit.assert.equal(p.lens[2](vars), 0xffec, "Value");
});

QUnit.test("BEQ rel8", function () {
  vars = { LOOP: 0x1234, SHORT: 0x21, NEAR: 0x0105, BEAR: 0xf0, _PC: 0x0100 };
  s = { opcode: "BEQ", params: ["NEAR"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x27, "Opcode OK");
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
  QUnit.assert.equal(p.lens[1](vars), 0x3, "Value");
});

QUnit.test("BEQ rel8 negative", function () {
  vars = { LOOP: 0x1234, SHORT: 0x21, NEAR: 0x0105, BEAR: 0xf0, _PC: 0x0100 };
  s = { opcode: "BEQ", params: ["BEAR"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x27, "Opcode OK");
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
  QUnit.assert.equal(p.lens[1](vars), 0xee, "Value");
});

QUnit.test("BEQ out of range", function () {
  QUnit.assert.throws(function () {
    vars = { LOOP: 0x1234, SHORT: 0x21, NEAR: 0x0105, BEAR: 0xf0, _PC: 0x0100 };
    s = { opcode: "BEQ", params: ["LOOP"], addr: "0x100", lens: [], bytes: 0 };
    p = M6809.parseOpcode(s, vars, Parser);
    p.lens[1](vars);
  });
});

QUnit.test("BEQ out of range", function () {
  QUnit.assert.throws(function () {
    vars = { LOOP: 0x1234, SHORT: 0x21, NEAR: 0x0105, BEAR: 0xf0, _PC: 0x0100 };
    s = { opcode: "BEQ", params: ["SHORT"], addr: "0x100", lens: [], bytes: 0 };
    p = M6809.parseOpcode(s, vars, Parser);
    p.lens[1](vars);
  });
});

QUnit.test("TFR A,2 - unrecognized register name", function () {
  QUnit.assert.throws(function () {
    s = {
      opcode: "TFR",
      params: ["A", "2"],
      addr: "0x100",
      lens: [],
      bytes: 0,
    };
    p = M6809.parseOpcode(s, vars, Parser);
  });
});
QUnit.test("LDA - bad addressing mode", function () {
  QUnit.assert.throws(function () {
    s = { opcode: "LDA", params: [], addr: "0x100", lens: [], bytes: 0 };
    p = M6809.parseOpcode(s, vars, Parser);
  });
});

QUnit.test("SETDP", function () {
  s = {
    opcode: "LDA",
    params: ["$121"],
    addr: 0x100,
    lens: [],
    bytes: 0,
    _dp: 1,
  };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x96, "Opcode OK");
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
  QUnit.assert.equal(p.lens[1](vars), 0x21, "Value");
});

QUnit.test("SETDP + prefix", function () {
  s = {
    opcode: "LDA",
    params: ["<$121"],
    addr: 0x100,
    lens: [],
    bytes: 0,
    _dp: 1,
  };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x96, "Opcode OK");
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
  QUnit.assert.equal(p.lens[1](vars), 0x21, "Value");
});

QUnit.test("SETDP + out of bounds", function () {
  s = {
    opcode: "LDA",
    params: ["$21"],
    addr: 0x100,
    lens: [],
    bytes: 0,
    _dp: 1000,
  };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0xb6, "Opcode OK");
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.bytes, 3, "Length OK");
  QUnit.assert.equal(p.lens[1](vars), 0x21, "Value");
});

QUnit.module("Coverage tests for M6809");

QUnit.test("Extended opcode > 256 with indirect", function () {
  // Test lines 416-419: Extended opcode handling for opcodes > 256
  s = { opcode: "LDD", params: ["[$1234]"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0xec, "Extended opcode high byte");
  QUnit.assert.equal(p.lens[1], 0x9f, "Extended opcode low byte");
  QUnit.assert.equal(typeof p.lens[2], "function", "Indirect postbyte");
  const outval1 = p.lens[2](vars);
  QUnit.assert.equal(outval1, 0x1234, "Expected value $1234");
  QUnit.assert.equal(p.bytes, 4, "Length with extended opcode");
});

QUnit.test("Predecrement addressing --R", function () {
  // Test lines 472-479: Predecrement addressing modes
  s = { opcode: "LDA", params: ["","--X"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0xA6, "Opcode OK");
  QUnit.assert.equal(p.lens[1], 0x83, "Double predecrement postbyte");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("Single predecrement addressing -R", function () {
  // Test lines 472-479: Single predecrement
  s = { opcode: "LDA", params: ["","-X"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0xA6, "Opcode OK");
  QUnit.assert.equal(p.lens[1], 0x82, "Single predecrement postbyte");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("Single predecrement with indirect error", function () {
  // Test line 477: Error for single predecrement with indirect
  QUnit.assert.throws(function() {
    s = { opcode: "LDA", params: ["[","-X]"], addr: 0x100, lens: [], bytes: 0 };
    p = M6809.parseOpcode(s, vars, Parser);
  }, "Cannot use predecrement with 1");
});

QUnit.test("Register A addressing mode", function () {
  // Test lines 495-498: A,R addressing mode
  s = { opcode: "LDA", params: ["A","X"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0xA6, "Opcode OK");
  QUnit.assert.equal(p.lens[1], 0x86, "A,X postbyte");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("Register B addressing mode", function () {
  // Test lines 500-503: B,R addressing mode
  s = { opcode: "LDA", params: ["B","Y"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0xA6, "Opcode OK");
  QUnit.assert.equal(p.lens[1], 0xa5, "B,Y postbyte");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("Register D addressing mode", function () {
  // Test lines 505-508: D,R addressing mode
  s = { opcode: "LDA", params: ["D","S"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0xA6, "Opcode OK");
  QUnit.assert.equal(p.lens[1], 0xeb, "D,S postbyte");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("PC relative 8-bit with indirect", function () {
  // Test lines 552-563: PC relative 8-bit with indirect
  s = { opcode: "LDA", params: ["[$105","PC]"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0xA6, "Opcode OK");
  QUnit.assert.equal(p.lens[1], 0x9c, "PC relative indirect postbyte");
  QUnit.assert.equal(typeof p.lens[2], "function", "PC relative function");
  QUnit.assert.equal(p.bytes, 3, "Length OK");
  // Test the function execution for indirect PC relative
  const result = p.lens[2](vars);
  QUnit.assert.ok(typeof result === "number", "Function returns number");
});

QUnit.test("PC relative 16-bit with indirect", function () {
  // Test lines 580-589: PC relative 16-bit with indirect
  s = { opcode: "LDA", params: ["[LOOP","PC]"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0xA6, "Opcode OK");
  QUnit.assert.equal(p.lens[1], 0x9d, "PC relative 16-bit indirect postbyte");
  QUnit.assert.equal(typeof p.lens[2], "function", "PC relative 16-bit function");
  QUnit.assert.equal(p.bytes, 4, "Length OK");
  // Test the function execution for indirect PC relative 16-bit
  const result = p.lens[2](vars);
  QUnit.assert.ok(typeof result === "number", "Function returns number");
});

QUnit.test("SETDP + undef", function () {
  s = {
    opcode: "LDA",
    params: ["qyg"],
    addr: 0x100,
    lens: [],
    bytes: 0,
    _dp: 0,
  };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0xb6, "Opcode OK");
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.bytes, 3, "Length OK");
  //QUnit.assert.equal(p.lens[1](vars),0x21,"Value");
});

QUnit.test("CLR 127", function () {
  s = {
    opcode: "CLR",
    params: ["127", "X"],
    addr: 0x100,
    lens: [],
    bytes: 0,
    _dp: 0,
  };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x6f, "Opcode OK");
  QUnit.assert.equal(p.lens[1], 0x88, "Opcode OK");
  QUnit.assert.equal(p.lens[2](), 0x7f, "Opcode OK");
  QUnit.assert.equal(p.bytes, 3, "Length OK");
  //QUnit.assert.equal(p.lens[1](vars),0x21,"Value");
});

QUnit.test("CLR 128", function () {
  s = {
    opcode: "CLR",
    params: ["128", "X"],
    addr: 0x100,
    lens: [],
    bytes: 0,
    _dp: 0,
  };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x6f, "Opcode OK");
  QUnit.assert.equal(p.lens[1], 0x89, "Opcode OK");
  QUnit.assert.equal(p.lens[2](), 0x0080, "Opcode OK");
  QUnit.assert.equal(p.bytes, 4, "Length OK");
  //QUnit.assert.equal(p.lens[1](vars),0x21,"Value");
});

QUnit.test("LEAY 65535,Y", function () {
  s = {
    opcode: "LEAY",
    params: ["65535", "Y"],
    addr: 0x100,
    lens: [],
    bytes: 0,
    _dp: 0,
  };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x31, "Opcode OK");
  QUnit.assert.equal(p.lens[1], 0x3f, "Parameter OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
  //QUnit.assert.equal(p.lens[1](vars),0x21,"Value");
});

QUnit.module("Simple OP tests");
var vars = { LOOP: 0x1234, SHORT: 0x21, _PC: 0x0100 };
var s = [],
  p;

QUnit.test("NOP test", function () {
  s = { opcode: "NOP", addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x12, "Opcode OK");
  QUnit.assert.equal(p.bytes, 1, "Length OK");
});

QUnit.test("Decide direct mode", function () {
  s = { opcode: "LDA", params: ["SHORT"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x96, "Opcode OK");
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
  QUnit.assert.equal(p.lens[1](vars), 0x21, "Value");
});

QUnit.test("SWI2 test - prefixed", function () {
  s = { opcode: "SWI2", addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x10, "Opcode OK");
  QUnit.assert.equal(p.lens[1], 0x3f, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("NEG zp", function () {
  s = { opcode: "NEG", params: ["$23"], addr: "0x100", lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x00, "Opcode");
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.bytes, 2, "Length");
});

QUnit.test("NEG ext", function () {
  s = { opcode: "NEG", params: ["$1234"], addr: "0x100", lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x70, "Opcode");
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[2], null, "Opcode");
  QUnit.assert.equal(p.bytes, 3, "Length");
  QUnit.assert.equal(p.lens[1](vars), 0x1234, "Value");
});
QUnit.test("NEG forced zp", function () {
  s = { opcode: "NEG", params: ["<$1234"], addr: "0x100", lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x00, "Opcode");
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.bytes, 2, "Length");
  QUnit.assert.equal(p.lens[1](vars), 0x1234, "Value");
});

QUnit.test("NEG forced ext", function () {
  s = { opcode: "NEG", params: [">$12"], addr: "0x100", lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x70, "Opcode");
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[2], null, "Opcode");
  QUnit.assert.equal(p.bytes, 3, "Length");
  QUnit.assert.equal(p.lens[1](vars), 0x12, "Value");
});

QUnit.test("ORCC imm", function () {
  s = { opcode: "ORCC", params: ["#$22"], addr: "0x100", lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x1a, "Opcode");
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.bytes, 2, "Length");
});
QUnit.test("SUBA imm", function () {
  s = { opcode: "SUBA", params: ["#$23"], addr: "0x100", lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x80, "Opcode");
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.bytes, 2, "Length");
});
QUnit.test("SUBD imm", function () {
  s = { opcode: "SUBD", params: ["#$23"], addr: "0x100", lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x83, "Opcode");
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[2], null, "Opcode");
  QUnit.assert.equal(p.bytes, 3, "Length");
});

QUnit.test("JMP", function () {
  s = { opcode: "JMP", params: ["$1234"], addr: "0x100", lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x7e, "Opcode");
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[2], null, "Opcode");
  QUnit.assert.equal(p.bytes, 3, "Length");
});

QUnit.test("CMPU imm", function () {
  s = { opcode: "CMPU", params: ["#$1234"], addr: "0x100", lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x11, "Opcode");
  QUnit.assert.equal(p.lens[1], 0x83, "Opcode");
  QUnit.assert.equal(typeof p.lens[2], "function", "Opcode");
  QUnit.assert.equal(p.lens[3], null, "Opcode");
  QUnit.assert.equal(p.bytes, 4, "Length");
});
QUnit.test("CMPU direct", function () {
  s = { opcode: "CMPU", params: ["$12"], addr: "0x100", lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x11, "Opcode");
  QUnit.assert.equal(p.lens[1], 0x93, "Opcode");
  QUnit.assert.equal(typeof p.lens[2], "function", "Opcode");
  QUnit.assert.equal(p.bytes, 3, "Length");
});
QUnit.test("CMPU extended", function () {
  s = { opcode: "CMPU", params: ["$1234"], addr: "0x100", lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x11, "Opcode");
  QUnit.assert.equal(p.lens[1], 0xb3, "Opcode");
  QUnit.assert.equal(typeof p.lens[2], "function", "Opcode");
  QUnit.assert.equal(p.lens[3], null, "Opcode");
  QUnit.assert.equal(p.bytes, 4, "Length");
});

QUnit.module("Indexed mode");

QUnit.test("LEAX ,X", function () {
  s = { opcode: "LEAX", params: ["", "X"], addr: "0x100", lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x30, "Opcode");
  QUnit.assert.equal(p.lens[1], 0x84, "Opcode");
  QUnit.assert.equal(p.bytes, 2, "Length");
});

QUnit.test("LDA ,X+", function () {
  s = { opcode: "LDA", params: ["", "X+"], addr: "0x100", lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0xa6, "Opcode");
  QUnit.assert.equal(p.lens[1], 0x80, "Opcode");
  QUnit.assert.equal(p.bytes, 2, "Length");
});

QUnit.test("CMPD ,X", function () {
  s = { opcode: "CMPD", params: ["", "X"], addr: "0x100", lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x10, "Opcode");
  QUnit.assert.equal(p.lens[1], 0xa3, "Opcode");
  QUnit.assert.equal(p.lens[2], 0x84, "Opcode");
  QUnit.assert.equal(p.bytes, 3, "Length");
});

QUnit.test("CMPU [,Y]", function () {
  s = {
    opcode: "CMPU",
    params: ["[", "Y]"],
    addr: "0x100",
    lens: [],
    bytes: 0,
  };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x11, "Opcode");
  QUnit.assert.equal(p.lens[1], 0xa3, "Opcode");
  QUnit.assert.equal(p.lens[2], 0xb4, "Opcode");
  QUnit.assert.equal(p.bytes, 3, "Length");
});

QUnit.test("LEAX [,Y]", function () {
  s = {
    opcode: "LEAX",
    params: ["[", "Y]"],
    addr: "0x100",
    lens: [],
    bytes: 0,
  };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x30, "Opcode");
  QUnit.assert.equal(p.lens[1], 0xb4, "Opcode");
  QUnit.assert.equal(p.bytes, 2, "Length");
});

QUnit.test("LEAX 5,X", function () {
  s = { opcode: "LEAX", params: ["5", "X"], addr: "0x100", lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x30, "Opcode");
  QUnit.assert.equal(p.lens[1], 0x05, "Opcode");
  QUnit.assert.equal(p.bytes, 2, "Length");
});
QUnit.test("LEAX -1,X", function () {
  s = {
    opcode: "LEAX",
    params: ["-1", "X"],
    addr: "0x100",
    lens: [],
    bytes: 0,
  };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x30, "Opcode");
  QUnit.assert.equal(p.lens[1], 0x1f, "Opcode");
  QUnit.assert.equal(p.bytes, 2, "Length");
});

QUnit.test("LEAX 35,X", function () {
  s = {
    opcode: "LEAX",
    params: ["35", "X"],
    addr: "0x100",
    lens: [],
    bytes: 0,
  };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x30, "Opcode");
  QUnit.assert.equal(p.lens[1], 0x88, "Opcode");
  QUnit.assert.equal(typeof p.lens[2], "function", "Opcode");
  QUnit.assert.equal(p.bytes, 3, "Length");
});
/*
QUnit.test( "LEAX [35,PC]", function() {
	s = {"opcode":"LEAX","params":["[35","PC]"],addr:"0x100",lens:[],"bytes":0};
	p = M6809.parseOpcode(s, vars, Parser);
	QUnit.assert.equal(p.lens[0],0x30,"Opcode");
	QUnit.assert.equal(p.lens[1],0x9c,"Opcode");
	QUnit.assert.equal(typeof(p.lens[2]),"function","Opcode");
	QUnit.assert.equal(p.bytes,3,"Length");
});
*/
QUnit.test("LEAX [nn,PC]", function () {
  s = {
    opcode: "LEAX",
    params: ["[nn", "PC]"],
    addr: "0x100",
    lens: [],
    bytes: 0,
  };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x30, "Opcode");
  QUnit.assert.equal(p.lens[1], 0x9d, "Opcode");
  QUnit.assert.equal(typeof p.lens[2], "function", "Opcode");
  QUnit.assert.equal(p.lens[3], null, "Opcode");
  QUnit.assert.equal(p.bytes, 4, "Length");
});

QUnit.test("LDA [$1234,x]", function () {
  s = {
    opcode: "LDA",
    params: ["[$1234", "x]"],
    addr: "0x100",
    lens: [],
    bytes: 0,
  };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0xa6, "Opcode");
  QUnit.assert.equal(p.lens[1], 0x99, "Opcode");
  QUnit.assert.equal(typeof p.lens[2], "function", "Opcode");
  QUnit.assert.equal(p.lens[3], null, "Opcode");
  QUnit.assert.equal(p.bytes, 4, "Length");
});

QUnit.test("LDA [$1234]", function () {
  s = { opcode: "LDA", params: ["[$1234]"], addr: "0x100", lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0xa6, "Opcode");
  QUnit.assert.equal(p.lens[1], 0x9f, "Opcode");
  QUnit.assert.equal(typeof p.lens[2], "function", "Opcode");
  QUnit.assert.equal(p.lens[3], null, "Opcode");
  QUnit.assert.equal(p.bytes, 4, "Length");
});

QUnit.module("Special params");

QUnit.test("EXG A,B", function () {
  s = { opcode: "EXG", params: ["A", "B"], addr: "0x100", lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x1e, "Opcode");
  QUnit.assert.equal(p.lens[1], 0x89, "Opcode");
  QUnit.assert.equal(p.bytes, 2, "Length");
});
QUnit.test("TFR X,S", function () {
  s = { opcode: "TFR", params: ["X", "S"], addr: "0x100", lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x1f, "Opcode");
  QUnit.assert.equal(p.lens[1], 0x14, "Opcode");
  QUnit.assert.equal(p.bytes, 2, "Length");
});

QUnit.test("PSHS X,B,A", function () {
  s = {
    opcode: "PSHS",
    params: ["X", "B", "A"],
    addr: "0x100",
    lens: [],
    bytes: 0,
  };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x34, "Opcode");
  QUnit.assert.equal(p.lens[1], 0x16, "Opcode");
  QUnit.assert.equal(p.bytes, 2, "Length");
});
QUnit.test("PSHS D", function () {
  s = { opcode: "PSHS", params: ["D"], addr: "0x100", lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x34, "Opcode");
  QUnit.assert.equal(p.lens[1], 0x06, "Opcode");
  QUnit.assert.equal(p.bytes, 2, "Length");
});
QUnit.test("PSHU D", function () {
  s = { opcode: "PSHU", params: ["D"], addr: "0x100", lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x36, "Opcode");
  QUnit.assert.equal(p.lens[1], 0x06, "Opcode");
  QUnit.assert.equal(p.bytes, 2, "Length");
});
QUnit.test("PULU S,X,Y,A,B", function () {
  s = {
    opcode: "PULU",
    params: ["S", "X", "Y", "B", "A"],
    addr: "0x100",
    lens: [],
    bytes: 0,
  };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x37, "Opcode");
  QUnit.assert.equal(p.lens[1], 0x76, "Opcode");
  QUnit.assert.equal(p.bytes, 2, "Length");
});
QUnit.test("PULS U,X,Y,A,B", function () {
  s = {
    opcode: "PULS",
    params: ["U", "X", "Y", "B", "A"],
    addr: "0x100",
    lens: [],
    bytes: 0,
  };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x35, "Opcode");
  QUnit.assert.equal(p.lens[1], 0x76, "Opcode");
  QUnit.assert.equal(p.bytes, 2, "Length");
});

QUnit.module("Bad tests");

QUnit.test("PSHS N", function () {
  QUnit.assert.throws(function () {
    s = { opcode: "PSHS", params: ["N"], addr: "0x100", lens: [], bytes: 0 };
    p = M6809.parseOpcode(s, vars, Parser);
  });
});
QUnit.test("PSHU N", function () {
  QUnit.assert.throws(function () {
    s = { opcode: "PSHU", params: ["N"], addr: "0x100", lens: [], bytes: 0 };
    p = M6809.parseOpcode(s, vars, Parser);
  });
});

QUnit.test("JMP bad mode", function () {
  s = {
    opcode: "JMP",
    params: ["#$1234"],
    addr: "0x100",
    lens: [],
    bytes: 0,
    numline: 23,
  };
  try {
    p = M6809.parseOpcode(s, vars, Parser);
  } catch (e) {
    p = e;
  }
  QUnit.assert.equal(p, "Bad addressing mode at line 23", "Bad mode detected");
});
QUnit.test("EXG A", function () {
  QUnit.assert.throws(function () {
    s = { opcode: "EXG", params: ["A"], addr: "0x100", lens: [], bytes: 0 };
    p = M6809.parseOpcode(s, vars, Parser);
  });
});
QUnit.test("EXG A,B,C", function () {
  QUnit.assert.throws(function () {
    s = {
      opcode: "EXG",
      params: ["A", "B", "C"],
      addr: "0x100",
      lens: [],
      bytes: 0,
    };
    p = M6809.parseOpcode(s, vars, Parser);
  });
});
QUnit.test("EXG A,C", function () {
  QUnit.assert.throws(function () {
    s = {
      opcode: "EXG",
      params: ["A", "C"],
      addr: "0x100",
      lens: [],
      bytes: 0,
    };
    p = M6809.parseOpcode(s, vars, Parser);
  });
});
//*------------------------------

QUnit.module("Opcodes 6809");

QUnit.test("NEG test, mode direct", function () {
  s = { opcode: "NEG", params: ["$12"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x0, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("NEG test, mode extended", function () {
  s = { opcode: "NEG", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x70, "Opcode OK");
  QUnit.assert.equal(p.bytes, 3, "Length OK");
});

QUnit.test("COM test, mode direct", function () {
  s = { opcode: "COM", params: ["$12"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x3, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("COM test, mode extended", function () {
  s = { opcode: "COM", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x73, "Opcode OK");
  QUnit.assert.equal(p.bytes, 3, "Length OK");
});

QUnit.test("LSR test, mode direct", function () {
  s = { opcode: "LSR", params: ["$12"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x4, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("LSR test, mode extended", function () {
  s = { opcode: "LSR", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x74, "Opcode OK");
  QUnit.assert.equal(p.bytes, 3, "Length OK");
});

QUnit.test("ROR test, mode direct", function () {
  s = { opcode: "ROR", params: ["$12"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x6, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("ROR test, mode extended", function () {
  s = { opcode: "ROR", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x76, "Opcode OK");
  QUnit.assert.equal(p.bytes, 3, "Length OK");
});

QUnit.test("ASR test, mode direct", function () {
  s = { opcode: "ASR", params: ["$12"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x7, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("ASR test, mode extended", function () {
  s = { opcode: "ASR", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x77, "Opcode OK");
  QUnit.assert.equal(p.bytes, 3, "Length OK");
});

QUnit.test("LSL test, mode direct", function () {
  s = { opcode: "LSL", params: ["$12"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x8, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("LSL test, mode extended", function () {
  s = { opcode: "LSL", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x78, "Opcode OK");
  QUnit.assert.equal(p.bytes, 3, "Length OK");
});

QUnit.test("ASL test, mode direct", function () {
  s = { opcode: "ASL", params: ["$12"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x8, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("ASL test, mode extended", function () {
  s = { opcode: "ASL", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x78, "Opcode OK");
  QUnit.assert.equal(p.bytes, 3, "Length OK");
});

QUnit.test("ROL test, mode direct", function () {
  s = { opcode: "ROL", params: ["$12"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x9, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("ROL test, mode extended", function () {
  s = { opcode: "ROL", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x79, "Opcode OK");
  QUnit.assert.equal(p.bytes, 3, "Length OK");
});

QUnit.test("DEC test, mode direct", function () {
  s = { opcode: "DEC", params: ["$12"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xa, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("DEC test, mode extended", function () {
  s = { opcode: "DEC", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x7a, "Opcode OK");
  QUnit.assert.equal(p.bytes, 3, "Length OK");
});

QUnit.test("INC test, mode direct", function () {
  s = { opcode: "INC", params: ["$12"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xc, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("INC test, mode extended", function () {
  s = { opcode: "INC", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x7c, "Opcode OK");
  QUnit.assert.equal(p.bytes, 3, "Length OK");
});

QUnit.test("TST test, mode direct", function () {
  s = { opcode: "TST", params: ["$12"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xd, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("TST test, mode extended", function () {
  s = { opcode: "TST", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x7d, "Opcode OK");
  QUnit.assert.equal(p.bytes, 3, "Length OK");
});

QUnit.test("JMP test, mode direct", function () {
  s = { opcode: "JMP", params: ["$12"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xe, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("JMP test, mode extended", function () {
  s = { opcode: "JMP", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x7e, "Opcode OK");
  QUnit.assert.equal(p.bytes, 3, "Length OK");
});

QUnit.test("CLR test, mode direct", function () {
  s = { opcode: "CLR", params: ["$12"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xf, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("CLR test, mode extended", function () {
  s = { opcode: "CLR", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x7f, "Opcode OK");
  QUnit.assert.equal(p.bytes, 3, "Length OK");
});

QUnit.test("NOP test, mode imp", function () {
  s = { opcode: "NOP", addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x12, "Opcode OK");
  QUnit.assert.equal(p.bytes, 1, "Length OK");
});

QUnit.test("SYNC test, mode imp", function () {
  s = { opcode: "SYNC", addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x13, "Opcode OK");
  QUnit.assert.equal(p.bytes, 1, "Length OK");
});

QUnit.test("DAA test, mode imp", function () {
  s = { opcode: "DAA", addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x19, "Opcode OK");
  QUnit.assert.equal(p.bytes, 1, "Length OK");
});

QUnit.test("SEX test, mode imp", function () {
  s = { opcode: "SEX", addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x1d, "Opcode OK");
  QUnit.assert.equal(p.bytes, 1, "Length OK");
});

QUnit.test("RTS test, mode imp", function () {
  s = { opcode: "RTS", addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x39, "Opcode OK");
  QUnit.assert.equal(p.bytes, 1, "Length OK");
});

QUnit.test("ABX test, mode imp", function () {
  s = { opcode: "ABX", addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x3a, "Opcode OK");
  QUnit.assert.equal(p.bytes, 1, "Length OK");
});

QUnit.test("RTI test, mode imp", function () {
  s = { opcode: "RTI", addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x3b, "Opcode OK");
  QUnit.assert.equal(p.bytes, 1, "Length OK");
});

QUnit.test("CWAI test, mode imm8", function () {
  s = { opcode: "CWAI", params: ["#$20"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x3c, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("MUL test, mode imp", function () {
  s = { opcode: "MUL", addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x3d, "Opcode OK");
  QUnit.assert.equal(p.bytes, 1, "Length OK");
});

QUnit.test("SWI test, mode imp", function () {
  s = { opcode: "SWI", addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x3f, "Opcode OK");
  QUnit.assert.equal(p.bytes, 1, "Length OK");
});

QUnit.test("SWI2 test, mode imp", function () {
  s = { opcode: "SWI2", addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x10, "Opcode 1 OK");
  QUnit.assert.equal(p.lens[1], 0x3f, "Opcode 2 OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("SWI3 test, mode imp", function () {
  s = { opcode: "SWI3", addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x11, "Opcode 1 OK");
  QUnit.assert.equal(p.lens[1], 0x3f, "Opcode 2 OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("NEGA test, mode imp", function () {
  s = { opcode: "NEGA", addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x40, "Opcode OK");
  QUnit.assert.equal(p.bytes, 1, "Length OK");
});

QUnit.test("COMA test, mode imp", function () {
  s = { opcode: "COMA", addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x43, "Opcode OK");
  QUnit.assert.equal(p.bytes, 1, "Length OK");
});

QUnit.test("LSRA test, mode imp", function () {
  s = { opcode: "LSRA", addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x44, "Opcode OK");
  QUnit.assert.equal(p.bytes, 1, "Length OK");
});

QUnit.test("RORA test, mode imp", function () {
  s = { opcode: "RORA", addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x46, "Opcode OK");
  QUnit.assert.equal(p.bytes, 1, "Length OK");
});

QUnit.test("ASRA test, mode imp", function () {
  s = { opcode: "ASRA", addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x47, "Opcode OK");
  QUnit.assert.equal(p.bytes, 1, "Length OK");
});

QUnit.test("LSLA test, mode imp", function () {
  s = { opcode: "LSLA", addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x48, "Opcode OK");
  QUnit.assert.equal(p.bytes, 1, "Length OK");
});

QUnit.test("ASLA test, mode imp", function () {
  s = { opcode: "ASLA", addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x48, "Opcode OK");
  QUnit.assert.equal(p.bytes, 1, "Length OK");
});

QUnit.test("ROLA test, mode imp", function () {
  s = { opcode: "ROLA", addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x49, "Opcode OK");
  QUnit.assert.equal(p.bytes, 1, "Length OK");
});

QUnit.test("DECA test, mode imp", function () {
  s = { opcode: "DECA", addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x4a, "Opcode OK");
  QUnit.assert.equal(p.bytes, 1, "Length OK");
});

QUnit.test("INCA test, mode imp", function () {
  s = { opcode: "INCA", addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x4c, "Opcode OK");
  QUnit.assert.equal(p.bytes, 1, "Length OK");
});

QUnit.test("TSTA test, mode imp", function () {
  s = { opcode: "TSTA", addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x4d, "Opcode OK");
  QUnit.assert.equal(p.bytes, 1, "Length OK");
});

QUnit.test("CLRA test, mode imp", function () {
  s = { opcode: "CLRA", addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x4f, "Opcode OK");
  QUnit.assert.equal(p.bytes, 1, "Length OK");
});

QUnit.test("NEGB test, mode imp", function () {
  s = { opcode: "NEGB", addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x50, "Opcode OK");
  QUnit.assert.equal(p.bytes, 1, "Length OK");
});

QUnit.test("COMB test, mode imp", function () {
  s = { opcode: "COMB", addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x53, "Opcode OK");
  QUnit.assert.equal(p.bytes, 1, "Length OK");
});

QUnit.test("LSRB test, mode imp", function () {
  s = { opcode: "LSRB", addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x54, "Opcode OK");
  QUnit.assert.equal(p.bytes, 1, "Length OK");
});

QUnit.test("RORB test, mode imp", function () {
  s = { opcode: "RORB", addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x56, "Opcode OK");
  QUnit.assert.equal(p.bytes, 1, "Length OK");
});

QUnit.test("ASRB test, mode imp", function () {
  s = { opcode: "ASRB", addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x57, "Opcode OK");
  QUnit.assert.equal(p.bytes, 1, "Length OK");
});

QUnit.test("LSLB test, mode imp", function () {
  s = { opcode: "LSLB", addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x58, "Opcode OK");
  QUnit.assert.equal(p.bytes, 1, "Length OK");
});

QUnit.test("ASLB test, mode imp", function () {
  s = { opcode: "ASLB", addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x58, "Opcode OK");
  QUnit.assert.equal(p.bytes, 1, "Length OK");
});

QUnit.test("ROLB test, mode imp", function () {
  s = { opcode: "ROLB", addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x59, "Opcode OK");
  QUnit.assert.equal(p.bytes, 1, "Length OK");
});

QUnit.test("DECB test, mode imp", function () {
  s = { opcode: "DECB", addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x5a, "Opcode OK");
  QUnit.assert.equal(p.bytes, 1, "Length OK");
});

QUnit.test("INCB test, mode imp", function () {
  s = { opcode: "INCB", addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x5c, "Opcode OK");
  QUnit.assert.equal(p.bytes, 1, "Length OK");
});

QUnit.test("TSTB test, mode imp", function () {
  s = { opcode: "TSTB", addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x5d, "Opcode OK");
  QUnit.assert.equal(p.bytes, 1, "Length OK");
});

QUnit.test("CLRB test, mode imp", function () {
  s = { opcode: "CLRB", addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.lens[0], 0x5f, "Opcode OK");
  QUnit.assert.equal(p.bytes, 1, "Length OK");
});

QUnit.test("SUBA test, mode direct", function () {
  s = { opcode: "SUBA", params: ["$12"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x90, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("SUBA test, mode extended", function () {
  s = { opcode: "SUBA", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xb0, "Opcode OK");
  QUnit.assert.equal(p.bytes, 3, "Length OK");
});

QUnit.test("SUBA test, mode imm8", function () {
  s = { opcode: "SUBA", params: ["#$20"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x80, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("CMPA test, mode direct", function () {
  s = { opcode: "CMPA", params: ["$12"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x91, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("CMPA test, mode extended", function () {
  s = { opcode: "CMPA", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xb1, "Opcode OK");
  QUnit.assert.equal(p.bytes, 3, "Length OK");
});

QUnit.test("CMPA test, mode imm8", function () {
  s = { opcode: "CMPA", params: ["#$20"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x81, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("SBCA test, mode direct", function () {
  s = { opcode: "SBCA", params: ["$12"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x92, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("SBCA test, mode extended", function () {
  s = { opcode: "SBCA", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xb2, "Opcode OK");
  QUnit.assert.equal(p.bytes, 3, "Length OK");
});

QUnit.test("SBCA test, mode imm8", function () {
  s = { opcode: "SBCA", params: ["#$20"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x82, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("ANDA test, mode direct", function () {
  s = { opcode: "ANDA", params: ["$12"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x94, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("ANDA test, mode extended", function () {
  s = { opcode: "ANDA", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xb4, "Opcode OK");
  QUnit.assert.equal(p.bytes, 3, "Length OK");
});

QUnit.test("ANDA test, mode imm8", function () {
  s = { opcode: "ANDA", params: ["#$20"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x84, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("BITA test, mode direct", function () {
  s = { opcode: "BITA", params: ["$12"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x95, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("BITA test, mode extended", function () {
  s = { opcode: "BITA", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xb5, "Opcode OK");
  QUnit.assert.equal(p.bytes, 3, "Length OK");
});

QUnit.test("BITA test, mode imm8", function () {
  s = { opcode: "BITA", params: ["#$20"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x85, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("LDA test, mode direct", function () {
  s = { opcode: "LDA", params: ["$12"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x96, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("LDA test, mode extended", function () {
  s = { opcode: "LDA", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xb6, "Opcode OK");
  QUnit.assert.equal(p.bytes, 3, "Length OK");
});

QUnit.test("LDA test, mode imm8", function () {
  s = { opcode: "LDA", params: ["#$20"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x86, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("STA test, mode direct", function () {
  s = { opcode: "STA", params: ["$12"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x97, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("STA test, mode extended", function () {
  s = { opcode: "STA", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xb7, "Opcode OK");
  QUnit.assert.equal(p.bytes, 3, "Length OK");
});

QUnit.test("EORA test, mode direct", function () {
  s = { opcode: "EORA", params: ["$12"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x98, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("EORA test, mode extended", function () {
  s = { opcode: "EORA", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xb8, "Opcode OK");
  QUnit.assert.equal(p.bytes, 3, "Length OK");
});

QUnit.test("EORA test, mode imm8", function () {
  s = { opcode: "EORA", params: ["#$20"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x88, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("ADCA test, mode direct", function () {
  s = { opcode: "ADCA", params: ["$12"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x99, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("ADCA test, mode extended", function () {
  s = { opcode: "ADCA", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xb9, "Opcode OK");
  QUnit.assert.equal(p.bytes, 3, "Length OK");
});

QUnit.test("ADCA test, mode imm8", function () {
  s = { opcode: "ADCA", params: ["#$20"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x89, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("ORA test, mode direct", function () {
  s = { opcode: "ORA", params: ["$12"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x9a, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("ORA test, mode extended", function () {
  s = { opcode: "ORA", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xba, "Opcode OK");
  QUnit.assert.equal(p.bytes, 3, "Length OK");
});

QUnit.test("ORA test, mode imm8", function () {
  s = { opcode: "ORA", params: ["#$20"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x8a, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("ADDA test, mode direct", function () {
  s = { opcode: "ADDA", params: ["$12"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x9b, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("ADDA test, mode extended", function () {
  s = { opcode: "ADDA", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xbb, "Opcode OK");
  QUnit.assert.equal(p.bytes, 3, "Length OK");
});

QUnit.test("ADDA test, mode imm8", function () {
  s = { opcode: "ADDA", params: ["#$20"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x8b, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("JSR test, mode direct", function () {
  s = { opcode: "JSR", params: ["$12"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x9d, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("JSR test, mode direct 2 (IAN)", function () {
  s = { opcode: "JSR", params: ["[1","X]"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[2], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xad, "Opcode 0 OK");
  QUnit.assert.equal(p.lens[1], 0x98, "Opcode 1 OK");
  QUnit.assert.equal(p.bytes, 3, "Length OK");
});


QUnit.test("JSR test, mode extended", function () {
  s = { opcode: "JSR", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xbd, "Opcode OK");
  QUnit.assert.equal(p.bytes, 3, "Length OK");
});

QUnit.test("SUBD test, mode direct", function () {
  s = { opcode: "SUBD", params: ["$12"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x93, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("SUBD test, mode extended", function () {
  s = { opcode: "SUBD", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xb3, "Opcode OK");
  QUnit.assert.equal(p.bytes, 3, "Length OK");
});

QUnit.test("SUBD test, mode imm16", function () {
  s = { opcode: "SUBD", params: ["#$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x83, "Opcode OK");
  QUnit.assert.equal(p.bytes, 3, "Length OK");
});

QUnit.test("CMPX test, mode direct", function () {
  s = { opcode: "CMPX", params: ["$12"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x9c, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("CMPX test, mode extended", function () {
  s = { opcode: "CMPX", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xbc, "Opcode OK");
  QUnit.assert.equal(p.bytes, 3, "Length OK");
});

QUnit.test("CMPX test, mode imm16", function () {
  s = { opcode: "CMPX", params: ["#$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x8c, "Opcode OK");
  QUnit.assert.equal(p.bytes, 3, "Length OK");
});

QUnit.test("LDX test, mode direct", function () {
  s = { opcode: "LDX", params: ["$12"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x9e, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("LDX test, mode extended", function () {
  s = { opcode: "LDX", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xbe, "Opcode OK");
  QUnit.assert.equal(p.bytes, 3, "Length OK");
});

QUnit.test("LDX test, mode imm16", function () {
  s = { opcode: "LDX", params: ["#$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x8e, "Opcode OK");
  QUnit.assert.equal(p.bytes, 3, "Length OK");
});

QUnit.test("STX test, mode direct", function () {
  s = { opcode: "STX", params: ["$12"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x9f, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("STX test, mode extended", function () {
  s = { opcode: "STX", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xbf, "Opcode OK");
  QUnit.assert.equal(p.bytes, 3, "Length OK");
});

QUnit.test("CMPD test, mode direct", function () {
  s = { opcode: "CMPD", params: ["$12"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[2], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x10, "Opcode 1 OK");
  QUnit.assert.equal(p.lens[1], 0x93, "Opcode 2 OK");
  QUnit.assert.equal(p.bytes, 3, "Length OK");
});

QUnit.test("CMPD test, mode extended", function () {
  s = { opcode: "CMPD", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[2], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x10, "Opcode 1 OK");
  QUnit.assert.equal(p.lens[1], 0xb3, "Opcode 2 OK");
  QUnit.assert.equal(p.bytes, 4, "Length OK");
});

QUnit.test("CMPD test, mode imm16", function () {
  s = { opcode: "CMPD", params: ["#$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[2], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x10, "Opcode 1 OK");
  QUnit.assert.equal(p.lens[1], 0x83, "Opcode 2 OK");
  QUnit.assert.equal(p.bytes, 4, "Length OK");
});

QUnit.test("CMPY test, mode direct", function () {
  s = { opcode: "CMPY", params: ["$12"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[2], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x10, "Opcode 1 OK");
  QUnit.assert.equal(p.lens[1], 0x9c, "Opcode 2 OK");
  QUnit.assert.equal(p.bytes, 3, "Length OK");
});

QUnit.test("CMPY test, mode extended", function () {
  s = { opcode: "CMPY", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[2], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x10, "Opcode 1 OK");
  QUnit.assert.equal(p.lens[1], 0xbc, "Opcode 2 OK");
  QUnit.assert.equal(p.bytes, 4, "Length OK");
});

QUnit.test("CMPY test, mode imm16", function () {
  s = { opcode: "CMPY", params: ["#$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[2], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x10, "Opcode 1 OK");
  QUnit.assert.equal(p.lens[1], 0x8c, "Opcode 2 OK");
  QUnit.assert.equal(p.bytes, 4, "Length OK");
});

QUnit.test("LDY test, mode direct", function () {
  s = { opcode: "LDY", params: ["$12"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[2], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x10, "Opcode 1 OK");
  QUnit.assert.equal(p.lens[1], 0x9e, "Opcode 2 OK");
  QUnit.assert.equal(p.bytes, 3, "Length OK");
});

QUnit.test("LDY test, mode extended", function () {
  s = { opcode: "LDY", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[2], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x10, "Opcode 1 OK");
  QUnit.assert.equal(p.lens[1], 0xbe, "Opcode 2 OK");
  QUnit.assert.equal(p.bytes, 4, "Length OK");
});

QUnit.test("LDY test, mode imm16", function () {
  s = { opcode: "LDY", params: ["#$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[2], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x10, "Opcode 1 OK");
  QUnit.assert.equal(p.lens[1], 0x8e, "Opcode 2 OK");
  QUnit.assert.equal(p.bytes, 4, "Length OK");
});

QUnit.test("STY test, mode direct", function () {
  s = { opcode: "STY", params: ["$12"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[2], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x10, "Opcode 1 OK");
  QUnit.assert.equal(p.lens[1], 0x9f, "Opcode 2 OK");
  QUnit.assert.equal(p.bytes, 3, "Length OK");
});

QUnit.test("STY test, mode extended", function () {
  s = { opcode: "STY", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[2], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x10, "Opcode 1 OK");
  QUnit.assert.equal(p.lens[1], 0xbf, "Opcode 2 OK");
  QUnit.assert.equal(p.bytes, 4, "Length OK");
});

QUnit.test("LDS test, mode direct", function () {
  s = { opcode: "LDS", params: ["$12"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[2], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x10, "Opcode 1 OK");
  QUnit.assert.equal(p.lens[1], 0xde, "Opcode 2 OK");
  QUnit.assert.equal(p.bytes, 3, "Length OK");
});

QUnit.test("LDS test, mode extended", function () {
  s = { opcode: "LDS", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[2], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x10, "Opcode 1 OK");
  QUnit.assert.equal(p.lens[1], 0xfe, "Opcode 2 OK");
  QUnit.assert.equal(p.bytes, 4, "Length OK");
});

QUnit.test("LDS test, mode imm16", function () {
  s = { opcode: "LDS", params: ["#$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[2], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x10, "Opcode 1 OK");
  QUnit.assert.equal(p.lens[1], 0xce, "Opcode 2 OK");
  QUnit.assert.equal(p.bytes, 4, "Length OK");
});

QUnit.test("STS test, mode direct", function () {
  s = { opcode: "STS", params: ["$12"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[2], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x10, "Opcode 1 OK");
  QUnit.assert.equal(p.lens[1], 0xdf, "Opcode 2 OK");
  QUnit.assert.equal(p.bytes, 3, "Length OK");
});

QUnit.test("STS test, mode extended", function () {
  s = { opcode: "STS", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[2], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x10, "Opcode 1 OK");
  QUnit.assert.equal(p.lens[1], 0xff, "Opcode 2 OK");
  QUnit.assert.equal(p.bytes, 4, "Length OK");
});

QUnit.test("SUBB test, mode direct", function () {
  s = { opcode: "SUBB", params: ["$12"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xd0, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("SUBB test, mode extended", function () {
  s = { opcode: "SUBB", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xf0, "Opcode OK");
  QUnit.assert.equal(p.bytes, 3, "Length OK");
});

QUnit.test("SUBB test, mode imm8", function () {
  s = { opcode: "SUBB", params: ["#$20"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xc0, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("CMPB test, mode direct", function () {
  s = { opcode: "CMPB", params: ["$12"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xd1, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("CMPB test, mode extended", function () {
  s = { opcode: "CMPB", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xf1, "Opcode OK");
  QUnit.assert.equal(p.bytes, 3, "Length OK");
});

QUnit.test("CMPB test, mode imm8", function () {
  s = { opcode: "CMPB", params: ["#$20"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xc1, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("SBCB test, mode direct", function () {
  s = { opcode: "SBCB", params: ["$12"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xd2, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("SBCB test, mode extended", function () {
  s = { opcode: "SBCB", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xf2, "Opcode OK");
  QUnit.assert.equal(p.bytes, 3, "Length OK");
});

QUnit.test("SBCB test, mode imm8", function () {
  s = { opcode: "SBCB", params: ["#$20"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xc2, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("ANDB test, mode direct", function () {
  s = { opcode: "ANDB", params: ["$12"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xd4, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("ANDB test, mode extended", function () {
  s = { opcode: "ANDB", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xf4, "Opcode OK");
  QUnit.assert.equal(p.bytes, 3, "Length OK");
});

QUnit.test("ANDB test, mode imm8", function () {
  s = { opcode: "ANDB", params: ["#$20"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xc4, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("BITB test, mode direct", function () {
  s = { opcode: "BITB", params: ["$12"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xd5, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("BITB test, mode extended", function () {
  s = { opcode: "BITB", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xf5, "Opcode OK");
  QUnit.assert.equal(p.bytes, 3, "Length OK");
});

QUnit.test("BITB test, mode imm8", function () {
  s = { opcode: "BITB", params: ["#$20"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xc5, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("LDB test, mode direct", function () {
  s = { opcode: "LDB", params: ["$12"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xd6, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("LDB test, mode extended", function () {
  s = { opcode: "LDB", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xf6, "Opcode OK");
  QUnit.assert.equal(p.bytes, 3, "Length OK");
});

QUnit.test("LDB test, mode imm8", function () {
  s = { opcode: "LDB", params: ["#$20"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xc6, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("STB test, mode direct", function () {
  s = { opcode: "STB", params: ["$12"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xd7, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("STB test, mode extended", function () {
  s = { opcode: "STB", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xf7, "Opcode OK");
  QUnit.assert.equal(p.bytes, 3, "Length OK");
});

QUnit.test("EORB test, mode direct", function () {
  s = { opcode: "EORB", params: ["$12"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xd8, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("EORB test, mode extended", function () {
  s = { opcode: "EORB", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xf8, "Opcode OK");
  QUnit.assert.equal(p.bytes, 3, "Length OK");
});

QUnit.test("EORB test, mode imm8", function () {
  s = { opcode: "EORB", params: ["#$20"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xc8, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("ADCB test, mode direct", function () {
  s = { opcode: "ADCB", params: ["$12"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xd9, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("ADCB test, mode extended", function () {
  s = { opcode: "ADCB", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xf9, "Opcode OK");
  QUnit.assert.equal(p.bytes, 3, "Length OK");
});

QUnit.test("ADCB test, mode imm8", function () {
  s = { opcode: "ADCB", params: ["#$20"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xc9, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("ORB test, mode direct", function () {
  s = { opcode: "ORB", params: ["$12"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xda, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("ORB test, mode extended", function () {
  s = { opcode: "ORB", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xfa, "Opcode OK");
  QUnit.assert.equal(p.bytes, 3, "Length OK");
});

QUnit.test("ORB test, mode imm8", function () {
  s = { opcode: "ORB", params: ["#$20"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xca, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("ADDB test, mode direct", function () {
  s = { opcode: "ADDB", params: ["$12"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xdb, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("ADDB test, mode extended", function () {
  s = { opcode: "ADDB", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xfb, "Opcode OK");
  QUnit.assert.equal(p.bytes, 3, "Length OK");
});

QUnit.test("ADDB test, mode imm8", function () {
  s = { opcode: "ADDB", params: ["#$20"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xcb, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("ADDD test, mode direct", function () {
  s = { opcode: "ADDD", params: ["$12"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xd3, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("ADDD test, mode extended", function () {
  s = { opcode: "ADDD", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xf3, "Opcode OK");
  QUnit.assert.equal(p.bytes, 3, "Length OK");
});

QUnit.test("ADDD test, mode imm16", function () {
  s = { opcode: "ADDD", params: ["#$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xc3, "Opcode OK");
  QUnit.assert.equal(p.bytes, 3, "Length OK");
});

QUnit.test("LDD test, mode direct", function () {
  s = { opcode: "LDD", params: ["$12"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xdc, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("LDD test, mode extended", function () {
  s = { opcode: "LDD", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xfc, "Opcode OK");
  QUnit.assert.equal(p.bytes, 3, "Length OK");
});

QUnit.test("LDD test, mode imm16", function () {
  s = { opcode: "LDD", params: ["#$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xcc, "Opcode OK");
  QUnit.assert.equal(p.bytes, 3, "Length OK");
});

QUnit.test("STD test, mode direct", function () {
  s = { opcode: "STD", params: ["$12"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xdd, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("STD test, mode extended", function () {
  s = { opcode: "STD", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xfd, "Opcode OK");
  QUnit.assert.equal(p.bytes, 3, "Length OK");
});

QUnit.test("LDU test, mode direct", function () {
  s = { opcode: "LDU", params: ["$12"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xde, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("LDU test, mode extended", function () {
  s = { opcode: "LDU", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xfe, "Opcode OK");
  QUnit.assert.equal(p.bytes, 3, "Length OK");
});

QUnit.test("LDU test, mode imm16", function () {
  s = { opcode: "LDU", params: ["#$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xce, "Opcode OK");
  QUnit.assert.equal(p.bytes, 3, "Length OK");
});

QUnit.test("STU test, mode direct", function () {
  s = { opcode: "STU", params: ["$12"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xdf, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("STU test, mode extended", function () {
  s = { opcode: "STU", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0xff, "Opcode OK");
  QUnit.assert.equal(p.bytes, 3, "Length OK");
});

QUnit.test("CMPS test, mode direct", function () {
  s = { opcode: "CMPS", params: ["$12"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[2], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x11, "Opcode 1 OK");
  QUnit.assert.equal(p.lens[1], 0x9c, "Opcode 2 OK");
  QUnit.assert.equal(p.bytes, 3, "Length OK");
});

QUnit.test("CMPS test, mode extended", function () {
  s = { opcode: "CMPS", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[2], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x11, "Opcode 1 OK");
  QUnit.assert.equal(p.lens[1], 0xbc, "Opcode 2 OK");
  QUnit.assert.equal(p.bytes, 4, "Length OK");
});

QUnit.test("CMPS test, mode imm16", function () {
  s = { opcode: "CMPS", params: ["#$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[2], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x11, "Opcode 1 OK");
  QUnit.assert.equal(p.lens[1], 0x8c, "Opcode 2 OK");
  QUnit.assert.equal(p.bytes, 4, "Length OK");
});

QUnit.test("CMPU test, mode direct", function () {
  s = { opcode: "CMPU", params: ["$12"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[2], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x11, "Opcode 1 OK");
  QUnit.assert.equal(p.lens[1], 0x93, "Opcode 2 OK");
  QUnit.assert.equal(p.bytes, 3, "Length OK");
});

QUnit.test("CMPU test, mode extended", function () {
  s = { opcode: "CMPU", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[2], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x11, "Opcode 1 OK");
  QUnit.assert.equal(p.lens[1], 0xb3, "Opcode 2 OK");
  QUnit.assert.equal(p.bytes, 4, "Length OK");
});

QUnit.test("CMPU test, mode imm16", function () {
  s = { opcode: "CMPU", params: ["#$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[2], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x11, "Opcode 1 OK");
  QUnit.assert.equal(p.lens[1], 0x83, "Opcode 2 OK");
  QUnit.assert.equal(p.bytes, 4, "Length OK");
});

QUnit.test("LBRA test, mode rel16", function () {
  s = { opcode: "LBRA", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x16, "Opcode OK");
  QUnit.assert.equal(p.bytes, 3, "Length OK");
});

QUnit.test("LBSR test, mode rel16", function () {
  s = { opcode: "LBSR", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x17, "Opcode OK");
  QUnit.assert.equal(p.bytes, 3, "Length OK");
});

QUnit.test("BSR test, mode rel8", function () {
  s = { opcode: "BSR", params: ["$120"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x8d, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("BRA test, mode rel8", function () {
  s = { opcode: "BRA", params: ["$120"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x20, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("BRN test, mode rel8", function () {
  s = { opcode: "BRN", params: ["$120"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x21, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("BHI test, mode rel8", function () {
  s = { opcode: "BHI", params: ["$120"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x22, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("BLS test, mode rel8", function () {
  s = { opcode: "BLS", params: ["$120"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x23, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("BHS test, mode rel8", function () {
  s = { opcode: "BHS", params: ["$120"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x24, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("BCC test, mode rel8", function () {
  s = { opcode: "BCC", params: ["$120"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x24, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("BLO test, mode rel8", function () {
  s = { opcode: "BLO", params: ["$120"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x25, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("BCS test, mode rel8", function () {
  s = { opcode: "BCS", params: ["$120"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x25, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("BNE test, mode rel8", function () {
  s = { opcode: "BNE", params: ["$120"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x26, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("BEQ test, mode rel8", function () {
  s = { opcode: "BEQ", params: ["$120"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x27, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("BVC test, mode rel8", function () {
  s = { opcode: "BVC", params: ["$120"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x28, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("BVS test, mode rel8", function () {
  s = { opcode: "BVS", params: ["$120"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x29, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("BPL test, mode rel8", function () {
  s = { opcode: "BPL", params: ["$120"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x2a, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("BMI test, mode rel8", function () {
  s = { opcode: "BMI", params: ["$120"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x2b, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("BGE test, mode rel8", function () {
  s = { opcode: "BGE", params: ["$120"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x2c, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("BLT test, mode rel8", function () {
  s = { opcode: "BLT", params: ["$120"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x2d, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("BGT test, mode rel8", function () {
  s = { opcode: "BGT", params: ["$120"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x2e, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("BLE test, mode rel8", function () {
  s = { opcode: "BLE", params: ["$120"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x2f, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("LBRN test, mode rel16", function () {
  s = { opcode: "LBRN", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[2], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x10, "Opcode 1 OK");
  QUnit.assert.equal(p.lens[1], 0x21, "Opcode 2 OK");
  QUnit.assert.equal(p.bytes, 4, "Length OK");
});

QUnit.test("LBHI test, mode rel16", function () {
  s = { opcode: "LBHI", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[2], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x10, "Opcode 1 OK");
  QUnit.assert.equal(p.lens[1], 0x22, "Opcode 2 OK");
  QUnit.assert.equal(p.bytes, 4, "Length OK");
});

QUnit.test("LBLS test, mode rel16", function () {
  s = { opcode: "LBLS", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[2], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x10, "Opcode 1 OK");
  QUnit.assert.equal(p.lens[1], 0x23, "Opcode 2 OK");
  QUnit.assert.equal(p.bytes, 4, "Length OK");
});

QUnit.test("LBHS test, mode rel16", function () {
  s = { opcode: "LBHS", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[2], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x10, "Opcode 1 OK");
  QUnit.assert.equal(p.lens[1], 0x24, "Opcode 2 OK");
  QUnit.assert.equal(p.bytes, 4, "Length OK");
});

QUnit.test("LBCC test, mode rel16", function () {
  s = { opcode: "LBCC", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[2], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x10, "Opcode 1 OK");
  QUnit.assert.equal(p.lens[1], 0x24, "Opcode 2 OK");
  QUnit.assert.equal(p.bytes, 4, "Length OK");
});

QUnit.test("LBLO test, mode rel16", function () {
  s = { opcode: "LBLO", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[2], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x10, "Opcode 1 OK");
  QUnit.assert.equal(p.lens[1], 0x25, "Opcode 2 OK");
  QUnit.assert.equal(p.bytes, 4, "Length OK");
});

QUnit.test("LBCS test, mode rel16", function () {
  s = { opcode: "LBCS", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[2], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x10, "Opcode 1 OK");
  QUnit.assert.equal(p.lens[1], 0x25, "Opcode 2 OK");
  QUnit.assert.equal(p.bytes, 4, "Length OK");
});

QUnit.test("LBNE test, mode rel16", function () {
  s = { opcode: "LBNE", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[2], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x10, "Opcode 1 OK");
  QUnit.assert.equal(p.lens[1], 0x26, "Opcode 2 OK");
  QUnit.assert.equal(p.bytes, 4, "Length OK");
});

QUnit.test("LBEQ test, mode rel16", function () {
  s = { opcode: "LBEQ", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[2], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x10, "Opcode 1 OK");
  QUnit.assert.equal(p.lens[1], 0x27, "Opcode 2 OK");
  QUnit.assert.equal(p.bytes, 4, "Length OK");
});

QUnit.test("LBVC test, mode rel16", function () {
  s = { opcode: "LBVC", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[2], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x10, "Opcode 1 OK");
  QUnit.assert.equal(p.lens[1], 0x28, "Opcode 2 OK");
  QUnit.assert.equal(p.bytes, 4, "Length OK");
});

QUnit.test("LBVS test, mode rel16", function () {
  s = { opcode: "LBVS", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[2], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x10, "Opcode 1 OK");
  QUnit.assert.equal(p.lens[1], 0x29, "Opcode 2 OK");
  QUnit.assert.equal(p.bytes, 4, "Length OK");
});

QUnit.test("LBPL test, mode rel16", function () {
  s = { opcode: "LBPL", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[2], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x10, "Opcode 1 OK");
  QUnit.assert.equal(p.lens[1], 0x2a, "Opcode 2 OK");
  QUnit.assert.equal(p.bytes, 4, "Length OK");
});

QUnit.test("LBMI test, mode rel16", function () {
  s = { opcode: "LBMI", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[2], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x10, "Opcode 1 OK");
  QUnit.assert.equal(p.lens[1], 0x2b, "Opcode 2 OK");
  QUnit.assert.equal(p.bytes, 4, "Length OK");
});

QUnit.test("LBGE test, mode rel16", function () {
  s = { opcode: "LBGE", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[2], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x10, "Opcode 1 OK");
  QUnit.assert.equal(p.lens[1], 0x2c, "Opcode 2 OK");
  QUnit.assert.equal(p.bytes, 4, "Length OK");
});

QUnit.test("LBLT test, mode rel16", function () {
  s = { opcode: "LBLT", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[2], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x10, "Opcode 1 OK");
  QUnit.assert.equal(p.lens[1], 0x2d, "Opcode 2 OK");
  QUnit.assert.equal(p.bytes, 4, "Length OK");
});

QUnit.test("LBGT test, mode rel16", function () {
  s = { opcode: "LBGT", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[2], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x10, "Opcode 1 OK");
  QUnit.assert.equal(p.lens[1], 0x2e, "Opcode 2 OK");
  QUnit.assert.equal(p.bytes, 4, "Length OK");
});

QUnit.test("LBLE test, mode rel16", function () {
  s = { opcode: "LBLE", params: ["$1234"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[2], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x10, "Opcode 1 OK");
  QUnit.assert.equal(p.lens[1], 0x2f, "Opcode 2 OK");
  QUnit.assert.equal(p.bytes, 4, "Length OK");
});

QUnit.test("ORCC test, mode imm8", function () {
  s = { opcode: "ORCC", params: ["#$20"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x1a, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});

QUnit.test("ANDCC test, mode imm8", function () {
  s = { opcode: "ANDCC", params: ["#$20"], addr: 0x100, lens: [], bytes: 0 };
  p = M6809.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(typeof p.lens[1], "function", "Opcode");
  QUnit.assert.equal(p.lens[0], 0x1c, "Opcode OK");
  QUnit.assert.equal(p.bytes, 2, "Length OK");
});
