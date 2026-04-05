# Z180 Assembler Support — Implementation Intent

## Goal

Add Zilog Z180 / Hitachi HD64180 as a new CPU target in asm80-core.
The Z180 is a strict superset of Z80: every valid Z80 instruction is valid Z180,
but the Z180 defines 34 additional instructions using opcode slots that are
undefined/illegal on the plain Z80.

**New language ID:** `z180asm`
**Primary file extension:** `.z180`
**Assembler CPU directive:** `.cpu z180`

---

## Repository context

- CPU encoders live in `cpu/*.js`
- The existing Z80 encoder is `cpu/z80.js`, exporting `export const Z80 = { endian, cpu, ext, set, ... }`
- The HD6309 superset pattern (`cpu/h6309.js`) is the reference implementation:
  it imports the base CPU object, defines extension tables, and exports a merged object.
- Instruction name lists for Monaco language features live in `docs/cpu/*-code.json`
- Tests live in `test/`; the QUnit framework is used (`npm test`)

---

## Pattern to follow

`cpu/h6309.js` extends `cpu/m6809.js`:

```js
import { M6809 } from "./m6809.js";
const h6309Extensions = { ... };
// merged export
export const H6309 = { ...M6809, cpu: "h6309", ext: "h09", set: { ...M6809.set, ...h6309Extensions } };
```

Do the same for Z180, importing from Z80:

```js
import { Z80 } from "./z80.js";
const z180Extensions = { ... };
export const Z180 = { ...Z80, cpu: "z180", ext: "z180", set: { ...Z80.set, ...z180Extensions } };
```

---

## Z80 instruction table column layout (from `cpu/z80.js`)

```
//         0     1     2       3      4      5     6       7      8      9     10    11     12    13
//         0 /  /A,r/ A,N /   R8  /   N   / R16 / R16A /  POP   COND /  IMM /  RST /  REL  / ABS / (HL)
```

Column indices used by Z180 new instructions:
- **col 0** — no operand
- **col 4** — R8 (single 8-bit register: B/C/D/E/H/L/A, encoded in low 3 bits of opcode)
- **col 5** — N (immediate 8-bit)
- **col 6** — R16 (register pair BC/DE/HL/SP, encoded in bits 5:4)

---

## New Z180 instructions

All new instructions use the ED prefix.
Opcode = full 2-byte value stored in the table (e.g. `0xed04`).

### TST r — Test register (AND A with r, set S/Z/H/P/N/C flags, do not store)

| Opcode | Reg |
|--------|-----|
| ED 04  | B   |
| ED 0C  | C   |
| ED 14  | D   |
| ED 1C  | E   |
| ED 24  | H   |
| ED 2C  | L   |
| ED 34  | (HL)|
| ED 3C  | A   |

This maps to the R8 column (col 4). Base opcode for B = 0xed04; each successive
register adds 8 (same stride as Z80 R8 instructions). `(HL)` uses the standard
`(HL)` slot (col 13) or can be treated as a special case in the same R8 row.

```js
TST:  [-1,   -1,    -1,  0xed04,  -1,  0xed64,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  0xed34],
```

- col 4 (R8):  0xed04 (base; parser encodes reg in bits 5:3, same as Z80 R8)
- col 5 (IMM8): 0xed64 (TST n — test immediate)
- col 13 ((HL)): 0xed34

### TST n — Test immediate (AND A with n, flags only)

Already included in TST row above at col 5 = 0xed64. Instruction length: 3 bytes (ED 64 n).

### TSTIO n — Test I/O port (AND (C) with n, flags only)

```js
TSTIO: [-1,  -1,  -1,  -1,  -1,  0xed74,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
```

- col 5 (IMM8): 0xed74 — length 3 bytes (ED 74 n)

### MLT rr — 8×8 unsigned multiply (rr_hi × rr_lo → rr)

| Opcode | Pair |
|--------|------|
| ED 4C  | BC   |
| ED 5C  | DE   |
| ED 6C  | HL   |
| ED 7C  | SP   |

Maps to R16 column (col 6). Base opcode for BC = 0xed4c; stride = 0x10.

```js
MLT:  [-1,  -1,  -1,  -1,  -1,  -1,  0xed4c,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
```

### SLP — Sleep (halt CPU until next interrupt, lower power)

```js
SLP:  [0xed76,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
```

- col 0 (no operand): 0xed76 — length 2 bytes

