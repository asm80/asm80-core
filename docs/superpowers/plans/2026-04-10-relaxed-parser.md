# Relaxed Parser Mode Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `opts.relaxed = true` mode to `compile()` that collects all parse/assembly errors across the full pipeline and throws them as an array instead of stopping at the first error.

**Architecture:** Each pipeline phase (parseLine, preprocessor, pass1, pass2) wraps its per-line/per-directive processing in try/catch; in relaxed mode errors are pushed to `opts.errors` and processing continues. `compile()` resets `opts.errors` before each Pass1 iteration (to discard phantom forward-reference errors), does NOT reset before Pass2, then throws `{ errors: [...] }` at the end.

**Tech Stack:** ES6 modules, QUnit tests (`npm test`), Node.js

---

## Chunk 1: compile() orchestration + integration test scaffold

### Task 1: Add relaxed mode scaffolding in `asm.js`

**Files:**
- Modify: `asm.js:38-129`
- Create: `test/relaxed.js`

- [ ] **Step 1: Write the failing integration test**

Add `test/relaxed.js`:

```javascript
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
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npm test 2>&1 | grep -A3 "relaxed"
```

Expected: tests fail (opts.relaxed not implemented yet).

- [ ] **Step 3: Add relaxed mode scaffolding to `compile()` in `asm.js`**

In `asm.js`, modify the `compile` function:

After the `opts = {...opts, ...}` spread (line ~48), add:
```javascript
    if (opts.relaxed) opts.errors = [];
```

Note: `asm.js` calls Pass1 four times as **four separate explicit call sites** (not a loop). Reset `opts.errors` immediately before each of the four calls — this discards phantom errors from earlier iterations where forward references were unresolved. Do NOT reset before `pass2`.

Replace the 4 `pass1` calls (lines ~67-73) with:
```javascript
    if (opts.relaxed) opts.errors = [];
    metacode = await pass1(parsedSource, null, opts)

    if (opts.relaxed) opts.errors = [];
    metacode = await pass1(metacode[0], metacode[1], opts);
    if (opts.relaxed) opts.errors = [];
    metacode = await pass1(metacode[0], metacode[1], opts);
    if (opts.relaxed) opts.errors = [];
    metacode = await pass1(metacode[0], metacode[1], opts);
    // DO NOT reset opts.errors here — pass1 errors must survive into pass2
```

After `metacode[1]["__PRAGMAS"] = opts.PRAGMAS;` and before `metacode = pass2(...)`, errors from final pass1 are now preserved (no reset before pass2).

Add the relaxed final-error throw **after `pass2` completes and after `out` is constructed, but still inside the outer `try` block, just before `return out`**:

```javascript
    if (opts.relaxed && opts.errors && opts.errors.length > 0) {
        throw { errors: opts.errors };
    }
    return out;
```

Then replace the `catch (e)` block entirely:

```javascript
    } catch (e) {
        if (opts.relaxed) {
            const fatalError = {
                msg: e.msg || "Internal error",
                s: e.s || "Fatal error",
                wline: opts.WLINE
            };
            throw { errors: [...(opts.errors || []), fatalError] };
        }
        let s = e.s || "Internal error";
        if (!e.msg) {
            console.error(e);
            throw {
                error: {
                    msg: `Cannot evaluate line ${opts.WLINE.numline}, there is some unspecified error (e.g. reserved world as label etc.)`,
                    wline: opts.WLINE
                }
            }
        }
        if (!e.s) e.s = s;
        throw {
            error: {
                msg: e.msg,
                s: e.s,
                wline: opts.WLINE
            }
        };
    }
```

Also add at end of the `try` block, just before the closing `}`:
```javascript
    if (opts.relaxed && opts.errors && opts.errors.length > 0) {
        throw { errors: opts.errors };
    }
```

- [ ] **Step 4: Run tests**

```bash
npm test 2>&1 | grep -A3 "relaxed"
```

