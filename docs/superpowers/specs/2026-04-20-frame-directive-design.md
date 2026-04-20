# Design: .frame Directive for ASM80-core

**Date:** 2026-04-20  
**Status:** Approved

## Overview

Add `.frame` and `.frame_indirect` directives to ASM80-core. These directives attach stack-frame metadata to exported symbols, enabling the ic80 linker to perform static frame allocation and call-graph analysis.

## Syntax

```asm
.frame <symbol>, size=<N>, reentrant=<0|1>
.frame <symbol>, size=<N>, reentrant=<0|1>, calls=<sym1>|<sym2>|<sym3>
.frame_indirect <symbol>, sig=<fingerprint>
```

- `symbol` — function name (label in the module); association is by name, not position
- `size` — bytes for parameters + local variables (integer ≥ 0)
- `reentrant` — `1` = always uses stack ABI, never gets a static frame; `0` = may receive static frame
- `calls` — explicit callees the assembler cannot detect automatically (RST vectors, CALL 0005h for CP/M BDOS, jump tables); separator is `|`; merged with any future auto-detection (union, no duplicates)
- `.frame_indirect` — declares that the function calls a callback via function pointer of the given signature; adds fingerprint to `indirect[]`

## Fingerprint Format (`__sig_*`)

`__sig_<ret>_<params>` where type abbreviations are:

| Type | Abbrev |
|------|--------|
| void | v |
| signed char (1B) | c |
| unsigned char (1B) | uc |
| signed int (2B) | i |
| unsigned int (2B) | ui |
| signed long (4B) | l |
| unsigned long (4B) | ul |
| pointer (2B) | p |
| struct ≤2B | i |
| struct 3–4B | l |
| struct >4B | p |

No parameters → `v`. Examples: `__sig_v_ip`, `__sig_i_pp`, `__sig_v_v`.

Syntactic validation: the value of `sig=` must match `/^__sig_[a-z][a-z0-9]*(_[a-z][a-z0-9]*)+$/i`. Any other value → error.

## Architecture

### Storage: `opts.frames` and `opts.frameIndirectQueue`

Two maps populated in `pass1.js` and consumed in `objcode.js`.

```ts
type FrameRecord = {
  size: number,        // integer >= 0
  reentrant: boolean,
  calls: string[],     // uppercase symbol names, deduplicated
  indirect: string[],  // fingerprint strings
}

opts.frames: Map<SYMBOL_UPPERCASE, FrameRecord>
opts.frameIndirectQueue: Array<{ symbol: string, sig: string }>
```

The `frameIndirectQueue` decouples `.frame_indirect` from source order — entries are collected during pass1 and merged into `opts.frames` after pass1 completes (in `objcode.js`), eliminating order-dependence between `.frame` and `.frame_indirect`.

Symbols without a `.frame` directive have no `frame` key in their export record. ic80 interprets the absence as `reentrant = true`.

### pass1.js Changes

Handle two new opcodes: `.FRAME` and `.FRAME_INDIRECT`. Both generate no bytes (`continue` after processing).

**Initialization:** Reset both maps unconditionally at the start of each `pass1` run (not guarded), because `pass1` runs four times and the duplicate-frame check would otherwise fire on passes 2–4:

```js
opts.frames = {}
opts.frameIndirectQueue = []
```

**`.FRAME` processing:**
1. Use `op.params[0]` as symbol name; `op.params.slice(1)` as `key=value` pairs (the parser already splits on commas and trims).
2. Normalize symbol to UPPERCASE.
3. Parse each param token as `key=value`. Unknown keys (anything other than `size`, `reentrant`, `calls`) → error. Tokens without `=` → error.
4. Validate:
   - `size` missing or not an integer ≥ 0 → error
   - `reentrant` not `0` or `1` → error
   - `opts.frames[symbol]` already exists → error (duplicate `.frame`)
5. Parse `calls=`: split on `|`, trim, filter empty strings, uppercase, deduplicate.
6. Store: `opts.frames[symbol] = { size, reentrant: reentrant === 1, calls, indirect: [] }`

No symbol existence check in pass1 — symbol table is incomplete during pass runs.

