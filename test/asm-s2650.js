import { S2650 } from "../cpu/s2650.js";
import { Parser } from "../expression-parser.js";
import QUnit from "qunit";

QUnit.config.hidepassed = true;

// Helper: evaluate lambda lens entries (same pattern as other CPU tests)
function ev(lens, i, vars) {
  return typeof lens[i] === "function" ? lens[i](vars) : lens[i];
}

// vars for tests at address $0100 (relative: IAR = $0102)
const varsAt100 = { _PC: 0x0100, LOOP: 0x0110 };
// vars for tests at address $0200 (relative: IAR = $0202)
const varsAt200 = { _PC: 0x0200 };

// ─── Module: basics ───────────────────────────────────────────────────────────

QUnit.module("S2650 - basics");

QUnit.test("S2650 is defined", function (assert) {
  assert.notEqual(S2650, null);
  assert.equal(typeof S2650, "object");
  assert.equal(typeof S2650.parseOpcode, "function");
  assert.equal(S2650.cpu, "s2650");
  assert.equal(S2650.ext, "s26");
});

// ─── Module: NOP / HALT ───────────────────────────────────────────────────────

QUnit.module("S2650 - misc");

QUnit.test("NOP", function (assert) {
  const s = { opcode: "NOP", params: [], lens: [], bytes: 0, addr: 0 };
  const p = S2650.parseOpcode(s, {}, Parser);
  assert.equal(p.bytes, 1);
  assert.equal(p.lens[0], 0xC0);
});

QUnit.test("HALT", function (assert) {
  const s = { opcode: "HALT", params: [], lens: [], bytes: 0, addr: 0 };
  const p = S2650.parseOpcode(s, {}, Parser);
  assert.equal(p.bytes, 1);
  assert.equal(p.lens[0], 0x40);
});

// ─── Module: Z-mode (register) ────────────────────────────────────────────────

QUnit.module("S2650 - Z-mode");

QUnit.test("LODZ,R0", function (assert) {
  const s = { opcode: "LODZ", params: ["", "R0"], lens: [], bytes: 0, addr: 0 };
  const p = S2650.parseOpcode(s, {}, Parser);
  assert.equal(p.bytes, 1);
  assert.equal(p.lens[0], 0x00);
});

QUnit.test("LODZ,R3", function (assert) {
  const s = { opcode: "LODZ", params: ["", "R3"], lens: [], bytes: 0, addr: 0 };
  const p = S2650.parseOpcode(s, {}, Parser);
  assert.equal(p.lens[0], 0x03);
});

QUnit.test("ADDZ,R1", function (assert) {
  const s = { opcode: "ADDZ", params: ["", "R1"], lens: [], bytes: 0, addr: 0 };
  const p = S2650.parseOpcode(s, {}, Parser);
  assert.equal(p.lens[0], 0x81);
});

QUnit.test("SUBZ,R2", function (assert) {
  const s = { opcode: "SUBZ", params: ["", "R2"], lens: [], bytes: 0, addr: 0 };
  const p = S2650.parseOpcode(s, {}, Parser);
  assert.equal(p.lens[0], 0xA2);
});

QUnit.test("EORZ,R2", function (assert) {
  const s = { opcode: "EORZ", params: ["", "R2"], lens: [], bytes: 0, addr: 0 };
  const p = S2650.parseOpcode(s, {}, Parser);
  assert.equal(p.lens[0], 0x22);
});

QUnit.test("ANDZ,R1", function (assert) {
  const s = { opcode: "ANDZ", params: ["", "R1"], lens: [], bytes: 0, addr: 0 };
  const p = S2650.parseOpcode(s, {}, Parser);
  assert.equal(p.lens[0], 0x41);
});

QUnit.test("ANDZ,R0 encodes as 0x40 (HALT) — like 8080 MOV M,M", function (assert) {
  const s = { opcode: "ANDZ", params: ["", "R0"], lens: [], bytes: 0, addr: 0 };
  const p = S2650.parseOpcode(s, {}, Parser);
  assert.equal(p.lens[0], 0x40, "ANDZ,R0 = 0x40 = HALT");
});

