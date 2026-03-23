import { M6803 } from "../cpu/m6803.js";
import { Parser } from "../expression-parser.js";
import QUnit from "qunit";

QUnit.module("ASM 6803");

const vars = { "LOOP": 0x1234, "SHORT": 0x21, "_PC": 0x0100 };

// Helper: evaluate function-type lens entries
function ev(lens, i) {
  return typeof lens[i] === "function" ? lens[i](vars) : lens[i];
}

// --- INH instructions ---

QUnit.test("MUL", function(assert) {
  const s = { opcode: "MUL", params: [], lens: [], bytes: 0 };
  const p = M6803.parseOpcode(s, vars, Parser);
  assert.equal(p.lens[0], 0x3D, "opcode");
  assert.equal(p.bytes, 1, "bytes");
});

QUnit.test("ABX", function(assert) {
  const s = { opcode: "ABX", params: [], lens: [], bytes: 0 };
  const p = M6803.parseOpcode(s, vars, Parser);
  assert.equal(p.lens[0], 0x3A, "opcode");
  assert.equal(p.bytes, 1, "bytes");
});

QUnit.test("PSHX", function(assert) {
  const s = { opcode: "PSHX", params: [], lens: [], bytes: 0 };
  const p = M6803.parseOpcode(s, vars, Parser);
  assert.equal(p.lens[0], 0x3C, "opcode");
  assert.equal(p.bytes, 1, "bytes");
});

QUnit.test("PULX", function(assert) {
  const s = { opcode: "PULX", params: [], lens: [], bytes: 0 };
  const p = M6803.parseOpcode(s, vars, Parser);
  assert.equal(p.lens[0], 0x38, "opcode");
  assert.equal(p.bytes, 1, "bytes");
});

QUnit.test("LSRD", function(assert) {
  const s = { opcode: "LSRD", params: [], lens: [], bytes: 0 };
  const p = M6803.parseOpcode(s, vars, Parser);
  assert.equal(p.lens[0], 0x04, "opcode");
  assert.equal(p.bytes, 1, "bytes");
});

QUnit.test("ASLD", function(assert) {
  const s = { opcode: "ASLD", params: [], lens: [], bytes: 0 };
  const p = M6803.parseOpcode(s, vars, Parser);
  assert.equal(p.lens[0], 0x05, "opcode");
  assert.equal(p.bytes, 1, "bytes");
});

QUnit.test("LSLD (alias for ASLD)", function(assert) {
  const s = { opcode: "LSLD", params: [], lens: [], bytes: 0 };
  const p = M6803.parseOpcode(s, vars, Parser);
  assert.equal(p.lens[0], 0x05, "opcode");
  assert.equal(p.bytes, 1, "bytes");
});

// --- BRN (REL) ---

QUnit.test("BRN $+5 → [0x21, 0x03]", function(assert) {
  const localVars = { ...vars, "_PC": 0x0100 };
  // target = 0x0105, _PC = 0x0100, offset = 0x0105 - 0x0100 - 2 = 3
  const s = { opcode: "BRN", params: ["$105"], paramstring: "$105", lens: [], bytes: 0 };
  const p = M6803.parseOpcode(s, localVars, Parser);
  assert.equal(p.lens[0], 0x21, "opcode");
  assert.equal(ev(p.lens, 1), 0x03, "offset");
  assert.equal(p.bytes, 2, "bytes");
});

// --- LDD ---

QUnit.test("LDD #$1234 → [0xCC, 0x12, 0x34]", function(assert) {
  const s = { opcode: "LDD", params: ["#$1234"], paramstring: "#$1234", lens: [], bytes: 0 };
  const p = M6803.parseOpcode(s, vars, Parser);
  assert.equal(p.lens[0], 0xCC, "opcode");
  assert.equal(ev(p.lens, 1), 0x1234, "16-bit value (split by output stage)");
  assert.equal(p.lens[2], null, "null marker for 16-bit split");
  assert.equal(p.bytes, 3, "bytes");
});

QUnit.test("LDD $42 → [0xDC, 0x42]", function(assert) {
  const s = { opcode: "LDD", params: ["$42"], paramstring: "$42", lens: [], bytes: 0 };
  const p = M6803.parseOpcode(s, vars, Parser);
  assert.equal(p.lens[0], 0xDC, "opcode");
  assert.equal(ev(p.lens, 1), 0x42, "address");
  assert.equal(p.bytes, 2, "bytes");
});

QUnit.test("LDD $1234 → [0xFC, 0x12, 0x34]", function(assert) {
  const s = { opcode: "LDD", params: ["$1234"], paramstring: "$1234", lens: [], bytes: 0 };
  const p = M6803.parseOpcode(s, vars, Parser);
  assert.equal(p.lens[0], 0xFC, "opcode");
  assert.equal(ev(p.lens, 1), 0x1234, "address");
  assert.equal(p.bytes, 3, "bytes");
});

QUnit.test("LDD 5,X → [0xEC, 0x05]", function(assert) {
  const s = { opcode: "LDD", params: ["5", "X"], paramstring: "5,X", lens: [], bytes: 0 };
  const p = M6803.parseOpcode(s, vars, Parser);
  assert.equal(p.lens[0], 0xEC, "opcode");
  assert.equal(ev(p.lens, 1), 5, "offset");
  assert.equal(p.bytes, 2, "bytes");
});

// --- STD ---

QUnit.test("STD $42 → [0xDD, 0x42]", function(assert) {
  const s = { opcode: "STD", params: ["$42"], paramstring: "$42", lens: [], bytes: 0 };
  const p = M6803.parseOpcode(s, vars, Parser);
  assert.equal(p.lens[0], 0xDD, "opcode");
  assert.equal(ev(p.lens, 1), 0x42, "address");
  assert.equal(p.bytes, 2, "bytes");
});

