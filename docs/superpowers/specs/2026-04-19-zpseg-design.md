# ZPSEG Design

Date: 2026-04-19
Project: asm80-core
Status: Approved (design), pending implementation

## Goal

Introduce `ZPSEG` as a dedicated zero-page/direct segment with strict capacity/placement rules and forced short addressing behavior on CPUs where it applies.

## Scope

In scope:
- New `.ZPSEG` alias directive (`.SEGMENT ZPSEG`).
- `ZPSEG` address space constrained to `0x00..0xFF`.
- `.ORG` behavior in `ZPSEG` as absolute position within the segment.
- Collision and overflow detection in `ZPSEG`.
- Forced short/direct addressing for symbols from `ZPSEG` on:
  - 6502
  - 6800
  - 6809
- Tests (unit + E2E) and docs updates.

Out of scope:
- Any changes to generic linker semantics beyond normal handling of a new segment name.

## User-Facing Behavior

### Directives

- `.ZPSEG` switches current segment to `ZPSEG`.
- `.ORG` inside `ZPSEG` sets absolute position in `0..255`.

Example:

```asm
.zpseg
.org $50
sdcc_par1: .ds 2
sdcc_arg1: .ds 2
my_flag:   .ds 1

.org $FF
last:
semaphor:
    .ds 1
```

### Rules in `ZPSEG`

- Valid range is strictly `0x00..0xFF`.
- `.ORG` may move forward or backward.
- Allocation may not overflow past `0xFF`.
- Allocation may not overlap previously allocated bytes.
- Multiple labels at same address are allowed if no bytes are allocated between them.

### Errors

- `.ORG` value outside `0..255` in `ZPSEG` -> assembler error.
- Allocation that exceeds `0xFF` in `ZPSEG` -> assembler error.
- Allocation overlapping already used byte in `ZPSEG` -> assembler error.

## Technical Design

### 1) Parser and segment aliases

- Add `.ZPSEG` to recognized segment directives.
- Implement as alias to segment name `ZPSEG` (same mechanism as other segment aliases).

### 2) Pass1: ZPSEG occupancy model

Use byte occupancy bitmap:
- `zpUsed = new Array(256).fill(false)`

Behavior:
- Active in `ZPSEG` only.
- `.ORG` updates current segment PC (after range validation).
- Any byte-emitting or reserving directive marks occupied bytes in `zpUsed`.
- Before marking, check:
  - bounds (`start >= 0 && end <= 256`)
  - no occupied byte in target range

If any check fails, throw with line-context-aware assembler error.

Rationale:
- 256 entries is tiny and gives precise, deterministic overlap checks.

### 3) CPU backends: forced short/direct mode

`$$seg` metadata already tracks defining segment per symbol. Extend CPU behavior:

#### 6502
- Prefer zero-page encoding when referenced symbol is in `ZPSEG`.
- If instruction has no zero-page variant for that operand form, emit addressing-mode error.

#### 6800 and 6809
- Prefer/force direct mode when referenced symbol is in `ZPSEG`.
- If instruction does not support direct mode for given form, emit error (do not silently fall back to extended).

This keeps `ZPSEG` semantics explicit and predictable.

### 4) Linker

- No special-case linker behavior needed.
- `ZPSEG` is treated as a normal named segment with optional explicit base in link recipe.
- Existing dynamic segment mapping remains valid.

## Testing Strategy (TDD)

### RED tests first

1. `ZPSEG` + `.ORG` in-range basic allocation succeeds.
2. `.ORG` out of `0..255` fails.
3. Overflow fails (`.org $FF` + `.ds 2`).
4. Backward `.ORG` with overlap fails.
5. Backward `.ORG` without overlap succeeds.
6. Multiple labels on same address succeed.
7. 6502 symbol in `ZPSEG` emits zero-page form.
8. 6800 symbol in `ZPSEG` emits direct form.
9. 6809 symbol in `ZPSEG` emits direct form.
10. Forced short/direct mode unavailable -> error.

### E2E

- Assemble module using `ZPSEG` and `.ORG`.
- Link with `.lnk` that defines `ZPSEG` base.
- Verify:
  - link succeeds,
  - relocation values are correct,
  - emitted opcodes for relevant instructions are short/direct forms.

## Documentation Updates

- `docs/directives.json`: add `.ZPSEG`.
- `docs/relocable-modules.md`: `ZPSEG` semantics and constraints.
- `docs/asm.md`: segment model note for `ZPSEG`.

## Risks and Mitigations

- Risk: CPU-specific mode-selection regressions.
  - Mitigation: focused opcode-level tests per CPU + existing regression suite.

- Risk: false-positive overlaps if byte sizing differs by directive semantics.
  - Mitigation: mark occupancy using final pass1-calculated byte counts for each directive.

- Risk: ambiguous behavior when symbol values are unresolved in early pass.
  - Mitigation: rely on `$$seg` metadata (segment provenance), not only numeric value heuristics.
