# File/Loc Line-Start Debug Mapping Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement `.file/.loc` line-start debug metadata end-to-end in assembler outputs (`dump`, `lst`, `obj`, linked output) with silent-ignore behavior for invalid directives.

**Architecture:** Extend parser/pass pipeline with lightweight debug state (`debugFiles`, `_pendingLoc`) and annotate only the first emitted instruction after `.loc` via `op.loc`. Keep machine-code generation untouched; downstream formatters (`lst`, `objCode`, linker) project debug metadata into their own outputs (`LST`, `obj.debug + code[].dbg`, linked line-map structures). Invalid `.file/.loc` are ignored without throwing.

**Tech Stack:** Node.js ESM, QUnit, existing asm80-core parse/pass/link pipeline.

---

## File Structure

- Modify: `D:\servers\weby\ASM80\asm80-core\parseLine.js` (recognize `.file`/`.loc` directives as known pseudo-opcodes)
- Modify: `D:\servers\weby\ASM80\asm80-core\pass1.js` (track debug file table and pending loc; stamp `op.loc` on first byte-emitting line)
- Modify: `D:\servers\weby\ASM80\asm80-core\listing.js` (render `loc` markers in text listing)
- Modify: `D:\servers\weby\ASM80\asm80-core\objcode.js` (project `op.loc` into `obj.debug.files` and `code[].dbg[{off,fileId,line,comment}]` while preserving merge optimization)
- Modify: `D:\servers\weby\ASM80\asm80-core\asm.js` (expose debug data from compile/link result if needed by callers)
- Modify: `D:\servers\weby\ASM80\asm80-core\test\pass1.js` (pending-loc semantics + silent-ignore)
- Modify: `D:\servers\weby\ASM80\asm80-core\test\relocable.js` or `D:\servers\weby\ASM80\asm80-core\test\asm.js` (obj/link projection checks)
- Modify: `D:\servers\weby\ASM80\asm80-core\test\parseLine.js` (directive recognition)
- Add: `D:\servers\weby\ASM80\asm80-core\test\debug-loc.js` (focused integration tests for dump/lst/obj/linked line starts)

### Task 1: Parse-Level Directive Recognition

**Files:**
- Modify: `D:\servers\weby\ASM80\asm80-core\parseLine.js`
- Test: `D:\servers\weby\ASM80\asm80-core\test\parseLine.js`

- [ ] **Step 1: Write the failing parse tests for `.file`/`.loc`**

```js
QUnit.test(".file and .loc are recognized pseudo-opcodes", (assert) => {
  const opts = { assembler: I8080, PRAGMAS: [] };
  const fileLine = parseLine({ line: '.file 1 "x.c"', numline: 1 }, {}, opts);
  const locLine = parseLine({ line: '.loc 1 42 ; hello', numline: 2 }, {}, opts);

  assert.equal(fileLine.opcode, ".FILE");
  assert.deepEqual(fileLine.params, ["1", '"x.c"']);
  assert.equal(locLine.opcode, ".LOC");
  assert.equal(locLine.params[0], "1");
  assert.equal(locLine.params[1], "42");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `qunit test/parseLine.js`
Expected: FAIL on unrecognized `.file`/`.loc`.

- [ ] **Step 3: Implement minimal parser support**

```js
if (s.opcode === ".FILE") return s;
if (s.opcode === ".LOC") return s;
```

(Insert into the known-directives allowlist branch so directives are parsed but do not emit bytes.)

- [ ] **Step 4: Re-run parse tests**

Run: `qunit test/parseLine.js`
Expected: PASS including new `.file/.loc` test.

- [ ] **Step 5: Commit**

```bash
git add parseLine.js test/parseLine.js
git commit -m "feat: recognize .file and .loc directives in parseLine"
```

### Task 2: Pending-Loc Semantics in Pass1 (Silent Ignore)

**Files:**
- Modify: `D:\servers\weby\ASM80\asm80-core\pass1.js`
- Test: `D:\servers\weby\ASM80\asm80-core\test\pass1.js`

- [ ] **Step 1: Write failing pass1 tests for pending-loc behavior**

```js
QUnit.test(".loc tags first byte-emitting line after directives", async (assert) => {
  const src = `
.file 1 "main.c"
.loc 1 9 ; i = 1
.export FOO
main:
  LDB #1
`;
  const out = await doPass(src, false, M6809);
  const emit = out[0].find(x => Array.isArray(x.lens) && x.lens.length > 0);
  assert.deepEqual(emit.loc, { fileId: 1, line: 9, comment: "i = 1" });
});

