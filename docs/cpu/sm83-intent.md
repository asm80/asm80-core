# SM83 Assembler Support — Implementation Intent

## Goal

Add Sharp SM83 (LR35902) as a new CPU target in asm80-core.
The SM83 is the CPU in the Nintendo Game Boy (DMG, 1989) and Game Boy Color.
It is NOT a Z80 superset — it shares Z80-like mnemonics but has different binary encoding,
removes most Z80 extensions (no IX/IY, no alternate registers, no IN/OUT), and adds
several unique instructions (LDH, LD (HL+), LD (HL-), ADD SP,n, LD HL,SP+n, SWAP).

**New language ID:** `sm83asm`
**Primary file extension:** `.sm83`
**Assembler CPU directive:** `.cpu sm83`

---

## Repository context

- CPU encoders live in `cpu/*.js`
- The SM83 cannot extend the Z80 encoder — the binary encoding is incompatible
- Implement as a **standalone encoder** (no import from z80.js)
- Pattern: like `cpu/c6502.js` — fresh parseOpcode, custom table

---

## Instruction set overview

### Registers

| Symbol | Width | Notes |
|--------|-------|-------|
| A      | 8-bit | Accumulator |
| B, C, D, E, H, L | 8-bit | General purpose |
| F      | 8-bit | Flags (lower nibble always 0) |
| AF, BC, DE, HL | 16-bit | Pairs |
| SP     | 16-bit | Stack pointer |
| (HL)   | —     | Memory at address HL (used as 8-bit operand) |

**No IX, IY, I, R, A', B', C', D', E', H', L'**

### Flag register F

| Bit | Mask | Name | Meaning |
|-----|------|------|---------|
| 7   | 0x80 | Z    | Zero |
| 6   | 0x40 | N    | Subtract (set after SUB/SBC/CP/DEC) |
| 5   | 0x20 | H    | Half carry (carry from bit 3) |
| 4   | 0x10 | C    | Carry |
| 3–0 | —   | —    | Always 0 |

**No Sign flag. No Parity/Overflow flag.**

---

## Register encoding

```js
// 8-bit register encoding (3 bits, used in LD r,r' and ALU instructions)
const R8 = { B:0, C:1, D:2, E:3, H:4, L:5, "(HL)":6, A:7 };

// 16-bit register pairs (2 bits, used in LD rr,nn / INC rr / DEC rr / ADD HL,rr)
const R16 = { BC:0, DE:1, HL:2, SP:3 };

// Stack register pairs (PUSH/POP — AF instead of SP)
const R16STK = { BC:0, DE:1, HL:2, AF:3 };

// Condition codes (2 bits)
const CC = { NZ:0, Z:1, NC:2, C:3 };
```

---

## Opcode encoding patterns

Most SM83 instructions follow one of these encoding patterns:

```
LD r, r'     = 0x40 | (R8[dst] << 3) | R8[src]   (0x76 = HALT exception)
LD r, n      = 0x06 | (R8[r] << 3)   then byte n
INC r        = 0x04 | (R8[r] << 3)
DEC r        = 0x05 | (R8[r] << 3)
ALU A, r     = base | R8[r]           (see ALU base table)
ALU A, n     = imm_opcode             (see ALU immediate table)
JP cc, nn    = 0xC2 | (CC[cc] << 3)
JR cc, n     = 0x20 | (CC[cc] << 3)
CALL cc, nn  = 0xC4 | (CC[cc] << 3)
RET cc       = 0xC0 | (CC[cc] << 3)
PUSH rr      = 0xC5 | (R16STK[rr] << 4)
POP rr       = 0xC1 | (R16STK[rr] << 4)
LD rr, nn    = 0x01 | (R16[rr] << 4)
INC rr       = 0x03 | (R16[rr] << 4)
DEC rr       = 0x0B | (R16[rr] << 4)
ADD HL, rr   = 0x09 | (R16[rr] << 4)
RST n        = 0xC7 | n   (n = 0,8,16,24,32,40,48,56)
```

### ALU base opcodes (register operand, opcode | R8)