QUnit.test("IORZ,R0", function (assert) {
  const s = { opcode: "IORZ", params: ["", "R0"], lens: [], bytes: 0, addr: 0 };
  const p = S2650.parseOpcode(s, {}, Parser);
  assert.equal(p.lens[0], 0x60);
});

QUnit.test("COMZ,R3", function (assert) {
  const s = { opcode: "COMZ", params: ["", "R3"], lens: [], bytes: 0, addr: 0 };
  const p = S2650.parseOpcode(s, {}, Parser);
  assert.equal(p.lens[0], 0xE3);
});

QUnit.test("STRZ,R1 (R1 ← R0)", function (assert) {
  const s = { opcode: "STRZ", params: ["", "R1"], lens: [], bytes: 0, addr: 0 };
  const p = S2650.parseOpcode(s, {}, Parser);
  assert.equal(p.lens[0], 0xC1);
});

QUnit.test("STRZ,R0 encodes as 0xC0 (NOP)", function (assert) {
  const s = { opcode: "STRZ", params: ["", "R0"], lens: [], bytes: 0, addr: 0 };
  const p = S2650.parseOpcode(s, {}, Parser);
  assert.equal(p.lens[0], 0xC0, "STRZ,R0 = 0xC0 = NOP");
});

QUnit.test("RRR,R0", function (assert) {
  const s = { opcode: "RRR", params: ["", "R0"], lens: [], bytes: 0, addr: 0 };
  const p = S2650.parseOpcode(s, {}, Parser);
  assert.equal(p.lens[0], 0x50);
});

QUnit.test("RRL,R2", function (assert) {
  const s = { opcode: "RRL", params: ["", "R2"], lens: [], bytes: 0, addr: 0 };
  const p = S2650.parseOpcode(s, {}, Parser);
  assert.equal(p.lens[0], 0xD2);
});

QUnit.test("DAR,R0", function (assert) {
  const s = { opcode: "DAR", params: ["", "R0"], lens: [], bytes: 0, addr: 0 };
  const p = S2650.parseOpcode(s, {}, Parser);
  assert.equal(p.lens[0], 0x94);
});

// ─── Module: Immediate ────────────────────────────────────────────────────────

QUnit.module("S2650 - immediate");

QUnit.test("LODI,R0 $42", function (assert) {
  const s = { opcode: "LODI", params: ["", "R0 $42"], lens: [], bytes: 0, addr: 0 };
  const p = S2650.parseOpcode(s, {}, Parser);
  assert.equal(p.bytes, 2);
  assert.equal(p.lens[0], 0x04);
  assert.equal(ev(p.lens, 1, {}), 0x42);
});

QUnit.test("LODI,R3 255", function (assert) {
  const s = { opcode: "LODI", params: ["", "R3 255"], lens: [], bytes: 0, addr: 0 };
  const p = S2650.parseOpcode(s, {}, Parser);
  assert.equal(p.lens[0], 0x07);
  assert.equal(ev(p.lens, 1, {}), 0xFF);
});

QUnit.test("ADDI,R1 $10", function (assert) {
  const s = { opcode: "ADDI", params: ["", "R1 $10"], lens: [], bytes: 0, addr: 0 };
  const p = S2650.parseOpcode(s, {}, Parser);
  assert.equal(p.lens[0], 0x85);
  assert.equal(ev(p.lens, 1, {}), 0x10);
});

QUnit.test("SUBI,R2 5", function (assert) {
  const s = { opcode: "SUBI", params: ["", "R2 5"], lens: [], bytes: 0, addr: 0 };
  const p = S2650.parseOpcode(s, {}, Parser);
  assert.equal(p.lens[0], 0xA6);
  assert.equal(ev(p.lens, 1, {}), 5);
});

