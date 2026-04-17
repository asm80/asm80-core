/**
 * Tests for 6809/HD6309 linker: immediate relocation of DSEG symbols.
 *
 * BUG: LDD #g where g is in .dseg left the operand as 0x0000 instead of
 * the absolute DSEG address, because pass2 called Parser.usage("#G", ...)
 * and the leading '#' prevented the parser from recognising 'G' as a symbol
 * reference, so op.usage was never populated and no relocation record was
 * created in the object module.
 */

import { M6809 } from "../cpu/m6809.js";
import { pass1 } from "../pass1.js";
import { pass2 } from "../pass2.js";
import { objCode, linkModules } from "../objcode.js";
import * as Parser from "../parser.js";
import QUnit from "qunit";

QUnit.module("link-6809 imm-dseg relocation");

const readFile = () => "";

const assemble = async (src, name = "test") => {
    const opts = {
        assembler: M6809,
        readFile,
        PRAGMAS: [],
        endian: M6809.endian,
        xref: {},
    };
    let o = await Parser.parse(src, opts);
    let vx = await pass1(o, null, opts);
    vx = await pass1(vx[0], vx[1], opts);
    vx = await pass1(vx[0], vx[1], opts);
    vx = await pass1(vx[0], vx[1], opts);
    vx[1]["__PRAGMAS"] = opts.PRAGMAS;
    vx = pass2(vx, opts);
    return objCode(vx[0], vx[1], opts, name);
};

const link = (modules, segments = { CSEG: "0x0100", DSEG: "0x0200" }, vars = {}) => {
    const cfg = { segments, vars, endian: M6809.endian };
    return linkModules(cfg, modules, []);
};

/** Get bytes at a specific absolute address from the linked output. */
const bytesAt = (out, addr, count) => {
    for (const block of out.dump) {
        if (block.addr <= addr && addr < block.addr + block.lens.length) {
            const off = addr - block.addr;
            return block.lens.slice(off, off + count);
        }
    }
    return [];
};

// ── BUG: LDD #dseg_symbol operand not relocated ───────────────────────────────

QUnit.test("LDD #dseg_symbol is relocated to absolute DSEG address", async assert => {
    // g is at DSEG+0 = 0x0200 (with linker script DSEG=0x0200)
    // LDD #g should encode 0x0200 as the immediate operand
    const src = `
  .pragma module
  .dseg
g: .db 89

  .cseg
  .export main
main:
  LDD #g
`;
    const obj = await assemble(src);
    const out = link([obj]);
    // LDD imm16 = 0xCC, hi, lo  =>  bytes at CSEG=0x0100: CC 02 00
    const bytes = bytesAt(out, 0x0100, 3);
    assert.strictEqual(bytes[0], 0xCC, "opcode LDD imm = 0xCC");
    assert.strictEqual(bytes[1], 0x02, "operand hi byte = 0x02");
    assert.strictEqual(bytes[2], 0x00, "operand lo byte = 0x00");
});

QUnit.test("LDD #dseg_symbol+offset is relocated correctly", async assert => {
    // padding occupies DSEG+0..1, g is at DSEG+2 = 0x0202
    const src = `
  .pragma module
  .dseg
padding: .db 0
         .db 0
g: .db 89

  .cseg
  .export main
main:
  LDD #g
`;
    const obj = await assemble(src);
    const out = link([obj]);
    const bytes = bytesAt(out, 0x0100, 3);
    assert.strictEqual(bytes[0], 0xCC, "opcode LDD imm = 0xCC");
    assert.strictEqual(bytes[1], 0x02, "operand hi byte = 0x02");
    assert.strictEqual(bytes[2], 0x02, "operand lo byte = 0x02");
});

// ── BUG: PSHS with register name that shadows a BSSEG label ──────────────────
// PSHS A where label 'A' exists in BSSEG must not trigger relocation.
// Before the fix, wia defaulted to 0 and get16 read the opcode byte 0x34 as the
// high byte of the address, corrupting the instruction during linking.

