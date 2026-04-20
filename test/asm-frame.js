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
