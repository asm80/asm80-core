import { Z80 } from "../cpu/z80.js";
import { pass1 } from "../pass1.js";
import { pass2 } from "../pass2.js";
import { objCode } from "../objcode.js";
import QUnit from "qunit";
import * as Parser from "../parser.js";
import { asyncThrows } from "./_asyncThrows.js";

QUnit.module("asm-frame");

const readFile = () => "";

const doObjCode = async (src, showError = false) => {
  const opts = {
    assembler: Z80,
    readFile,
    PRAGMAS: ["MODULE"],
    endian: Z80.endian,
  };
  try {
    let o = await Parser.parse(src, opts);
    let vx = await pass1(o, null, opts);
    vx = await pass1(vx[0], vx[1], opts);
    vx = await pass1(vx[0], vx[1], opts);
    vx = await pass1(vx[0], vx[1], opts);
    vx = pass2(vx, opts);
    return objCode(vx[0], vx[1], opts, "test");
  } catch (e) {
    if (showError) console.log(e);
    throw e;
  }
};

QUnit.test("opts.frames is reset on each pass1 run", async (assert) => {
  const opts = { assembler: Z80, readFile, PRAGMAS: ["MODULE"], endian: Z80.endian };
  const src = `.pragma module\n.frame putc, size=1, reentrant=0\nputc: RET\n.export putc`;
  const o = await Parser.parse(src, opts);
  await pass1(o, null, opts);
  assert.ok(opts.frames, "opts.frames initialized after first pass");
  await pass1(o, null, opts);
  assert.ok(true, "second pass1 run does not throw duplicate error");
});

QUnit.test(".frame outside MODULE throws error", async (assert) => {
  const opts = { assembler: Z80, readFile, PRAGMAS: [], endian: Z80.endian };
  const src = `.frame putc, size=1, reentrant=0\nputc: RET`;
  const o = await Parser.parse(src, opts);
  await asyncThrows(assert, () => pass1(o, null, opts),
    (e) => /not allowed out of modules/i.test(e.msg));
});

QUnit.test(".frame stores correct record in opts.frames", async (assert) => {
  const opts = { assembler: Z80, readFile, PRAGMAS: ["MODULE"], endian: Z80.endian };
  const src = `.pragma module\n.frame putc, size=1, reentrant=0\nputc: RET\n.export putc`;
  const o = await Parser.parse(src, opts);
  await pass1(o, null, opts);
  const rec = opts.frames["PUTC"];
  assert.ok(rec, "frame record stored under uppercase key");
  assert.strictEqual(rec.size, 1);
  assert.strictEqual(rec.reentrant, false);
  assert.deepEqual(rec.calls, []);
  assert.deepEqual(rec.indirect, []);
});

QUnit.test(".frame with calls= stores uppercase deduplicated array", async (assert) => {
  const opts = { assembler: Z80, readFile, PRAGMAS: ["MODULE"], endian: Z80.endian };
  const src = `.pragma module\n.frame puts, size=2, reentrant=0, calls=putc|bdos|putc\nputs: RET\n.export puts`;
  const o = await Parser.parse(src, opts);
  await pass1(o, null, opts);
  assert.deepEqual(opts.frames["PUTS"].calls, ["PUTC", "BDOS"]);
});

QUnit.test(".frame reentrant=1 stores true", async (assert) => {
  const opts = { assembler: Z80, readFile, PRAGMAS: ["MODULE"], endian: Z80.endian };
  const src = `.pragma module\n.frame fn, size=0, reentrant=1\nfn: RET\n.export fn`;
  const o = await Parser.parse(src, opts);
  await pass1(o, null, opts);
  assert.strictEqual(opts.frames["FN"].reentrant, true);
});

QUnit.test(".frame duplicate symbol throws error", async (assert) => {
  const opts = { assembler: Z80, readFile, PRAGMAS: ["MODULE"], endian: Z80.endian };
  const src = `.pragma module\n.frame fn, size=1, reentrant=0\n.frame fn, size=2, reentrant=0\nfn: RET`;
  const o = await Parser.parse(src, opts);
  await asyncThrows(assert, () => pass1(o, null, opts),
    (e) => /duplicate/i.test(e.msg));
});

QUnit.test(".frame negative size throws error", async (assert) => {
  const opts = { assembler: Z80, readFile, PRAGMAS: ["MODULE"], endian: Z80.endian };
  const src = `.pragma module\n.frame fn, size=-1, reentrant=0\nfn: RET`;
  const o = await Parser.parse(src, opts);
  await asyncThrows(assert, () => pass1(o, null, opts),
    (e) => /size/i.test(e.msg));
});