QUnit.test("invalid .file/.loc are silently ignored", async (assert) => {
  const src = `
.file X "bad"
.loc 99 NaN
LDB #1
`;
  await doPass(src, false, M6809);
  assert.ok(true, "no throw");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `qunit test/pass1.js`
Expected: FAIL because `loc` is missing and invalid directives currently not handled.

- [ ] **Step 3: Implement pending-loc state in pass1**

```js
if (!opts.debugFiles) opts.debugFiles = {};
if (typeof opts._pendingLoc === "undefined") opts._pendingLoc = null;

if (op.opcode === ".FILE") {
  const fileId = Number(op.params?.[0]);
  const rawPath = op.params?.[1];
  if (Number.isInteger(fileId) && fileId > 0 && typeof rawPath === "string") {
    opts.debugFiles[fileId] = rawPath.replace(/^"|"$/g, "");
  }
  continue;
}

if (op.opcode === ".LOC") {
  const fileId = Number(op.params?.[0]);
  const line = Number(op.params?.[1]);
  const ok = Number.isInteger(fileId) && fileId > 0 && Number.isInteger(line) && line > 0 && opts.debugFiles[fileId];
  if (ok) {
    opts._pendingLoc = { fileId, line, comment: op.remark && op.remark.trim() ? op.remark.trim() : undefined };
  }
  continue;
}

if (opts._pendingLoc && op.lens && op.lens.length && !op.ifskip) {
  op.loc = { ...opts._pendingLoc };
  opts._pendingLoc = null;
}
```

(Apply the final `op.loc` stamp after opcode parsing/byte-size determination but before advancing to next line.)

- [ ] **Step 4: Re-run pass1 tests**

Run: `qunit test/pass1.js`
Expected: PASS including new loc/silent-ignore tests.

- [ ] **Step 5: Commit**

```bash
git add pass1.js test/pass1.js
git commit -m "feat: apply pending .loc to first emitted instruction with silent ignore rules"
```

### Task 3: LST Rendering of Loc Markers

**Files:**
- Modify: `D:\servers\weby\ASM80\asm80-core\listing.js`
- Add: `D:\servers\weby\ASM80\asm80-core\test\debug-loc.js`

- [ ] **Step 1: Write failing listing test**

```js
QUnit.test("lst renders loc markers", async (assert) => {
  const source = `.file 1 "main.c"\n.loc 1 11 ; putc()\nLDB #1`;
  const result = await compile(source, fsMock, { assembler: M6809 }, "main.asm");
  const text = lst(result, false, true);
  assert.true(text.includes(".loc 1 11"), "listing contains loc marker");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `qunit test/debug-loc.js`
Expected: FAIL because `lst()` currently ignores `op.loc`.

- [ ] **Step 3: Implement LST loc rendering**

```js
if (op.loc) {
  let locText = `.loc ${op.loc.fileId} ${op.loc.line}`;
  if (op.loc.comment) locText += ` ; ${op.loc.comment}`;
  out += ln + locText + "\n";
}
```

(Place rendering next to normal row emission so marker appears at the instruction line where `loc` is attached.)

- [ ] **Step 4: Re-run listing test**

Run: `qunit test/debug-loc.js`
Expected: PASS for LST marker visibility.

- [ ] **Step 5: Commit**

```bash
git add listing.js test/debug-loc.js
git commit -m "feat: render loc markers in lst output"
```

### Task 4: Object Projection (`debug.files` + `code[].dbg`)

**Files:**
- Modify: `D:\servers\weby\ASM80\asm80-core\objcode.js`
- Modify: `D:\servers\weby\ASM80\asm80-core\test\relocable.js`
- Modify: `D:\servers\weby\ASM80\asm80-core\test\debug-loc.js`

- [ ] **Step 1: Write failing obj projection test**

```js
QUnit.test("objCode emits debug.files and dbg offsets", async (assert) => {
  const result = await compile(sourceWithTwoLocs, fsMock, { assembler: M6809 }, "m.asm");
  const obj = objCode(result.dump, result.vars, result.opts, "m.asm");

  assert.equal(obj.debug.files[0].id, 1);
  assert.ok(Array.isArray(obj.code[0].dbg), "merged block has dbg array");
  assert.deepEqual(obj.code[0].dbg[0], { off: 0, fileId: 1, line: 9, comment: "i = 1" });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `qunit test/debug-loc.js`
Expected: FAIL because `objCode` currently emits no debug section.

- [ ] **Step 3: Implement `objCode` debug projection with merge offsets**

```js
const debugFiles = Object.entries(opts.debugFiles || {}).map(([id, path]) => ({ id: Number(id), path }));

// when creating new op from ln:
if (ln.loc) op.dbg = [{ off: 0, fileId: ln.loc.fileId, line: ln.loc.line, ...(ln.loc.comment ? { comment: ln.loc.comment } : {}) }];

// when merging into lastOne:
const baseOff = lastOne.lens.length;
if (op.dbg?.length) {
  if (!lastOne.dbg) lastOne.dbg = [];
  lastOne.dbg.push(...op.dbg.map(d => ({ ...d, off: d.off + baseOff })));
}
lastOne.lens = lastOne.lens.concat(op.lens);

// return object:
if (debugFiles.length) result.debug = { files: debugFiles };
```

- [ ] **Step 4: Re-run obj tests**

Run: `qunit test/debug-loc.js test/relocable.js`
Expected: PASS with valid `debug.files` and `dbg.off` in merged blocks.

- [ ] **Step 5: Commit**

```bash
git add objcode.js test/debug-loc.js test/relocable.js
git commit -m "feat: project line-start debug metadata into obj format"
```

### Task 5: Link-Time Debug Address Resolution

**Files:**
- Modify: `D:\servers\weby\ASM80\asm80-core\objcode.js`
- Modify: `D:\servers\weby\ASM80\asm80-core\asm.js`
- Modify: `D:\servers\weby\ASM80\asm80-core\test\asm.js`
- Modify: `D:\servers\weby\ASM80\asm80-core\test\debug-loc.js`

- [ ] **Step 1: Write failing linker debug mapping test**

```js
QUnit.test("linkModules resolves dbg off to absolute addresses", async (assert) => {
  const linked = await asm.link(lnkRecipe, fsMock, "prog");
  assert.ok(linked.debugLineStarts.length > 0);
  assert.equal(linked.debugLineStarts[0].addr, linked.dump[0].addr);
  assert.equal(linked.debugLineStarts[0].line, 9);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `qunit test/asm.js test/debug-loc.js`
Expected: FAIL because link result currently has no debug line-start collection.

- [ ] **Step 3: Implement linker debug export**

```js
const linkedDebugFiles = new Map();
const debugLineStarts = [];

// in addModule(mod,...):
for (const f of mod.debug?.files || []) linkedDebugFiles.set(f.id, f.path);
for (const d of s.dbg || []) {
  debugLineStarts.push({ addr: s.addr + d.off, fileId: d.fileId, line: d.line, ...(d.comment ? { comment: d.comment } : {}) });
}

// in final return of linkModules:
return {
  ...,
  debug: { files: [...linkedDebugFiles.entries()].map(([id, path]) => ({ id, path })), lineStarts: debugLineStarts.sort((a,b)=>a.addr-b.addr) }
}
```

- [ ] **Step 4: Re-run linker tests**

Run: `qunit test/asm.js test/debug-loc.js`
Expected: PASS with sorted absolute line starts.

- [ ] **Step 5: Commit**

```bash
git add objcode.js asm.js test/asm.js test/debug-loc.js
git commit -m "feat: expose linked absolute debug line-start map"
```

### Task 6: LMAP Text Export + Final Regression

**Files:**
- Modify: `D:\servers\weby\ASM80\asm80-core\listing.js` (or new helper in `utils/` if preferred)
- Modify: `D:\servers\weby\ASM80\asm80-core\asm.js`
- Modify: `D:\servers\weby\ASM80\asm80-core\docs\asm.md`
- Modify: `D:\servers\weby\ASM80\asm80-core\test\debug-loc.js`

- [ ] **Step 1: Write failing lmap export test**

```js
QUnit.test("lmap export uses file_id table and sorted lines", async (assert) => {
  const linked = await asm.link(lnkRecipe, fsMock, "prog");
  const text = asm.lmap(linked);
  assert.true(text.includes("# files"));
  assert.true(text.includes("file_id,path"));
  assert.true(text.includes("# lines"));
  assert.true(text.includes("addr,file_id,line,comment"));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `qunit test/debug-loc.js`
Expected: FAIL because no `asm.lmap` exists yet.

- [ ] **Step 3: Implement CSV-like LMAP renderer**

```js
const csv = (s = "") => `"${String(s).replace(/"/g, '""')}"`;
export const lmap = (linked) => {
  const files = linked.debug?.files || [];
  const lines = linked.debug?.lineStarts || [];
  let out = "# files\nfile_id,path\n";
  for (const f of files) out += `${f.id},${csv(f.path)}\n`;
  out += "\n# lines\naddr,file_id,line,comment\n";
  for (const r of lines) out += `0x${r.addr.toString(16).toUpperCase()},${r.fileId},${r.line},${csv(r.comment || "")}\n`;
  return out;
};
```

- [ ] **Step 4: Run full relevant regression set**

Run: `qunit test/debug-loc.js test/parseLine.js test/pass1.js test/asm.js test/relocable.js`
Expected: PASS.

Run: `npm run test:run`
Expected: PASS all project tests.

- [ ] **Step 5: Commit**

```bash
git add listing.js asm.js docs/asm.md test/debug-loc.js
git commit -m "feat: add lmap export for linked file/loc line-start debug map"
```

## Spec Coverage Check

1. `.file/.loc` semantics with pending behavior: covered by Task 1 + Task 2.
2. Silent ignore for invalid directives: covered by Task 2 tests + implementation.
3. `loc` shown in LST: covered by Task 3.
4. `obj.debug.files` and `code[].dbg` with merge offsets: covered by Task 4.
5. Link-time absolute address mapping: covered by Task 5.
6. Compact file-id based lmap output: covered by Task 6.
7. No HEX behavior change: guarded by Task 6 full regression (`npm run test:run`).

## Placeholder Scan

No TBD/TODO placeholders remain. All tasks include concrete files, code snippets, commands, and expected outcomes.

## Type Consistency Check

Consistent names across tasks: `loc`, `debugFiles`, `_pendingLoc`, `debug.files`, `dbg`, `off`, `lineStarts`, `fileId`.
