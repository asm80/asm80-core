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
