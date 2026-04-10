import { asm } from "../asm.js";
import { Z80 } from "../cpu/z80.js";
import QUnit from "qunit";

QUnit.module("relaxed mode");

const fs = { readFile: async () => null, childOpts: null, resolvePath: null };
const z80opts = { assembler: Z80, relaxed: true };

QUnit.test("relaxed: collects multiple errors and throws { errors }",
  async (assert) => {
    try {
      await asm.compile(
        "LD A, B\nBADINSTR\nLD B, C\nALSOBAD\nLD H, L",
        fs,
        z80opts
      );
      assert.ok(false, "should have thrown");
    } catch (e) {
      assert.ok(Array.isArray(e.errors), "throws { errors: [] }");
      assert.ok(e.errors.length >= 2, "collected at least 2 errors");
    }
  }
);

QUnit.test("relaxed: no errors returns result normally", async (assert) => {
  const result = await asm.compile(
    "LD A, B\nLD B, C",
    fs,
    z80opts
  );
  assert.ok(result.dump, "returns dump");
});

import { parseLine } from "../parseLine.js";
import { parse } from "../parser.js";

QUnit.test("parseLine: relaxed returns marker on bad instruction", (assert) => {
  const opts = { assembler: Z80, relaxed: true, errors: [] };
  const s = { line: "BADINSTR", numline: 5 };
  const result = parseLine(s, {}, opts);
  assert.ok(result._parseError, "returns _parseError marker");
  assert.equal(opts.errors.length, 1, "error pushed to opts.errors");
  assert.ok(opts.errors[0].msg, "error has msg");
});

QUnit.test("parseLine: normal mode still throws on bad instruction", (assert) => {
  const opts = { assembler: Z80 };
  const s = { line: "BADINSTR", numline: 5 };
  assert.throws(
    () => parseLine(s, {}, opts),
    (e) => !!e.msg,
    "throws error object with msg"
  );
});

QUnit.test("parser: _parseError markers are filtered before unroll()", async (assert) => {
  const opts = { assembler: Z80, relaxed: true, errors: [],
    readFile: async () => null, childOpts: null, resolvePath: null,
    includedFiles: {}, PRAGMAS: [] };
  const result = await parse("LD A, B\nBADINSTR\nLD B, C", opts);
  assert.equal(result.filter(l => !l._parseError && l.opcode).length, 2,
    "only valid lines reach unroll");
  assert.ok(opts.errors.length >= 1, "error was collected");
});

QUnit.test("relaxed: pass1 error on one line does not stop other lines",
  async (assert) => {
    const src = "LABEL1: LD A, B\nBADINSTR\nLABEL2: LD B, C";
    try {
      await asm.compile(src, fs, z80opts);
      assert.ok(false, "should throw");
    } catch (e) {
      assert.ok(Array.isArray(e.errors), "throws errors array");
      assert.ok(e.errors.length >= 1, "at least one error collected");
    }
  }
);

QUnit.test("relaxed: INCLUDE of missing file collects error and continues",
  async (assert) => {
    const src = "LD A, B\n.INCLUDE \"missing.asm\"\nLD B, C";
    try {
      await asm.compile(src, fs, z80opts);
      assert.ok(false, "should throw");
    } catch (e) {
      assert.ok(Array.isArray(e.errors), "throws errors array");
      const incErr = e.errors.find(e => /missing\.asm|not found/i.test(e.msg));
      assert.ok(incErr, "error about missing file is present");
    }
  }
);

QUnit.test("relaxed: full pipeline collects errors from multiple phases",
  async (assert) => {
    const src = [
      "LD A, B",
      "BADINSTR1",
      "LD B, C",
      "BADINSTR2",
      "LD H, L",
    ].join("\n");
    try {
      await asm.compile(src, fs, z80opts);
      assert.ok(false, "should throw");
    } catch (e) {
      assert.ok(Array.isArray(e.errors), "throws errors array");
      assert.ok(e.errors.length >= 2, "collects 2+ errors");
      assert.ok(e.errors.every(err => err.msg), "all errors have msg");
      assert.ok(e.errors.every(err => err.wline), "all errors have wline");
    }
  }
);
