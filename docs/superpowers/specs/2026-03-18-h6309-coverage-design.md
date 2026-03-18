# H6309 Coverage Improvement — Design Spec

Date: 2026-03-18

## Overview

Improve test coverage for `cpu/h6309.js` from its current state (69.77% statements, 62.71% branches, 20.83% functions) to ≥95% statements and ≥95% branches by adding tests to the existing `test/asm-6309.js` file.

## Scope

- **Only file changed:** `test/asm-6309.js` — append new `QUnit.module` blocks
- **No changes to production code** (`cpu/h6309.js` is correct and all 1833 tests pass)
- **Target:** ≥95% statements, ≥95% branches for `cpu/h6309.js`

## What is currently untested

### 1. `ixregPC()` function (0% — never called)

The helper function `ixregPC(par)` handles PC and X/Y/U/S register lookup for indexed addressing with offsets. It is never exercised because no test uses PC-relative or large-offset indexed addressing.

### 2. 5-bit offset indexed (`n,R` with small n)

When `zptest >= -17 && zptest < 16` and the register is not PC and not indirect, the postbyte encodes a 5-bit signed offset. Example: `LDA 5,X` → postbyte = `0x05` (1 byte total for postbyte, no extra bytes).

### 3. High-address 5-bit indexed (zptest > 65536−17)

When the offset wraps near 65536 (e.g., `LDA -1,X` expressed as 65535), the 5-bit negative encoding applies.

### 4. 8-bit signed offset indexed (`n,R` with −128 ≤ n < 128)

When `zptest >= -129 && zptest < 128` but outside the 5-bit range. Postbyte = `ixregPC(p2) | 0x88`, followed by 1 offset byte. Example: `LDA 100,X` → 3 bytes (opcode + postbyte + offset).

Sub-cases:
- Non-PC register (`LDA 100,X`)
- PC register — offset is PC-relative (`LDA 10,PC`)
- Indirect variant (`LDA [100,X]`)
- Negative offset converted to unsigned (`LDA -5,X`)

### 5. 16-bit offset indexed (`n,R` with large n)

When offset is outside 8-bit range. Postbyte = `ixregPC(p2) | 0x89`, followed by 2 offset bytes + null.

Sub-cases:
- Non-PC register (`LDA 500,X`)
- W register — always 16-bit, postbyte = `0xAF` (`LDA 100,W`)
- PC register (`LDA 1000,PC`)
- Indirect variant (`LDA [500,X]`)

### 6. Indirect extended `[addr]`

Single parameter with brackets: `LDA [$1000]`. Postbyte = `0x9F`, followed by 2-byte address.

Sub-cases:
- 1-byte opcode (`LDA [$1000]`)
- 2-byte opcode (`LDW [$1000]`)

### 7. AIM/OIM/EIM/TIM with indexed addressing

Current tests only cover AIM with direct addressing. The indexed mode path (`ax[2]`) is untested.

### 8. Error paths

- `PSHS` / `PULS` / `PSHU` / `PULU` with unrecognized register name → throws
- `EXG` with only 1 parameter → throws
- `TFM` with only 1 parameter → throws
- `ADDR` with non-existent register name → throws (parnibble fails)
- Indexed mode with invalid register → throws (ixreg fails)
- AIM without `#` prefix → throws

## New QUnit modules

All appended to end of `test/asm-6309.js`:

| Module name | Tests |
|---|---|
| `H6309 indexed — 5-bit offset` | `LDA 5,X`, `LDA -1,X` (high-address wrap) |
| `H6309 indexed — 8-bit offset` | `LDA 100,X`, `LDA -5,X`, `LDA 10,PC`, indirect `[100,X]` |
| `H6309 indexed — 16-bit offset` | `LDA 500,X`, `LDA 100,W`, `LDA 1000,PC`, indirect `[500,X]` |
| `H6309 indexed — indirect extended` | `LDA [$1000]`, `LDW [$1000]` |
| `H6309 AIM indexed` | `AIM #$FF,$1000` (extended), `AIM` indexed with `["#$FF","0","X"]` |
| `H6309 error paths` | PSHS bad reg, EXG 1 param, TFM 1 param, AIM no hash, indexed bad reg |

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

## Notes on `vars`

The existing `vars = { _PC: 0x0100 }`. For PC-relative tests, the expected offset = `target - _PC - bytes`. For 8-bit PC-relative: `n - 0x0100 - bytes`.

## Success criteria

After adding tests:
- `npm test` passes (all tests green, no regressions)
- `cpu/h6309.js` coverage ≥ 95% statements
- `cpu/h6309.js` coverage ≥ 95% branches
- `cpu/h6309.js` coverage ≥ 95% functions
