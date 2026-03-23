import { SM83 } from "../cpu/sm83.js";
import { Parser } from "../expression-parser.js";
import QUnit from "qunit";

QUnit.config.hidepassed = true;

// Helper: build instruction object as the assembler would
function insn(opcode, ...params) {
  return { opcode, params, lens: [], bytes: 0, addr: 0x0100 };
}

// Helper: evaluate a lens entry (may be a function)
function ev(lens, i, vars) {
  return typeof lens[i] === "function" ? lens[i](vars) : lens[i];
}

const vars0 = { _PC: 0x0100 };

// ─── basics ───────────────────────────────────────────────────────────────────

QUnit.module("SM83 - basics");

QUnit.test("SM83 is defined", function (assert) {
  assert.notEqual(SM83, null);
  assert.equal(typeof SM83, "object");
  assert.equal(typeof SM83.parseOpcode, "function");
  assert.equal(SM83.cpu, "sm83");
  assert.equal(SM83.ext, "sm83");
  assert.equal(SM83.endian, false);
});

// ─── single-byte fixed ────────────────────────────────────────────────────────

QUnit.module("SM83 - fixed opcodes");

QUnit.test("NOP", function (assert) {
  const p = SM83.parseOpcode(insn("NOP"), vars0, Parser);
  assert.equal(p.bytes, 1);
  assert.equal(p.lens[0], 0x00);
});

QUnit.test("HALT", function (assert) {
  const p = SM83.parseOpcode(insn("HALT"), vars0, Parser);
  assert.equal(p.bytes, 1);
  assert.equal(p.lens[0], 0x76);
});

QUnit.test("DI", function (assert) {
  const p = SM83.parseOpcode(insn("DI"), vars0, Parser);
  assert.equal(p.bytes, 1);
  assert.equal(p.lens[0], 0xF3);
});

QUnit.test("EI", function (assert) {
  const p = SM83.parseOpcode(insn("EI"), vars0, Parser);
  assert.equal(p.bytes, 1);
  assert.equal(p.lens[0], 0xFB);
});

QUnit.test("RETI", function (assert) {
  const p = SM83.parseOpcode(insn("RETI"), vars0, Parser);
  assert.equal(p.bytes, 1);
  assert.equal(p.lens[0], 0xD9);
});

QUnit.test("RLCA", function (assert) {
  const p = SM83.parseOpcode(insn("RLCA"), vars0, Parser);
  assert.equal(p.bytes, 1); assert.equal(p.lens[0], 0x07);
});

QUnit.test("RRCA", function (assert) {
  const p = SM83.parseOpcode(insn("RRCA"), vars0, Parser);
  assert.equal(p.bytes, 1); assert.equal(p.lens[0], 0x0F);
});

QUnit.test("RLA", function (assert) {
  const p = SM83.parseOpcode(insn("RLA"), vars0, Parser);
  assert.equal(p.bytes, 1); assert.equal(p.lens[0], 0x17);
});

QUnit.test("RRA", function (assert) {
  const p = SM83.parseOpcode(insn("RRA"), vars0, Parser);
  assert.equal(p.bytes, 1); assert.equal(p.lens[0], 0x1F);
});

QUnit.test("DAA", function (assert) {
  const p = SM83.parseOpcode(insn("DAA"), vars0, Parser);
  assert.equal(p.bytes, 1); assert.equal(p.lens[0], 0x27);
});

QUnit.test("CPL", function (assert) {
  const p = SM83.parseOpcode(insn("CPL"), vars0, Parser);
  assert.equal(p.bytes, 1); assert.equal(p.lens[0], 0x2F);
});

QUnit.test("SCF", function (assert) {
  const p = SM83.parseOpcode(insn("SCF"), vars0, Parser);
  assert.equal(p.bytes, 1); assert.equal(p.lens[0], 0x37);
});

QUnit.test("CCF", function (assert) {
  const p = SM83.parseOpcode(insn("CCF"), vars0, Parser);
  assert.equal(p.bytes, 1); assert.equal(p.lens[0], 0x3F);
});

QUnit.test("STOP 0", function (assert) {
  const p = SM83.parseOpcode(insn("STOP", "0"), vars0, Parser);
  assert.equal(p.bytes, 2);
  assert.equal(p.lens[0], 0x10);
  assert.equal(ev(p.lens, 1, vars0), 0x00);
});

// ─── LD r, r' ─────────────────────────────────────────────────────────────────

QUnit.module("SM83 - LD r,r'");

QUnit.test("LD B, C → 0x41", function (assert) {
  const p = SM83.parseOpcode(insn("LD", "B", "C"), vars0, Parser);
  assert.equal(p.bytes, 1); assert.equal(p.lens[0], 0x41);
});

QUnit.test("LD H, A → 0x67", function (assert) {
  const p = SM83.parseOpcode(insn("LD", "H", "A"), vars0, Parser);
  assert.equal(p.bytes, 1); assert.equal(p.lens[0], 0x67);
});

