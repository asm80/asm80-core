import { Z180 } from "../cpu/z180.js";
import { Parser } from "../expression-parser.js";
import QUnit from "qunit";

QUnit.config.hidepassed = true;

QUnit.module("Z180 - namespace");

QUnit.test("Z180 is defined", function (assert) {
  assert.notEqual(Z180, null);
  assert.equal(typeof Z180, "object");
  assert.equal(typeof Z180.parseOpcode, "function");
  assert.equal(Z180.cpu, "z180");
});

// ---------------------------------------------------------------------------
// TST
// ---------------------------------------------------------------------------

QUnit.module("Z180 - TST");

QUnit.test("TST B", function (assert) {
  var s = { opcode: "TST", params: ["B"], addr: 0, lens: [], bytes: 0 };
  var p = Z180.parseOpcode(s, {}, Parser);
  assert.equal(p.bytes, 2);
  assert.equal(p.lens[0], 0xed);
  assert.equal(p.lens[1], 0x04);
});

QUnit.test("TST C", function (assert) {
  var s = { opcode: "TST", params: ["C"], addr: 0, lens: [], bytes: 0 };
  var p = Z180.parseOpcode(s, {}, Parser);
  assert.equal(p.bytes, 2);
  assert.equal(p.lens[0], 0xed);
  assert.equal(p.lens[1], 0x0c);
});

QUnit.test("TST A", function (assert) {
  var s = { opcode: "TST", params: ["A"], addr: 0, lens: [], bytes: 0 };
  var p = Z180.parseOpcode(s, {}, Parser);
  assert.equal(p.bytes, 2);
  assert.equal(p.lens[0], 0xed);
  assert.equal(p.lens[1], 0x3c);
});

QUnit.test("TST (HL)", function (assert) {
  var s = { opcode: "TST", params: ["(HL)"], addr: 0, lens: [], bytes: 0 };
  var p = Z180.parseOpcode(s, {}, Parser);
  assert.equal(p.bytes, 2);
  assert.equal(p.lens[0], 0xed);
  assert.equal(p.lens[1], 0x34);
});

QUnit.test("TST n (immediate)", function (assert) {
  var s = { opcode: "TST", params: ["0x42"], addr: 0, lens: [], bytes: 0 };
  var p = Z180.parseOpcode(s, {}, Parser);
  assert.equal(p.bytes, 3);
  assert.equal(p.lens[0], 0xed);
  assert.equal(p.lens[1], 0x64);
  assert.equal(p.lens[2]({ _PC: 0 }), 0x42);
});

// ---------------------------------------------------------------------------
// TSTIO
// ---------------------------------------------------------------------------

QUnit.module("Z180 - TSTIO");

QUnit.test("TSTIO 0xFF", function (assert) {
  var s = { opcode: "TSTIO", params: ["0xFF"], addr: 0, lens: [], bytes: 0 };
  var p = Z180.parseOpcode(s, {}, Parser);
  assert.equal(p.bytes, 3);
  assert.equal(p.lens[0], 0xed);
  assert.equal(p.lens[1], 0x74);
  assert.equal(p.lens[2]({ _PC: 0 }), 0xff);
});

// ---------------------------------------------------------------------------
// MLT
// ---------------------------------------------------------------------------

QUnit.module("Z180 - MLT");

QUnit.test("MLT BC", function (assert) {
  var s = { opcode: "MLT", params: ["BC"], addr: 0, lens: [], bytes: 0 };
  var p = Z180.parseOpcode(s, {}, Parser);
  assert.equal(p.bytes, 2);
  assert.equal(p.lens[0], 0xed);
  assert.equal(p.lens[1], 0x4c);
});

QUnit.test("MLT DE", function (assert) {
  var s = { opcode: "MLT", params: ["DE"], addr: 0, lens: [], bytes: 0 };
  var p = Z180.parseOpcode(s, {}, Parser);
  assert.equal(p.bytes, 2);
  assert.equal(p.lens[0], 0xed);
  assert.equal(p.lens[1], 0x5c);
});

QUnit.test("MLT HL", function (assert) {
  var s = { opcode: "MLT", params: ["HL"], addr: 0, lens: [], bytes: 0 };
  var p = Z180.parseOpcode(s, {}, Parser);
  assert.equal(p.bytes, 2);
  assert.equal(p.lens[0], 0xed);
  assert.equal(p.lens[1], 0x6c);
});

QUnit.test("MLT SP", function (assert) {
  var s = { opcode: "MLT", params: ["SP"], addr: 0, lens: [], bytes: 0 };
  var p = Z180.parseOpcode(s, {}, Parser);
  assert.equal(p.bytes, 2);
  assert.equal(p.lens[0], 0xed);
  assert.equal(p.lens[1], 0x7c);
});

// ---------------------------------------------------------------------------
// SLP
// ---------------------------------------------------------------------------

QUnit.module("Z180 - SLP");

QUnit.test("SLP", function (assert) {
  var s = { opcode: "SLP", params: [], addr: 0, lens: [], bytes: 0 };
  var p = Z180.parseOpcode(s, {}, Parser);
  assert.equal(p.bytes, 2);
  assert.equal(p.lens[0], 0xed);
  assert.equal(p.lens[1], 0x76);
});

