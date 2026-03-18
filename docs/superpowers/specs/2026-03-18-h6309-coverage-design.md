# H6309 Coverage Improvement — Design Spec

Date: 2026-03-18

## Overview

Improve test coverage for `cpu/h6309.js` from its current state (69.77% statements, 62.71% branches, 20.83% functions) to ≥95% statements and ≥95% branches by adding tests to the existing `test/asm-6309.js` file.

## Scope

- **Only file changed:** `test/asm-6309.js` — append new `QUnit.module` blocks
- **No changes to production code** (`cpu/h6309.js` is correct and all 1833 tests pass)
- **Target:** ≥95% statements, ≥95% branches for `cpu/h6309.js`

## What is currently untested

### 1. `ixregPC()` — PC branch and throw branch uncovered

The helper `ixregPC(par)` is a closure inside `parseOpcode`. It is called on every numeric-offset indexed path, so the function itself is reached. However two branches inside it are never taken:
- `r === 4` (PC register case) — returns `0x04` instead of `r << 5`
- `r < 0` (invalid register) — throws

Both branches require a test that passes `PC` or an invalid name as the base register in indexed addressing.

### 2. 5-bit offset indexed (`n,R` with small n)

Condition in code (line 478):
```javascript
if (zptest < 16 && zptest > -17 && ixregPC(p2) !== 4 && !indir)
```
Note: lower bound is `> -17` (strictly), so -17 itself does NOT take this path.

When the condition is met, postbyte = `ixreg(p2) | (zptest & 0x1f)` — no extra bytes. Example: `LDA 5,X` → `bytes=2`, postbyte = `0x05`.

### 3. High-address 5-bit indexed (zptest > 65519)

Condition: `zptest > 65536 - 17` (i.e., `> 65519`). Example: expressing -1 as 65535 hits this path. Postbyte encodes the 5-bit value via `(32 - (65536 - zptest)) & 0x1f`.

### 4. 8-bit signed offset indexed (−129 < n < 128, outside 5-bit range)

Condition: `zptest < 128 && zptest > -129 && zptest !== null`. Postbyte = `ixregPC(p2) | 0x88`, followed by 1 offset byte. `s.bytes` increments by 1 for the extra byte.

**Worked example — `LDA 100,X` at addr 0x100:**
- 1-byte opcode `0xA6`, postbyte `0x88 | 0x00 = 0x88`, 1 offset byte → `bytes = 3`
- Offset function returns `Parser.evaluate("100", vars)` → `100`

**Worked example — `LDA 10,PC` at addr 0x100 (8-bit PC-relative):**
- Postbyte = `0x04 | 0x88 = 0x8C`, `bytes = 3`
- Offset function returns `10 - vars._PC - 3 = 10 - 256 - 3 = -249` → wrapped: `256 - 249 = 7`

Sub-cases to test:
- Non-PC register (`LDA 100,X`) → postbyte `0x88`, offset = 100
- PC register (`LDA 10,PC`) → postbyte `0x8C`, offset = 7 (worked above)
- Negative offset (`LDA -5,X`) → offset converted: `256 + (-5) = 251`
- Indirect `[100,X]` → `indir = 0x10`, postbyte `0x98`

### 5. 16-bit offset indexed (n outside ±128 range, or n,W)

Condition: falls through all above cases. `s.bytes += 2`. Postbyte = `ixregPC(p2) | 0x89` for normal registers, `0xAF` for W.

Sub-cases to test:
- Non-PC register (`LDA 500,X`) → postbyte `0x89`, 2 offset bytes + null, `bytes=4`
- W register (`LDA 500,W`) → postbyte `0xAF` (W guard, skips ixregPC). **Must use offset ≥ 128** (e.g., 500) — offsets < 128 enter the 8-bit path first where there is NO W guard and `ixregPC("W")` throws.
- PC register (`LDA 1000,PC`) → postbyte `0x8D`, offset is PC-relative 16-bit
- Indirect (`LDA [500,X]`) → `indir = 0x10`, postbyte `0x99`

### 6. `zptest === null` fallthrough

When `Parser.evaluate(p1, vars)` throws (undefined symbol), `zptest` is set to `null`. In JS, `null` coerces to `0` in numeric comparisons, so `null < 16` and `null > -17` are both `true` — meaning the **5-bit path (line 478) is taken** when the base register is X/Y/U/S. To bypass the 5-bit path and reach the null-fallthrough-to-16-bit, the base register must be `PC` (`ixregPC("PC") === 4`), which makes the `ixregPC(p2) !== 4` guard false, skipping the 5-bit path. Then the 8-bit path's `zptest !== null` guard stops it, falling through to the 16-bit block.