QUnit.test("COMI,R2 0", function (assert) {
  const s = { opcode: "COMI", params: ["", "R2 0"], lens: [], bytes: 0, addr: 0 };
  const p = S2650.parseOpcode(s, {}, Parser);
  assert.equal(p.lens[0], 0xE6);
  assert.equal(ev(p.lens, 1, {}), 0);
});

QUnit.test("TMI,R0 $F0", function (assert) {
  const s = { opcode: "TMI", params: ["", "R0 $F0"], lens: [], bytes: 0, addr: 0 };
  const p = S2650.parseOpcode(s, {}, Parser);
  assert.equal(p.lens[0], 0xF4);
  assert.equal(ev(p.lens, 1, {}), 0xF0);
});

// ─── Module: PSW ──────────────────────────────────────────────────────────────

QUnit.module("S2650 - PSW");

QUnit.test("SPSU", function (assert) {
  const s = { opcode: "SPSU", params: [], lens: [], bytes: 0, addr: 0 };
  const p = S2650.parseOpcode(s, {}, Parser);
  assert.equal(p.bytes, 1);
  assert.equal(p.lens[0], 0x12);
});

QUnit.test("SPSL", function (assert) {
  const s = { opcode: "SPSL", params: [], lens: [], bytes: 0, addr: 0 };
  const p = S2650.parseOpcode(s, {}, Parser);
  assert.equal(p.lens[0], 0x13);
});

QUnit.test("LPSU", function (assert) {
  const s = { opcode: "LPSU", params: [], lens: [], bytes: 0, addr: 0 };
  const p = S2650.parseOpcode(s, {}, Parser);
  assert.equal(p.lens[0], 0x92);
});

QUnit.test("LPSL", function (assert) {
  const s = { opcode: "LPSL", params: [], lens: [], bytes: 0, addr: 0 };
  const p = S2650.parseOpcode(s, {}, Parser);
  assert.equal(p.lens[0], 0x93);
});

QUnit.test("CPSU $20", function (assert) {
  const s = { opcode: "CPSU", params: ["$20"], lens: [], bytes: 0, addr: 0 };
  const p = S2650.parseOpcode(s, {}, Parser);
  assert.equal(p.bytes, 2);
  assert.equal(p.lens[0], 0x74);
  assert.equal(ev(p.lens, 1, {}), 0x20);
});

QUnit.test("CPSL $08", function (assert) {
  const s = { opcode: "CPSL", params: ["$08"], lens: [], bytes: 0, addr: 0 };
  const p = S2650.parseOpcode(s, {}, Parser);
  assert.equal(p.lens[0], 0x75);
  assert.equal(ev(p.lens, 1, {}), 0x08);
});

QUnit.test("PPSU $40", function (assert) {
  const s = { opcode: "PPSU", params: ["$40"], lens: [], bytes: 0, addr: 0 };
  const p = S2650.parseOpcode(s, {}, Parser);
  assert.equal(p.lens[0], 0x76);
  assert.equal(ev(p.lens, 1, {}), 0x40);
});

QUnit.test("PPSL $08", function (assert) {
  const s = { opcode: "PPSL", params: ["$08"], lens: [], bytes: 0, addr: 0 };
  const p = S2650.parseOpcode(s, {}, Parser);
  assert.equal(p.lens[0], 0x77);
  assert.equal(ev(p.lens, 1, {}), 0x08);
});

QUnit.test("TPSU $80", function (assert) {
  const s = { opcode: "TPSU", params: ["$80"], lens: [], bytes: 0, addr: 0 };
  const p = S2650.parseOpcode(s, {}, Parser);
  assert.equal(p.lens[0], 0xB4);
  assert.equal(ev(p.lens, 1, {}), 0x80);
});

QUnit.test("TPSL $01", function (assert) {
  const s = { opcode: "TPSL", params: ["$01"], lens: [], bytes: 0, addr: 0 };
  const p = S2650.parseOpcode(s, {}, Parser);
  assert.equal(p.lens[0], 0xB5);
  assert.equal(ev(p.lens, 1, {}), 0x01);
});