QUnit.test("PSHS A not corrupted when label A exists in BSSEG", async assert => {
    // label 'a' is in BSSEG; PSHS A must encode as [0x34, 0x02] regardless
    const src = `
  .pragma module
  .bsseg
a: .ds 1

  .cseg
  .export main
main:
  PSHS A
`;
    const obj = await assemble(src);
    const out = link([obj], { CSEG: "0x0100", BSSEG: "0x0200" });
    // PSHS A = 0x34 0x02, must not be altered by linker
    const bytes = bytesAt(out, 0x0100, 2);
    assert.strictEqual(bytes[0], 0x34, "opcode PSHS = 0x34");
    assert.strictEqual(bytes[1], 0x02, "register mask A = 0x02");
});

// ══════════════════════════════════════════════════════════════════════════════
// Direct-vs-linked comparison tests
//
// Each test assembles the SAME program twice:
//   1. Directly, with .org to fix the base address (reference output)
//   2. As a .pragma module, then linked at the same base address
// The two outputs must be byte-for-byte identical.
// ══════════════════════════════════════════════════════════════════════════════

const CSEG_BASE = 0x0100;
const DSEG_BASE = 0x0200;
const BSSEG_BASE = 0x0300;

/**
 * Assemble src directly (no module) with .org at CSEG_BASE.
 * Returns flat byte array starting at CSEG_BASE.
 */
const assembleDirect = async (body) => {
    const src = `  .cpu m6809\n  .org ${CSEG_BASE}\n${body}`;
    const opts = {
        assembler: M6809,
        readFile,
        PRAGMAS: [],
        endian: M6809.endian,
        xref: {},
    };
    let o = await Parser.parse(src, opts);
    let vx = await pass1(o, null, opts);
    vx = await pass1(vx[0], vx[1], opts);
    vx = await pass1(vx[0], vx[1], opts);
    vx = await pass1(vx[0], vx[1], opts);
    vx[1]["__PRAGMAS"] = opts.PRAGMAS;
    vx = pass2(vx, opts);
    // Collect bytes from CSEG_BASE onwards
    const result = [];
    for (const block of vx[0]) {
        if (block.lens && block.addr >= CSEG_BASE) {
            const off = block.addr - CSEG_BASE;
            for (let i = 0; i < block.lens.length; i++) {
                result[off + i] = block.lens[i];
            }
        }
    }
    return result;
};

/**
 * Assemble src as module, link it at CSEG_BASE/DSEG_BASE/BSSEG_BASE.
 * Returns flat byte array starting at CSEG_BASE (same format as assembleDirect).
 */
const assembleLinked = async (body) => {
    const src = `  .pragma module\n  .cseg\n  .export main\nmain:\n${body}`;
    const obj = await assemble(src);
    const out = link([obj], {
        CSEG: `0x${CSEG_BASE.toString(16)}`,
        DSEG: `0x${DSEG_BASE.toString(16)}`,
        BSSEG: `0x${BSSEG_BASE.toString(16)}`,
    });
    const result = [];
    for (const block of out.dump) {
        if (block.addr >= CSEG_BASE) {
            const off = block.addr - CSEG_BASE;
            for (let i = 0; i < block.lens.length; i++) {
                result[off + i] = block.lens[i];
            }
        }
    }
    return result;
};

/** Assert that direct and linked outputs match byte for byte. */
const assertSameOutput = async (assert, label, body) => {
    const direct = await assembleDirect(body);
    const linked = await assembleLinked(body);
    assert.deepEqual(linked, direct, `${label}: linked output matches direct assembly`);
};

// ── inherent instructions ─────────────────────────────────────────────────────

QUnit.test("direct==linked: inherent instructions (NOP, RTS, etc.)", async assert => {
    await assertSameOutput(assert, "inherent", `
  NOP
  RTS
  RTI
  NOP
`);
});

// ── immediate mode ────────────────────────────────────────────────────────────

QUnit.test("direct==linked: immediate instructions with constants", async assert => {
    await assertSameOutput(assert, "immediate", `
  LDA #$42
  LDB #0
  LDD #$1234
  LDX #$ABCD
  LDU #$0100
`);
});

// ── extended addressing ───────────────────────────────────────────────────────

QUnit.test("direct==linked: extended addressing to absolute addresses", async assert => {
    await assertSameOutput(assert, "extended abs", `
  LDA $1234
  STA $5678
  LDD $ABCD
`);
});