QUnit.test("LD (HL), B → 0x70", function (assert) {
  const p = SM83.parseOpcode(insn("LD", "(HL)", "B"), vars0, Parser);
  assert.equal(p.bytes, 1); assert.equal(p.lens[0], 0x70);
});

QUnit.test("LD A, (HL) → 0x7E", function (assert) {
  const p = SM83.parseOpcode(insn("LD", "A", "(HL)"), vars0, Parser);
  assert.equal(p.bytes, 1); assert.equal(p.lens[0], 0x7E);
});

// ─── LD r, n ──────────────────────────────────────────────────────────────────

QUnit.module("SM83 - LD r,n");

QUnit.test("LD B, $42 → [0x06, 0x42]", function (assert) {
  const p = SM83.parseOpcode(insn("LD", "B", "$42"), vars0, Parser);
  assert.equal(p.bytes, 2);
  assert.equal(p.lens[0], 0x06);
  assert.equal(ev(p.lens, 1, vars0), 0x42);
});

QUnit.test("LD A, 0 → [0x3E, 0x00]", function (assert) {
  const p = SM83.parseOpcode(insn("LD", "A", "0"), vars0, Parser);
  assert.equal(p.bytes, 2);
  assert.equal(p.lens[0], 0x3E);
  assert.equal(ev(p.lens, 1, vars0), 0x00);
});

// ─── LD rr, nn ────────────────────────────────────────────────────────────────

QUnit.module("SM83 - LD rr,nn");

QUnit.test("LD BC, $1234 → [0x01, 0x34, 0x12]", function (assert) {
  const p = SM83.parseOpcode(insn("LD", "BC", "$1234"), vars0, Parser);
  assert.equal(p.bytes, 3);
  assert.equal(p.lens[0], 0x01);
  assert.equal(ev(p.lens, 1, vars0), 0x34);
  assert.equal(ev(p.lens, 2, vars0), 0x12);
});

QUnit.test("LD SP, $FFFE → [0x31, 0xFE, 0xFF]", function (assert) {
  const p = SM83.parseOpcode(insn("LD", "SP", "$FFFE"), vars0, Parser);
  assert.equal(p.bytes, 3);
  assert.equal(p.lens[0], 0x31);
  assert.equal(ev(p.lens, 1, vars0), 0xFE);
  assert.equal(ev(p.lens, 2, vars0), 0xFF);
});

// ─── LD (HL+/HL-) ─────────────────────────────────────────────────────────────

QUnit.module("SM83 - LD (HL+/HL-)");

QUnit.test("LD (HL+), A → 0x22", function (assert) {
  const p = SM83.parseOpcode(insn("LD", "(HL+)", "A"), vars0, Parser);
  assert.equal(p.bytes, 1); assert.equal(p.lens[0], 0x22);
});

QUnit.test("LD A, (HL+) → 0x2A", function (assert) {
  const p = SM83.parseOpcode(insn("LD", "A", "(HL+)"), vars0, Parser);
  assert.equal(p.bytes, 1); assert.equal(p.lens[0], 0x2A);
});

QUnit.test("LD (HL-), A → 0x32", function (assert) {
  const p = SM83.parseOpcode(insn("LD", "(HL-)", "A"), vars0, Parser);
  assert.equal(p.bytes, 1); assert.equal(p.lens[0], 0x32);
});

QUnit.test("LD A, (HL-) → 0x3A", function (assert) {
  const p = SM83.parseOpcode(insn("LD", "A", "(HL-)"), vars0, Parser);
  assert.equal(p.bytes, 1); assert.equal(p.lens[0], 0x3A);
});

QUnit.test("LDI (HL), A alias → 0x22", function (assert) {
  const p = SM83.parseOpcode(insn("LDI", "(HL)", "A"), vars0, Parser);
  assert.equal(p.bytes, 1); assert.equal(p.lens[0], 0x22);
});

QUnit.test("LDI A, (HL) alias → 0x2A", function (assert) {
  const p = SM83.parseOpcode(insn("LDI", "A", "(HL)"), vars0, Parser);
  assert.equal(p.bytes, 1); assert.equal(p.lens[0], 0x2A);
});

QUnit.test("LDD (HL), A alias → 0x32", function (assert) {
  const p = SM83.parseOpcode(insn("LDD", "(HL)", "A"), vars0, Parser);
  assert.equal(p.bytes, 1); assert.equal(p.lens[0], 0x32);
});

QUnit.test("LDD A, (HL) alias → 0x3A", function (assert) {
  const p = SM83.parseOpcode(insn("LDD", "A", "(HL)"), vars0, Parser);
  assert.equal(p.bytes, 1); assert.equal(p.lens[0], 0x3A);
});

// ─── LD indirect register ─────────────────────────────────────────────────────

QUnit.module("SM83 - LD indirect register");

QUnit.test("LD (BC), A → 0x02", function (assert) {
  const p = SM83.parseOpcode(insn("LD", "(BC)", "A"), vars0, Parser);
  assert.equal(p.bytes, 1); assert.equal(p.lens[0], 0x02);
});

