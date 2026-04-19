# Segment Model Generalization Design

Date: 2026-04-19
Project: asm80-core
Status: Approved (design), pending implementation

## Goal

Generalize segment handling so assembler and linker support arbitrary segment names via `.SEGMENT <name>`, while preserving backward compatibility with existing directives `.CSEG`, `.DSEG`, `.ESEG`, `.BSSEG`.

Add new alias directive `.HEAPSEG` in step 1.

In step 2, add special zeropage behavior for `ZPSEG` with automatic ZP hints.

## Scope

In scope (step 1):
- New generic segment directive `.SEGMENT <name>`.
- Alias directives map to generic segment switching:
  - `.CSEG` -> `CSEG`
  - `.DSEG` -> `DSEG`
  - `.ESEG` -> `ESEG`
  - `.BSSEG` -> `BSSEG`
  - `.HEAPSEG` -> `HEAPSEG`
- Pass1 segment state refactor from fixed variables to dynamic map.
- Object output `seglen` refactor from fixed keys to dynamic keys.
- Linker base-address resolution refactor from fixed segment set to dynamic map.
- Keep `BSSEG` behavior unchanged (reservation only, no emitted data bytes).

Out of scope (step 1):
- Any CPU-specific ZP optimization logic.
- New semantic restrictions for `HEAPSEG`.

Planned next scope (step 2):
- Special handling for `ZPSEG` including automatic zeropage hints.

## User-Facing Behavior

### Directive Syntax

- `.SEGMENT <name>` switches the active segment to `<name>`.
- Segment names are case-insensitive for behavior; internally normalized to uppercase.
- Empty/missing segment name is an assembler error.

### Compatibility

- Existing source using `.CSEG/.DSEG/.ESEG/.BSSEG` remains fully compatible.
- `.HEAPSEG` is introduced as a new compatibility-style alias.
- Existing linker scripts using `segments: { CSEG, DSEG, ESEG, BSSEG }` keep working.

## Technical Design

### 1) Parser / line classification

- Keep `.SEGMENT` recognized as a directive (already parsed), but no longer treated as no-op.
- Add `.HEAPSEG` to known segment-switching directives.

### 2) Pass1 segment state model

Current behavior uses hardcoded branch blocks for each segment. Replace with:
- `currentSegment: string` (default `CSEG`)
- `segmentPC: Record<string, number>` with lazy initialization

Switch algorithm:
1. `segmentPC[currentSegment] = PC`
2. `currentSegment = normalize(name)`
3. `PC = segmentPC[currentSegment] ?? 0`
4. `op.segment = currentSegment`
5. `op.addr = PC`

Alias directives resolve to segment names and execute the same switch algorithm.

### 3) Object code generation

- Build `seglen` dynamically from encountered lines/ops.
- Preserve `BSSEG` special rule:
  - track reserved size
  - do not emit loadable bytes for its reservations
- All other segments, including `HEAPSEG`, are regular relocatable segments.

### 4) Linker segment base resolution

Replace fixed `CSEG/DSEG/ESEG/BSSEG` base handling with `baseBySegment`.

Input:
- `data.segments` remains a map `segmentName -> baseAddressString`.

Computation:
- Normalize names to uppercase.
- Determine deterministic segment order:
  - first known aliases in this order if present: `CSEG`, `DSEG`, `ESEG`, `BSSEG`, `HEAPSEG`
  - then all remaining segments in lexicographic order
- For each segment in order:
  - if explicit base is provided, use it
  - otherwise place it immediately after previous segment end

Relocation:
- Symbol and fixup relocation uses `baseBySegment[symbol.segment]`.

Errors:
- Missing parameter in `.SEGMENT`.
- Duplicate segment-base declarations in linker config after normalization.
- Relocation references segment without computed base.

## Data and Serialization Impact

- Object/module JSON structure continues using segment names as string keys.
- No schema break required; only expands accepted keys beyond fixed set.

## Testing Strategy

### Unit / integration tests (step 1)

1. Generic segment switch:
- Source using `.SEGMENT FOO` and `.SEGMENT BAR` produces separate segment lengths and valid relocation.

2. Alias compatibility:
- Existing code with `.CSEG/.DSEG/.ESEG/.BSSEG` yields unchanged outputs.

3. New alias:
- `.HEAPSEG` switches to `HEAPSEG` and links correctly.

4. BSSEG invariants:
- `BSSEG` allocations reserve addresses but do not emit load bytes.

5. Deterministic layout:
- Mixed known and custom segments produce deterministic, stable placement.

6. Error paths:
- `.SEGMENT` without name errors clearly.
- Conflicting/duplicate segment-base keys in linker map error clearly.

## Risks and Mitigations

- Risk: hidden fixed-segment assumptions in relocation paths.
  - Mitigation: grep-driven replacement of all fixed-segment branches + focused regression tests.

- Risk: compatibility regressions for legacy code.
  - Mitigation: keep alias directives and expected placement defaults; run existing tests unchanged.

- Risk: non-deterministic ordering for custom segments.
  - Mitigation: explicit ordering policy documented and tested.

## Implementation Sequence

1. Update parsing/classification for `.HEAPSEG` and `.SEGMENT` processing path.
2. Refactor pass1 to generic `currentSegment/segmentPC`.
3. Refactor object-code `seglen` + relocation to dynamic segment keys.
4. Refactor linker base assignment and relocation to `baseBySegment`.
5. Add/adjust tests for generic segments and compatibility.
6. Run full test suite and compare legacy fixture outputs.

## Step 2 Preview: ZPSEG semantics

Step 2 will introduce:
- Recognized `ZPSEG` segment class.
- Automatic zero-page hinting when label segment is `ZPSEG`.
- CPU-specific guardrails where needed (e.g. 6502 modes only).

This is intentionally deferred to keep step 1 focused on generalized segment infrastructure.