Expected: The "no errors" test may pass. The "collects multiple errors" test still likely fails (errors not yet collected in phases). That's fine — we'll fix phases in later tasks.

- [ ] **Step 5: Commit**

```bash
git add asm.js test/relaxed.js
git commit -m "feat: add relaxed mode scaffolding to compile() with opts.errors collection"
```

---

## Chunk 2: parseLine + parser filter

### Task 2: Relaxed error capture in `parseLine.js` and marker filter in `parser.js`

**Files:**
- Modify: `parseLine.js:353-420` (the `parseOpcode` call and final throws)
- Modify: `parser.js:27`
- Test: `test/relaxed.js`

`★ Insight ─────────────────────────────────────`
`parseLine` is called both from `parser.js` (main path) and from within `unroll()` for macro expansion. Only the `parser.js` call gets the relaxed marker treatment — `unroll()` calls parseLine internally with a local opts without `relaxed`, so it won't produce markers.
`─────────────────────────────────────────────────`

- [ ] **Step 1: Add test for parseLine relaxed behavior**

Append to `test/relaxed.js`:

```javascript
import { parseLine } from "../parseLine.js";
import { Z80 } from "../cpu/z80.js";

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
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test 2>&1 | grep -E "parseLine.*relaxed|relaxed.*parseLine"
```

- [ ] **Step 3: Wrap `parseLine` body for relaxed mode**

In `parseLine.js`, wrap the entire exported function body. Change the export to:

```javascript
export const parseLine = (s, macros, opts = {stopFlag:null, olds:null, assembler:null}) => {
    if (opts.relaxed && opts.errors) {
        try {
            return parseLineCore(s, macros, opts);
        } catch (e) {
            opts.errors.push({
                msg: e.msg || String(e),
                s: e.s || "Parse error",
                wline: s
            });
            return { _parseError: true };
        }
    }
    return parseLineCore(s, macros, opts);
};
```

Rename the current function body to `parseLineCore` — add `const parseLineCore = (s, macros, opts = {stopFlag:null, olds:null, assembler:null}) => {` at the top (same default parameters as the original), close with `};` before the export. The wrapper must forward all three arguments: `parseLineCore(s, macros, opts)`.

- [ ] **Step 4: Add test for parser.js marker filter**

Append to `test/relaxed.js` (before the parseLine unit tests):

```javascript
import { parse } from "../parser.js";

QUnit.test("parser: _parseError markers are filtered before unroll()", async (assert) => {
  const opts = { assembler: Z80, relaxed: true, errors: [],
    readFile: async () => null, childOpts: null, resolvePath: null,
    includedFiles: {}, PRAGMAS: [] };
  // Two valid lines + one bad line — parse should return 2 lines, not 3
  const result = await parse("LD A, B\nBADINSTR\nLD B, C", opts);
  assert.equal(result.filter(l => !l._parseError && l.opcode).length, 2,
    "only valid lines reach unroll");
  assert.ok(opts.errors.length >= 1, "error was collected");
});
```

- [ ] **Step 5: Filter markers in `parser.js` before `unroll()`**

In `parser.js`, after the `parseLine` map call and before `unroll()`:

```javascript
  i = prei[0].map((line) => parseLine(line, prei[1], opts));
  if (opts.relaxed) i = i.filter(line => !line._parseError);
  i = unroll(i, prei[1], null, opts);
```

- [ ] **Step 6: Run tests**

```bash
npm test 2>&1 | grep -E "relaxed|parseLine"
```

Expected: parseLine relaxed tests pass.

- [ ] **Step 7: Commit**

```bash
git add parseLine.js parser.js test/relaxed.js
git commit -m "feat: relaxed error capture in parseLine with _parseError marker filter"
```

---

## Chunk 3: preprocessor relaxed error capture

### Task 3: Relaxed error capture in `preprocessor.js`