QUnit.test("LD (DE), A → 0x12", function (assert) {
  const p = SM83.parseOpcode(insn("LD", "(DE)", "A"), vars0, Parser);
  assert.equal(p.bytes, 1); assert.equal(p.lens[0], 0x12);
});

QUnit.test("LD A, (BC) → 0x0A", function (assert) {
  const p = SM83.parseOpcode(insn("LD", "A", "(BC)"), vars0, Parser);
  assert.equal(p.bytes, 1); assert.equal(p.lens[0], 0x0A);
});

QUnit.test("LD A, (DE) → 0x1A", function (assert) {
  const p = SM83.parseOpcode(insn("LD", "A", "(DE)"), vars0, Parser);
  assert.equal(p.bytes, 1); assert.equal(p.lens[0], 0x1A);
});

// ─── LD absolute ──────────────────────────────────────────────────────────────

QUnit.module("SM83 - LD absolute");

QUnit.test("LD ($C000), A → [0xEA, 0x00, 0xC0]", function (assert) {
  const p = SM83.parseOpcode(insn("LD", "($C000)", "A"), vars0, Parser);
  assert.equal(p.bytes, 3);
  assert.equal(p.lens[0], 0xEA);
  assert.equal(ev(p.lens, 1, vars0), 0x00);
  assert.equal(ev(p.lens, 2, vars0), 0xC0);
});

QUnit.test("LD A, ($C000) → [0xFA, 0x00, 0xC0]", function (assert) {
  const p = SM83.parseOpcode(insn("LD", "A", "($C000)"), vars0, Parser);
  assert.equal(p.bytes, 3);
  assert.equal(p.lens[0], 0xFA);
  assert.equal(ev(p.lens, 1, vars0), 0x00);
  assert.equal(ev(p.lens, 2, vars0), 0xC0);
});

QUnit.test("LD ($C000), SP → [0x08, 0x00, 0xC0]", function (assert) {
  const p = SM83.parseOpcode(insn("LD", "($C000)", "SP"), vars0, Parser);
  assert.equal(p.bytes, 3);
  assert.equal(p.lens[0], 0x08);
  assert.equal(ev(p.lens, 1, vars0), 0x00);
  assert.equal(ev(p.lens, 2, vars0), 0xC0);
});

// ─── LD SP, HL / LD HL, SP+n ──────────────────────────────────────────────────

QUnit.module("SM83 - LD SP,HL / LD HL,SP+n");

QUnit.test("LD SP, HL → 0xF9", function (assert) {
  const p = SM83.parseOpcode(insn("LD", "SP", "HL"), vars0, Parser);
  assert.equal(p.bytes, 1); assert.equal(p.lens[0], 0xF9);
});

QUnit.test("LD HL, SP+4 → [0xF8, 0x04]", function (assert) {
  const p = SM83.parseOpcode(insn("LD", "HL", "SP+4"), vars0, Parser);
  assert.equal(p.bytes, 2);
  assert.equal(p.lens[0], 0xF8);
  assert.equal(ev(p.lens, 1, vars0), 0x04);
});

QUnit.test("LD HL, SP-1 → [0xF8, 0xFF]", function (assert) {
  const p = SM83.parseOpcode(insn("LD", "HL", "SP-1"), vars0, Parser);
  assert.equal(p.bytes, 2);
  assert.equal(p.lens[0], 0xF8);
  assert.equal(ev(p.lens, 1, vars0), 0xFF);
});

// ─── LDH ──────────────────────────────────────────────────────────────────────

QUnit.module("SM83 - LDH");

QUnit.test("LDH ($40), A → [0xE0, 0x40]", function (assert) {
  const p = SM83.parseOpcode(insn("LDH", "($40)", "A"), vars0, Parser);
  assert.equal(p.bytes, 2);
  assert.equal(p.lens[0], 0xE0);
  assert.equal(ev(p.lens, 1, vars0), 0x40);
});

QUnit.test("LDH A, ($40) → [0xF0, 0x40]", function (assert) {
  const p = SM83.parseOpcode(insn("LDH", "A", "($40)"), vars0, Parser);
  assert.equal(p.bytes, 2);
  assert.equal(p.lens[0], 0xF0);
  assert.equal(ev(p.lens, 1, vars0), 0x40);
});

QUnit.test("LDH (C), A → 0xE2", function (assert) {
  const p = SM83.parseOpcode(insn("LDH", "(C)", "A"), vars0, Parser);
  assert.equal(p.bytes, 1); assert.equal(p.lens[0], 0xE2);
});

QUnit.test("LDH A, (C) → 0xF2", function (assert) {
  const p = SM83.parseOpcode(insn("LDH", "A", "(C)"), vars0, Parser);
  assert.equal(p.bytes, 1); assert.equal(p.lens[0], 0xF2);
});

// ─── ALU register ─────────────────────────────────────────────────────────────

QUnit.module("SM83 - ALU register");

QUnit.test("ADD A, B → 0x80", function (assert) {
  const p = SM83.parseOpcode(insn("ADD", "A", "B"), vars0, Parser);
  assert.equal(p.bytes, 1); assert.equal(p.lens[0], 0x80);
});