// ── branch instructions ───────────────────────────────────────────────────────

QUnit.test("direct==linked: short branches (BRA, BEQ, BNE)", async assert => {
    await assertSameOutput(assert, "short branch", `
loop:
  NOP
  BRA loop
skip:
  NOP
  BEQ skip
  NOP
  BNE skip
`);
});

QUnit.test("direct==linked: long branches (LBRA, LBEQ, LBSR)", async assert => {
    await assertSameOutput(assert, "long branch", `
start:
  NOP
  LBRA start
mid:
  NOP
  NOP
  LBEQ mid
  LBSR start
`);
});

// ── data directives with forward/backward cseg references ─────────────────────

QUnit.test("direct==linked: FCB/FDB with CSEG label references", async assert => {
    await assertSameOutput(assert, "FCB/FDB cseg refs", `
  NOP
  NOP
handler:
  RTS
table:
  FDB handler
  FDB table
`);
});

// ── BSR / JSR ─────────────────────────────────────────────────────────────────

QUnit.test("direct==linked: BSR and JSR to local labels", async assert => {
    await assertSameOutput(assert, "BSR/JSR", `
  BSR sub
  JSR sub
  RTS
sub:
  NOP
  RTS
`);
});

// ── indexed addressing ────────────────────────────────────────────────────────

QUnit.test("direct==linked: indexed addressing modes", async assert => {
    await assertSameOutput(assert, "indexed", `
  LDA ,X
  LDA ,Y
  LDA 5,X
  LDA -3,Y
  LDA ,X+
  LDA ,X++
  LDA ,-X
  LDA ,--X
`);
});

// ── indexed 5-bit offset not corrupted when register name shadows a BSSEG label ─
// LEAS 2,S where label 'S' exists in BSSEG must not trigger relocation.
// The 5-bit offset is baked into the postbyte — there is no 16-bit address field.
// Before the fix, pass2 picked up 'S' as a BSSEG symbol usage, creating a false
// relocation record with wia=0, and the linker added BSSEG_base to the opcode byte
// (0x32 → 0x33 = LEAU instead of LEAS).

QUnit.test("LEAS 2,S not corrupted when label S exists in BSSEG", async assert => {
    const src = `
  .pragma module
  .bsseg
s: .ds 1

  .cseg
  .export main
main:
  LEAS 2,S
`;
    const obj = await assemble(src);
    const out = link([obj], { CSEG: "0x0100", BSSEG: "0x0200" });
    const bytes = bytesAt(out, 0x0100, 2);
    assert.strictEqual(bytes[0], 0x32, "opcode LEAS = 0x32 (not corrupted to LEAU 0x33)");
    assert.strictEqual(bytes[1], 0x62, "postbyte 2,S = 0x62");
});

// ── indirect extended via extern (JMP [addr]) ─────────────────────────────────
// BUG: JMP [icall] where icall is an .extern symbol produced 6E 9F 00 00
// instead of 6E 9F 00 0E because:
//   1. s.wia was not set for indirect extended mode → linker defaulted to wia=0
//      and patched the opcode bytes instead of the address bytes
//   2. Parser.usage("[ICALL]", ...) threw on '[' → op.usage was never set
//      → no external relocation record was created

QUnit.test("JMP [extern_symbol] resolves address from linker vars", async assert => {
    const src = `
  .pragma module
  .extern icall
  .export __icall
__icall:
  jmp [icall]
`;
    const obj = await assemble(src);
    const out = link(
        [obj],
        { CSEG: "0x0100" },
        { icall: "0x000e" }
    );
    // JMP extended indirect = 6E 9F <addr_hi> <addr_lo>
    const bytes = bytesAt(out, 0x0100, 4);
    assert.strictEqual(bytes[0], 0x6E, "opcode JMP indexed = 0x6E");
    assert.strictEqual(bytes[1], 0x9F, "postbyte extended indirect = 0x9F");
    assert.strictEqual(bytes[2], 0x00, "address hi byte = 0x00");
    assert.strictEqual(bytes[3], 0x0E, "address lo byte = 0x0E");
});
