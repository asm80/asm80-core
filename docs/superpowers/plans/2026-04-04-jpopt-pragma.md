# .pragma JPOPT — JP→JR Size Optimization Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `.pragma JPOPT` directive to the Z80 assembler that automatically replaces `JP`/`JP cond` with the shorter `JR`/`JR cond` (2 bytes vs 3 bytes) when the target is in relative jump range.

**Architecture:** The range check and encoding decision happen inside `parseOpcode` at call time (not in a `lens` lambda). Pass1 runs 5× already — on each iteration `parseOpcode` re-evaluates the jump and converges to the correct encoding. All CPU modules receive a unified `opts` parameter for forward compatibility.

**Tech Stack:** ES6 modules, QUnit tests, Node.js

**Spec:** `docs/superpowers/specs/2026-04-04-jpopt-pragma-design.md`

---

## Chunk 1: API signature update — all non-Z80 CPU modules + pass1 call site

### Task 1: Add `opts` param to non-Z80 CPU module signatures

These modules do not use `opts` — only the signature changes. No logic changes.

**Files:**
- Modify: `cpu/i8080.js:202`
- Modify: `cpu/i8008.js:401`
- Modify: `cpu/m6800.js:148`
- Modify: `cpu/m6803.js:40`
- Modify: `cpu/c6502.js:146`
- Modify: `cpu/c65816.js:128`
- Modify: `cpu/m6809.js:149`
- Modify: `cpu/h6309.js:119`
- Modify: `cpu/cdp1802.js:122`
- Modify: `cpu/s2650.js:147`
- Modify: `cpu/sm83.js:380`
- Modify: `cpu/dummy.js:4`

- [ ] **Step 1: Update i8080.js signature**

In `cpu/i8080.js`, change:
```js
parseOpcode: function (s, vars, Parser) {
```
to:
```js
parseOpcode: function (s, vars, Parser, opts) {
```

- [ ] **Step 2: Update i8008.js signature**

In `cpu/i8008.js`, change:
```js
parseOpcode: function (s, vars, Parser) {
```
to:
```js
parseOpcode: function (s, vars, Parser, opts) {
```

- [ ] **Step 3: Update m6800.js signature**

In `cpu/m6800.js`, change:
```js
"parseOpcode": function(s,vars, Parser) {
```
to:
```js
"parseOpcode": function(s, vars, Parser, opts) {
```

- [ ] **Step 4: Update m6803.js signature**

In `cpu/m6803.js`, change:
```js
function parseOpcode(s, vars, Parser) {
```
to:
```js
function parseOpcode(s, vars, Parser, opts) {
```

- [ ] **Step 5: Update c6502.js signature**

In `cpu/c6502.js`, change:
```js
parseOpcode: function (s, vars, Parser) {
```
to:
```js
parseOpcode: function (s, vars, Parser, opts) {
```

- [ ] **Step 6: Update c65816.js signature**

In `cpu/c65816.js`, change:
```js
parseOpcode: function (s, vars, Parser) {
```
to:
```js
parseOpcode: function (s, vars, Parser, opts) {
```

- [ ] **Step 7: Update m6809.js signature**

In `cpu/m6809.js`, change:
```js
parseOpcode: function (s, vars, Parser) {
```
to:
```js
parseOpcode: function (s, vars, Parser, opts) {
```

- [ ] **Step 8: Update h6309.js signature**

In `cpu/h6309.js`, change:
```js
function parseOpcode(s, vars, Parser) {
```
to:
```js
function parseOpcode(s, vars, Parser, opts) {
```

- [ ] **Step 9: Update cdp1802.js signature**

In `cpu/cdp1802.js`, change:
```js
parseOpcode: function(s, vars, Parser) {
```
to:
```js
parseOpcode: function(s, vars, Parser, opts) {
```

- [ ] **Step 10: Update s2650.js signature**

In `cpu/s2650.js`, change:
```js
function parseOpcode(s, vars, Parser) {
```
to:
```js
function parseOpcode(s, vars, Parser, opts) {
```