QUnit.test("ADD A, (HL) → 0x86", function (assert) {
  const p = SM83.parseOpcode(insn("ADD", "A", "(HL)"), vars0, Parser);
  assert.equal(p.bytes, 1); assert.equal(p.lens[0], 0x86);
});

QUnit.test("ADC A, C → 0x89", function (assert) {
  const p = SM83.parseOpcode(insn("ADC", "A", "C"), vars0, Parser);
  assert.equal(p.bytes, 1); assert.equal(p.lens[0], 0x89);
});

QUnit.test("SUB D → 0x92", function (assert) {
  const p = SM83.parseOpcode(insn("SUB", "D"), vars0, Parser);
  assert.equal(p.bytes, 1); assert.equal(p.lens[0], 0x92);
});

QUnit.test("SUB A, D → 0x92 (explicit A)", function (assert) {
  const p = SM83.parseOpcode(insn("SUB", "A", "D"), vars0, Parser);
  assert.equal(p.bytes, 1); assert.equal(p.lens[0], 0x92);
});

QUnit.test("SBC A, H → 0x9C", function (assert) {
  const p = SM83.parseOpcode(insn("SBC", "A", "H"), vars0, Parser);
  assert.equal(p.bytes, 1); assert.equal(p.lens[0], 0x9C);
});

QUnit.test("AND L → 0xA5", function (assert) {
  const p = SM83.parseOpcode(insn("AND", "L"), vars0, Parser);
  assert.equal(p.bytes, 1); assert.equal(p.lens[0], 0xA5);
});

QUnit.test("XOR A → 0xAF", function (assert) {
  const p = SM83.parseOpcode(insn("XOR", "A"), vars0, Parser);
  assert.equal(p.bytes, 1); assert.equal(p.lens[0], 0xAF);
});

QUnit.test("OR B → 0xB0", function (assert) {
  const p = SM83.parseOpcode(insn("OR", "B"), vars0, Parser);
  assert.equal(p.bytes, 1); assert.equal(p.lens[0], 0xB0);
});

QUnit.test("CP (HL) → 0xBE", function (assert) {
  const p = SM83.parseOpcode(insn("CP", "(HL)"), vars0, Parser);
  assert.equal(p.bytes, 1); assert.equal(p.lens[0], 0xBE);
});

// ─── ALU immediate ────────────────────────────────────────────────────────────

QUnit.module("SM83 - ALU immediate");

QUnit.test("ADD A, $10 → [0xC6, 0x10]", function (assert) {
  const p = SM83.parseOpcode(insn("ADD", "A", "$10"), vars0, Parser);
  assert.equal(p.bytes, 2);
  assert.equal(p.lens[0], 0xC6);
  assert.equal(ev(p.lens, 1, vars0), 0x10);
});

QUnit.test("SUB $01 → [0xD6, 0x01]", function (assert) {
  const p = SM83.parseOpcode(insn("SUB", "$01"), vars0, Parser);
  assert.equal(p.bytes, 2);
  assert.equal(p.lens[0], 0xD6);
  assert.equal(ev(p.lens, 1, vars0), 0x01);
});

QUnit.test("AND $0F → [0xE6, 0x0F]", function (assert) {
  const p = SM83.parseOpcode(insn("AND", "$0F"), vars0, Parser);
  assert.equal(p.bytes, 2);
  assert.equal(p.lens[0], 0xE6);
  assert.equal(ev(p.lens, 1, vars0), 0x0F);
});

QUnit.test("CP $FF → [0xFE, 0xFF]", function (assert) {
  const p = SM83.parseOpcode(insn("CP", "$FF"), vars0, Parser);
  assert.equal(p.bytes, 2);
  assert.equal(p.lens[0], 0xFE);
  assert.equal(ev(p.lens, 1, vars0), 0xFF);
});

// ─── INC / DEC ────────────────────────────────────────────────────────────────

QUnit.module("SM83 - INC/DEC");

QUnit.test("INC B → 0x04", function (assert) {
  const p = SM83.parseOpcode(insn("INC", "B"), vars0, Parser);
  assert.equal(p.bytes, 1); assert.equal(p.lens[0], 0x04);
});

QUnit.test("INC (HL) → 0x34", function (assert) {
  const p = SM83.parseOpcode(insn("INC", "(HL)"), vars0, Parser);
  assert.equal(p.bytes, 1); assert.equal(p.lens[0], 0x34);
});

QUnit.test("DEC A → 0x3D", function (assert) {
  const p = SM83.parseOpcode(insn("DEC", "A"), vars0, Parser);
  assert.equal(p.bytes, 1); assert.equal(p.lens[0], 0x3D);
});

QUnit.test("INC BC → 0x03", function (assert) {
  const p = SM83.parseOpcode(insn("INC", "BC"), vars0, Parser);
  assert.equal(p.bytes, 1); assert.equal(p.lens[0], 0x03);
});

QUnit.test("DEC HL → 0x2B", function (assert) {
  const p = SM83.parseOpcode(insn("DEC", "HL"), vars0, Parser);
  assert.equal(p.bytes, 1); assert.equal(p.lens[0], 0x2B);
});

