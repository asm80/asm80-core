# M6803 Assembler Support — Implementation Intent

## Goal

Add Motorola 6803 (MC6803) as a new CPU target in asm80-core.
The 6803 is a strict superset of 6800: every valid 6800 instruction is valid 6803,
but the 6803 fills ~23 previously undefined opcode slots with new instructions
centered around the 16-bit D register (A:B) and multiply.

**New language ID:** `m6803asm`
**Primary file extension:** `.a83`
**Assembler CPU directive:** `.cpu m6803`

---

## Repository context

- CPU encoders live in `cpu/*.js`
- The existing 6800 encoder is `cpu/m6800.js`, exporting `export const M6800 = { endian, cpu, ext, set, parseOpcode }`
- Column layout in M6800.set (7 columns):
  ```
  //          0        1     2      3      4      5       6
  //         INH    DIR   IMM3   EXT     IDX    IMM     REL
  ```
- `IMM3` (col 2) = 3-byte instruction: opcode + 16-bit big-endian immediate
- `IMM`  (col 5) = 2-byte instruction: opcode + 8-bit immediate
- The HD6309 superset pattern in `cpu/h6309.js` is the reference.

---

## Pattern to follow

```js
import { M6800 } from "./m6800.js";

const m6803Extensions = { ... };

export const M6803 = {
  ...M6800,
  cpu: "m6803",
  ext: "a83",
  set: { ...M6800.set, ...m6803Extensions },
  parseOpcode,   // wrap M6800.parseOpcode with D-register awareness
};
```

---

## D register concept

The 6803 introduces the **D register** = A (high byte) concatenated with B (low byte).
D is not a separate physical register — writing D writes both A and B.

All 16-bit D-register instructions (LDD, STD, ADDD, SUBD) operate on the full 16-bit
pair. No A/B prefix disambiguation is needed for these mnemonics — they always work
on D. The `parseOpcode` wrapper does not need to handle `A`/`B` prefix stripping for
these new instructions; they follow the standard 1-param addressing mode path.

---

## New 6803 instructions — complete table

All opcodes below were **undefined/illegal** on the 6800.

### Single-operand (INH — col 0)

| Opcode | Mnemonic | Description | Cycles |
|--------|----------|-------------|--------|
| 0x04   | LSRD     | Logical shift right D (A:B >> 1; MSB=0; LSB→C) | 2 |
| 0x05   | ASLD / LSLD | Arithmetic/logical shift left D (A:B << 1; MSB→C) | 2 |
| 0x38   | PULX     | Pull X from stack (SP+1→SP; mem→XH; SP+1→SP; mem→XL) | 5 |
| 0x3A   | ABX      | Add B (unsigned 8-bit) to X → X; no flags affected | 3 |
| 0x3C   | PSHX     | Push X onto stack (XL→mem; SP-1; XH→mem; SP-1) | 4 |
| 0x3D   | MUL      | Unsigned 8×8: A × B → D (A=high, B=low); sets C=bit7(B) | 10 |

### Branch (REL — col 6)

| Opcode | Mnemonic | Description | Cycles |
|--------|----------|-------------|--------|
| 0x21   | BRN rel  | Branch never — always falls through; 2-byte NOP | 3 |

### SUBD — Subtract 16-bit from D (D - operand → D)

Flags affected: N, Z, V, C (same semantics as SUBA/SUBB but 16-bit)

| Opcode | Mode | Col | Bytes | Cycles |
|--------|------|-----|-------|--------|
| 0x83   | IMM16 | 2 (IMM3) | 3 | 4 |
| 0x93   | DIR   | 1 | 2 | 5 |
| 0xA3   | IDX   | 4 | 2 | 6 |
| 0xB3   | EXT   | 3 | 3 | 7 |

### ADDD — Add 16-bit to D (D + operand → D)

Flags affected: N, Z, V, C

| Opcode | Mode | Col | Bytes | Cycles |
|--------|------|-----|-------|--------|
| 0xC3   | IMM16 | 2 (IMM3) | 3 | 4 |
| 0xD3   | DIR   | 1 | 2 | 5 |
| 0xE3   | IDX   | 4 | 2 | 6 |
| 0xF3   | EXT   | 3 | 3 | 7 |