- [ ] **Step 11: Update sm83.js signature**

In `cpu/sm83.js`, change:
```js
function parseOpcode(s, vars, Parser) {
```
to:
```js
function parseOpcode(s, vars, Parser, opts) {
```

- [ ] **Step 12: Update dummy.js signature**

In `cpu/dummy.js`, change:
```js
parseOpcode: function (s, vars, Parser) {
```
to:
```js
parseOpcode: function (s, vars, Parser, opts) {
```

- [ ] **Step 13: Run tests to verify no regressions**

```bash
npm test
```
Expected: all tests pass (JS is lenient with extra params, no behavior change yet).

- [ ] **Step 14: Commit**

```bash
git add cpu/i8080.js cpu/i8008.js cpu/m6800.js cpu/m6803.js cpu/c6502.js cpu/c65816.js cpu/m6809.js cpu/h6309.js cpu/cdp1802.js cpu/s2650.js cpu/sm83.js cpu/dummy.js
git commit -m "refactor: add opts param to all CPU parseOpcode signatures"
```

---

### Task 2: Update z80.js and z180.js signatures + pass1 call site

**Files:**
- Modify: `cpu/z80.js:104`
- Modify: `cpu/z180.js:25` and `cpu/z180.js:75`
- Modify: `pass1.js:559`

- [ ] **Step 1: Update z80.js parseOpcode signature**

In `cpu/z80.js`, change:
```js
parseOpcode: function(s, vars, Parser) {
```
to:
```js
parseOpcode: function(s, vars, Parser, opts) {
```

- [ ] **Step 2: Update z180.js parseOpcode signature**

In `cpu/z180.js`, change:
```js
function parseOpcode(s, vars, Parser) {
```
to:
```js
function parseOpcode(s, vars, Parser, opts) {
```

- [ ] **Step 3: Update z180.js delegation to Z80**

Z180 delegates to Z80 for instructions it doesn't handle itself. In `cpu/z180.js`, change:
```js
return Z80.parseOpcode(s, vars, Parser);
```
to:
```js
return Z80.parseOpcode(s, vars, Parser, opts);
```

- [ ] **Step 4: Update pass1.js call site**

In `pass1.js` line 559, change:
```js
let opa = opts.assembler.parseOpcode(origin, vars, Parser);
```
to:
```js
let opa = opts.assembler.parseOpcode(origin, vars, Parser, opts);
```

- [ ] **Step 5: Run tests to verify no regressions**

```bash
npm test
```
Expected: all tests pass (opts is passed but not used yet).

- [ ] **Step 6: Commit**

```bash
git add cpu/z80.js cpu/z180.js pass1.js
git commit -m "refactor: pass opts through parseOpcode call chain (z80, z180, pass1)"
```

---

## Chunk 2: JPOPT logic in z80.js + tests

### Task 3: Write failing tests for JPOPT

Write the tests first (TDD). Tests go in `test/asm-z80.js`.

**Files:**
- Modify: `test/asm-z80.js`

Context: existing tests in `test/asm-z80.js` call `Z80.parseOpcode(s, vars, Parser)` directly and check `p.bytes`, `p.lens[0]`, `p.lens[1]` (lambda). The `vars` object used throughout is `{"LOOP":0x1234,"SHORT":0x21,"_PC":0x0100}`.

For JPOPT tests, pass `opts` with `PRAGMAS: ["JPOPT"]` as the 4th argument.

- [ ] **Step 1: Add JPOPT test block to test/asm-z80.js**

Append the following to `test/asm-z80.js`:

```js
// ─── .pragma JPOPT tests ───────────────────────────────────────────────────

const jpoptOpts = { PRAGMAS: ["JPOPT"] };

// vars._PC = 0x0100, SHORT = 0x21 → offset = 0x21 - (0x0100+2) = 0x21-0x102 = -0xe1 → OUT of range
// Use a near label: addr _PC=0x0100, target=0x0150 → offset = 0x50-2 = 0x4E → in range
const nearVars  = { _PC: 0x0100, NEAR: 0x0150 };
const farVars   = { _PC: 0x0100, FAR:  0x0200 }; // offset = 0x100-2 = 0xFE → out of range
const boundVars127 = { _PC: 0x0100, B127: 0x0100 + 2 + 127 }; // offset exactly 127
const boundVars128 = { _PC: 0x0100, B128: 0x0100 + 2 + 128 }; // offset exactly 128 → out of range

QUnit.test("JPOPT: JP NZ,near → JR NZ (0x20, 2 bytes)", function(assert) {
  const s = { opcode: "JP", params: ["NZ", "NEAR"], addr: 0x0100, lens: [], bytes: 0 };
  const p = Z80.parseOpcode(s, nearVars, Parser, jpoptOpts);
  assert.equal(p.bytes, 2, "bytes=2");
  assert.equal(p.lens[0], 0x20, "opcode=0x20 (JR NZ)");
});

QUnit.test("JPOPT: JP Z,near → JR Z (0x28, 2 bytes)", function(assert) {
  const s = { opcode: "JP", params: ["Z", "NEAR"], addr: 0x0100, lens: [], bytes: 0 };
  const p = Z80.parseOpcode(s, nearVars, Parser, jpoptOpts);
  assert.equal(p.bytes, 2, "bytes=2");
  assert.equal(p.lens[0], 0x28, "opcode=0x28 (JR Z)");
});

QUnit.test("JPOPT: JP NC,near → JR NC (0x30, 2 bytes)", function(assert) {
  const s = { opcode: "JP", params: ["NC", "NEAR"], addr: 0x0100, lens: [], bytes: 0 };
  const p = Z80.parseOpcode(s, nearVars, Parser, jpoptOpts);
  assert.equal(p.bytes, 2, "bytes=2");
  assert.equal(p.lens[0], 0x30, "opcode=0x30 (JR NC)");
});

QUnit.test("JPOPT: JP C,near → JR C (0x38, 2 bytes)", function(assert) {
  const s = { opcode: "JP", params: ["C", "NEAR"], addr: 0x0100, lens: [], bytes: 0 };
  const p = Z80.parseOpcode(s, nearVars, Parser, jpoptOpts);
  assert.equal(p.bytes, 2, "bytes=2");
  assert.equal(p.lens[0], 0x38, "opcode=0x38 (JR C)");
});

QUnit.test("JPOPT: JP near (unconditional) → JR (0x18, 2 bytes)", function(assert) {
  const s = { opcode: "JP", params: ["NEAR"], addr: 0x0100, lens: [], bytes: 0 };
  const p = Z80.parseOpcode(s, nearVars, Parser, jpoptOpts);
  assert.equal(p.bytes, 2, "bytes=2");
  assert.equal(p.lens[0], 0x18, "opcode=0x18 (JR)");
});

QUnit.test("JPOPT: JP P,near → stays JP P (0xF2, 3 bytes)", function(assert) {
  const s = { opcode: "JP", params: ["P", "NEAR"], addr: 0x0100, lens: [], bytes: 0 };
  const p = Z80.parseOpcode(s, nearVars, Parser, jpoptOpts);
  assert.equal(p.bytes, 3, "bytes=3");
  assert.equal(p.lens[0], 0xF2, "opcode=0xF2 (JP P)");
});

QUnit.test("JPOPT: JP M,near → stays JP M (0xFA, 3 bytes)", function(assert) {
  const s = { opcode: "JP", params: ["M", "NEAR"], addr: 0x0100, lens: [], bytes: 0 };
  const p = Z80.parseOpcode(s, nearVars, Parser, jpoptOpts);
  assert.equal(p.bytes, 3, "bytes=3");
  assert.equal(p.lens[0], 0xFA, "opcode=0xFA (JP M)");
});

QUnit.test("JPOPT: JP NZ,far (out of range) → stays JP NZ (0xC2, 3 bytes)", function(assert) {
  const s = { opcode: "JP", params: ["NZ", "FAR"], addr: 0x0100, lens: [], bytes: 0 };
  const p = Z80.parseOpcode(s, farVars, Parser, jpoptOpts);
  assert.equal(p.bytes, 3, "bytes=3");
  assert.equal(p.lens[0], 0xC2, "opcode=0xC2 (JP NZ)");
});

QUnit.test("JPOPT: JP NZ,b127 (offset=127, boundary) → JR NZ (2 bytes)", function(assert) {
  const s = { opcode: "JP", params: ["NZ", "B127"], addr: 0x0100, lens: [], bytes: 0 };
  const p = Z80.parseOpcode(s, boundVars127, Parser, jpoptOpts);
  assert.equal(p.bytes, 2, "bytes=2 (127 is in range)");
  assert.equal(p.lens[0], 0x20, "opcode=0x20 (JR NZ)");
});

QUnit.test("JPOPT: JP NZ,b128 (offset=128, boundary) → stays JP NZ (3 bytes)", function(assert) {
  const s = { opcode: "JP", params: ["NZ", "B128"], addr: 0x0100, lens: [], bytes: 0 };
  const p = Z80.parseOpcode(s, boundVars128, Parser, jpoptOpts);
  assert.equal(p.bytes, 3, "bytes=3 (128 is out of range)");
  assert.equal(p.lens[0], 0xC2, "opcode=0xC2 (JP NZ)");
});

QUnit.test("JPOPT: JP NZ without pragma → stays JP NZ (3 bytes)", function(assert) {
  const s = { opcode: "JP", params: ["NZ", "NEAR"], addr: 0x0100, lens: [], bytes: 0 };
  const p = Z80.parseOpcode(s, nearVars, Parser, {});
  assert.equal(p.bytes, 3, "bytes=3 (no pragma)");
  assert.equal(p.lens[0], 0xC2, "opcode=0xC2 (JP NZ)");
});

QUnit.test("JPOPT: JP NZ with no opts at all → stays JP NZ (3 bytes)", function(assert) {
  const s = { opcode: "JP", params: ["NZ", "NEAR"], addr: 0x0100, lens: [], bytes: 0 };
  const p = Z80.parseOpcode(s, nearVars, Parser);
  assert.equal(p.bytes, 3, "bytes=3 (opts undefined)");
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test 2>&1 | grep -A2 "JPOPT"
```
Expected: tests fail because JPOPT logic doesn't exist yet.