// ─── Module: Returns ──────────────────────────────────────────────────────────

QUnit.module("S2650 - returns");

QUnit.test("RETC,EQ", function (assert) {
  const s = { opcode: "RETC", params: ["", "EQ"], lens: [], bytes: 0, addr: 0 };
  const p = S2650.parseOpcode(s, {}, Parser);
  assert.equal(p.bytes, 1);
  assert.equal(p.lens[0], 0x14);
});

QUnit.test("RETC,LT", function (assert) {
  const s = { opcode: "RETC", params: ["", "LT"], lens: [], bytes: 0, addr: 0 };
  const p = S2650.parseOpcode(s, {}, Parser);
  assert.equal(p.lens[0], 0x16);
});

QUnit.test("RETC,UN", function (assert) {
  const s = { opcode: "RETC", params: ["", "UN"], lens: [], bytes: 0, addr: 0 };
  const p = S2650.parseOpcode(s, {}, Parser);
  assert.equal(p.lens[0], 0x17);
});

QUnit.test("RETE,UN", function (assert) {
  const s = { opcode: "RETE", params: ["", "UN"], lens: [], bytes: 0, addr: 0 };
  const p = S2650.parseOpcode(s, {}, Parser);
  assert.equal(p.lens[0], 0x37);
});

QUnit.test("RETE,EQ", function (assert) {
  const s = { opcode: "RETE", params: ["", "EQ"], lens: [], bytes: 0, addr: 0 };
  const p = S2650.parseOpcode(s, {}, Parser);
  assert.equal(p.lens[0], 0x34);
});

// ─── Module: I/O ──────────────────────────────────────────────────────────────

QUnit.module("S2650 - I/O");

QUnit.test("REDD,R0", function (assert) {
  const s = { opcode: "REDD", params: ["", "R0"], lens: [], bytes: 0, addr: 0 };
  const p = S2650.parseOpcode(s, {}, Parser);
  assert.equal(p.lens[0], 0x70);
});

QUnit.test("WRTD,R1", function (assert) {
  const s = { opcode: "WRTD", params: ["", "R1"], lens: [], bytes: 0, addr: 0 };
  const p = S2650.parseOpcode(s, {}, Parser);
  assert.equal(p.lens[0], 0xF1);
});

QUnit.test("REDC,R2", function (assert) {
  const s = { opcode: "REDC", params: ["", "R2"], lens: [], bytes: 0, addr: 0 };
  const p = S2650.parseOpcode(s, {}, Parser);
  assert.equal(p.lens[0], 0x32);
});

QUnit.test("WRTC,R0", function (assert) {
  const s = { opcode: "WRTC", params: ["", "R0"], lens: [], bytes: 0, addr: 0 };
  const p = S2650.parseOpcode(s, {}, Parser);
  assert.equal(p.lens[0], 0xB0);
});

QUnit.test("REDE,R3 $40", function (assert) {
  const s = { opcode: "REDE", params: ["", "R3 $40"], lens: [], bytes: 0, addr: 0 };
  const p = S2650.parseOpcode(s, {}, Parser);
  assert.equal(p.lens[0], 0x57);
  assert.equal(ev(p.lens, 1, {}), 0x40);
});

QUnit.test("WRTE,R0 $10", function (assert) {
  const s = { opcode: "WRTE", params: ["", "R0 $10"], lens: [], bytes: 0, addr: 0 };
  const p = S2650.parseOpcode(s, {}, Parser);
  assert.equal(p.lens[0], 0xD4);
  assert.equal(ev(p.lens, 1, {}), 0x10);
});

// ─── Module: Relative mode ────────────────────────────────────────────────────

QUnit.module("S2650 - relative mode");