| Mnemonic | Base  |
|----------|-------|
| ADD A,   | 0x80  |
| ADC A,   | 0x88  |
| SUB      | 0x90  |
| SBC A,   | 0x98  |
| AND      | 0xA0  |
| XOR      | 0xA8  |
| OR       | 0xB0  |
| CP       | 0xB8  |

### ALU immediate opcodes (n operand, 2 bytes each)

| Mnemonic  | Opcode |
|-----------|--------|
| ADD A, n  | 0xC6   |
| ADC A, n  | 0xCE   |
| SUB n     | 0xD6   |
| SBC A, n  | 0xDE   |
| AND n     | 0xE6   |
| XOR n     | 0xEE   |
| OR n      | 0xF6   |
| CP n      | 0xFE   |

---

## CB prefix instructions

All CB instructions are 2 bytes (0xCB, then opcode byte):

```
CB opcode byte layout:
  bits 7:6 = group: 00=shift/rotate/SWAP, 01=BIT, 10=RES, 11=SET
  bits 5:3 = bit index (for BIT/RES/SET) or sub-operation (for shifts)
  bits 2:0 = register (R8 encoding)
```

| Group (bits 7:6) | Sub-op (bits 5:3) | Mnemonic |
|------------------|-------------------|----------|
| 00 | 000 | RLC r |
| 00 | 001 | RRC r |
| 00 | 010 | RL r |
| 00 | 011 | RR r |
| 00 | 100 | SLA r |
| 00 | 101 | SRA r |
| 00 | 110 | SWAP r |
| 00 | 111 | SRL r |
| 01 | bbb | BIT b, r |
| 10 | bbb | RES b, r |
| 11 | bbb | SET b, r |

Encoding:
```js
// BIT b, r  → [0xCB, 0x40 | (b << 3) | R8[r]]
// RES b, r  → [0xCB, 0x80 | (b << 3) | R8[r]]
// SET b, r  → [0xCB, 0xC0 | (b << 3) | R8[r]]
// SWAP r    → [0xCB, 0x30 | R8[r]]
// RLC r     → [0xCB, 0x00 | R8[r]]
// RRC r     → [0xCB, 0x08 | R8[r]]
// RL r      → [0xCB, 0x10 | R8[r]]
// RR r      → [0xCB, 0x18 | R8[r]]
// SLA r     → [0xCB, 0x20 | R8[r]]
// SRA r     → [0xCB, 0x28 | R8[r]]
// SRL r     → [0xCB, 0x38 | R8[r]]
```

---

## Special / unique instructions

These cannot be encoded by the patterns above and need explicit handling:

| Mnemonic | Opcode(s) | Bytes | Notes |
|----------|-----------|-------|-------|
| LD (HL+), A | 0x22 | 1 | Store A at (HL), HL++ |
| LD A, (HL+) | 0x2A | 1 | Load A from (HL), HL++ |
| LD (HL-), A | 0x32 | 1 | Store A at (HL), HL-- |
| LD A, (HL-) | 0x3A | 1 | Load A from (HL), HL-- |
| LDH (n), A  | 0xE0, n | 2 | mem[0xFF00+n] = A |
| LDH A, (n)  | 0xF0, n | 2 | A = mem[0xFF00+n] |
| LDH (C), A  | 0xE2 | 1 | mem[0xFF00+C] = A |
| LDH A, (C)  | 0xF2 | 1 | A = mem[0xFF00+C] |
| LD (BC), A  | 0x02 | 1 | |
| LD (DE), A  | 0x12 | 1 | |
| LD A, (BC)  | 0x0A | 1 | |
| LD A, (DE)  | 0x1A | 1 | |
| LD (nn), SP | 0x08, lo, hi | 3 | Store SP at absolute address |
| LD (nn), A  | 0xEA, lo, hi | 3 | Store A at absolute address |
| LD A, (nn)  | 0xFA, lo, hi | 3 | Load A from absolute address |
| ADD SP, n   | 0xE8, n | 2 | n is **signed** 8-bit |
| LD HL, SP+n | 0xF8, n | 2 | HL = SP + signed n |
| LD SP, HL   | 0xF9 | 1 | |
| JP (HL)     | 0xE9 | 1 | Jump to address in HL (RGBDS writes JP HL) |
| STOP n      | 0x10, n | 2 | n is usually 0x00 |
| HALT        | 0x76 | 1 | Special case in LD r,r' block |
| NOP         | 0x00 | 1 | |
| DI          | 0xF3 | 1 | Disable interrupts |
| EI          | 0xFB | 1 | Enable interrupts (delayed 1 instr) |
| RETI        | 0xD9 | 1 | Return + enable interrupts |
| RLCA        | 0x07 | 1 | |
| RRCA        | 0x0F | 1 | |
| RLA         | 0x17 | 1 | |
| RRA         | 0x1F | 1 | |
| DAA         | 0x27 | 1 | |
| CPL         | 0x2F | 1 | |
| SCF         | 0x37 | 1 | |
| CCF         | 0x3F | 1 | |
| JR n        | 0x18, n | 2 | Unconditional relative jump |
| JP nn       | 0xC3, lo, hi | 3 | Unconditional absolute jump |
| CALL nn     | 0xCD, lo, hi | 3 | Unconditional call |
| RET         | 0xC9 | 1 | Unconditional return |
| RST n       | 0xC7\|n | 1 | n = 0x00,0x08,0x10,0x18,0x20,0x28,0x30,0x38 |