- [ ] **Step 3: Commit failing tests**

```bash
git add test/asm-z80.js
git commit -m "test: add failing JPOPT tests for Z80 JP→JR optimization"
```

---

### Task 4: Implement JPOPT logic in cpu/z80.js

**Files:**
- Modify: `cpu/z80.js` — JP handling branch (around line 429)

Context: The existing JP handling is in the two-parameter branch (`ax2`). The relevant code starts at line 429. The `COND` function (line 130) maps condition name → index using `["NZ","Z","NC","C","PO","PE","P","M"].indexOf(...)`, so: **NZ=0, Z=1, NC=2, C=3, PO=4, PE=5, P=6, M=7**. JR supports only conditions 0–3 (NZ/Z/NC/C), which is why existing JR code checks `reg < 4`. The JR conditional opcode formula is `0x20 + (reg << 3)`: NZ→0x20, Z→0x28, NC→0x30, C→0x38.

- [ ] **Step 1: Verify the COND function and existing JR handling**

Read `cpu/z80.js` lines 128–135 (COND function) and lines 450–475 (existing JR handling) to confirm the above. No changes needed — just orient yourself before editing.

- [ ] **Step 2: Add JPOPT logic to the JP branch in cpu/z80.js**

In `cpu/z80.js`, find the conditional JP block (around line 429–448):

```js
if (s.opcode == 'JP') {
  ax = Z80.set2.JP2;
  reg = COND(par1);

  if (reg >= 0 && ax[5]>0){
    op = ax[5];
    if (op>0) {
      op += reg<<3;
      s.bytes = 3;
      s.lens=[];
      s.lens[0] = op;
      s.lens[1] = function(vars){return Parser.evaluate(par2,vars); };
      s.lens[2] = null;
      return s;
    }
  } else if (reg<0) {
    throw "Invalid JP COND code: "+reg;
  }
  return null;
}
```