**`.FRAME_INDIRECT` processing:**
1. Use `op.params[0]` as symbol name and find `sig=` in `op.params.slice(1)`.
2. Normalize symbol to UPPERCASE.
3. Validate `sig=` value against `/^__sig_[a-z][a-z0-9]*(_[a-z][a-z0-9]*)+$/i` → error if invalid.
4. Push `{ symbol, sig }` to `opts.frameIndirectQueue`. No immediate cross-check against `opts.frames` — order between `.frame` and `.frame_indirect` in source is unrestricted.

**MODULE pragma:** Both directives are **only valid inside MODULE context** (i.e. `opts.PRAGMAS` contains `"MODULE"`). If used outside a module → error, same as `.EXPORT` and `.EXTERN`.

### objcode.js Changes

After `pass1` output is available (i.e., at the start of `objCode()`), perform the merge and validation:

**Step 1 — merge `frameIndirectQueue` into `opts.frames`:**

```js
for (const { symbol, sig } of (opts.frameIndirectQueue || [])) {
  if (!opts.frames?.[symbol]) {
    throw { msg: `.frame_indirect for ${symbol} has no corresponding .frame` }
  }
  opts.frames[symbol].indirect.push(sig)
}
```

**Step 2 — unknown symbol warning:** After building the `exports` map, check every key in `opts.frames` against the full symbol table `vars`. The symbol must be **locally defined** — `vars[sym]` must be a number (an address), not `null`. `null` indicates an `.EXTERN` declaration, which is not a local label and must not silently pass:

```js
for (const sym of Object.keys(opts.frames || {})) {
  if (typeof vars[sym] !== "number") {
    console.warn(`.frame declared for unknown or extern symbol: ${sym}`)
  }
}
```

This is a **mandatory behavior** (not optional). `console.warn` is the mechanism for the initial implementation.

**Step 3 — attach frame to exports:** In the `.EXPORT` handler:

```js
if (opts.frames?.[name]) {
  exports[name].frame = opts.frames[name]
}
```

## Output Format

```json
{
  "exports": {
    "PUTS": {
      "addr": 0,
      "seg": "CSEG",
      "frame": {
        "size": 3,
        "reentrant": false,
        "calls": ["PUTC", "__CPMBDOS"],
        "indirect": []
      }
    }
  }
}
```

The same structure applies inside `.libz80` (`modules[i].obj.exports[sym].frame`).

## Error Table

| Situation | Behavior |
|-----------|----------|
| Duplicate `.frame` for same symbol | error |
| `size` missing, negative, or non-integer | error |
| `reentrant` not `0` or `1` | error |
| Unknown key in `.frame` params | error |
| Param token without `=` in `.frame` | error |
| `sig=` value not matching `__sig_*` pattern | error |
| `.frame_indirect` with no corresponding `.frame` (checked after all passes) | error |
| `.frame` or `.frame_indirect` used outside MODULE | error |
| `.frame` for symbol not in symbol table | `console.warn` (mandatory) |
| Symbol exported without `.frame` | no `frame` key in output (ic80 → `reentrant=true`) |

## Examples

```asm
; Simple function
.frame putc, size=1, reentrant=0
putc:
    RET

; CP/M BDOS via CALL 0005h — not auto-detectable
.frame bdos_write, size=5, reentrant=0, calls=__cpmbdos
bdos_write:
    LD C, 9
    CALL 0005h
    RET

; RST vector
.frame rst8_caller, size=2, reentrant=0, calls=RST_8_HANDLER
rst8_caller:
    RST 8
    RET

; Multiple explicit callees
.frame dispatch, size=4, reentrant=0, calls=handler_a|handler_b

; .frame_indirect before .frame — valid, order is unrestricted
.frame_indirect map_array, sig=__sig_i_ip
.frame map_array, size=4, reentrant=0
```

## Files to Modify

1. `pass1.js` — add `.FRAME` and `.FRAME_INDIRECT` handlers; reset `opts.frames` and `opts.frameIndirectQueue`
2. `objcode.js` — merge queue, warn on unknown symbols, attach `frame` to export record

## Files to Create

1. `test/asm-frame.js` — QUnit tests covering all directives, error cases, order independence, and output format
