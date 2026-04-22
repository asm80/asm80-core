/**
 * Tests for segment propagation through .equ directives.
 *
 * A .equ symbol that references a relocatable symbol should inherit
 * the segment of that symbol, so it exports correctly for linking.
 */

import { compile } from "../asm.js";
import { objCode, linkModules } from "../objcode.js";
import { I8080 } from "../cpu/i8080.js";

import QUnit from "qunit";

QUnit.module("equ-segment");

const compileObj = async (src) => {
    const result = await compile(src, { readFile: () => null }, { assembler: I8080 });
    return objCode(result.dump, result.vars, { endian: false, assembler: I8080 });
};

// T1 — BSSEG: alias .equ base + 3 should export in BSSEG
QUnit.test("T1: equ alias into BSSEG exports with BSSEG segment", async (assert) => {
    const src = `
.pragma module
.bsseg
BASE: .ds 10
.cseg
.export ALIAS
ALIAS .equ BASE + 3
`;
    const obj = await compileObj(src);
    assert.equal(obj.exports["ALIAS"].seg, "BSSEG", "ALIAS should be in BSSEG");
    assert.equal(obj.exports["ALIAS"].addr, 3, "ALIAS offset should be 3");
});

// T2 — CSEG: alias .equ routine + 2 should export in CSEG
QUnit.test("T2: equ alias into CSEG exports with CSEG segment", async (assert) => {
    const src = `
.pragma module
.cseg
ROUTINE: NOP
.export ENTRY
ENTRY .equ ROUTINE + 2
`;
    const obj = await compileObj(src);
    assert.equal(obj.exports["ENTRY"].seg, "CSEG", "ENTRY should be in CSEG");
    assert.equal(obj.exports["ENTRY"].addr, 2, "ENTRY offset should be 2");
});

// T3 — DSEG: alias .equ table + 2 should export in DSEG
QUnit.test("T3: equ alias into DSEG exports with DSEG segment", async (assert) => {
    const src = `
.pragma module
.dseg
TABLE: .db 1, 2, 3, 4, 5
.cseg
.export THIRD
THIRD .equ TABLE + 2
`;
    const obj = await compileObj(src);
    assert.equal(obj.exports["THIRD"].seg, "DSEG", "THIRD should be in DSEG");
    assert.equal(obj.exports["THIRD"].addr, 2, "THIRD offset should be 2");
});

// T4 — zero offset: alias .equ base + 0 should have same segment as base
QUnit.test("T4: equ with zero offset keeps segment of base", async (assert) => {
    const src = `
.pragma module
.bsseg
BASE: .ds 5
.cseg
.export ALIAS
ALIAS .equ BASE + 0
`;
    const obj = await compileObj(src);
    assert.equal(obj.exports["ALIAS"].seg, "BSSEG", "ALIAS with +0 should be in BSSEG");
    assert.equal(obj.exports["ALIAS"].addr, 0, "ALIAS offset should be 0");
});

// T5 — multiple exports from same base
QUnit.test("T5: multiple equ exports from same base each get correct offset and segment", async (assert) => {
    const src = `
.pragma module
.bsseg
BASE: .ds 10
.cseg
.export SYM_A
.export SYM_B
SYM_A .equ BASE + 0
SYM_B .equ BASE + 2
`;
    const obj = await compileObj(src);
    assert.equal(obj.exports["SYM_A"].seg, "BSSEG", "SYM_A should be in BSSEG");
    assert.equal(obj.exports["SYM_A"].addr, 0, "SYM_A offset should be 0");
    assert.equal(obj.exports["SYM_B"].seg, "BSSEG", "SYM_B should be in BSSEG");
    assert.equal(obj.exports["SYM_B"].addr, 2, "SYM_B offset should be 2");
});

// T7 — forward reference: base defined after alias use
QUnit.test("T7: equ with forward reference resolves correctly", async (assert) => {
    const src = `
.pragma module
.cseg
.export ALIAS
ALIAS .equ BASE + 3
.bsseg
BASE: .ds 10
`;
    const obj = await compileObj(src);
    assert.equal(obj.exports["ALIAS"].seg, "BSSEG", "forward-ref ALIAS should be in BSSEG");
    assert.equal(obj.exports["ALIAS"].addr, 3, "forward-ref ALIAS offset should be 3");
});

// T8 — difference of two symbols in same segment → absolute
QUnit.test("T8: equ difference of same-segment symbols produces absolute result", async (assert) => {
    const src = `
.pragma module
.bsseg
BUF_START: .ds 20
BUF_END:
.cseg
.export BUF_SIZE
BUF_SIZE .equ BUF_END - BUF_START
`;
    const obj = await compileObj(src);
    assert.notEqual(obj.exports["BUF_SIZE"].seg, "BSSEG", "BUF_SIZE should not be in BSSEG");
    assert.equal(obj.exports["BUF_SIZE"].addr, 20, "BUF_SIZE should equal 20");
});

// T9 — error: sum of two relocatable symbols
QUnit.test("T9: equ sum of two relocatable symbols throws error", async (assert) => {
    const src = `
.pragma module
.bsseg
SYM_A: .ds 5
SYM_B: .ds 5
.cseg
ALIAS .equ SYM_A + SYM_B
`;
    try {
        await compileObj(src);
        assert.ok(false, "should have thrown an error");
    } catch (e) {
        const msg = (e && e.error && e.error.msg) || (e && e.msg) || JSON.stringify(e);
        assert.ok(/segment|relocat/i.test(msg), `error message mentions segment: ${msg}`);
    }
});

// T10 — error: difference of symbols from different segments
QUnit.test("T10: equ difference of symbols from different segments throws error", async (assert) => {
    const src = `
.pragma module
.cseg
CSYM: NOP
.bsseg
BSYM: .ds 1
.cseg
ALIAS .equ CSYM - BSYM
`;
    try {
        await compileObj(src);
        assert.ok(false, "should have thrown an error");
    } catch (e) {
        const msg = (e && e.error && e.error.msg) || (e && e.msg) || JSON.stringify(e);
        assert.ok(/segment|relocat/i.test(msg), `error message mentions segment: ${msg}`);
    }
});

// T1-link: linked module resolves BSSEG alias to correct address in instruction bytes
QUnit.test("T1-link: linked module resolves BSSEG alias address in LXI instruction", async (assert) => {
    // Module A: BASE in BSSEG, ALIAS = BASE + 3 exported, LXI H,ALIAS uses the address
    const srcA = `
.pragma module
.bsseg
BASE: .ds 10
.cseg
.export ALIAS
ALIAS .equ BASE + 3
LXI H, ALIAS
`;
    const resultA = await compile(srcA, { readFile: () => null }, { assembler: I8080 });
    const objA = objCode(resultA.dump, resultA.vars, { endian: false, assembler: I8080 });

    const linked = linkModules(
        { endian: false, segments: { CSEG: "0x0100", BSSEG: "0x8000" }, vars: {} },
        [objA],
        []
    );

    // LXI H, 0x8003 = 0x21, 0x03, 0x80 (little-endian)
    const allBytes = linked.dump.flatMap(s => s.lens);
    const lxiIndex = allBytes.indexOf(0x21);
    assert.ok(lxiIndex >= 0, "LXI H instruction found in output");
    assert.equal(allBytes[lxiIndex + 1], 0x03, "LXI H low byte = 0x03 (BSSEG base 0x8000 + offset 3)");
    assert.equal(allBytes[lxiIndex + 2], 0x80, "LXI H high byte = 0x80");
});