### IN0 r,(n) — Input from absolute port (port address 0x00–0xFF, high byte forced 0)

| Opcode | Reg |
|--------|-----|
| ED 00  | B   |
| ED 08  | C   |
| ED 10  | D   |
| ED 18  | E   |
| ED 20  | H   |
| ED 28  | L   |
| ED 38  | A   |

Length: 3 bytes (ED, opcode, port-byte).
Encoding: this is a new addressing mode not present in Z80.
The parser must handle `IN0 r,(n)` syntax: two operands where the second is `(n)`.

Suggested approach: add a dedicated column or handle as a special opcode in
`parseOpcode`. The simplest path is to treat it like Z80's `IN r,(C)` special case —
detect the `(n)` literal in the second operand and encode accordingly.

Base opcode for B = 0xed00; stride = 8 per register (same as Z80 IN r,(C) pattern).

### OUT0 (n),r — Output to absolute port

| Opcode | Reg |
|--------|-----|
| ED 01  | B   |
| ED 09  | C   |
| ED 11  | D   |
| ED 19  | E   |
| ED 21  | H   |
| ED 29  | L   |
| ED 39  | A   |

Length: 3 bytes (ED, opcode, port-byte).
Parser handles `OUT0 (n),r` — first operand is `(n)`, second is register.
Base opcode for B = 0xed01; stride = 8.

### OTIM / OTDM / OTIMR / OTDMR — Block output with increment/decrement

These are no-operand instructions (col 0):

```js
OTIM:  [0xed83, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
OTDM:  [0xed8b, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
OTIMR: [0xed93, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
OTDMR: [0xed9b, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
```

Semantics:
- `OTIM`: output byte at (HL) to port (C); HL++; B--; set Z if B=0; set N=0
- `OTDM`: output byte at (HL) to port (C); HL--; B--; set Z if B=0; set N=0
- `OTIMR`: repeat OTIM until B=0
- `OTDMR`: repeat OTDM until B=0

Length: 2 bytes each.

---

## Complete z180Extensions object (ready to copy)

```js
const z180Extensions = {
  // TST r / TST n / TST (HL)
  // cols: 0   1    2      3       4       5       6    7    8    9   10   11   12    13
  TST:   [ -1, -1,  -1,  0xed04, 0xed04, 0xed64,  -1,  -1,  -1,  -1,  -1,  -1,  -1, 0xed34],

  // TSTIO n
  TSTIO: [ -1, -1,  -1,    -1,    -1,   0xed74,   -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],

  // MLT rr
  MLT:   [ -1, -1,  -1,    -1,    -1,     -1,   0xed4c, -1,  -1,  -1,  -1,  -1,  -1,  -1],

  // SLP
  SLP:   [0xed76, -1, -1,  -1,    -1,     -1,     -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],

  // Block output with increment/decrement
  OTIM:  [0xed83, -1, -1,  -1,    -1,     -1,     -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
  OTDM:  [0xed8b, -1, -1,  -1,    -1,     -1,     -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
  OTIMR: [0xed93, -1, -1,  -1,    -1,     -1,     -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
  OTDMR: [0xed9b, -1, -1,  -1,    -1,     -1,     -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],

  // IN0 r,(n) and OUT0 (n),r require parseOpcode special-case handling
  // (see below — they cannot be expressed purely in the opcode table)
  IN0:   [ -1, -1,  -1,    -1,    -1,     -1,     -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
  OUT0:  [ -1, -1,  -1,    -1,    -1,     -1,     -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
};
```

> **Note on IN0/OUT0:** Because their syntax (`IN0 r,(n)` / `OUT0 (n),r`) uses an
> immediate port number wrapped in parentheses — unlike Z80 `IN r,(C)` which uses
> a register — they need a dedicated block in `parseOpcode` (see below).

---

## parseOpcode additions for IN0 / OUT0

Add inside the `parseOpcode` function exported by `z180.js`, before the generic
table lookup, a special-case block similar to how Z80 handles `IN r,(C)` and
`OUT (C),r`:

```js
// IN0 r,(n)  — ED 00..38, stride 8
if (s.mn === "IN0") {
  const regOrder = ["B","C","D","E","H","L",null,"A"];
  const reg = s.p[0].toUpperCase();
  const ri = regOrder.indexOf(reg);
  if (ri < 0) throw "IN0: unknown register";
  const port = parsePortImm(s.p[1]); // strips parentheses, evaluates expression
  return [0xed, ri * 8, port & 0xff];
}

// OUT0 (n),r  — ED 01..39, stride 8
if (s.mn === "OUT0") {
  const regOrder = ["B","C","D","E","H","L",null,"A"];
  const reg = s.p[1].toUpperCase();
  const ri = regOrder.indexOf(reg);
  if (ri < 0) throw "OUT0: unknown register";
  const port = parsePortImm(s.p[0]); // strips parentheses
  return [0xed, ri * 8 + 1, port & 0xff];
}
```

`parsePortImm` — helper that accepts `(expr)` or `(n)` and returns the 8-bit value.
Reuse expression parsing utilities already present in the Z80 module.

---

## Export

```js
export const Z180 = {
  ...Z80,
  cpu:  "z180",
  ext:  "z180",
  set:  { ...Z80.set, ...z180Extensions },
  parseOpcode,   // override with Z180-aware version
};
```

---

## Registration in asm80-core entry point

In `index.js` (or wherever CPUs are registered / resolved from `.cpu` directive),
add:

```js
import { Z180 } from "./cpu/z180.js";
// ...
"z180": Z180,
"hd64180": Z180,   // alias for Hitachi variant
```

---

## docs/cpu/z180-code.json

Create `docs/cpu/z180-code.json` — the full instruction list for Monaco autocomplete
and syntax highlighting. This is the union of Z80 instructions plus the new Z180 ones:

```json
["TST","TSTIO","MLT","SLP","IN0","OUT0","OTIM","OTDM","OTIMR","OTDMR",
 "DEC","INC","AND","OR","XOR","SUB","CP","SLA","SRA","SLL","SRL","RR","RL","RRC","RLC",
 "POP","PUSH","RET","IM","RST","CALL","JP","DJNZ","JR","NOP","CCF","CPD","CPDR","CPI",
 "CPIR","CPL","DAA","DI","EI","EXX","IND","INDR","INI","INIR","LDD","LDDR","LDI","LDIR",
 "OUTD","OTDR","OUTI","OTIR","HALT","NEG","RETI","RETN","RLA","RLCA","RLD","RRA","RRCA",
 "RRD","SCF","EX","LD","ADC","ADD","SBC","BIT","RES","SET","IN","OUT"]
```

---

## Tests to write

Add `test/z180.js` (QUnit). Minimum coverage:

```
✓ TST B               → [0xED, 0x04]
✓ TST C               → [0xED, 0x0C]
✓ TST (HL)            → [0xED, 0x34]
✓ TST A               → [0xED, 0x3C]
✓ TST 0x42            → [0xED, 0x64, 0x42]
✓ TSTIO 0xFF          → [0xED, 0x74, 0xFF]
✓ MLT BC              → [0xED, 0x4C]
✓ MLT DE              → [0xED, 0x5C]
✓ MLT HL              → [0xED, 0x6C]
✓ MLT SP              → [0xED, 0x7C]
✓ SLP                 → [0xED, 0x76]
✓ IN0 B,(0x20)        → [0xED, 0x00, 0x20]
✓ IN0 A,(0x10)        → [0xED, 0x38, 0x10]
✓ OUT0 (0x20),B       → [0xED, 0x01, 0x20]
✓ OUT0 (0x10),A       → [0xED, 0x39, 0x10]
✓ OTIM                → [0xED, 0x83]
✓ OTDM                → [0xED, 0x8B]
✓ OTIMR               → [0xED, 0x93]
✓ OTDMR               → [0xED, 0x9B]
✓ Z80 instruction NOP → [0x00]      (regression: Z80 instructions still work)
✓ Z80 instruction LDIR→ [0xED, 0xB0] (regression)
✓ Z80 instruction LD HL,(0x1234) → [0x2A, 0x34, 0x12] (regression)
```

---

## What this does NOT change

- The Z180 uses the same address space model as Z80 (16-bit, 64 KB).
- No new addressing modes for standard instructions — only IN0/OUT0 are special.
- No undocumented Z80 instructions (IXH, IXL, etc.) — the Z180 treats them as illegal.
  The assembler should not generate them; this is already the case in the Z80 encoder
  (they are not in the table).
- Relocatable module format, linker, directives — all unchanged.

---

## Reference

- Zilog Z180 CPU User Manual (UM0050ED08) — authoritative opcode and timing source
- Hitachi HD64180 manual — identical instruction set, different peripheral map
- Z180 opcode map is also documented at: https://z80.info/z180ops.htm