// ─── PUSH / POP ───────────────────────────────────────────────────────────────

QUnit.module("SM83 - PUSH/POP");

QUnit.test("PUSH BC → 0xC5", function (assert) {
  const p = SM83.parseOpcode(insn("PUSH", "BC"), vars0, Parser);
  assert.equal(p.bytes, 1); assert.equal(p.lens[0], 0xC5);
});

QUnit.test("POP AF → 0xF1", function (assert) {
  const p = SM83.parseOpcode(insn("POP", "AF"), vars0, Parser);
  assert.equal(p.bytes, 1); assert.equal(p.lens[0], 0xF1);
});

QUnit.test("PUSH HL → 0xE5", function (assert) {
  const p = SM83.parseOpcode(insn("PUSH", "HL"), vars0, Parser);
  assert.equal(p.bytes, 1); assert.equal(p.lens[0], 0xE5);
});

// ─── ADD HL / ADD SP ──────────────────────────────────────────────────────────

QUnit.module("SM83 - ADD HL / ADD SP");

QUnit.test("ADD HL, BC → 0x09", function (assert) {
  const p = SM83.parseOpcode(insn("ADD", "HL", "BC"), vars0, Parser);
  assert.equal(p.bytes, 1); assert.equal(p.lens[0], 0x09);
});

QUnit.test("ADD HL, SP → 0x39", function (assert) {
  const p = SM83.parseOpcode(insn("ADD", "HL", "SP"), vars0, Parser);
  assert.equal(p.bytes, 1); assert.equal(p.lens[0], 0x39);
});

QUnit.test("ADD SP, $04 → [0xE8, 0x04]", function (assert) {
  const p = SM83.parseOpcode(insn("ADD", "SP", "$04"), vars0, Parser);
  assert.equal(p.bytes, 2);
  assert.equal(p.lens[0], 0xE8);
  assert.equal(ev(p.lens, 1, vars0), 0x04);
});

QUnit.test("ADD SP, -2 → [0xE8, 0xFE]", function (assert) {
  const p = SM83.parseOpcode(insn("ADD", "SP", "-2"), vars0, Parser);
  assert.equal(p.bytes, 2);
  assert.equal(p.lens[0], 0xE8);
  assert.equal(ev(p.lens, 1, vars0), 0xFE);
});

// ─── JP ───────────────────────────────────────────────────────────────────────

QUnit.module("SM83 - JP");

QUnit.test("JP $1234 → [0xC3, 0x34, 0x12]", function (assert) {
  const p = SM83.parseOpcode(insn("JP", "$1234"), vars0, Parser);
  assert.equal(p.bytes, 3);
  assert.equal(p.lens[0], 0xC3);
  assert.equal(ev(p.lens, 1, vars0), 0x34);
  assert.equal(ev(p.lens, 2, vars0), 0x12);
});

QUnit.test("JP NZ, $1000 → [0xC2, 0x00, 0x10]", function (assert) {
  const p = SM83.parseOpcode(insn("JP", "NZ", "$1000"), vars0, Parser);
  assert.equal(p.bytes, 3);
  assert.equal(p.lens[0], 0xC2);
  assert.equal(ev(p.lens, 1, vars0), 0x00);
  assert.equal(ev(p.lens, 2, vars0), 0x10);
});

QUnit.test("JP Z, $1000 → [0xCA, ...]", function (assert) {
  const p = SM83.parseOpcode(insn("JP", "Z", "$1000"), vars0, Parser);
  assert.equal(p.lens[0], 0xCA);
});

QUnit.test("JP NC, $1000 → [0xD2, ...]", function (assert) {
  const p = SM83.parseOpcode(insn("JP", "NC", "$1000"), vars0, Parser);
  assert.equal(p.lens[0], 0xD2);
});

QUnit.test("JP C, $1000 → [0xDA, ...]", function (assert) {
  const p = SM83.parseOpcode(insn("JP", "C", "$1000"), vars0, Parser);
  assert.equal(p.lens[0], 0xDA);
});

QUnit.test("JP HL → 0xE9", function (assert) {
  const p = SM83.parseOpcode(insn("JP", "HL"), vars0, Parser);
  assert.equal(p.bytes, 1); assert.equal(p.lens[0], 0xE9);
});

// ─── JR ───────────────────────────────────────────────────────────────────────

QUnit.module("SM83 - JR");

// JR $+2 at addr 0x0100 → offset = 0x0102 - 0x0102 = 0
QUnit.test("JR $+2 → [0x18, 0x00]", function (assert) {
  const s = insn("JR", "$+2"); s.addr = 0x0100;
  const p = SM83.parseOpcode(s, { _PC: 0x0100 }, Parser);
  assert.equal(p.bytes, 2);
  assert.equal(p.lens[0], 0x18);
  assert.equal(ev(p.lens, 1, { _PC: 0x0100 }), 0x00);
});

