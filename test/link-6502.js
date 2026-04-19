/**
 * Tests for 6502 module/linker bugs:
 * BUG1: .dw dseg_label gives only base address, ignores offset
 * BUG2: .db dseg_label gives only base address, ignores offset
 * BUG3: lda cseg_label+N picks ZP mode when offset is small
 * BUG4: .dw cseg_label (forward ref) gives wrong value
 */

import { C6502 } from "../cpu/c6502.js";
import { pass1 } from "../pass1.js";
import { pass2 } from "../pass2.js";
import { objCode, linkModules } from "../objcode.js";
import * as Parser from "../parser.js";
import QUnit from "qunit";

QUnit.module("link-6502 bugs");

const readFile = () => "";

const assemble = async (src, name = "test") => {
    const opts = {
        assembler: C6502,
        readFile,
        PRAGMAS: [],
        endian: C6502.endian,
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

const link = (modules, segments = { CSEG: "0xE000", DSEG: "0x0018" }) => {
    const cfg = { segments, vars: {}, endian: C6502.endian };
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

// ── BUG 1: .dw dseg_label ignores offset ─────────────────────────────────────

QUnit.test("BUG1: .dw dseg_label preserves offset", async assert => {
    const src = `
  .pragma module
  .dseg
padding:
  .db 0
  .db 0
  .db 0
foo:
  .db 0
bar:
  .db 0
  .cseg
  .export main
main:
foo_ptr:
  .dw foo
bar_ptr:
  .dw bar
`;
    const obj = await assemble(src);
    const out = link([obj]);
    // padding occupies DSEG+0..2, foo is at DSEG+3=$001B, bar is at DSEG+4=$001C
    // foo_ptr is at CSEG+0=$E000, bar_ptr is at CSEG+2=$E002
    const fooPtr = bytesAt(out, 0xE000, 2);
    const barPtr = bytesAt(out, 0xE002, 2);
    assert.strictEqual(fooPtr[0], 0x1B, "foo_ptr lo = $1B");
    assert.strictEqual(fooPtr[1], 0x00, "foo_ptr hi = $00");
    assert.strictEqual(barPtr[0], 0x1C, "bar_ptr lo = $1C");
    assert.strictEqual(barPtr[1], 0x00, "bar_ptr hi = $00");
});

// ── BUG 2: .db dseg_label ignores offset ─────────────────────────────────────

QUnit.test("BUG2: .db dseg_label preserves offset", async assert => {
    const src = `
  .pragma module
  .dseg
foo:
  .db 0
bar:
  .db 0
  .cseg
  .export main
main:
foo_lo:
  .db foo
bar_lo:
  .db bar
`;
    const obj = await assemble(src);
    const out = link([obj]);
    // foo at DSEG+0=$0018, bar at DSEG+1=$0019
    // foo_lo at CSEG+0=$E000, bar_lo at CSEG+1=$E001
    const fooLo = bytesAt(out, 0xE000, 1);
    const barLo = bytesAt(out, 0xE001, 1);
    assert.strictEqual(fooLo[0], 0x18, "foo_lo = $18");
    assert.strictEqual(barLo[0], 0x19, "bar_lo = $19");
});

// ── BUG 3: lda cseg_label+N picks ZP mode ────────────────────────────────────

QUnit.test("BUG3: lda cseg_label+N uses absolute mode", async assert => {
    const src = `
  .pragma module
  .cseg
  .export main
main:
instr_slot:
  lda $18
  lda instr_slot+1
`;
    const obj = await assemble(src);
    const out = link([obj]);
    // instr_slot at $E000 (2-byte ZP instruction: A5 18)
    // lda instr_slot+1 should be absolute at $E002: AD 01 E0
    const bytes = bytesAt(out, 0xE002, 3);
    assert.strictEqual(bytes[0], 0xAD, "lda absolute opcode = $AD");
    assert.strictEqual(bytes[1], 0x01, "address lo = $01");
    assert.strictEqual(bytes[2], 0xE0, "address hi = $E0");
});

// ── BUG 4: .dw cseg_label (forward ref) ──────────────────────────────────────

QUnit.test("BUG4: .dw cseg_label forward ref resolves correctly", async assert => {
    const src = `
  .pragma module
  .cseg
  .export main
main:
ptr_slot:
  .dw myfunc
  nop
  nop
  nop
myfunc:
  rts
`;
    const obj = await assemble(src);
    const out = link([obj]);
    // ptr_slot at $E000 (2 bytes), then 3 nops, myfunc at $E000+2+3=$E005
    const ptrBytes = bytesAt(out, 0xE000, 2);
    assert.strictEqual(ptrBytes[0], 0x05, "ptr_slot lo = $05");
    assert.strictEqual(ptrBytes[1], 0xE0, "ptr_slot hi = $E0");
});

QUnit.test("E2E: extern name@zpseg forces zpg and links with ZPSEG base", async assert => {
    const zpMod = await assemble(`
  .pragma module
  .segment ZPSEG
  .export last_key
last_key:
  .db 0
`);
    const mainMod = await assemble(`
  .pragma module
  .extern last_key@zpseg
  .cseg
  .export main
main:
  lda last_key
  rts
`);
    const out = link([mainMod, zpMod], { CSEG: "0x8000", ZPSEG: "0x0000" });
    const lda = bytesAt(out, 0x8000, 2);
    const rts = bytesAt(out, 0x8002, 1);
    assert.strictEqual(lda[0], 0xA5, "LDA zpg opcode");
    assert.strictEqual(lda[1], 0x00, "ZP address 0x00");
    assert.strictEqual(rts[0], 0x60, "RTS");
});