Replace with:

```js
if (s.opcode == 'JP') {
  ax = Z80.set2.JP2;
  reg = COND(par1);

  if (reg >= 0 && ax[5]>0){
    op = ax[5];
    if (op>0) {
      // JPOPT: replace JP cond with JR cond if pragma active, condition JR-compatible, and in range
      if (opts && opts.PRAGMAS && opts.PRAGMAS.indexOf("JPOPT") >= 0 && reg < 4) {
        let target;
        try { target = Parser.evaluate(par2, vars); } catch(e) { target = null; }
        const pc = vars._PC;
        if (target !== null) {
          const offset = target - (pc + 2);
          if (offset >= -128 && offset <= 127) {
            const jrOp = 0x20 + (reg << 3);
            s.bytes = 2;
            s.lens = [];
            s.lens[0] = jrOp;
            s.lens[1] = function(vars) {
              const lab = Parser.evaluate(par2, vars);
              const disp = lab - (vars._PC + 2);
              if (disp > 127 || disp < -128) throw "Target is out of relative jump reach";
              return disp < 0 ? disp + 256 : disp;
            };
            return s;
          }
        } else {
          // Forward reference: optimistically emit JR, will re-evaluate next pass1 iteration
          const jrOp = 0x20 + (reg << 3);
          s.bytes = 2;
          s.lens = [];
          s.lens[0] = jrOp;
          s.lens[1] = function(vars) {
            const lab = Parser.evaluate(par2, vars);
            const disp = lab - (vars._PC + 2);
            if (disp > 127 || disp < -128) throw "Target is out of relative jump reach";
            return disp < 0 ? disp + 256 : disp;
          };
          return s;
        }
      }
      op += reg<<3;
      s.bytes = 3;
      s.lens=[];
      s.lens[0] = op;
      s.lens[1] = function(vars){return Parser.evaluate(par2,vars); };
      s.lens[2] = null;
      return s;
    }
  } else if (reg<0) {
    throw "Invalid JP COND code: "+reg;
  }
  return null;
}
```

Also handle the **unconditional JP** case. Find the unconditional JP encoding (1-param case, at line 253 — the `if (ax[12]>0)` block in the `ax` branch). The `(HL)`/`(IX)`/`(IY)` indirect forms are handled first (lines 256–265); the plain label case follows at lines 281–284. Insert the JPOPT block **after** the `(HL)` guard returns and **before** the standard `s.bytes = 3` emission (i.e., between lines 280 and 281). Add JPOPT handling there too:

```js
// In the 1-param JP handling (ax branch, unconditional JP):
// After confirming it's JP with a label target (not JP (HL)/(IX)/(IY)):
if (opts && opts.PRAGMAS && opts.PRAGMAS.indexOf("JPOPT") >= 0) {
  let target;
  try { target = Parser.evaluate(par1, vars); } catch(e) { target = null; }
  const pc = vars._PC;
  if (target !== null) {
    const offset = target - (pc + 2);
    if (offset >= -128 && offset <= 127) {
      s.bytes = 2;
      s.lens = [0x18];
      s.lens[1] = function(vars) {
        const lab = Parser.evaluate(par1, vars);
        const disp = lab - (vars._PC + 2);
        if (disp > 127 || disp < -128) throw "Target is out of relative jump reach";
        return disp < 0 ? disp + 256 : disp;
      };
      return s;
    }
  } else {
    s.bytes = 2;
    s.lens = [0x18];
    s.lens[1] = function(vars) {
      const lab = Parser.evaluate(par1, vars);
      const disp = lab - (vars._PC + 2);
      if (disp > 127 || disp < -128) throw "Target is out of relative jump reach";
      return disp < 0 ? disp + 256 : disp;
    };
    return s;
  }
}
```