**Files:**
- Modify: `preprocessor.js:90-324`
- Test: `test/relaxed.js`

- [ ] **Step 1: Add test for preprocessor relaxed behavior**

Append to `test/relaxed.js`:

```javascript
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
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npm test 2>&1 | grep "INCLUDE.*missing\|missing.*INCLUDE"
```

- [ ] **Step 3: Wrap directive throws in `preprocessor.js`**

In `prepro()`, the `for (const item of V)` loop contains several `throw` statements for directive errors (`.INCLUDE` file not found, `.MACRO` bad name, `.ENDM` without MACRO, `.REPT` bad count, missing ENDM at end).

Wrap each directive's error-path `throw` with a relaxed check. Pattern for each:

```javascript
// BEFORE:
throw { msg: "Some error", s: item };

// AFTER:
if (opts.relaxed && opts.errors) {
    opts.errors.push({ msg: "Some error", s: "Preprocessor error", wline: item });
    continue;  // or skip the rest of the directive handling
}
throw { msg: "Some error", s: item };
```

Apply this pattern to the following **exact throw sites** in `preprocessor.js`:

1. **`.INCLUDE`, no filename** (~line 136): `if (!params?.[0]) throw { msg: "No file name given", s: item }`
2. **`.INCLUDE`, file not found** (~line 168): `if (!nf) throw { msg: \`File ${params[0]} not found\`, s: item }`  
   — after pushing error, `continue` to skip the rest of the include handling for this item
3. **`.ENDM`, no macro** (~line 202): `if (!macroDefine) throw { msg: \`ENDM without MACRO at line ${item.numline}\`, s: item }`
4. **`.MACRO`, bad name** (~line 272): `if (!macroName) throw { msg: \`Bad macro name at line ${item.numline}\`, s: item }`  
   — after pushing error, `continue`
5. **`.MACRO`, redefinition** (~line 283): `if (macros[macroDefine]) throw { msg: \`Macro ${macroDefine} redefinition at line ${item.numline}\`, s: item }`  
   — after pushing error, `continue`