QUnit.test("STD $1234 → [0xFD, 0x12, 0x34]", function(assert) {
  const s = { opcode: "STD", params: ["$1234"], paramstring: "$1234", lens: [], bytes: 0 };
  const p = M6803.parseOpcode(s, vars, Parser);
  assert.equal(p.lens[0], 0xFD, "opcode");
  assert.equal(ev(p.lens, 1), 0x1234, "address");
  assert.equal(p.bytes, 3, "bytes");
});

QUnit.test("STD 5,X → [0xED, 0x05]", function(assert) {
  const s = { opcode: "STD", params: ["5", "X"], paramstring: "5,X", lens: [], bytes: 0 };
  const p = M6803.parseOpcode(s, vars, Parser);
  assert.equal(p.lens[0], 0xED, "opcode");
  assert.equal(ev(p.lens, 1), 5, "offset");
  assert.equal(p.bytes, 2, "bytes");
});

// --- ADDD ---

QUnit.test("ADDD #$0010 → [0xC3, 0x00, 0x10]", function(assert) {
  const s = { opcode: "ADDD", params: ["#$0010"], paramstring: "#$0010", lens: [], bytes: 0 };
  const p = M6803.parseOpcode(s, vars, Parser);
  assert.equal(p.lens[0], 0xC3, "opcode");
  assert.equal(ev(p.lens, 1), 0x0010, "16-bit value");
  assert.equal(p.lens[2], null, "null marker for 16-bit split");
  assert.equal(p.bytes, 3, "bytes");
});

QUnit.test("ADDD $10 → [0xD3, 0x10]", function(assert) {
  const s = { opcode: "ADDD", params: ["$10"], paramstring: "$10", lens: [], bytes: 0 };
  const p = M6803.parseOpcode(s, vars, Parser);
  assert.equal(p.lens[0], 0xD3, "opcode");
  assert.equal(ev(p.lens, 1), 0x10, "address");
  assert.equal(p.bytes, 2, "bytes");
});

QUnit.test("ADDD $1000 → [0xF3, 0x10, 0x00]", function(assert) {
  const s = { opcode: "ADDD", params: ["$1000"], paramstring: "$1000", lens: [], bytes: 0 };
  const p = M6803.parseOpcode(s, vars, Parser);
  assert.equal(p.lens[0], 0xF3, "opcode");
  assert.equal(ev(p.lens, 1), 0x1000, "address");
  assert.equal(p.bytes, 3, "bytes");
});

// --- SUBD ---

QUnit.test("SUBD #$0001 → [0x83, 0x00, 0x01]", function(assert) {
  const s = { opcode: "SUBD", params: ["#$0001"], paramstring: "#$0001", lens: [], bytes: 0 };
  const p = M6803.parseOpcode(s, vars, Parser);
  assert.equal(p.lens[0], 0x83, "opcode");
  assert.equal(ev(p.lens, 1), 0x0001, "16-bit value");
  assert.equal(p.lens[2], null, "null marker for 16-bit split");
  assert.equal(p.bytes, 3, "bytes");
});

QUnit.test("SUBD $10 → [0x93, 0x10]", function(assert) {
  const s = { opcode: "SUBD", params: ["$10"], paramstring: "$10", lens: [], bytes: 0 };
  const p = M6803.parseOpcode(s, vars, Parser);
  assert.equal(p.lens[0], 0x93, "opcode");
  assert.equal(ev(p.lens, 1), 0x10, "address");
  assert.equal(p.bytes, 2, "bytes");
});

// --- JSR DIR (new 6803 mode) ---

QUnit.test("JSR $42 → [0x9D, 0x42] (new DIR mode)", function(assert) {
  const s = { opcode: "JSR", params: ["$42"], paramstring: "$42", lens: [], bytes: 0 };
  const p = M6803.parseOpcode(s, vars, Parser);
  assert.equal(p.lens[0], 0x9D, "opcode");
  assert.equal(ev(p.lens, 1), 0x42, "address");
  assert.equal(p.bytes, 2, "bytes");
});

QUnit.test("JSR $1234 → [0xBD, 0x12, 0x34] (EXT regression)", function(assert) {
  const s = { opcode: "JSR", params: ["$1234"], paramstring: "$1234", lens: [], bytes: 0 };
  const p = M6803.parseOpcode(s, vars, Parser);
  assert.equal(p.lens[0], 0xBD, "opcode");
  assert.equal(ev(p.lens, 1), 0x1234, "address");
  assert.equal(p.bytes, 3, "bytes");
});

// --- 6800 regressions ---

QUnit.test("LDAA #5 → [0x86, 0x05] (6800 regression)", function(assert) {
  const s = { opcode: "LDAA", params: ["#5"], paramstring: "#5", lens: [], bytes: 0 };
  const p = M6803.parseOpcode(s, vars, Parser);
  assert.equal(p.lens[0], 0x86, "opcode");
  assert.equal(ev(p.lens, 1), 5, "value");
  assert.equal(p.bytes, 2, "bytes");
});

QUnit.test("BRA $+3 → [0x20, 0x01] (6800 regression)", function(assert) {
  const localVars = { ...vars, "_PC": 0x0100 };
  // target = 0x0103, offset = 0x0103 - 0x0100 - 2 = 1
  const s = { opcode: "BRA", params: ["$103"], paramstring: "$103", lens: [], bytes: 0 };
  const p = M6803.parseOpcode(s, localVars, Parser);
  assert.equal(p.lens[0], 0x20, "opcode");
  assert.equal(ev(p.lens, 1), 0x01, "offset");
  assert.equal(p.bytes, 2, "bytes");
});
