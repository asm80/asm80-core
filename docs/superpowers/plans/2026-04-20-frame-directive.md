# .frame Directive Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `.frame` and `.frame_indirect` directives that attach stack-frame metadata to exported symbols in MODULE-mode object files.

**Architecture:** `pass1.js` collects directive data into `opts.frames` (map) and `opts.frameIndirectQueue` (array), both reset on each of the four pass1 runs. `objcode.js` merges the queue, warns on non-local symbols, and attaches `frame` records to exports.

**Tech Stack:** ES6 modules, QUnit, Node.js. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-04-20-frame-directive-design.md`

---

## Chunk 0: Extend `asyncThrows` with optional matcher

### Task 0: Add matcher support to `_asyncThrows.js`

All error-message assertions in this plan require the matcher argument. Without it, `asyncThrows` silently accepts any error regardless of content.

**Files:**
- Modify: `test/_asyncThrows.js`

- [ ] **Step 1: Update `_asyncThrows.js`**

Replace the entire file with:

```js
export const asyncThrows = (assert, fn, matcher) => {
  let done = assert.async();
  return new Promise((resolve) => {
    fn().then(() => {
      assert.ok(false, "expected throw, but resolved");
      done(); resolve();
    }).catch(e => {
      if (matcher) {
        assert.ok(matcher(e), `error matched: ${JSON.stringify(e)}`);
      } else {
        assert.ok(true);
      }
      done(); resolve();
    });
  });
};
```

- [ ] **Step 2: Run existing tests to verify no regressions**

```bash
npm test 2>&1 | tail -10
```
Expected: all existing tests still pass (matcher is optional, backward-compatible)

- [ ] **Step 3: Commit**

```bash
git add test/_asyncThrows.js
git commit -m "test: add optional matcher to asyncThrows"
```

---

## Chunk 1: pass1.js — initialization and `.FRAME` handler

### Task 1: Initialization — reset `opts.frames` and `opts.frameIndirectQueue`

**Files:**
- Modify: `pass1.js` (top of the `pass1` async function body, before the main loop)

- [ ] **Step 1: Write the failing test**

Create `test/asm-frame.js`:

```js
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
  // After run 1, opts.frames must exist
  assert.ok(opts.frames, "opts.frames initialized after first pass");
  // Running again must NOT throw duplicate error
  await pass1(o, null, opts);
  assert.ok(true, "second pass1 run does not throw duplicate error");
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test 2>&1 | grep -A3 "opts.frames is reset"
```
Expected: FAIL (opts.frames undefined or duplicate error thrown)

- [ ] **Step 3: Add initialization to `pass1.js`**

In `pass1.js`, find the block where `opts` fields are initialized at the top of the function body (near `if (!opts.xref) opts.xref = {}`). Add after those lines:

```js
opts.frames = {}
opts.frameIndirectQueue = []
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test 2>&1 | grep -A3 "opts.frames is reset"
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add pass1.js test/asm-frame.js
git commit -m "feat: initialize opts.frames and opts.frameIndirectQueue in pass1"
```

---

### Task 2: `.FRAME` handler — MODULE guard, param parsing, validation, storage

**Files:**
- Modify: `pass1.js` (after the `.EXTERN` handler block, around line 332)
- Test: `test/asm-frame.js`

- [ ] **Step 1: Write failing tests**

Add to `test/asm-frame.js`:

```js
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test 2>&1 | grep -E "\.frame (stores|outside|duplicate|negative|invalid|unknown|param)"
```
Expected: all FAIL

- [ ] **Step 3: Add `.FRAME` handler to `pass1.js`**

After the `.EXTERN` handler block (around line 332), insert:

```js
if (op.opcode === ".FRAME") {
  if (opts.PRAGMAS && opts.PRAGMAS.indexOf("MODULE") < 0) {
    throw { msg: ".FRAME is not allowed out of modules" }
  }
  const symbol = (op.params[0] || "").toUpperCase()
  if (!symbol) throw { msg: ".FRAME needs a symbol name" }
  const kvPairs = op.params.slice(1)
  const ALLOWED_KEYS = new Set(["size", "reentrant", "calls"])
  let size, reentrant, calls = []
  for (const pair of kvPairs) {
    if (!pair.includes("=")) throw { msg: `.FRAME invalid param (missing =): ${pair}` }
    const eqIdx = pair.indexOf("=")
    const key = pair.substring(0, eqIdx).trim().toLowerCase()
    const val = pair.substring(eqIdx + 1).trim()
    if (!ALLOWED_KEYS.has(key)) throw { msg: `.FRAME unknown key: ${key}` }
    if (key === "size") size = val
    if (key === "reentrant") reentrant = val
    if (key === "calls") {
      calls = [...new Set(
        val.split("|").map(s => s.trim()).filter(Boolean).map(s => s.toUpperCase())
      )]
    }
  }
  const sizeNum = parseInt(size, 10)
  if (size === undefined || isNaN(sizeNum) || sizeNum < 0) {
    throw { msg: ".FRAME size must be a non-negative integer" }
  }
  const reentrantNum = parseInt(reentrant, 10)
  if (reentrant === undefined || (reentrantNum !== 0 && reentrantNum !== 1)) {
    throw { msg: ".FRAME reentrant must be 0 or 1" }
  }
  if (opts.frames[symbol]) throw { msg: `.FRAME duplicate: ${symbol}` }
  opts.frames[symbol] = { size: sizeNum, reentrant: reentrantNum === 1, calls, indirect: [] }
  continue
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test 2>&1 | grep -E "\.frame (stores|outside|duplicate|negative|invalid|unknown|param)"
```
Expected: all PASS

- [ ] **Step 5: Run full test suite to check for regressions**

```bash
npm test 2>&1 | tail -20
```
Expected: no new failures

- [ ] **Step 6: Commit**

```bash
git add pass1.js test/asm-frame.js
git commit -m "feat: add .FRAME handler to pass1"
```

---

### Task 3: `.FRAME_INDIRECT` handler — MODULE guard, sig= validation, queue

**Files:**
- Modify: `pass1.js` (after the `.FRAME` handler just added)
- Test: `test/asm-frame.js`

- [ ] **Step 1: Write failing tests**

Add to `test/asm-frame.js`:

```js
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test 2>&1 | grep "frame_indirect"
```
Expected: all FAIL

- [ ] **Step 3: Add `.FRAME_INDIRECT` handler to `pass1.js`**

Immediately after the `.FRAME` handler:

```js
if (op.opcode === ".FRAME_INDIRECT") {
  if (opts.PRAGMAS && opts.PRAGMAS.indexOf("MODULE") < 0) {
    throw { msg: ".FRAME_INDIRECT is not allowed out of modules" }
  }
  const symbol = (op.params[0] || "").toUpperCase()
  if (!symbol) throw { msg: ".FRAME_INDIRECT needs a symbol name" }
  const kvPairs = op.params.slice(1)
  let sig
  for (const pair of kvPairs) {
    if (!pair.includes("=")) continue
    const eqIdx = pair.indexOf("=")
    if (pair.substring(0, eqIdx).trim().toLowerCase() === "sig") {
      sig = pair.substring(eqIdx + 1).trim()
    }
  }
  if (!sig || !/^__sig_[a-z][a-z0-9]*(_[a-z][a-z0-9]*)+$/i.test(sig)) {
    throw { msg: `.FRAME_INDIRECT invalid sig= value: ${sig}` }
  }
  opts.frameIndirectQueue.push({ symbol, sig })
  continue
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test 2>&1 | grep "frame_indirect"
```
Expected: all PASS

- [ ] **Step 5: Run full test suite**

```bash
npm test 2>&1 | tail -20
```
Expected: no new failures

- [ ] **Step 6: Commit**

```bash
git add pass1.js test/asm-frame.js
git commit -m "feat: add .FRAME_INDIRECT handler to pass1"
```

---

## Chunk 2: objcode.js — merge, warn, attach to exports

### Task 4: merge queue + unknown-symbol warning + attach frame to exports

**Files:**
- Modify: `objcode.js` (at the start of `objCode()`, before the main loop)
- Test: `test/asm-frame.js`

- [ ] **Step 1: Write failing tests**

Add to `test/asm-frame.js`:

```js
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test 2>&1 | grep -E "frame metadata|frame_indirect merged|no .frame throws|reentrant=1 stored|calls= present|order independent|no frame key"
```
Expected: all FAIL

- [ ] **Step 3: Add merge + warn + attach to `objcode.js`**

At the start of `objCode()` function body, after the variable declarations and before the main `for (let ln of V)` loop, insert:

```js
// Merge .frame_indirect queue into opts.frames
for (const { symbol, sig } of (opts.frameIndirectQueue || [])) {
  if (!opts.frames?.[symbol]) {
    throw { msg: `.frame_indirect for ${symbol} has no corresponding .frame` }
  }
  opts.frames[symbol].indirect.push(sig)
}
```

Then, in the `.EXPORT` handler section (around line 174–179), change:

```js
// existing code:
exports[name] = {addr:vars[name],seg:varsSegs[name]}
```

to:

```js
exports[name] = {addr:vars[name],seg:varsSegs[name]}
if (opts.frames?.[name]) {
  exports[name].frame = opts.frames[name]
}
```

Then, after the main loop (after all `for (let ln of V)` processing) and after `exports` is fully built, add the unknown-symbol warning:

```js
for (const sym of Object.keys(opts.frames || {})) {
  if (typeof vars[sym] !== "number") {
    console.warn(`.frame declared for unknown or extern-only symbol: ${sym}`)
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test 2>&1 | grep -E "frame metadata|frame_indirect merged|no .frame throws|reentrant=1 stored|calls= present|order independent|no frame key"
```
Expected: all PASS

- [ ] **Step 5: Run full test suite**

```bash
npm test 2>&1 | tail -20
```
Expected: no new failures

- [ ] **Step 6: Commit**

```bash
git add objcode.js test/asm-frame.js
git commit -m "feat: merge frame queue and attach frame metadata to exports in objcode"
```

---

## Chunk 3: Edge cases and integration

### Task 5: Edge case tests and integration smoke test

**Files:**
- Test: `test/asm-frame.js`

- [ ] **Step 1: Write edge case tests**

Add to `test/asm-frame.js`:

```js
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
```

- [ ] **Step 2: Run tests to verify they pass**

```bash
npm test 2>&1 | grep -E "calls= empty|size=0|extern symbol|multiple .frame_indirect|full pipeline"
```
Expected: all PASS

- [ ] **Step 3: Run full test suite — final check**

```bash
npm test
```
Expected: all existing tests still pass, new asm-frame tests all pass

- [ ] **Step 4: Commit**

```bash
git add test/asm-frame.js
git commit -m "test: add edge case and integration tests for .frame directive"
```

---

### Task 6: Documentation and version bump

**Files:**
- Modify: `CLAUDE.md` (supported directives list)

- [ ] **Step 1: Update CLAUDE.md**

In `CLAUDE.md`, under `### Key files` or a relevant section, note that `pass1.js` now handles `.FRAME` and `.FRAME_INDIRECT` directives (MODULE-only), and `objcode.js` attaches `frame` metadata to exports.

- [ ] **Step 2: Commit docs**

```bash
git add CLAUDE.md
git commit -m "docs: note .frame/.frame_indirect directives in project overview"
```

- [ ] **Step 3: Version bump**

```bash
npm version patch
```

---

## Quick Reference

| File | Change |
|------|--------|
| `pass1.js` | Reset `opts.frames`/`opts.frameIndirectQueue`; add `.FRAME` and `.FRAME_INDIRECT` handlers |
| `objcode.js` | Merge indirect queue; attach `frame` to export record; warn on non-local symbols |
| `test/asm-frame.js` | New: all tests for directives, errors, output format |
| `CLAUDE.md` | Note new directives |