// JR NZ, $+4 at 0x0100 → offset = 0x0104 - 0x0102 = 2
QUnit.test("JR NZ, $+4 → [0x20, 0x02]", function (assert) {
  const s = insn("JR", "NZ", "$+4"); s.addr = 0x0100;
  const p = SM83.parseOpcode(s, { _PC: 0x0100 }, Parser);
  assert.equal(p.bytes, 2);
  assert.equal(p.lens[0], 0x20);
  assert.equal(ev(p.lens, 1, { _PC: 0x0100 }), 0x02);
});

// JR Z, $-2 at 0x0100 → offset = 0x00FE - 0x0102 = -4 → 0xFC
QUnit.test("JR Z, $-2 → [0x28, offset]", function (assert) {
  const s = insn("JR", "Z", "$-2"); s.addr = 0x0100;
  const p = SM83.parseOpcode(s, { _PC: 0x0100 }, Parser);
  assert.equal(p.bytes, 2);
  assert.equal(p.lens[0], 0x28);
  assert.equal(ev(p.lens, 1, { _PC: 0x0100 }), 0xFC);
});

// ─── CALL / RET ───────────────────────────────────────────────────────────────

QUnit.module("SM83 - CALL/RET");

QUnit.test("CALL $1234 → [0xCD, 0x34, 0x12]", function (assert) {
  const p = SM83.parseOpcode(insn("CALL", "$1234"), vars0, Parser);
  assert.equal(p.bytes, 3);
  assert.equal(p.lens[0], 0xCD);
  assert.equal(ev(p.lens, 1, vars0), 0x34);
  assert.equal(ev(p.lens, 2, vars0), 0x12);
});

QUnit.test("CALL NZ, $1234 → [0xC4, ...]", function (assert) {
  const p = SM83.parseOpcode(insn("CALL", "NZ", "$1234"), vars0, Parser);
  assert.equal(p.lens[0], 0xC4);
});

QUnit.test("CALL Z, $1234 → [0xCC, ...]", function (assert) {
  const p = SM83.parseOpcode(insn("CALL", "Z", "$1234"), vars0, Parser);
  assert.equal(p.lens[0], 0xCC);
});

QUnit.test("RET → 0xC9", function (assert) {
  const p = SM83.parseOpcode(insn("RET"), vars0, Parser);
  assert.equal(p.bytes, 1); assert.equal(p.lens[0], 0xC9);
});

QUnit.test("RET NZ → 0xC0", function (assert) {
  const p = SM83.parseOpcode(insn("RET", "NZ"), vars0, Parser);
  assert.equal(p.bytes, 1); assert.equal(p.lens[0], 0xC0);
});

QUnit.test("RET C → 0xD8", function (assert) {
  const p = SM83.parseOpcode(insn("RET", "C"), vars0, Parser);
  assert.equal(p.bytes, 1); assert.equal(p.lens[0], 0xD8);
});

// ─── RST ──────────────────────────────────────────────────────────────────────

QUnit.module("SM83 - RST");

QUnit.test("RST $00 → 0xC7", function (assert) {
  const p = SM83.parseOpcode(insn("RST", "$00"), vars0, Parser);
  assert.equal(p.bytes, 1); assert.equal(p.lens[0], 0xC7);
});

QUnit.test("RST $08 → 0xCF", function (assert) {
  const p = SM83.parseOpcode(insn("RST", "$08"), vars0, Parser);
  assert.equal(p.bytes, 1); assert.equal(p.lens[0], 0xCF);
});

QUnit.test("RST $38 → 0xFF", function (assert) {
  const p = SM83.parseOpcode(insn("RST", "$38"), vars0, Parser);
  assert.equal(p.bytes, 1); assert.equal(p.lens[0], 0xFF);
});

QUnit.test("RST invalid throws", function (assert) {
  assert.throws(() => SM83.parseOpcode(insn("RST", "7"), vars0, Parser));
});

// ─── CB prefix: shifts/rotates ────────────────────────────────────────────────

QUnit.module("SM83 - CB shifts/rotates");

QUnit.test("RLC B → [0xCB, 0x00]", function (assert) {
  const p = SM83.parseOpcode(insn("RLC", "B"), vars0, Parser);
  assert.equal(p.bytes, 2); assert.equal(p.lens[0], 0xCB); assert.equal(p.lens[1], 0x00);
});

QUnit.test("RLC (HL) → [0xCB, 0x06]", function (assert) {
  const p = SM83.parseOpcode(insn("RLC", "(HL)"), vars0, Parser);
  assert.equal(p.bytes, 2); assert.equal(p.lens[1], 0x06);
});

QUnit.test("RRC A → [0xCB, 0x0F]", function (assert) {
  const p = SM83.parseOpcode(insn("RRC", "A"), vars0, Parser);
  assert.equal(p.bytes, 2); assert.equal(p.lens[1], 0x0F);
});

QUnit.test("RL C → [0xCB, 0x11]", function (assert) {
  const p = SM83.parseOpcode(insn("RL", "C"), vars0, Parser);
  assert.equal(p.bytes, 2); assert.equal(p.lens[1], 0x11);
});