QUnit.test(".frame invalid reentrant value throws error", async (assert) => {
  const opts = { assembler: Z80, readFile, PRAGMAS: ["MODULE"], endian: Z80.endian };
  const src = `.pragma module\n.frame fn, size=1, reentrant=2\nfn: RET`;
  const o = await Parser.parse(src, opts);
  await asyncThrows(assert, () => pass1(o, null, opts),
    (e) => /reentrant/i.test(e.msg));
});

QUnit.test(".frame unknown key throws error", async (assert) => {
  const opts = { assembler: Z80, readFile, PRAGMAS: ["MODULE"], endian: Z80.endian };
  const src = `.pragma module\n.frame fn, size=1, reentrant=0, siz=1\nfn: RET`;
  const o = await Parser.parse(src, opts);
  await asyncThrows(assert, () => pass1(o, null, opts),
    (e) => /unknown key/i.test(e.msg));
});

QUnit.test(".frame param without = throws error", async (assert) => {
  const opts = { assembler: Z80, readFile, PRAGMAS: ["MODULE"], endian: Z80.endian };
  const src = `.pragma module\n.frame fn, size=1, reentrant\nfn: RET`;
  const o = await Parser.parse(src, opts);
  await asyncThrows(assert, () => pass1(o, null, opts),
    (e) => /invalid param/i.test(e.msg));
});

QUnit.test(".frame_indirect outside MODULE throws error", async (assert) => {
  const opts = { assembler: Z80, readFile, PRAGMAS: [], endian: Z80.endian };
  const src = `.frame_indirect fn, sig=__sig_v_v\nfn: RET`;
  const o = await Parser.parse(src, opts);
  await asyncThrows(assert, () => pass1(o, null, opts),
    (e) => /not allowed out of modules/i.test(e.msg));
});

QUnit.test(".frame_indirect queues entry without error", async (assert) => {
  const opts = { assembler: Z80, readFile, PRAGMAS: ["MODULE"], endian: Z80.endian };
  const src = `.pragma module\n.frame fn, size=2, reentrant=0\n.frame_indirect fn, sig=__sig_v_ip\nfn: RET`;
  const o = await Parser.parse(src, opts);
  await pass1(o, null, opts);
  assert.strictEqual(opts.frameIndirectQueue.length, 1);
  assert.strictEqual(opts.frameIndirectQueue[0].symbol, "FN");
  assert.strictEqual(opts.frameIndirectQueue[0].sig, "__sig_v_ip");
});

QUnit.test(".frame_indirect before .frame is allowed (order independent)", async (assert) => {
  const opts = { assembler: Z80, readFile, PRAGMAS: ["MODULE"], endian: Z80.endian };
  const src = `.pragma module\n.frame_indirect fn, sig=__sig_v_v\n.frame fn, size=0, reentrant=1\nfn: RET`;
  const o = await Parser.parse(src, opts);
  await pass1(o, null, opts);
  assert.strictEqual(opts.frameIndirectQueue.length, 1, "queued even before .frame");
});

QUnit.test(".frame_indirect invalid sig= throws error", async (assert) => {
  const opts = { assembler: Z80, readFile, PRAGMAS: ["MODULE"], endian: Z80.endian };
  const src = `.pragma module\n.frame fn, size=1, reentrant=0\n.frame_indirect fn, sig=bad_sig\nfn: RET`;
  const o = await Parser.parse(src, opts);
  await asyncThrows(assert, () => pass1(o, null, opts),
    (e) => /sig/i.test(e.msg));
});

QUnit.test(".frame missing size= key throws error", async (assert) => {
  const opts = { assembler: Z80, readFile, PRAGMAS: ["MODULE"], endian: Z80.endian };
  const src = `.pragma module\n.frame fn, reentrant=0\nfn: RET`;
  const o = await Parser.parse(src, opts);
  await asyncThrows(assert, () => pass1(o, null, opts),
    (e) => /size/i.test(e.msg));
});

QUnit.test(".frame_indirect missing sig= throws error", async (assert) => {
  const opts = { assembler: Z80, readFile, PRAGMAS: ["MODULE"], endian: Z80.endian };
  const src = `.pragma module\n.frame fn, size=1, reentrant=0\n.frame_indirect fn\nfn: RET`;
  const o = await Parser.parse(src, opts);
  await asyncThrows(assert, () => pass1(o, null, opts),
    (e) => /sig/i.test(e.msg));
});

QUnit.test(".frame_indirect with no .frame throws error in objCode", async (assert) => {
  await asyncThrows(assert,
    () => doObjCode(`.pragma module\n.frame_indirect ghost, sig=__sig_v_v\nghost: RET\n.export ghost`),
    (e) => /frame_indirect.*ghost|ghost.*frame_indirect/i.test(e.msg)
  );
});

