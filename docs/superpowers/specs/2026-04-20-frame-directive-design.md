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

## Architecture

### Storage: `opts.frames`

A map `SYMBOL_UPPERCASE → FrameRecord` populated in `pass1.js` and consumed in `objcode.js`.

```ts
type FrameRecord = {
  size: number,        // integer >= 0
  reentrant: boolean,
  calls: string[],     // uppercase symbol names, deduplicated
  indirect: string[],  // fingerprint strings
}
```

Symbols without a `.frame` directive have no `frame` key in their export record. ic80 interprets the absence as `reentrant = true`.

### pass1.js Changes

Handle two new opcodes: `.FRAME` and `.FRAME_INDIRECT`. Both generate no bytes (`continue` after processing).

**`.FRAME` processing:**
1. Use `op.params[0]` as symbol name; `op.params.slice(1)` as `key=value` pairs (the parser already splits on commas).
2. Normalize symbol to UPPERCASE.
3. Validate:
   - `size` missing or not an integer ≥ 0 → error
   - `reentrant` not `0` or `1` → error
   - `opts.frames[symbol]` already exists → error (duplicate `.frame`)
4. Parse `calls=`: split on `|`, trim, filter empty strings, uppercase, deduplicate.
5. Store: `opts.frames[symbol] = { size, reentrant: reentrant === 1, calls, indirect: [] }`
6. No symbol existence check in pass1 — forward references are normal in a multi-pass assembler. The unknown-symbol check is deferred to `objcode.js` (see below).

**`.FRAME_INDIRECT` processing:**
1. Use `op.params[0]` as symbol name and find `sig=` in `op.params.slice(1)`.
2. Normalize symbol to UPPERCASE.
3. If `opts.frames[symbol]` does not exist → error (`.frame` must precede `.frame_indirect`).
4. Push fingerprint string to `opts.frames[symbol].indirect`.

**Initialization:** Reset `opts.frames = {}` unconditionally at the start of each `pass1` run (not guarded with `if (!opts.frames)`), because `pass1` runs four times and the duplicate-frame check would otherwise fire on passes 2–4.

**MODULE pragma:** No restriction — `.frame` and `.frame_indirect` are valid both inside and outside MODULE context (they are metadata, not relocation directives).

### objcode.js Changes

In the `.EXPORT` handler, after building the base export record:

```js
if (opts.frames?.[name]) {
  exports[name].frame = opts.frames[name]
}
```

This applies to all exports. The `frame` key is only present when a `.frame` directive was declared for that symbol.

**Unknown symbol warning:** After building `exports`, emit a warning for every key in `opts.frames` that is not present in `exports`. This is the correct place to check — the symbol table is complete at this point, unlike during `pass1` runs.

```js
for (const sym of Object.keys(opts.frames || {})) {
  if (!exports[sym]) {
    // warn: .frame declared for unknown symbol sym
  }
}
```

Note: ASM80-core currently has no warning infrastructure. A `console.warn` or a dedicated `opts.warnings` array may be introduced; alternatively this check can be omitted for the initial implementation and left as a future improvement.

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
| `size` negative or non-integer | error |
| `reentrant` not `0` or `1` | error |
| `.frame_indirect` without preceding `.frame` | error |
| `.frame` for unknown symbol | warning (checked in `objcode.js`, not `pass1`) |
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

; Callback via function pointer
.frame map_array, size=4, reentrant=0
.frame_indirect map_array, sig=__sig_i_ip
```

## Files to Modify

1. `pass1.js` — add `.FRAME` and `.FRAME_INDIRECT` handlers; initialize `opts.frames`
2. `objcode.js` — attach `frame` to export record when present

## Files to Create

1. `test/asm-frame.js` — QUnit tests covering all directives, error cases, and output format