QUnit.test("RR D → [0xCB, 0x1A]", function (assert) {
  const p = SM83.parseOpcode(insn("RR", "D"), vars0, Parser);
  assert.equal(p.bytes, 2); assert.equal(p.lens[1], 0x1A);
});

QUnit.test("SLA H → [0xCB, 0x24]", function (assert) {
  const p = SM83.parseOpcode(insn("SLA", "H"), vars0, Parser);
  assert.equal(p.bytes, 2); assert.equal(p.lens[1], 0x24);
});

QUnit.test("SRA L → [0xCB, 0x2D]", function (assert) {
  const p = SM83.parseOpcode(insn("SRA", "L"), vars0, Parser);
  assert.equal(p.bytes, 2); assert.equal(p.lens[1], 0x2D);
});

QUnit.test("SWAP A → [0xCB, 0x37]", function (assert) {
  const p = SM83.parseOpcode(insn("SWAP", "A"), vars0, Parser);
  assert.equal(p.bytes, 2); assert.equal(p.lens[1], 0x37);
});

QUnit.test("SRL B → [0xCB, 0x38]", function (assert) {
  const p = SM83.parseOpcode(insn("SRL", "B"), vars0, Parser);
  assert.equal(p.bytes, 2); assert.equal(p.lens[1], 0x38);
});

// ─── CB prefix: BIT/RES/SET ───────────────────────────────────────────────────

QUnit.module("SM83 - BIT/RES/SET");

QUnit.test("BIT 0, B → [0xCB, 0x40]", function (assert) {
  const p = SM83.parseOpcode(insn("BIT", "0", "B"), vars0, Parser);
  assert.equal(p.bytes, 2); assert.equal(p.lens[0], 0xCB); assert.equal(p.lens[1], 0x40);
});

QUnit.test("BIT 7, A → [0xCB, 0x7F]", function (assert) {
  const p = SM83.parseOpcode(insn("BIT", "7", "A"), vars0, Parser);
  assert.equal(p.bytes, 2); assert.equal(p.lens[1], 0x7F);
});

QUnit.test("BIT 3, (HL) → [0xCB, 0x5E]", function (assert) {
  const p = SM83.parseOpcode(insn("BIT", "3", "(HL)"), vars0, Parser);
  assert.equal(p.bytes, 2); assert.equal(p.lens[1], 0x5E);
});

QUnit.test("RES 0, B → [0xCB, 0x80]", function (assert) {
  const p = SM83.parseOpcode(insn("RES", "0", "B"), vars0, Parser);
  assert.equal(p.bytes, 2); assert.equal(p.lens[1], 0x80);
});

QUnit.test("RES 7, A → [0xCB, 0xBF]", function (assert) {
  const p = SM83.parseOpcode(insn("RES", "7", "A"), vars0, Parser);
  assert.equal(p.bytes, 2); assert.equal(p.lens[1], 0xBF);
});

QUnit.test("SET 0, B → [0xCB, 0xC0]", function (assert) {
  const p = SM83.parseOpcode(insn("SET", "0", "B"), vars0, Parser);
  assert.equal(p.bytes, 2); assert.equal(p.lens[1], 0xC0);
});

QUnit.test("SET 7, A → [0xCB, 0xFF]", function (assert) {
  const p = SM83.parseOpcode(insn("SET", "7", "A"), vars0, Parser);
  assert.equal(p.bytes, 2); assert.equal(p.lens[1], 0xFF);
});

// ─── Error cases ──────────────────────────────────────────────────────────────

QUnit.module("SM83 - errors");

// Unknown mnemonic
QUnit.test("unknown mnemonic throws", function (assert) {
  assert.throws(() => SM83.parseOpcode(insn("FOO"), vars0, Parser));
});

// Unknown 8-bit register
QUnit.test("LD IX, A throws (no IX on SM83)", function (assert) {
  assert.throws(() => SM83.parseOpcode(insn("LD", "IX", "A"), vars0, Parser));
});

QUnit.test("ADD A, IX treated as label (IX has no special meaning on SM83)", function (assert) {
  // IX is not a register on SM83 — treated as an expression/label name, not an error
  const p = SM83.parseOpcode(insn("ADD", "A", "IX"), vars0, Parser);
  assert.equal(p.bytes, 2);   // falls through to immediate form
  assert.equal(p.lens[0], 0xC6);
});

QUnit.test("RLC IX throws (no IX on SM83)", function (assert) {
  assert.throws(() => SM83.parseOpcode(insn("RLC", "IX"), vars0, Parser));
});

// Unknown 16-bit register (INC/DEC rr)
QUnit.test("INC IX throws", function (assert) {
  assert.throws(() => SM83.parseOpcode(insn("INC", "IX"), vars0, Parser));
});

QUnit.test("DEC IY throws", function (assert) {
  assert.throws(() => SM83.parseOpcode(insn("DEC", "IY"), vars0, Parser));
});

// Unknown stack register (PUSH/POP)
QUnit.test("PUSH SP throws (SP not valid for PUSH)", function (assert) {
  assert.throws(() => SM83.parseOpcode(insn("PUSH", "SP"), vars0, Parser));
});