// ---------------------------------------------------------------------------
// Block output
// ---------------------------------------------------------------------------

QUnit.module("Z180 - Block output");

QUnit.test("OTIM", function (assert) {
  var s = { opcode: "OTIM", params: [], addr: 0, lens: [], bytes: 0 };
  var p = Z180.parseOpcode(s, {}, Parser);
  assert.equal(p.bytes, 2);
  assert.equal(p.lens[0], 0xed);
  assert.equal(p.lens[1], 0x83);
});

QUnit.test("OTDM", function (assert) {
  var s = { opcode: "OTDM", params: [], addr: 0, lens: [], bytes: 0 };
  var p = Z180.parseOpcode(s, {}, Parser);
  assert.equal(p.bytes, 2);
  assert.equal(p.lens[0], 0xed);
  assert.equal(p.lens[1], 0x8b);
});

QUnit.test("OTIMR", function (assert) {
  var s = { opcode: "OTIMR", params: [], addr: 0, lens: [], bytes: 0 };
  var p = Z180.parseOpcode(s, {}, Parser);
  assert.equal(p.bytes, 2);
  assert.equal(p.lens[0], 0xed);
  assert.equal(p.lens[1], 0x93);
});

QUnit.test("OTDMR", function (assert) {
  var s = { opcode: "OTDMR", params: [], addr: 0, lens: [], bytes: 0 };
  var p = Z180.parseOpcode(s, {}, Parser);
  assert.equal(p.bytes, 2);
  assert.equal(p.lens[0], 0xed);
  assert.equal(p.lens[1], 0x9b);
});

// ---------------------------------------------------------------------------
// IN0 / OUT0
// ---------------------------------------------------------------------------

QUnit.module("Z180 - IN0 / OUT0");

QUnit.test("IN0 B,(0x20)", function (assert) {
  var s = { opcode: "IN0", params: ["B", "(0x20)"], addr: 0, lens: [], bytes: 0 };
  var p = Z180.parseOpcode(s, {}, Parser);
  assert.equal(p.bytes, 3);
  assert.equal(p.lens[0], 0xed);
  assert.equal(p.lens[1], 0x00);
  assert.equal(p.lens[2]({ _PC: 0 }), 0x20);
});

QUnit.test("IN0 A,(0x10)", function (assert) {
  var s = { opcode: "IN0", params: ["A", "(0x10)"], addr: 0, lens: [], bytes: 0 };
  var p = Z180.parseOpcode(s, {}, Parser);
  assert.equal(p.bytes, 3);
  assert.equal(p.lens[0], 0xed);
  assert.equal(p.lens[1], 0x38);
  assert.equal(p.lens[2]({ _PC: 0 }), 0x10);
});

QUnit.test("OUT0 (0x20),B", function (assert) {
  var s = { opcode: "OUT0", params: ["(0x20)", "B"], addr: 0, lens: [], bytes: 0 };
  var p = Z180.parseOpcode(s, {}, Parser);
  assert.equal(p.bytes, 3);
  assert.equal(p.lens[0], 0xed);
  assert.equal(p.lens[1], 0x01);
  assert.equal(p.lens[2]({ _PC: 0 }), 0x20);
});

QUnit.test("OUT0 (0x10),A", function (assert) {
  var s = { opcode: "OUT0", params: ["(0x10)", "A"], addr: 0, lens: [], bytes: 0 };
  var p = Z180.parseOpcode(s, {}, Parser);
  assert.equal(p.bytes, 3);
  assert.equal(p.lens[0], 0xed);
  assert.equal(p.lens[1], 0x39);
  assert.equal(p.lens[2]({ _PC: 0 }), 0x10);
});

// ---------------------------------------------------------------------------
// Z80 regressions
// ---------------------------------------------------------------------------

QUnit.module("Z180 - Z80 regressions");

QUnit.test("NOP", function (assert) {
  var s = { opcode: "NOP", params: [], addr: 0, lens: [], bytes: 0 };
  var p = Z180.parseOpcode(s, {}, Parser);
  assert.equal(p.bytes, 1);
  assert.equal(p.lens[0], 0x00);
});

QUnit.test("LDIR", function (assert) {
  var s = { opcode: "LDIR", params: [], addr: 0, lens: [], bytes: 0 };
  var p = Z180.parseOpcode(s, {}, Parser);
  assert.equal(p.bytes, 2);
  assert.equal(p.lens[0], 0xed);
  assert.equal(p.lens[1], 0xb0);
});

QUnit.test("LD HL,(0x1234)", function (assert) {
  var s = { opcode: "LD", params: ["HL", "(0x1234)"], addr: 0, lens: [], bytes: 0 };
  var p = Z180.parseOpcode(s, {}, Parser);
  assert.equal(p.bytes, 3);
  assert.equal(p.lens[0], 0x2a);
  assert.equal(p.lens[1]({ _PC: 0 }), 0x1234);
});
