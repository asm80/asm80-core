# Design: `.pragma JPOPT` — Z80 JP→JR Size Optimization

**Date:** 2026-04-04
**Status:** Approved

## Overview

Add a `.pragma JPOPT` directive for the Z80 assembler that automatically replaces `JP`/`JP cond` instructions with the shorter `JR`/`JR cond` encoding (2 bytes vs 3 bytes) wherever the target address falls within the relative jump range (−128..+127 bytes from the next instruction).

Primary use case: C compiler backends that emit `JP` uniformly — enabling size optimization without manual review of every jump.

## Pragma Behavior

- **Activation:** `.pragma JPOPT` anywhere in the source file activates the optimization for the entire file. `.pragma` directives are processed during `Parser.parse` (before all pass1 iterations), so `opts.PRAGMAS` is fully populated by the time pass1 runs. Placement within the source file is therefore irrelevant.
- **Scope:** Global — entire compilation unit.
- **Default:** Off (opt-in).

## Conversion Rules

| Instruction  | Condition JR-compatible? | In range? | Result |
|--------------|--------------------------|-----------|--------|
| `JP NZ,lbl`  | Yes (NZ/Z/NC/C)          | Yes       | `JR NZ,lbl` (2 bytes) |
| `JP Z,lbl`   | Yes                      | Yes       | `JR Z,lbl` (2 bytes) |
| `JP lbl`     | Yes (unconditional)      | Yes       | `JR lbl` (2 bytes) |
| `JP P,lbl`   | No (P/M/PE/PO)           | —         | `JP P,lbl` (3 bytes, unchanged) |
| `JP NZ,lbl`  | Yes                      | No        | `JP NZ,lbl` (3 bytes, fallback) |
| `JP (HL)`    | Indirect                 | —         | `JP (HL)` (1 byte, unchanged) |
| `JP (IX)`    | Indirect                 | —         | `JP (IX)` (2 bytes, unchanged) |
| `JP (IY)`    | Indirect                 | —         | `JP (IY)` (2 bytes, unchanged) |

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

The range check and encoding decision happen **inside `parseOpcode` at call time**, not inside a `lens` lambda. This is critical: `lens` lambdas run in pass2 (which executes only once) and must not mutate `s.bytes` or `s.lens`. The pass1 convergence works because `parseOpcode` is called fresh on each pass1 iteration with updated `vars`.

In the `JP` handling branch of `parseOpcode`:

```
if opts.PRAGMAS && opts.PRAGMAS.indexOf("JPOPT") >= 0:
  cond = COND(par1)
  if cond is JR-compatible (0..3) or unconditional:
    try to evaluate target address from vars
    if target is known:
      offset = target - (vars._PC + 2)
      if offset in -128..127:
        emit JR encoding:
          s.bytes = 2
          s.lens[0] = JR opcode (0x18 unconditional, or 0x20 + cond<<3)
          s.lens[1] = lambda(vars): compute and return relative offset byte
          return s
    else (target unknown — forward reference):
      optimistically emit JR (bytes=2), will re-evaluate next pass
  // fallthrough: emit standard JP encoding (bytes=3)
```

On the next pass1 iteration, `parseOpcode` is called again. If the now-known target is out of range, the fallthrough path emits JP (3 bytes) instead. Addresses re-stabilize over subsequent iterations.

The pragma check pattern follows the established codebase convention: `opts.PRAGMAS && opts.PRAGMAS.indexOf("JPOPT") >= 0`.

### 3. Pass1 convergence

Pass1 already repeats 5 times in `asm.js` to resolve forward references. The JP→JR optimization fits naturally:

- **Iteration 1:** Optimistically emit JR (bytes=2) for all compatible JPs where target is unknown or in range. Addresses shift.
- **Iterations 2–5:** Any JP whose target is now known and out of range falls through to JP (bytes=3). Addresses re-stabilize. Typically converges in 2–3 iterations.

No changes to `pass1.js` iteration count or `asm.js` are required.

**Boundary oscillation:** If a jump target sits exactly at offset ±127/−128, encoding as JR (2 bytes) shifts subsequent addresses by −1, which may push the offset to 128 — now out of range. Next pass emits JP (3 bytes), restoring offset to 127, and so on. After 5 fixed iterations the result depends on which parity the loop ends on. If the final pass emits JR but the offset is actually out of range, pass2's lambda will throw. To prevent this: if in the previous iteration the instruction was JP (3 bytes) and the current range check yields exactly ±127/−128, prefer JP (conservative fallback). Test suite must include offset=127 and offset=128 boundary cases.

## Call Sites

`parseOpcode` is called from `pass1.js`. The call site must be updated to pass `opts`:

```js
// pass1.js
let result = opts.assembler.parseOpcode(s, vars, Parser, opts);
```

## Testing

New tests in `test/asm-z80.js` (or a dedicated `test/pragma-jpopt.js`):

1. `JP NZ, label` with JPOPT, label in range → bytes=2, opcode=0x20
2. `JP Z, label` with JPOPT, label in range → bytes=2, opcode=0x28
3. `JP NC, label` with JPOPT, label in range → bytes=2, opcode=0x30
4. `JP C, label` with JPOPT, label in range → bytes=2, opcode=0x38
5. `JP label` (unconditional) with JPOPT, in range → bytes=2, opcode=0x18
6. `JP P, label` with JPOPT → bytes=3, stays JP (0xF2)
7. `JP M, label` with JPOPT → bytes=3, stays JP (0xFA)
8. `JP NZ, far_label` (>127 bytes away) with JPOPT → bytes=3, opcode=0xC2 (JP NZ)
9. Forward reference (label defined after JP) in range → final output is JR (2 bytes, verify via compiled byte count)
10. Forward reference out of range → final output is JP (3 bytes, verify via compiled byte count)
11. Without `.pragma JPOPT`: `JP NZ` stays JP regardless
12. `JP (HL)` with JPOPT → unchanged (1 byte)

## Files to Modify

| File | Change |
|------|--------|
| `cpu/z80.js` | Add JPOPT logic in JP branch; add `opts` param |
| `cpu/*.js` (all others) | Add `opts` param to `parseOpcode` signature |
| `pass1.js` | Pass `opts` to `parseOpcode` call |
| `test/asm-z80.js` | Add JPOPT tests |