QUnit.test("POP SP throws (SP not valid for POP)", function (assert) {
  assert.throws(() => SM83.parseOpcode(insn("POP", "SP"), vars0, Parser));
});

// Invalid condition codes (Z80-only: PO, PE, P, M)
QUnit.test("JP PO throws (no PO condition on SM83)", function (assert) {
  assert.throws(() => SM83.parseOpcode(insn("JP", "PO", "$1000"), vars0, Parser));
});

QUnit.test("JR M throws (no M condition on SM83)", function (assert) {
  assert.throws(() => SM83.parseOpcode(insn("JR", "M", "$+2"), vars0, Parser));
});

QUnit.test("CALL PE throws (no PE condition on SM83)", function (assert) {
  assert.throws(() => SM83.parseOpcode(insn("CALL", "PE", "$1000"), vars0, Parser));
});

QUnit.test("RET P throws (no P condition on SM83)", function (assert) {
  assert.throws(() => SM83.parseOpcode(insn("RET", "P"), vars0, Parser));
});

// RST — invalid targets
QUnit.test("RST 7 throws (not multiple of 8)", function (assert) {
  assert.throws(() => SM83.parseOpcode(insn("RST", "7"), vars0, Parser));
});

QUnit.test("RST 64 throws (out of range)", function (assert) {
  assert.throws(() => SM83.parseOpcode(insn("RST", "64"), vars0, Parser));
});

QUnit.test("RST -8 throws (negative)", function (assert) {
  assert.throws(() => SM83.parseOpcode(insn("RST", "-8"), vars0, Parser));
});

// ADD SP, n — signed 8-bit range (checked in lambda at evaluation time)
QUnit.test("ADD SP, 128 throws at evaluation (out of signed 8-bit range)", function (assert) {
  const p = SM83.parseOpcode(insn("ADD", "SP", "128"), vars0, Parser);
  assert.throws(() => p.lens[1](vars0));
});

QUnit.test("ADD SP, -129 throws at evaluation (out of signed 8-bit range)", function (assert) {
  const p = SM83.parseOpcode(insn("ADD", "SP", "-129"), vars0, Parser);
  assert.throws(() => p.lens[1](vars0));
});

// LD HL, SP+n — signed 8-bit range (lambda, evaluated at lens time)
QUnit.test("LD HL, SP+128 throws at evaluation (out of signed 8-bit)", function (assert) {
  const p = SM83.parseOpcode(insn("LD", "HL", "SP+128"), vars0, Parser);
  assert.throws(() => p.lens[1](vars0));
});

QUnit.test("LD HL, SP-129 throws at evaluation (out of signed 8-bit)", function (assert) {
  const p = SM83.parseOpcode(insn("LD", "HL", "SP-129"), vars0, Parser);
  assert.throws(() => p.lens[1](vars0));
});

// JR — target out of relative jump reach (lambda, evaluated at lens time)
QUnit.test("JR too far forward throws at evaluation", function (assert) {
  const s = insn("JR", "$+200"); s.addr = 0x0100;
  const p = SM83.parseOpcode(s, { _PC: 0x0100 }, Parser);
  assert.throws(() => p.lens[1]({ _PC: 0x0100 }));
});

QUnit.test("JR too far backward throws at evaluation", function (assert) {
  const s = insn("JR", "$-200"); s.addr = 0x0100;
  const p = SM83.parseOpcode(s, { _PC: 0x0100 }, Parser);
  assert.throws(() => p.lens[1]({ _PC: 0x0100 }));
});

// ADC/SBC — require explicit A
QUnit.test("ADC B, C throws (must use ADC A, C)", function (assert) {
  assert.throws(() => SM83.parseOpcode(insn("ADC", "B", "C"), vars0, Parser));
});

QUnit.test("SBC B, C throws (must use SBC A, C)", function (assert) {
  assert.throws(() => SM83.parseOpcode(insn("SBC", "B", "C"), vars0, Parser));
});

// Unrecognized LD forms
QUnit.test("LD (HL), (HL) is HALT — not an LD error", function (assert) {
  // 0x76 = HALT, encoded in the LD r,r' block
  const p = SM83.parseOpcode(insn("LD", "(HL)", "(HL)"), vars0, Parser);
  assert.equal(p.lens[0], 0x76);
});

QUnit.test("LD BC, DE treated as LD BC, nn (DE used as label)", function (assert) {
  // SM83 has no 16-bit register-to-register LD — DE is treated as an expression/label
  const p = SM83.parseOpcode(insn("LD", "BC", "DE"), vars0, Parser);
  assert.equal(p.bytes, 3);
  assert.equal(p.lens[0], 0x01);
});

// Unrecognized LDH forms
QUnit.test("LDH B, ($40) throws (LDH only works with A)", function (assert) {
  assert.throws(() => SM83.parseOpcode(insn("LDH", "B", "($40)"), vars0, Parser));
});

// LDI/LDD — invalid forms
QUnit.test("LDI B, C throws (LDI only for HL/A)", function (assert) {
  assert.throws(() => SM83.parseOpcode(insn("LDI", "B", "C"), vars0, Parser));
});