### LDD — Load D from memory

Flags affected: N, Z; V cleared

| Opcode | Mode  | Col | Bytes | Cycles |
|--------|-------|-----|-------|--------|
| 0xCC   | IMM16 | 2 (IMM3) | 3 | 3 |
| 0xDC   | DIR   | 1 | 2 | 4 |
| 0xEC   | IDX   | 4 | 2 | 5 |
| 0xFC   | EXT   | 3 | 3 | 6 |

### STD — Store D to memory

Flags affected: N, Z; V cleared

| Opcode | Mode | Col | Bytes | Cycles |
|--------|------|-----|-------|--------|
| 0xDD   | DIR  | 1 | 2 | 4 |
| 0xED   | IDX  | 4 | 2 | 5 |
| 0xFD   | EXT  | 3 | 3 | 6 |

### JSR direct — JSR now supports direct mode (0x9D)

6800 had JSR only in EXT (0xBD) and IDX (0xAD). 6803 adds DIR (0x9D), 5 cycles.
Must override the full JSR row in the extension to preserve EXT and IDX:

```js
"JSR": [-1, 0x9D, -1, 0xBD, 0xAD, -1, -1],
```

---

## Complete m6803Extensions object

```js
const m6803Extensions = {
  //          0        1      2       3      4      5       6
  //         INH    DIR    IMM3    EXT    IDX    IMM     REL

  // D-register shift (INH only)
  "LSRD": [  0x04,    -1,    -1,    -1,    -1,    -1,    -1],
  "ASLD": [  0x05,    -1,    -1,    -1,    -1,    -1,    -1],
  "LSLD": [  0x05,    -1,    -1,    -1,    -1,    -1,    -1],  // alias for ASLD

  // Stack / misc (INH)
  "PULX": [  0x38,    -1,    -1,    -1,    -1,    -1,    -1],
  "ABX":  [  0x3A,    -1,    -1,    -1,    -1,    -1,    -1],
  "PSHX": [  0x3C,    -1,    -1,    -1,    -1,    -1,    -1],
  "MUL":  [  0x3D,    -1,    -1,    -1,    -1,    -1,    -1],

  // Branch never (REL)
  "BRN":  [    -1,    -1,    -1,    -1,    -1,    -1,  0x21],

  // SUBD
  "SUBD": [    -1,  0x93,  0x83,  0xB3,  0xA3,    -1,    -1],

  // ADDD
  "ADDD": [    -1,  0xD3,  0xC3,  0xF3,  0xE3,    -1,    -1],

  // LDD
  "LDD":  [    -1,  0xDC,  0xCC,  0xFC,  0xEC,    -1,    -1],

  // STD (no IMM — you can't store immediate to memory)
  "STD":  [    -1,  0xDD,    -1,  0xFD,  0xED,    -1,    -1],

  // JSR extended with DIR mode (override base 6800 row)
  "JSR":  [    -1,  0x9D,    -1,  0xBD,  0xAD,    -1,    -1],
};
```

---

## parseOpcode wrapper

The 6800 `parseOpcode` handles the `A`/`B` prefix for dual-accumulator instructions.
The 6803 wrapper only needs to:

1. Check for the new 16-bit instructions (LDD, STD, ADDD, SUBD) and route them
   through the standard IMM3/DIR/EXT/IDX path — they have no A/B prefix and take
   a 16-bit value where needed.
2. For LSRD, ASLD, LSLD, PULX, ABX, PSHX, MUL, BRN — no operands or simple REL,
   the existing 6800 parseOpcode handles these correctly via the table.
3. Fall through to `M6800.parseOpcode` for all other instructions.

The only real new parsing need is ensuring **16-bit immediate** (`IMM3`, col 2) works
for LDD/ADDD/SUBD. Looking at the 6800 parseOpcode — it already handles col 2
(CPX `#^` and LDS `#^` use it). So no special casing is needed; the existing
`o2 > -1` branch handles it. The wrapper can simply be:

```js
function parseOpcode(s, vars, Parser) {
  // Update the set reference to include 6803 extensions, then call base
  const saved = s.opcode;
  // M6803.set is already merged — call M6800.parseOpcode with updated set lookup
  return M6800.parseOpcode.call({ ...M6800, set: M6803.set }, s, vars, Parser);
}
```

Or more simply: since `M6800.parseOpcode` does `M6800.set[auxopcode]` internally,
and we export `M6803` with the merged set, we need the parseOpcode to reference
`M6803.set`. The cleanest approach is to copy `M6800.parseOpcode` verbatim and
replace the single `M6800.set[auxopcode]` lookup with `M6803.set[auxopcode]`.

---

## docs/cpu/m6803-code.json

Union of 6800 instructions plus new 6803 ones:

```json
["ABA","ADCA","ADCB","ADDA","ADDB","ADDD","ANDA","ANDB","ASL","ASLA","ASLB","ASLD",
 "ASR","ASRA","ASRB","ABX","BCC","BCS","BEQ","BGE","BGT","BHI","BITA","BITB","BLE",
 "BLS","BLT","BMI","BNE","BPL","BRA","BRN","BSR","BVC","BVS","CBA","CLC","CLI","CLR",
 "CLRA","CLRB","CLV","CMPA","CMPB","COM","COMA","COMB","CPX","DAA","DEC","DECA","DECB",
 "DES","DEX","EORA","EORB","INC","INCA","INCB","INS","INX","JMP","JSR","LDAA","LDAB",
 "LDD","LDS","LDX","LSR","LSRA","LSRB","LSRD","LSLD","MUL","NEG","NEGA","NEGB","NOP",
 "ORAA","ORAB","PSHA","PSHB","PSHX","PULA","PULB","PULX","ROL","ROLA","ROLB","ROR",
 "RORA","RORB","RTI","RTS","SBA","SBCA","SBCB","SEC","SEI","SEV","STAA","STAB","STD",
 "STS","STX","SUBA","SUBB","SUBD","SWI","TAB","TAP","TBA","TPA","TST","TSTA","TSTB",
 "TSX","TXS","WAI"]
```

---

## Registration

In `index.js` add:

```js
import { M6803 } from "./cpu/m6803.js";
// ...
"m6803": M6803,
"6803":  M6803,   // numeric alias
```

---

## Tests to write

Add `test/m6803.js`. Minimum coverage:

```
✓ MUL               → [0x3D]
✓ ABX               → [0x3A]
✓ PSHX              → [0x3C]
✓ PULX              → [0x38]
✓ LSRD              → [0x04]
✓ ASLD              → [0x05]
✓ LSLD              → [0x05]   (alias)
✓ BRN $+5           → [0x21, 0x03]
✓ LDD #$1234        → [0xCC, 0x12, 0x34]
✓ LDD $42           → [0xDC, 0x42]
✓ LDD $1234         → [0xFC, 0x12, 0x34]
✓ LDD 5,X           → [0xEC, 0x05]
✓ STD $42           → [0xDD, 0x42]
✓ STD $1234         → [0xFD, 0x12, 0x34]
✓ STD 5,X           → [0xED, 0x05]
✓ ADDD #$0010       → [0xC3, 0x00, 0x10]
✓ ADDD $10          → [0xD3, 0x10]
✓ ADDD $1000        → [0xF3, 0x10, 0x00]
✓ SUBD #$0001       → [0x83, 0x00, 0x01]
✓ SUBD $10          → [0x93, 0x10]
✓ JSR $42           → [0x9D, 0x42]   (new DIR mode)
✓ JSR $1234         → [0xBD, 0x12, 0x34]  (existing EXT, regression)
✓ LDAA #5           → [0x86, 0x05]   (regression: 6800 instruction)
✓ BRA $+3           → [0x20, 0x01]   (regression)
```

---

## Reference

- Motorola MC6803 Reference Manual (M6803RM/AD Rev 4) — primary opcode/timing source
- Motorola M6800 Programming Reference Manual — base instruction set
- https://en.wikipedia.org/wiki/Motorola_6801 — overview