// Instruction at $0100, IAR = $0102 after fetch
// LODR,R0 $0110 → offset = $0110 - $0102 = 14 = 0x0E
QUnit.test("LODR,R0 direct (label address)", function (assert) {
  const s = { opcode: "LODR", params: ["", "R0 $0110"], lens: [], bytes: 0, addr: 0x0100 };
  const p = S2650.parseOpcode(s, varsAt100, Parser);
  assert.equal(p.bytes, 2);
  assert.equal(p.lens[0], 0x08);
  assert.equal(ev(p.lens, 1, varsAt100), 0x0E, "offset = $0110 - $0102 = 14");
});

// LODR,R0 @$0110 → indirect, same offset, bit 7 set
QUnit.test("LODR,R0 indirect @addr", function (assert) {
  const s = { opcode: "LODR", params: ["", "R0 @$0110"], lens: [], bytes: 0, addr: 0x0100 };
  const p = S2650.parseOpcode(s, varsAt100, Parser);
  assert.equal(p.lens[0], 0x08);
  assert.equal(ev(p.lens, 1, varsAt100), 0x8E, "indirect: offset | 0x80");
});

// LODR,R0 *+14 → * = _PC = $0100 → target = $010E, offset = $010E - $0102 = 12
QUnit.test("LODR,R0 *+14 (current PC syntax)", function (assert) {
  const s = { opcode: "LODR", params: ["", "R0 *+14"], lens: [], bytes: 0, addr: 0x0100 };
  const p = S2650.parseOpcode(s, varsAt100, Parser);
  assert.equal(ev(p.lens, 1, varsAt100), 12, "offset = ($0100+14) - $0102 = 12");
});

// Instruction at $0200, IAR = $0202
// BCTR,EQ $0204 → offset = $0204 - $0202 = 2
QUnit.test("BCTR,EQ offset +2", function (assert) {
  const s = { opcode: "BCTR", params: ["", "EQ $0204"], lens: [], bytes: 0, addr: 0x0200 };
  const p = S2650.parseOpcode(s, varsAt200, Parser);
  assert.equal(p.bytes, 2);
  assert.equal(p.lens[0], 0x18, "opcode EQ=0");
  assert.equal(ev(p.lens, 1, varsAt200), 0x02);
});

QUnit.test("BCTR,GT negative offset", function (assert) {
  // BCTR,GT $0200 from $0202 → offset = $0200 - $0202 = -2 → encoded as 0x7E (0x80-2 = 0xFE & 0x7F = 0x7E)
  const s = { opcode: "BCTR", params: ["", "GT $0200"], lens: [], bytes: 0, addr: 0x0200 };
  const p = S2650.parseOpcode(s, varsAt200, Parser);
  assert.equal(p.lens[0], 0x19, "opcode GT=1");
  assert.equal(ev(p.lens, 1, varsAt200), 0x7E, "offset -2 → 0x7E");
});

QUnit.test("BCTR,LT offset +14", function (assert) {
  const s = { opcode: "BCTR", params: ["", "LT $0210"], lens: [], bytes: 0, addr: 0x0200 };
  const p = S2650.parseOpcode(s, varsAt200, Parser);
  assert.equal(p.lens[0], 0x1A, "opcode LT=2");
  assert.equal(ev(p.lens, 1, varsAt200), 0x0E);
});

QUnit.test("BCTR,UN offset +2", function (assert) {
  const s = { opcode: "BCTR", params: ["", "UN $0204"], lens: [], bytes: 0, addr: 0x0200 };
  const p = S2650.parseOpcode(s, varsAt200, Parser);
  assert.equal(p.lens[0], 0x1B, "opcode UN=3");
  assert.equal(ev(p.lens, 1, varsAt200), 0x02);
});

QUnit.test("BCFR,EQ offset +2", function (assert) {
  const s = { opcode: "BCFR", params: ["", "EQ $0204"], lens: [], bytes: 0, addr: 0x0200 };
  const p = S2650.parseOpcode(s, varsAt200, Parser);
  assert.equal(p.lens[0], 0x98);
  assert.equal(ev(p.lens, 1, varsAt200), 0x02);
});