6. **`.REPT`, no count** (~line 292): `if (!params?.[0]) throw { msg: "No repeat count given", s: item }`
7. **`.REPT`, bad count** (~line 296-297): `if (!reptCount || reptCount < 1) throw { msg: "Bad repeat count given", s: item }`
8. **End-of-loop MACRO without ENDM** (~line 316-321): `if (macroDefine) throw { msg: \`MACRO ${macroDefine} has no appropriate ENDM\` }`  
   — in relaxed mode: push error and `return [out, macros]` (no `continue` possible — we're after the loop)

Do NOT touch the throws in `macroParams()` (line ~28) or `findBlock()` (line ~78) — these are helpers that do not have access to `opts`.

- [ ] **Step 4: Run tests**

```bash
npm test 2>&1 | grep "relaxed\|INCLUDE"
```

Expected: preprocessor relaxed test passes.

- [ ] **Step 5: Commit**

```bash
git add preprocessor.js test/relaxed.js
git commit -m "feat: relaxed error capture in preprocessor directives"
```

---

## Chunk 4: pass1 + pass2 relaxed error capture

### Task 4: Relaxed per-line error capture in `pass1.js`

**Files:**
- Modify: `pass1.js:33` (main loop)
- Test: `test/relaxed.js`

- [ ] **Step 1: Add pass1 relaxed test**

Append to `test/relaxed.js`:

```javascript
QUnit.test("relaxed: pass1 error on one line does not stop other lines",
  async (assert) => {
    // BADINSTR will fail in pass1, but LD A,B should still be processed
    const src = "LABEL1: LD A, B\nBADINSTR\nLABEL2: LD B, C";
    try {
      await asm.compile(src, fs, z80opts);
      assert.ok(false, "should throw");
    } catch (e) {
      assert.ok(Array.isArray(e.errors), "throws errors array");
      // LABEL1 and LABEL2 should still be in vars despite the error
      // We can't easily check vars here but at least errors are collected
      assert.ok(e.errors.length >= 1, "at least one error collected");
    }
  }
);
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npm test 2>&1 | grep "pass1 error"
```

- [ ] **Step 3: Wrap pass1 main loop body with relaxed try/catch**

In `pass1.js`, the main loop is `for (let op of V) { ... }`. The entire loop body should be wrapped so errors can be caught per-line.

Since there are already internal `try/catch` blocks inside the loop for specific cases (IF condition evaluation), wrap the entire `for` loop body — from `const origin = {...op.origin}` to the end of the loop body — in:

```javascript
for (let op of V) {
    if (opts.relaxed && opts.errors) {
        try {
            // ... existing loop body ...
        } catch (e) {
            opts.errors.push({
                msg: e.msg || String(e),
                s: e.s || "Pass1 error",
                wline: opts.WLINE || op
            });
            continue;
        }
    } else {
        // ... existing loop body (unchanged) ...
    }
}
```

To avoid duplicating the loop body, extract it to an inner function or simply use the try/catch inline with a flag. The cleanest approach in this codebase: add `if (opts.relaxed && opts.errors) { try { ... } catch(e) { opts.errors.push(...); continue; } } else { ... }` — but that duplicates code. Instead, use:

```javascript
for (let op of V) {
    try {
        // ... entire existing loop body ...
    } catch (e) {
        if (opts.relaxed && opts.errors) {
            opts.errors.push({
                msg: e.msg || String(e),
                s: e.s || "Pass1 error",
                wline: opts.WLINE || op
            });
            continue;
        }
        throw e;
    }
}
```

This is the minimal change: wrap the existing loop body in try/catch, rethrow in normal mode.

**Important:** The existing loop body in `pass1.js` already contains inner try/catch blocks for `IF`/`IFN` condition evaluation — but those inner catches have **empty bodies** (errors are silently ignored for unresolved IF conditions). The new outer try/catch will not interfere with them: if the inner catch swallows an error, no exception propagates to the outer catch. The outer catch only fires on errors not already handled by inner catches.

- [ ] **Step 4: Run tests**

```bash
npm test 2>&1 | grep "relaxed\|pass1"
```

Expected: pass1 relaxed test passes, all other tests still pass.

- [ ] **Step 5: Commit**

```bash
git add pass1.js test/relaxed.js
git commit -m "feat: relaxed per-line error capture in pass1"
```

### Task 5: Relaxed per-line error capture in `pass2.js`

**Files:**
- Modify: `pass2.js:622-628` (the existing catch block)
- Test: `test/relaxed.js`

`★ Insight ─────────────────────────────────────`
`pass2.js` already has a try/catch wrapping the loop body (lines 62-628). The catch at line 622 currently always rethrows. We only need to modify that one catch block — not restructure the loop.
`─────────────────────────────────────────────────`

- [ ] **Step 1: Add pass2 relaxed test**

Append to `test/relaxed.js`:

```javascript
QUnit.test("relaxed: full pipeline collects errors from multiple phases",
  async (assert) => {
    const src = [
      "LD A, B",        // valid
      "BADINSTR1",      // parse/pass1 error
      "LD B, C",        // valid
      "BADINSTR2",      // parse/pass1 error
      "LD H, L",        // valid
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
```

- [ ] **Step 2: Run test to confirm current state**

```bash
npm test 2>&1 | grep "full pipeline"
```

- [ ] **Step 3: Modify pass2 catch block**

In `pass2.js`, find the catch block at line ~622:

```javascript
      } catch (e) {
        throw {
          msg: e.msg,
          s: op,
          e: e
        };
      }
```

Replace with:

```javascript
      } catch (e) {
        if (opts.relaxed && opts.errors) {
          opts.errors.push({
            msg: e.msg || String(e),
            s: e.s || "Pass2 error",
            wline: op
          });
          continue;
        }
        throw {
          msg: e.msg,
          s: op,
          e: e
        };
      }
```

- [ ] **Step 4: Run full test suite**

```bash
npm test
```

Expected: all existing tests pass, new relaxed tests pass.

- [ ] **Step 5: Commit**

```bash
git add pass2.js test/relaxed.js
git commit -m "feat: relaxed per-line error capture in pass2"
```

---

## Chunk 5: Edge cases + wline enrichment

### Task 6: Enrich error wline with includedFile info + edge case tests

**Files:**
- Modify: `test/relaxed.js`
- Review: `asm.js`, `pass1.js` (wline already has includedFile via opts.WLINE)

- [ ] **Step 1: Add included file error test**

The `test/suite/` directory has existing `.a80` files. Create a minimal include fixture:

Create `test/suite/relaxed-include.asm`:
```asm
LD A, B
BADINSTR_IN_INCLUDE
LD B, C
```

Create `test/suite/relaxed-main.asm` — not needed, test inline via fileSystem mock.

Append to `test/relaxed.js`:

```javascript
QUnit.test("relaxed: errors in included files carry includedFile info",
  async (assert) => {
    const mockFs = {
      readFile: async (path) => {
        if (path === "inc.asm") return "LD A, B\nBADINSTR_IN_INC\nLD B, C";
        return null;
      },
      childOpts: null,
      resolvePath: (p) => p
    };
    const src = "LD H, L\n.INCLUDE \"inc.asm\"\nLD A, B";
    try {
      await asm.compile(src, mockFs, { assembler: Z80, relaxed: true });
      assert.ok(false, "should throw");
    } catch (e) {
      assert.ok(Array.isArray(e.errors), "throws errors array");
      const incErr = e.errors.find(err => err.wline && err.wline.includedFile === "inc.asm");
      assert.ok(incErr, "error from included file has includedFile set");
    }
  }
);
```

- [ ] **Step 2: Run test**

```bash
npm test 2>&1 | grep "included file"
```

Expected: passes (wline attribution is automatic via opts.WLINE which carries includedFile).

- [ ] **Step 3: Run full test suite to confirm no regressions**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add test/relaxed.js
git commit -m "test: add included file error attribution test for relaxed mode"
```

---

## Chunk 6: Final verification

### Task 7: Full suite check + coverage review

- [ ] **Step 1: Run full test suite with coverage**

```bash
npm test
```

Expected: all tests pass, coverage report generated to `coverage/`.

- [ ] **Step 2: Check coverage for new code paths**

```bash
# Check that relaxed branches are covered
grep -A2 "opts.relaxed" coverage/asm80-core/asm.js.html | head -30
```

Look for uncovered lines (marked in red in HTML report). All `if (opts.relaxed)` branches should be green.

- [ ] **Step 3: Add dedicated normal-mode regression assertion**

Append to `test/relaxed.js`:

```javascript
QUnit.test("normal mode: bad instruction still throws { error } not { errors }",
  async (assert) => {
    try {
      await asm.compile("BADINSTR", fs, { assembler: Z80 });
      assert.ok(false, "should throw");
    } catch (e) {
      assert.notOk(Array.isArray(e.errors), "does NOT throw errors array");
      assert.ok(e.error, "throws { error: ... } object");
      assert.ok(e.error.msg, "error has msg");
    }
  }
);
```

Run:
```bash
npm test 2>&1 | grep "normal mode"
```

Expected: PASS.

- [ ] **Step 4: Verify existing test suite**

```bash
npm test
```

Expected: all tests pass, no regressions in `test/asm.js`, `test/asm-z80.js`, or any other existing test files.

- [ ] **Step 4: Final commit if any cleanup needed**

```bash
git add -p  # stage only intentional changes
git commit -m "test: verify relaxed mode coverage"
```
