# Relaxed Parser Mode — Design Spec

**Date:** 2026-04-10  
**Status:** Approved

## Overview

Add a `relaxed` compilation mode to asm80-core that collects all errors throughout the entire compilation pipeline instead of stopping at the first error. Intended for IDE integrations that need to display all errors at once.

## Activation

The caller passes `opts.relaxed = true` to `compile()`. This is a caller-controlled flag — it is not settable from within the assembled source code.

```javascript
const result = await compile(source, fileSystem, { assembler: Z80, relaxed: true });
```

## Error Format

Each collected error:
```javascript
{
  msg: "Error description",
  s: "Pass type string",   // e.g. "Parse error", "Pass1 error"
  wline: {
    numline: 42,
    line: "LD A, BADINSTR",
    includedFile: "lib.asm",      // present if error is in an included file
    includedFileAtLine: 10        // line number of the .include directive
  }
}
```

In relaxed mode, if any errors were collected, `compile()` throws:
```javascript
throw { errors: [ ...collectedErrors ] }
```

In normal mode, behavior is unchanged: `throw { error: { msg, s, wline } }`.

## Pipeline Changes

### Internal state

`compile()` initializes `opts.errors = []` when `opts.relaxed = true`. This array is a shared reference passed through all phases — recursive `prepro()` calls for included files share the same array automatically via `opts`.

### Phase 1: `parseLine.js`

- Wrap the function body in try/catch.
- On error in relaxed mode: push to `opts.errors`, return a `{ _parseError: true }` marker object instead of throwing.
- `parser.js` filters out marker objects **after `parseLine` but before `unroll()`**, so that `unroll()` never receives a marker object (which would lack the `.opcode`, `.params`, `.label` fields it expects).

### Phase 2: `preprocessor.js` (prepro)

- Wrap directive handling (`.INCLUDE`, `.MACRO`, `.REPT`, `.ENDM`) in try/catch.
- On error in relaxed mode: push to `opts.errors`, skip the offending directive, continue loop.
- Recursive `prepro()` calls for included files receive the same `opts` object, so errors from included files accumulate in the same `opts.errors` array.

### Phase 3: `pass1.js`

- Wrap the per-line processing body in try/catch.
- On error in relaxed mode: push to `opts.errors`, `continue` to next line.
- **Pass1 runs 4 times** for forward reference resolution. `opts.errors` is **reset to `[]` at the start of each Pass1 iteration** in `compile()`. Only errors surviving the final (4th) Pass1 iteration are kept. This prevents phantom errors from early passes where forward references were not yet resolved.

### Phase 4: `pass2.js`

- Same pattern as pass1: per-line try/catch, push error, continue.

### Phase 5: `compile()` (asm.js)

- Initialize `opts.errors = []` at start if `opts.relaxed`.
- The outer try/catch is kept for fatal errors (missing assembler, etc.).
- `opts.errors` is **reset to `[]` before each of the 4 Pass1 iterations**. It is **not reset before Pass2** — Pass1 errors from the final iteration must survive into Pass2 and be accumulated alongside Pass2 errors.
- `prepro()` and recursive `prepro()` calls for included files receive the same `opts` object (not a copy), so `opts.errors` is a true shared reference and included-file errors accumulate in the same array.
- At the end of the pipeline, if `opts.relaxed && opts.errors.length > 0`: throw `{ errors: opts.errors }`.
- If relaxed mode and no errors: return result normally.

## Error Attribution for Included Files

Lines from included files already carry `includedFile` and `includedFileAtLine` properties (set in `preprocessor.js`). The error's `wline` is taken from `opts.WLINE` (set before each line is processed), so included-file attribution is automatic with no extra work.

## Backward Compatibility

- Normal mode (`opts.relaxed` absent or false): no change in behavior.
- Existing `opts.PRAGMAS.RELAX` (array-based) is unrelated and untouched.
- The thrown object shape in normal mode (`{ error: ... }`) is unchanged.
- New relaxed mode always throws `{ errors: [...] }` (array, even for a single error).

## Fatal Errors in Relaxed Mode

Some errors are fatal and cannot be skipped (e.g. missing ENDM, unresolvable circular INCLUDE, missing assembler). When a fatal error fires, `compile()` throws:

```javascript
throw { errors: [...opts.errors, { msg: fatalError.msg, s: fatalError.s, wline: opts.WLINE }] }
```

Partial errors collected up to the fatal point are included in the array so the caller still sees all previously discovered issues.

## Known Limitations

- **No column number in errors.** The error format includes `numline` but no column offset. Most IDE integrations require a column for inline squiggles. This is a known gap — deferred to a future enhancement.

## Out of Scope

- No pragma-based activation from within source code.
- No streaming/callback error delivery.
- The existing `opts.PRAGMAS.RELAX` range-check behavior is not modified.