**Test fixture:** `params: ["UNDEF", "PC"]` with `UNDEF` not in `vars`.

### 7. Indirect extended `[addr]` (single param)

Condition: `s.params.length === 1 && s.params[0][0] === "["`. Postbyte = `0x9F`, followed by 2-byte address.

Two sub-cases (exercising different `ax[2]` branches):
- `LDA [$1000]` — `ax[2] = 0xA6 ≤ 256` → opcode at `lens[0]`, postbyte `0x9F` at `lens[1]`
- `LDW [$1000]` — `ax[2] = 0x10A6 > 256` → 2-byte prefix at `lens[0..1]`, postbyte `0x9F` at `lens[2]`

### 8. AIM/OIM/EIM/TIM with indexed and extended addressing

Current tests only cover AIM with direct addressing (`<$10`). Two more paths exist:

- **Extended (1-param path):** `AIM #$FF,$1000` — after shift, `params = ["$1000"]` (length 1, no `[`) → hits 1-param non-indexed path with `amode=3` (extended, `>` prefix or auto-detected). `bytes = 4`: opcode(1) + imm(1) shifted in + addr(2). Note: `aim = true` runs AFTER the 1-param block inserts imm byte.
- **Indexed (2-param path):** `AIM #$FF,0,X` — after shift (first call), `params = ["0","X"]` → hits 2-param indexed path. `bytes = 3`: opcode(1) + imm(1) + postbyte(1).

### 9. Error paths

- `PSHS` with unrecognized register → throws (`pshsbyte` throws)
- `PSHU` with unrecognized register → throws (`pshubyte` throws)
- `EXG` with only 1 parameter → throws
- `TFM` with only 1 parameter → throws
- `AIM` without `#` prefix on first param → throws
- Indexed mode with invalid base register (not X/Y/U/S) → throws (`ixreg` throws)

## New QUnit modules

All appended to end of `test/asm-6309.js`:

| Module name | Tests |
|---|---|
| `H6309 indexed — 5-bit offset` | `LDA 5,X` (positive), `LDA 65535,X` (high-addr wrap) |
| `H6309 indexed — 8-bit offset` | `LDA 100,X`, `LDA -5,X` (negative), `LDA 10,PC` (PC-relative), `LDA [100,X]` (indirect) |
| `H6309 indexed — 16-bit offset` | `LDA 500,X`, `LDA 500,W` (offset ≥128 required for W), `LDA 1000,PC`, `LDA [500,X]` |
| `H6309 indexed — null offset` | `LDA UNDEF,PC` (zptest=null fallthrough — must use PC base to bypass 5-bit guard) |
| `H6309 indexed — indirect extended` | `LDA [$1000]` (1-byte opcode), `LDW [$1000]` (2-byte opcode) |
| `H6309 AIM indexed/extended` | `AIM #$FF,$1000` (extended path), `AIM #$FF,0,X` (indexed path) |
| `H6309 error paths` | PSHS bad reg, PSHU bad reg, EXG 1 param, TFM 1 param, AIM no hash, indexed bad reg |

## Test pattern

All tests follow the existing pattern in `test/asm-6309.js`:

```javascript
QUnit.test("LDA 100,X indexed 8-bit offset", function () {
  var s = { opcode: "LDA", params: ["100", "X"], addr: 0x100, lens: [], bytes: 0 };
  var p = H6309.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.bytes, 3, "bytes");
  QUnit.assert.equal(p.lens[1], 0x88, "postbyte 8-bit X");
  QUnit.assert.equal(typeof p.lens[2], "function", "offset function");
  QUnit.assert.equal(p.lens[2](vars), 100, "offset value");
});
```

Note: `s.bytes = 0` in fixtures is correct — `parseOpcode` unconditionally resets `s.bytes` internally.

## Notes on `vars`

The existing `vars = { _PC: 0x0100 }`.

For PC-relative offset functions, the value returned is `target - vars._PC - s.bytes` (with wrapping). The `s.bytes` is the final byte count at the time the lambda is called (resolved in pass2). For test assertions, call the function with `vars` directly and assert the numeric result.

**Example — `LDA 10,PC` → 8-bit PC-relative:**
- `s.bytes = 3` (1 opcode + 1 postbyte + 1 offset)
- `offset(vars) = 10 - 256 - 3 = -249` → `256 + (-249) = 7`

## Success criteria

After adding tests:
- `npm test` passes (all tests green, no regressions)
- `cpu/h6309.js` coverage ≥ 95% statements
- `cpu/h6309.js` coverage ≥ 95% branches
- `cpu/h6309.js` coverage ≥ 95% functions