---

## Syntax notes — RGBDS compatibility

RGBDS (https://rgbds.gbdev.io) is the community-standard Game Boy assembler.
ASM80 should accept the same syntax:

1. **`LD (HL+), A`** — parentheses with `+`/`-` suffix (RGBDS also accepts `LDI`/`LDD` aliases)
2. **`LDH`** — required keyword; `LD ($FF00+n), A` should NOT be accepted as an alternative (keep it simple)
3. **`JP HL`** — without parentheses (RGBDS convention). Contrast with Z80 which uses `JP (HL)`.
4. **`ADD SP, n`** — n is a signed 8-bit value; accept decimal and `$xx` hex
5. **`RST $38`** or `RST 56` — both forms; value must be 0,8,16,24,32,40,48,56 (validate!)
6. **Condition codes:** NZ, Z, NC, C (only 4, unlike Z80's 8)

### Aliases to accept (common in Game Boy assembly literature)

| Alias | Canonical | Encoding |
|-------|-----------|---------|
| `LDI (HL), A` | `LD (HL+), A` | 0x22 |
| `LDI A, (HL)` | `LD A, (HL+)` | 0x2A |
| `LDD (HL), A` | `LD (HL-), A` | 0x32 |
| `LDD A, (HL)` | `LD A, (HL-)` | 0x3A |
| `LD ($FF00+n), A` | `LDH (n), A`  | 0xE0 |
| `LD A, ($FF00+n)` | `LDH A, (n)`  | 0xF0 |

---

## parseOpcode structure

The SM83 encoder must be implemented as a **custom parseOpcode** (not table-driven),
because the instruction encoding is irregular and mnemonic-dependent.

```js
export const SM83 = {
  endian: "little",
  cpu:    "sm83",
  ext:    "sm83",
  set:    {},       // not used — all encoding is in parseOpcode
  parseOpcode,
};

function parseOpcode(s, vars, Parser) {
  const mn  = s.mn.toUpperCase();
  const ops = s.p;  // operand strings (already split by assembler)
  const v   = (i) => Parser.evaluate(ops[i], vars);

  // --- LD instructions ---
  if (mn === "LD") return parseLd(ops, v, Parser);

  // --- LDH ---
  if (mn === "LDH") return parseLdh(ops, v, Parser);

  // --- ALU with register or immediate ---
  if (ALU_MNEMONICS.includes(mn)) return parseAlu(mn, ops, v);

  // --- INC / DEC ---
  if (mn === "INC") return parseIncDec(ops, 0x04, 0x03);
  if (mn === "DEC") return parseIncDec(ops, 0x05, 0x0B);

  // --- PUSH / POP ---
  if (mn === "PUSH") return [0xC5 | (r16stk(ops[0]) << 4)];
  if (mn === "POP")  return [0xC1 | (r16stk(ops[0]) << 4)];

  // --- JP / JR ---
  if (mn === "JP")   return parseJp(ops, v, Parser);
  if (mn === "JR")   return parseJr(ops, v, Parser);

  // --- CALL / RET / RETI ---
  if (mn === "CALL") return parseCall(ops, v);
  if (mn === "RET")  return parseRet(ops);
  if (mn === "RETI") return [0xD9];

  // --- RST ---
  if (mn === "RST")  { const n = v(0); assertRst(n); return [0xC7 | n]; }

  // --- BIT / RES / SET ---
  if (mn === "BIT") return [0xCB, 0x40 | (v(0) << 3) | r8(ops[1])];
  if (mn === "RES") return [0xCB, 0x80 | (v(0) << 3) | r8(ops[1])];
  if (mn === "SET") return [0xCB, 0xC0 | (v(0) << 3) | r8(ops[1])];

  // --- CB shift/rotate/SWAP ---
  const cbOps = { RLC:0x00, RRC:0x08, RL:0x10, RR:0x18, SLA:0x20, SRA:0x28, SWAP:0x30, SRL:0x38 };
  if (cbOps[mn] !== undefined) return [0xCB, cbOps[mn] | r8(ops[0])];

  // --- ADD HL,rr / ADD SP,n ---
  if (mn === "ADD") return parseAdd(ops, v);

  // --- Single-byte fixed opcodes ---
  const fixed = {
    NOP:0x00, RLCA:0x07, RRCA:0x0F, RLA:0x17, RRA:0x1F,
    DAA:0x27, CPL:0x2F, SCF:0x37, CCF:0x3F,
    HALT:0x76, DI:0xF3, EI:0xFB, RET:0xC9,
  };
  if (fixed[mn] !== undefined) return [fixed[mn]];

  // --- STOP ---
  if (mn === "STOP") return [0x10, ops.length ? v(0) & 0xFF : 0x00];

  throw new Error(`SM83: unknown mnemonic ${mn}`);
}
```

### parseLd helper — SM83 LD instruction tree

```js
function parseLd(ops, v, Parser) {
  const dst = ops[0].toUpperCase().trim();
  const src = ops[1].toUpperCase().trim();

  // LD r, r'  /  LD r, n
  if (R8_NAMES.includes(dst)) {
    if (R8_NAMES.includes(src)) {
      if (R8[dst] === 6 && R8[src] === 6) return [0x76]; // HALT
      return [0x40 | (R8[dst] << 3) | R8[src]];
    }
    // LD r, (HL) — already handled via (HL) as R8 entry 6
    // LD r, n (immediate)
    return [0x06 | (R8[dst] << 3), v(1) & 0xFF];
  }

  // LD rr, nn
  if (R16_NAMES.includes(dst)) {
    const nn = v(1);
    return [0x01 | (R16[dst] << 4), nn & 0xFF, (nn >> 8) & 0xFF];
  }

  // LD SP, HL
  if (dst === "SP" && src === "HL") return [0xF9];

  // LD (HL+), A  /  LD (HL-), A
  if (dst === "(HL+)" && src === "A") return [0x22];
  if (dst === "(HL-)" && src === "A") return [0x32];
  if (dst === "A" && src === "(HL+)") return [0x2A];
  if (dst === "A" && src === "(HL-)") return [0x3A];

  // LDI/LDD aliases
  // (handled at top of parseOpcode before reaching parseLd)

  // LD (BC), A  /  LD (DE), A
  if (dst === "(BC)" && src === "A") return [0x02];
  if (dst === "(DE)" && src === "A") return [0x12];
  if (dst === "A" && src === "(BC)") return [0x0A];
  if (dst === "A" && src === "(DE)") return [0x1A];

  // LD (nn), A  /  LD A, (nn)
  if (dst === "A" && src.startsWith("(")) {
    const addr = v(1);
    return [0xFA, addr & 0xFF, (addr >> 8) & 0xFF];
  }
  if (dst.startsWith("(") && src === "A") {
    const addr = v(0);
    return [0xEA, addr & 0xFF, (addr >> 8) & 0xFF];
  }

  // LD (nn), SP
  if (dst.startsWith("(") && src === "SP") {
    const addr = v(0);
    return [0x08, addr & 0xFF, (addr >> 8) & 0xFF];
  }

  // LD HL, SP+n
  if (dst === "HL" && src.startsWith("SP+")) {
    const n = Parser.evaluate(src.slice(3).trim());
    return [0xF8, toSigned8(n)];
  }
  if (dst === "HL" && src.startsWith("SP-")) {
    const n = Parser.evaluate(src.slice(3).trim());
    return [0xF8, toSigned8(-n)];
  }

  throw new Error(`SM83: unrecognized LD form: LD ${ops[0]}, ${ops[1]}`);
}
```

---

## docs/cpu/sm83-code.json

```json
["ADD","ADC","SUB","SBC","AND","OR","XOR","CP","INC","DEC",
 "LD","LDH","LDI","LDD",
 "JP","JR","CALL","RET","RETI",
 "PUSH","POP",
 "NOP","HALT","STOP","DI","EI",
 "RLCA","RRCA","RLA","RRA","DAA","CPL","SCF","CCF",
 "RLC","RRC","RL","RR","SLA","SRA","SRL","SWAP",
 "BIT","RES","SET","RST"]
```

---

## Tests to write (test/sm83.js)

```
// LD r, r'
LD B, C                     → [0x41]
LD H, A                     → [0x67]
LD (HL), B                  → [0x70]
LD A, (HL)                  → [0x7E]

// LD r, n
LD B, $42                   → [0x06, 0x42]
LD A, 0                     → [0x3E, 0x00]

// LD rr, nn
LD BC, $1234                → [0x01, 0x34, 0x12]   (little-endian!)
LD SP, $FFFE                → [0x31, 0xFE, 0xFF]

// HALT (special case in LD block)
HALT                        → [0x76]

// LD (HL+/HL-)
LD (HL+), A                 → [0x22]
LD A, (HL+)                 → [0x2A]
LD (HL-), A                 → [0x32]
LD A, (HL-)                 → [0x3A]
LDI (HL), A                 → [0x22]   (alias)
LDD A, (HL)                 → [0x3A]   (alias)

// LDH
LDH ($40), A                → [0xE0, 0x40]
LDH A, ($40)                → [0xF0, 0x40]
LDH (C), A                  → [0xE2]
LDH A, (C)                  → [0xF2]

// LD absolute
LD ($C000), A               → [0xEA, 0x00, 0xC0]
LD A, ($C000)               → [0xFA, 0x00, 0xC0]
LD ($C000), SP              → [0x08, 0x00, 0xC0]

// LD SP, HL
LD SP, HL                   → [0xF9]

// LD HL, SP+n
LD HL, SP+4                 → [0xF8, 0x04]
LD HL, SP-1                 → [0xF8, 0xFF]   (signed: -1 = 0xFF)

// ALU register
ADD A, B                    → [0x80]
ADD A, (HL)                 → [0x86]
ADC A, C                    → [0x89]
SUB D                       → [0x92]
SBC A, H                    → [0x9C]
AND L                       → [0xA5]
XOR A                       → [0xAF]
OR B                        → [0xB0]
CP (HL)                     → [0xBE]

// ALU immediate
ADD A, $10                  → [0xC6, 0x10]
SUB $01                     → [0xD6, 0x01]
AND $0F                     → [0xE6, 0x0F]
CP $FF                      → [0xFE, 0xFF]

// INC/DEC
INC B                       → [0x04]
INC (HL)                    → [0x34]
DEC A                       → [0x3D]
INC BC                      → [0x03]
DEC HL                      → [0x2B]

// PUSH/POP
PUSH BC                     → [0xC5]
POP AF                      → [0xF1]
PUSH HL                     → [0xE5]

// ADD HL / ADD SP
ADD HL, BC                  → [0x09]
ADD HL, SP                  → [0x39]
ADD SP, $04                 → [0xE8, 0x04]
ADD SP, -2                  → [0xE8, 0xFE]   (signed)

// JP / JR
JP $1234                    → [0xC3, 0x34, 0x12]
JP NZ, $1000                → [0xC2, 0x00, 0x10]
JP Z, $1000                 → [0xCA, 0x00, 0x10]
JP NC, $1000                → [0xD2, 0x00, 0x10]
JP C, $1000                 → [0xDA, 0x00, 0x10]
JP HL                       → [0xE9]
JR $+2                      → [0x18, 0x00]
JR NZ, $+4                  → [0x20, 0x02]
JR Z, $-2                   → [0x28, 0xFE]   (offset = -2 → branch to self)

// CALL / RET
CALL $1234                  → [0xCD, 0x34, 0x12]
CALL NZ, $1234              → [0xC4, 0x34, 0x12]
CALL Z, $1234               → [0xCC, 0x34, 0x12]
RET                         → [0xC9]
RET NZ                      → [0xC0]
RET C                       → [0xD8]
RETI                        → [0xD9]

// RST
RST $00                     → [0xC7]
RST $08                     → [0xCF]
RST $38                     → [0xFF]

// CB prefix — shifts/rotates
RLC B                       → [0xCB, 0x00]
RLC (HL)                    → [0xCB, 0x06]
RRC A                       → [0xCB, 0x0F]
RL C                        → [0xCB, 0x11]
RR D                        → [0xCB, 0x1A]
SLA H                       → [0xCB, 0x24]
SRA L                       → [0xCB, 0x2D]
SWAP A                      → [0xCB, 0x37]
SRL B                       → [0xCB, 0x38]

// CB prefix — BIT/RES/SET
BIT 0, B                    → [0xCB, 0x40]
BIT 7, A                    → [0xCB, 0x7F]
BIT 3, (HL)                 → [0xCB, 0x5E]
RES 0, B                    → [0xCB, 0x80]
RES 7, A                    → [0xCB, 0xBF]
SET 0, B                    → [0xCB, 0xC0]
SET 7, A                    → [0xCB, 0xFF]

// Single-byte misc
NOP                         → [0x00]
HALT                        → [0x76]
STOP 0                      → [0x10, 0x00]
DI                          → [0xF3]
EI                          → [0xFB]
RLCA                        → [0x07]
RRCA                        → [0x0F]
RLA                         → [0x17]
RRA                         → [0x1F]
DAA                         → [0x27]
CPL                         → [0x2F]
SCF                         → [0x37]
CCF                         → [0x3F]
```

---

## Gotchas

1. **Little-endian 16-bit values** — same as Z80/8080, lo byte first.
2. **`JP HL`** — no parentheses (unlike Z80's `JP (HL)`). Both forms could be accepted.
3. **`ADD SP, n`** — n is **signed** 8-bit (-128..127), not unsigned.
4. **`LD HL, SP+n`** — also signed; assembler must sign-extend or validate range.
5. **Condition codes** — only NZ, Z, NC, C. PO/PE/P/M (Z80) do not exist. Emit error.
6. **`HALT` is 0x76** — falls in the LD r,r' block (dst=(HL), src=(HL)); treat as special case.
7. **`RST` target validation** — only multiples of 8 from 0x00 to 0x38. Emit error otherwise.
8. **JR offset** — same as Z80: relative to instruction AFTER JR (i.e., PC+2). Offset = target - (current_addr + 2).
9. **No `SUB A, r` syntax** — SM83 `SUB r` has implicit A destination (unlike `ADD A, r`).
   Accept both `SUB r` and `SUB A, r` but encode the same.

---

## Reference

- **Pan Docs** (authoritative GB hardware reference): https://gbdev.io/pandocs/
- **RGBDS documentation** (community assembler, de-facto syntax standard): https://rgbds.gbdev.io/docs/
- **SM83 opcode table**: https://gbdev.io/gb-opcodes/optables/
- **izik1 opcode table** (detailed timing/flags): https://izik1.github.io/gbops/
- **Game Boy CPU Manual** (original Nintendo document): https://archive.org/details/GameBoyProgManVer1.1
- **gbdev.io community**: https://gbdev.io
