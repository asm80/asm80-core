# Design: `.pragma JPOPT` — Z80 JP→JR Size Optimization

**Date:** 2026-04-04
**Status:** Approved

## Overview

Add a `.pragma JPOPT` directive for the Z80 assembler that automatically replaces `JP`/`JP cond` instructions with the shorter `JR`/`JR cond` encoding (2 bytes vs 3 bytes) wherever the target address falls within the relative jump range (−128..+127 bytes from the next instruction).

Primary use case: C compiler backends that emit `JP` uniformly — enabling size optimization without manual review of every jump.

## Pragma Behavior

- **Activation:** `.pragma JPOPT` anywhere in the source file activates the optimization for the entire file (pragmas are parsed before pass1, so placement is irrelevant).
- **Scope:** Global — entire compilation unit.
- **Default:** Off (opt-in).

## Conversion Rules

| Instruction | Condition JR-compatible? | In range? | Result |
|-------------|--------------------------|-----------|--------|
| `JP NZ,lbl` | Yes (NZ/Z/NC/C)         | Yes       | `JR NZ,lbl` (2 bytes) |
| `JP Z,lbl`  | Yes                      | Yes       | `JR Z,lbl` (2 bytes) |
| `JP lbl`    | Yes (unconditional)      | Yes       | `JR lbl` (2 bytes) |
| `JP P,lbl`  | No (P/M/PE/PO)           | —         | `JP P,lbl` (3 bytes, unchanged) |
| `JP NZ,lbl` | Yes                      | No        | `JP NZ,lbl` (3 bytes, fallback) |
| `JP (HL)`   | Indirect                 | —         | `JP (HL)` (1 byte, unchanged) |

JR-compatible conditions: **NZ, Z, NC, C** (condition codes 0–3, opcodes 0x20/0x28/0x30/0x38).
Non-convertible conditions: **P, M, PE, PO** — Z80 JR instruction does not support these.

## Implementation

### 1. `parseOpcode` API change (all CPU modules)

All CPU modules receive a new optional `opts` parameter:

```js
parseOpcode(s, vars, Parser, opts)
```

Modules other than Z80 ignore `opts`. This unifies the API and prepares for future CPU-specific pragmas.

Affected files: `cpu/z80.js`, `cpu/i8080.js`, `cpu/i8008.js`, `cpu/m6800.js`, `cpu/m6803.js`, `cpu/c6502.js`, `cpu/c65816.js`, `cpu/m6809.js`, `cpu/h6309.js`, `cpu/cdp1802.js`, `cpu/z180.js`, `cpu/s2650.js`, `cpu/sm83.js`

### 2. `cpu/z80.js` — JP processing with JPOPT

In the `JP` handling branch of `parseOpcode`:

```
if JPOPT in opts.PRAGMAS:
  cond = COND(par1)
  if cond is JR-compatible (0..3) or unconditional:
    emit JR encoding:
      bytes = 2
      lens[0] = JR opcode (0x18 unconditional, or 0x20 + cond<<3)
      lens[1] = lambda(vars):
                  offset = target - (vars._PC + 2)
                  if offset in -128..127: return (offset < 0 ? offset+256 : offset)
                  else: DEGRADE — set bytes=3, emit JP encoding, return sentinel
```

The "degrade" path: if offset is out of range during a pass1 iteration, revert `s.bytes` to 3 and emit the standard 3-byte JP encoding. The pass1 loop (runs 5×) converges as addresses stabilize.

### 3. Pass1 convergence

Pass1 already repeats 5 times in `asm.js` to resolve forward references. The JP→JR optimization fits naturally:

- **Iteration 1:** Optimistically emit JR (bytes=2) for all compatible JPs. Addresses shift.
- **Iterations 2–5:** Any JR whose target is now out of range reverts to JP (bytes=3). Addresses re-stabilize. Typically converges in 2–3 iterations.

No changes to `pass1.js` or `asm.js` iteration count are required.

## Call Sites

`parseOpcode` is called from `pass1.js`. The call site must be updated to pass `opts`:

```js
// pass1.js
let result = opts.assembler.parseOpcode(s, vars, Parser, opts);
```

## Testing

New tests in `test/asm-z80.js` (or a dedicated `test/pragma-jpopt.js`):

1. `JP NZ, label` with JPOPT → bytes=2, opcode=0x20
2. `JP Z, label` with JPOPT → bytes=2, opcode=0x28
3. `JP NC, label` with JPOPT → bytes=2, opcode=0x30
4. `JP C, label` with JPOPT → bytes=2, opcode=0x38
5. `JP label` (unconditional) with JPOPT → bytes=2, opcode=0x18
6. `JP P, label` with JPOPT → bytes=3, stays JP (0xF2)
7. `JP M, label` with JPOPT → bytes=3, stays JP (0xFA)
8. `JP NZ, far_label` (out of range) with JPOPT → bytes=3, fallback to JP
9. Forward reference in range → JR
10. Forward reference out of range → JP fallback
11. Without `.pragma JPOPT`: `JP NZ` stays JP regardless
12. `JP (HL)` with JPOPT → unchanged

## Files to Modify

| File | Change |
|------|--------|
| `cpu/z80.js` | Add JPOPT logic in JP branch; add `opts` param |
| `cpu/*.js` (all others) | Add `opts` param to `parseOpcode` signature |
| `pass1.js` | Pass `opts` to `parseOpcode` call |
| `test/asm-z80.js` | Add JPOPT tests |