QUnit.test("frame metadata appears in export record", async (assert) => {
  const obj = await doObjCode(
    `.pragma module\n.frame putc, size=1, reentrant=0\nputc: RET\n.export putc`
  );
  const exp = obj.exports["PUTC"];
  assert.ok(exp, "PUTC exported");
  assert.ok(exp.frame, "frame key present");
  assert.strictEqual(exp.frame.size, 1);
  assert.strictEqual(exp.frame.reentrant, false);
  assert.deepEqual(exp.frame.calls, []);
  assert.deepEqual(exp.frame.indirect, []);
});

QUnit.test("reentrant=1 stored as boolean true in export", async (assert) => {
  const obj = await doObjCode(
    `.pragma module\n.frame fn, size=0, reentrant=1\nfn: RET\n.export fn`
  );
  assert.strictEqual(obj.exports["FN"].frame.reentrant, true);
});

QUnit.test("calls= present in export frame record", async (assert) => {
  const obj = await doObjCode(
    `.pragma module\n.frame puts, size=2, reentrant=0, calls=putc|bdos\nputs: RET\n.export puts`
  );
  assert.deepEqual(obj.exports["PUTS"].frame.calls, ["PUTC", "BDOS"]);
});

QUnit.test(".frame_indirect merged into export frame.indirect", async (assert) => {
  const obj = await doObjCode([
    ".pragma module",
    ".frame map_fn, size=4, reentrant=0",
    ".frame_indirect map_fn, sig=__sig_i_ip",
    "map_fn: RET",
    ".export map_fn",
  ].join("\n"));
  assert.deepEqual(obj.exports["MAP_FN"].frame.indirect, ["__sig_i_ip"]);
});

QUnit.test(".frame_indirect before .frame merged correctly (order independent)", async (assert) => {
  const obj = await doObjCode([
    ".pragma module",
    ".frame_indirect fn, sig=__sig_v_v",
    ".frame fn, size=0, reentrant=1",
    "fn: RET",
    ".export fn",
  ].join("\n"));
  assert.deepEqual(obj.exports["FN"].frame.indirect, ["__sig_v_v"]);
});

QUnit.test("symbol without .frame has no frame key in export", async (assert) => {
  const obj = await doObjCode(
    `.pragma module\nfoo: RET\n.export foo`
  );
  assert.strictEqual(obj.exports["FOO"].frame, undefined);
});

QUnit.test(".frame with calls= empty right-hand side produces empty array", async (assert) => {
  const opts = { assembler: Z80, readFile, PRAGMAS: ["MODULE"], endian: Z80.endian };
  const src = `.pragma module\n.frame fn, size=1, reentrant=0, calls=\nfn: RET`;
  const o = await Parser.parse(src, opts);
  await pass1(o, null, opts);
  assert.deepEqual(opts.frames["FN"].calls, [], "empty calls= produces empty array");
});

QUnit.test(".frame size=0 is valid", async (assert) => {
  const obj = await doObjCode(
    `.pragma module\n.frame fn, size=0, reentrant=0\nfn: RET\n.export fn`
  );
  assert.strictEqual(obj.exports["FN"].frame.size, 0);
});

QUnit.test(".frame for .extern symbol triggers console.warn (not error)", async (assert) => {
  const warnings = [];
  const origWarn = console.warn;
  console.warn = (...args) => warnings.push(args.join(" "));
  try {
    await doObjCode([
      ".pragma module",
      ".extern extfn",
      ".frame extfn, size=2, reentrant=0",
      "myfn: RET",
      ".export myfn",
    ].join("\n"));
    assert.ok(warnings.some(w => /extfn/i.test(w)), "warning mentions the extern symbol");
  } finally {
    console.warn = origWarn;
  }
});

QUnit.test("multiple .frame_indirect for same symbol all appear in indirect[]", async (assert) => {
  const obj = await doObjCode([
    ".pragma module",
    ".frame fn, size=4, reentrant=0",
    ".frame_indirect fn, sig=__sig_v_ip",
    ".frame_indirect fn, sig=__sig_i_pp",
    "fn: RET",
    ".export fn",
  ].join("\n"));
  assert.deepEqual(obj.exports["FN"].frame.indirect, ["__sig_v_ip", "__sig_i_pp"]);
});

QUnit.test("full pipeline: two exported functions, one with frame, one without", async (assert) => {
  const obj = await doObjCode([
    ".pragma module",
    ".frame puts, size=3, reentrant=0, calls=putc",
    "puts: RET",
    "bare: RET",
    ".export puts",
    ".export bare",
  ].join("\n"));
  assert.ok(obj.exports["PUTS"].frame, "puts has frame");
  assert.strictEqual(obj.exports["BARE"].frame, undefined, "bare has no frame");
  assert.deepEqual(obj.exports["PUTS"].frame.calls, ["PUTC"]);
});
