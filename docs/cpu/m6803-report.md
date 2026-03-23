# M6803 Implementation Report

## Summary

Motorola MC6803 CPU support added to asm80-core as a strict superset of the M6800.
The 6803 fills 23 previously undefined opcode slots, centered around the 16-bit D register
(A:B pair) and multiply.

**Language ID:** `m6803asm`
**File extension:** `.a83`
**CPU directive:** `.cpu m6803`

## Files Changed

| File | Action | Description |
|------|--------|-------------|
| `cpu/m6803.js` | Created | CPU module: extension table + adapted parseOpcode |
| `test/asm-6803.js` | Created | 25 test cases (TDD: tests written before implementation) |
| `asm.js` | Modified | Added M6803 import and registration in cpus array |
| `docs/cpu/m6803-code.json` | Created | Mnemonic list for IDE autocompletion |

## Implementation Approach

Followed the HD6309 superset pattern from `cpu/h6309.js`:

1. **Extension table** (`m6803Extensions`): 7-column format identical to M6800.set.
   Adds LSRD, ASLD/LSLD, PULX, ABX, PSHX, MUL (INH), BRN (REL),
   SUBD/ADDD/LDD/STD (multi-mode), and overrides JSR with DIR mode.

2. **Merged set**: `m6803set = { ...M6800.set, ...m6803Extensions }`

3. **parseOpcode**: Copy of `M6800.parseOpcode` with one change:
   `M6800.set[auxopcode]` → `m6803set[auxopcode]`.
   The `call()` trick from the intent doc would NOT work because M6800.parseOpcode
   hardcodes the `M6800.set` reference (not `this.set`).

## New Instructions

### INH (no operands)
| Opcode | Mnemonic | Description |
|--------|----------|-------------|
| 0x04 | LSRD | Logical shift right D |
| 0x05 | ASLD / LSLD | Arithmetic/logical shift left D (aliases) |
| 0x38 | PULX | Pull X from stack |
| 0x3A | ABX | Add B to X |
| 0x3C | PSHX | Push X onto stack |
| 0x3D | MUL | Unsigned 8×8 multiply A×B→D |

### REL
| Opcode | Mnemonic |
|--------|----------|
| 0x21 | BRN | Branch never (2-byte NOP) |

### Multi-mode (IMM16/DIR/EXT/IDX)
| Mnemonic | IMM16 | DIR | EXT | IDX |
|----------|-------|-----|-----|-----|
| SUBD | 0x83 | 0x93 | 0xB3 | 0xA3 |
| ADDD | 0xC3 | 0xD3 | 0xF3 | 0xE3 |
| LDD  | 0xCC | 0xDC | 0xFC | 0xEC |
| STD  | —    | 0xDD | 0xFD | 0xED |

### Override
| Mnemonic | New mode | Opcode |
|----------|----------|--------|
| JSR | DIR (new) | 0x9D |
| JSR | EXT (preserved) | 0xBD |

## Test Results

```
# pass 2238
# fail 0
```

All 25 new M6803 tests pass. No regressions in M6800 or any other CPU suite.

Coverage for `cpu/m6803.js`: 93.15% statements, 83.87% branches.
Uncovered lines (47–54, 136–137): A/B register prefix detection path for 3-char opcodes
(not exercised by current tests, but inherited from M6800 and functionally correct).

## Deviation from Intent Doc

The intent doc suggested using `M6800.parseOpcode.call({ ...M6800, set: M6803.set }, ...)`.
This approach does NOT work because `M6800.parseOpcode` contains a hardcoded reference to
`M6800.set` on line 171. The correct approach (also noted at the end of the intent doc) is
to copy the function verbatim and change the set lookup — which is what was implemented.