// BSTR,UN $020C from $0200: offset = $020C - $0202 = 10
QUnit.test("BSTR,UN call relative offset +10", function (assert) {
  const s = { opcode: "BSTR", params: ["", "UN $020C"], lens: [], bytes: 0, addr: 0x0200 };
  const p = S2650.parseOpcode(s, varsAt200, Parser);
  assert.equal(p.lens[0], 0x3B);
  assert.equal(ev(p.lens, 1, varsAt200), 0x0A);
});

// BIRR,R1 $0210 from $0200: offset = $0210 - $0202 = 14
QUnit.test("BIRR,R1 relative", function (assert) {
  const s = { opcode: "BIRR", params: ["", "R1 $0210"], lens: [], bytes: 0, addr: 0x0200 };
  const p = S2650.parseOpcode(s, varsAt200, Parser);
  assert.equal(p.lens[0], 0xD9);
  assert.equal(ev(p.lens, 1, varsAt200), 0x0E);
});

// BDRR,R3 $020C from $0200: offset = $020C - $0202 = 10
QUnit.test("BDRR,R3 relative", function (assert) {
  const s = { opcode: "BDRR", params: ["", "R3 $020C"], lens: [], bytes: 0, addr: 0x0200 };
  const p = S2650.parseOpcode(s, varsAt200, Parser);
  assert.equal(p.lens[0], 0xFB);
  assert.equal(ev(p.lens, 1, varsAt200), 0x0A);
});

// ─── Module: Absolute mode (branch — full 15-bit) ─────────────────────────────

QUnit.module("S2650 - absolute branch");

QUnit.test("BCTA,UN $2000", function (assert) {
  const s = { opcode: "BCTA", params: ["", "UN $2000"], lens: [], bytes: 0, addr: 0 };
  const p = S2650.parseOpcode(s, {}, Parser);
  assert.equal(p.bytes, 3);
  assert.equal(p.lens[0], 0x1F);
  assert.equal(ev(p.lens, 1, {}), 0x20, "hr = addr>>8 = 0x20");
  assert.equal(ev(p.lens, 2, {}), 0x00, "dr = addr&0xFF = 0x00");
});

QUnit.test("BSTA,UN $4000", function (assert) {
  const s = { opcode: "BSTA", params: ["", "UN $4000"], lens: [], bytes: 0, addr: 0 };
  const p = S2650.parseOpcode(s, {}, Parser);
  assert.equal(p.lens[0], 0x3F);
  assert.equal(ev(p.lens, 1, {}), 0x40);
  assert.equal(ev(p.lens, 2, {}), 0x00);
});

QUnit.test("BCTA,EQ $0100", function (assert) {
  const s = { opcode: "BCTA", params: ["", "EQ $0100"], lens: [], bytes: 0, addr: 0 };
  const p = S2650.parseOpcode(s, {}, Parser);
  assert.equal(p.lens[0], 0x1C);
  assert.equal(ev(p.lens, 1, {}), 0x01);
  assert.equal(ev(p.lens, 2, {}), 0x00);
});

QUnit.test("BCFA,GT $1800", function (assert) {
  const s = { opcode: "BCFA", params: ["", "GT $1800"], lens: [], bytes: 0, addr: 0 };
  const p = S2650.parseOpcode(s, {}, Parser);
  assert.equal(p.lens[0], 0x9D);
  assert.equal(ev(p.lens, 1, {}), 0x18);
  assert.equal(ev(p.lens, 2, {}), 0x00);
});

QUnit.test("BXA $1000", function (assert) {
  const s = { opcode: "BXA", params: ["", "UN $1000"], lens: [], bytes: 0, addr: 0 };
  const p = S2650.parseOpcode(s, {}, Parser);
  assert.equal(p.lens[0], 0x9F);
  assert.equal(ev(p.lens, 1, {}), 0x10);
  assert.equal(ev(p.lens, 2, {}), 0x00);
});