**Note:** Before writing, read the unconditional JP section carefully (around lines 380–410) to find the exact insertion point — specifically where `JP (HL)` is handled vs plain `JP label`. Insert the JPOPT block after the `(HL)`/`(IX)`/`(IY)` checks so those indirect forms are never affected.

- [ ] **Step 3: Run tests**

```bash
npm test 2>&1 | grep -E "JPOPT|passed|failed"
```
Expected: all JPOPT tests pass, no regressions.

- [ ] **Step 4: Commit**

```bash
git add cpu/z80.js
git commit -m "feat: implement .pragma JPOPT JP→JR size optimization for Z80"
```

---

### Task 5: Integration test — full compile with .pragma JPOPT

Verify end-to-end via `compile()` not just `parseOpcode` directly.

**Files:**
- Modify: `test/asm-z80.js` (append integration tests)

- [ ] **Step 1: Add integration tests**

First check `test/asm-z80.js` for existing imports. Add `import { compile } from "../asm.js";` at the top of the file if not already present. Then append to the end of the file:

```js
const compilefs = { readFile: async () => { throw new Error("no fs"); } };

QUnit.test("JPOPT integration: JP NZ compiled as JR NZ", async function(assert) {
  const src = `.pragma JPOPT\n.org 0x0100\n JP NZ, TARGET\n NOP\nTARGET: NOP`;
  const result = await compile(src, compilefs, { assembler: Z80 });
  // JP NZ→JR NZ = 2 bytes. So bytes at 0x100 should be [0x20, offset, 0x00, 0x00]
  // offset = TARGET - (0x100+2) = 0x103 - 0x102 = 1
  assert.equal(result.dump[0], 0x20, "first byte = 0x20 (JR NZ)");
  assert.equal(result.dump[1], 0x01, "offset = 1");
});

QUnit.test("JPOPT integration: JP P not converted", async function(assert) {
  const src = `.pragma JPOPT\n.org 0x0100\n JP P, TARGET\n NOP\nTARGET: NOP`;
  const result = await compile(src, compilefs, { assembler: Z80 });
  // JP P = 0xF2 addr_lo addr_hi
  assert.equal(result.dump[0], 0xF2, "first byte = 0xF2 (JP P)");
});

QUnit.test("JPOPT integration: JP NZ far → stays JP NZ", async function(assert) {
  // Fill with 200 NOPs between jump and target → out of range
  const nops = " NOP\n".repeat(200);
  const src = `.pragma JPOPT\n.org 0x0100\n JP NZ, TARGET\n${nops}TARGET: NOP`;
  const result = await compile(src, compilefs, { assembler: Z80 });
  assert.equal(result.dump[0], 0xC2, "first byte = 0xC2 (JP NZ, not optimized)");
});
```

- [ ] **Step 2: Run integration tests**

```bash
npm test 2>&1 | grep -E "JPOPT integration|passed|failed"
```
Expected: all pass.

- [ ] **Step 3: Commit**

```bash
git add test/asm-z80.js
git commit -m "test: add JPOPT integration tests via compile()"
```

---

## Chunk 3: Documentation and release

### Task 6: Update documentation

**Files:**
- Modify: `CLAUDE.md` — note JPOPT pragma in Z80 section if applicable
- Modify: `docs/cpu/` — check if z80 docs exist

- [ ] **Step 1: Check for existing Z80 docs**

```bash
ls docs/cpu/
```

- [ ] **Step 2: Update CLAUDE.md if needed**

If CLAUDE.md has a pragma list, add `JPOPT` to it. Otherwise skip.

- [ ] **Step 3: Commit docs**

```bash
git add CLAUDE.md  # only if changed
git commit -m "docs: document .pragma JPOPT in Z80 section"
```

### Task 7: Final test run and version bump

- [ ] **Step 1: Full test run**

```bash
npm test
```
Expected: all tests pass, coverage maintained.

- [ ] **Step 2: Version bump**

```bash
npm version patch
```

- [ ] **Step 3: Verify tag was created**

```bash
git log --oneline -5
git tag --list | tail -5
```