QUnit.test("BSXA $0200", function (assert) {
  const s = { opcode: "BSXA", params: ["", "UN $0200"], lens: [], bytes: 0, addr: 0 };
  const p = S2650.parseOpcode(s, {}, Parser);
  assert.equal(p.lens[0], 0xBF);
  assert.equal(ev(p.lens, 1, {}), 0x02);
  assert.equal(ev(p.lens, 2, {}), 0x00);
});

// ─── Module: Absolute mode (data — page-confined) ─────────────────────────────

QUnit.module("S2650 - absolute data");

// At page 0 (.org $0000), data addressing uses only bits 12:0 of addr
QUnit.test("LODA,R0 $0800 direct", function (assert) {
  const s = { opcode: "LODA", params: ["", "R0 $0800"], lens: [], bytes: 0, addr: 0 };
  const p = S2650.parseOpcode(s, {}, Parser);
  assert.equal(p.bytes, 3);
  assert.equal(p.lens[0], 0x0C);
  assert.equal(ev(p.lens, 1, {}), 0x08, "hr: bits 12:8 = 0x08");
  assert.equal(ev(p.lens, 2, {}), 0x00, "dr: bits 7:0 = 0x00");
});

QUnit.test("LODA,R0 @$0800 indirect", function (assert) {
  const s = { opcode: "LODA", params: ["", "R0 @$0800"], lens: [], bytes: 0, addr: 0 };
  const p = S2650.parseOpcode(s, {}, Parser);
  assert.equal(p.lens[0], 0x0C);
  assert.equal(ev(p.lens, 1, {}), 0x88, "hr: indirect(0x80) | 0x08");
  assert.equal(ev(p.lens, 2, {}), 0x00);
});

QUnit.test("LODA,R1 $0800,R2+ auto-increment", function (assert) {
  const s = { opcode: "LODA", params: ["", "R1 $0800", "R2+"], lens: [], bytes: 0, addr: 0 };
  const p = S2650.parseOpcode(s, {}, Parser);
  assert.equal(p.lens[0], 0x0D);
  assert.equal(ev(p.lens, 1, {}), 0x28, "hr: auto-inc(0x20) | 0x08");
  assert.equal(ev(p.lens, 2, {}), 0x00);
});

QUnit.test("LODA,R2 $0800,R3- auto-decrement", function (assert) {
  const s = { opcode: "LODA", params: ["", "R2 $0800", "R3-"], lens: [], bytes: 0, addr: 0 };
  const p = S2650.parseOpcode(s, {}, Parser);
  assert.equal(p.lens[0], 0x0E);
  assert.equal(ev(p.lens, 1, {}), 0x48, "hr: auto-dec(0x40) | 0x08");
  assert.equal(ev(p.lens, 2, {}), 0x00);
});

QUnit.test("LODA,R0 $0810,R1 indexed", function (assert) {
  const s = { opcode: "LODA", params: ["", "R0 $0810", "R1"], lens: [], bytes: 0, addr: 0 };
  const p = S2650.parseOpcode(s, {}, Parser);
  assert.equal(p.lens[0], 0x0C);
  assert.equal(ev(p.lens, 1, {}), 0x68, "hr: indexed(0x60) | 0x08");
  assert.equal(ev(p.lens, 2, {}), 0x10);
});

QUnit.test("STRA,R1 $0810 store", function (assert) {
  const s = { opcode: "STRA", params: ["", "R1 $0810"], lens: [], bytes: 0, addr: 0 };
  const p = S2650.parseOpcode(s, {}, Parser);
  assert.equal(p.lens[0], 0xCD);
  assert.equal(ev(p.lens, 1, {}), 0x08);
  assert.equal(ev(p.lens, 2, {}), 0x10);
});

QUnit.test("ADDA,R0 $0400", function (assert) {
  const s = { opcode: "ADDA", params: ["", "R0 $0400"], lens: [], bytes: 0, addr: 0 };
  const p = S2650.parseOpcode(s, {}, Parser);
  assert.equal(p.lens[0], 0x8C);
  assert.equal(ev(p.lens, 1, {}), 0x04);
  assert.equal(ev(p.lens, 2, {}), 0x00);
});
