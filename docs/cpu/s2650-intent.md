# Signetics 2650 Assembler Support — Implementation Intent

## Goal

Add Signetics 2650 (and compatible Mostek 2650A) as a new CPU target in asm80-core.
The 2650 is an unusual 8-bit CPU from 1975 with a 15-bit address space, page-based
architecture, hardware subroutine stack (8 levels), and 2-bit condition codes.
It is NOT related to Z80, 8080, or 6800 — needs a standalone implementation.

**New language ID:** `s2650asm`
**Primary file extension:** `.s26`
**Assembler CPU directive:** `.cpu s2650`

---

## Repository context

- CPU encoders live in `cpu/*.js`
- The 2650 cannot use the column-based table format (like m6800.js)
- Implement as a **standalone encoder** with custom parseOpcode — similar to `cpu/f8.js`
- No import from any existing CPU encoder

---

## Register set

| Name | Size | Description |
|------|------|-------------|
| R0   | 8-bit | Primary register / accumulator |
| R1   | 8-bit | General purpose (also index register) |
| R2   | 8-bit | General purpose (also index register) |
| R3   | 8-bit | General purpose (also index register, BXA/BSXA) |
| R4   | 8-bit | Alternate R1 (active when PSL.RS=1) |
| R5   | 8-bit | Alternate R2 (active when PSL.RS=1) |
| R6   | 8-bit | Alternate R3 (active when PSL.RS=1) |
| PSL  | 8-bit | Program Status Lower (flags) |
| PSU  | 8-bit | Program Status Upper (stack pointer, I/O bits) |
| PC   | 15-bit | Program Counter = PAGE(2b) \| IAR(13b) |

R0 is **shared** between both register banks. R4/R5/R6 are the alternate R1/R2/R3.
For the assembler, the programmer always writes `r0`–`r3`; the RS bit selects the active bank at runtime. No assembler syntax to access R4/R5/R6 directly.

---

## PSL bit layout

| Bit | Name | Meaning |
|-----|------|---------|
| 7–6 | CC   | Condition codes (see below); cannot be set by PPSL |
| 5   | IDC  | Inter-digit carry (BCD, carry from bit 3→4) |
| 4   | RS   | Register bank select (0=R0–R3, 1=R0/R4–R6) |
| 3   | WC   | With-carry mode (1=use carry-in in ADD/SUB/rotate) |
| 2   | OVF  | 2's-complement overflow |
| 1   | COM  | Compare mode (0=unsigned, 1=signed 2's-complement) |
| 0   | C    | Carry / borrow |

**Condition codes (CC, PSL bits 7–6):**

| CC value | Bits 7:6 | Meaning |
|----------|----------|---------|
| 0        | 00       | Zero (result = 0x00) |
| 1        | 01       | Plus (result = 0x01–0x7F) |
| 2        | 10       | Minus (result = 0x80–0xFF) |

> **Note**: CC=1 (plus/positive) is set when result is 0x01..0x7F — NOT when MSB=0.
> CC=2 (minus) = 0x80..0xFF — effectively MSB=1. Zero is separate.

---

## PSU bit layout

| Bit | Name | Meaning |
|-----|------|---------|
| 7   | SI   | Sense Input — **read-only**, reflects external pin |
| 6   | FO   | Flag Output — drives external pin |
| 5   | II   | Interrupt Inhibit (1=masked) |
| 4–3 | —    | **Always 0** — cannot be set by any instruction |
| 2–0 | SP   | Stack pointer (3-bit, 0–7, indexes into 8-level RAS) |

---

## Address space and pages

- **15-bit address bus**: 0x0000–0x7FFF (32 KB total)
- **4 pages** of 8 KB each:
  - Page 0: 0x0000–0x1FFF
  - Page 1: 0x2000–0x3FFF
  - Page 2: 0x4000–0x5FFF
  - Page 3: 0x6000–0x7FFF
- **PMSK** = 0x1FFF (13-bit page offset mask)
- **PAGE** = upper 2 bits of PC (0x0000, 0x2000, 0x4000, or 0x6000)

> **Critical**: `LODA`, `STRA`, `ADDA`, and all data-access absolute instructions
> compute EA = **current_page | (operand & PMSK)**. The operand cannot cross pages!
> Only branch/call instructions (BCTA, BSTA, etc.) support full 15-bit addressing.

---

## Addressing modes

### Register (Z suffix) — 1 byte
Direct register-to-register or R0-implied operations. No operand byte.

```
ADDZ,r0       → 0x80 | 0 = 0x80
LODZ,r3       → 0x00 | 3 = 0x03
```

### Immediate (I suffix) — 2 bytes: opcode + data byte
```
LODI,r1  $42  → [0x05, 0x42]
ADDI,r0  5    → [0x84, 0x05]
```

### Relative (R suffix) — 2 bytes: opcode + signed offset byte
Offset byte encoding:
- Bit 7: indirect flag (1 = indirect: fetch address from EA, then use that address)
- Bits 6–0: signed 7-bit offset (–64 to +63)

Effective address = `PAGE | ((IAR + sext7(offset_bits)) & PMSK)`
where IAR = PC after fetching both opcode and offset bytes.

```
LODR,r0  *+0  → offset = 0 → [0x08, 0x00]         ; direct, EA = next instr
LODR,r0  *+3  → offset = 1 → [0x08, 0x01]         ; EA = 1 byte past offset
LODR,r0  *$+3 → [0x08, indirect_flag | offset]     ; indirect
```

For branches, `*+n` syntax means "offset of n bytes from current instruction":
```
BCTR,EQ  *+5  → offset = 5-2 = 3 → [0x18, 0x03]
```
Offset formula: `offset_byte = target_addr - (opcode_addr + 2)` clamped to –64..+63.

### Absolute (A suffix) — 3 bytes: opcode + hr + dr
High byte (hr) encoding:
- Bit 7: indirect flag
- Bits 6–5: index mode (see table)
- Bits 4–0: address bits 12–8

| hr bits 6–5 | Mode | Effect on index register Rn |
|-------------|------|----------------------------|
| 00          | None | No indexing |
| 01          | Auto-increment | Rn++ BEFORE EA = base + Rn |
| 10          | Auto-decrement | Rn-- BEFORE EA = base + Rn |
| 11          | Indexed | EA = base + Rn, Rn unchanged |

Low byte (dr): address bits 7–0.

**For data instructions** (LODA, STRA, ADDA, etc.):
EA = `current_page | (((hr & 0x1F) << 8) | dr)` (stays within current page)

**For branch/call instructions** (BCTA, BSTA, etc.):
EA = `((hr & 0x7F) << 8) | dr` (full 15-bit; page bits ARE used)

```
LODA,r1  $0800          → hr=0x08, dr=0x00 → [0x0D, 0x08, 0x00]
LODA,r1  *$0800         → indirect → [0x0D, 0x88, 0x00]
LODA,r1  $0800,r2+      → auto-inc r2 → hr |= 0x20 → [0x0D, 0x28, 0x00]
LODA,r1  $0800,r2-      → auto-dec r2 → hr |= 0x40 → [0x0D, 0x48, 0x00]
LODA,r1  $0800,r2       → indexed → hr |= 0x60 → [0x0D, 0x68, 0x00]
BSTA,UN  $2000          → call $2000 → [0x3F, 0x20, 0x00]
```

> **Critical gotcha — absolute data mode ignores page bits in hr**: For LODA/STRA etc.,
> writing `$3800` as address is equivalent to `$1800` if current page is 0 — the upper
> 2 bits of the 15-bit address always come from the current PC page, not the operand.
> The assembler should warn if the address page differs from the current section page.

### Zero-page relative — for ZBRR and ZBSR only
Address is computed from page 0 regardless of current page. Same offset encoding as relative.

---

## Instruction set — complete table by opcode group

### Opcode encoding pattern

```
bits 7–2: operation family (6 bits → 64 families)
bits 1–0: register R0–R3 (or condition code for branches)
```

For branch/call conditions, bits 1–0:
- 00 = EQ (CC=zero)
- 01 = GT (CC=plus)
- 10 = LT (CC=minus)
- 11 = UN (always / unconditional)

### Full opcode map

```
0x00–0x03  LODZ,r     Z    R0 ← R(r); sets CC
0x04–0x07  LODI,r     I    R(r) ← imm; sets CC
0x08–0x0B  LODR,r     R    R(r) ← mem[EA]; sets CC
0x0C–0x0F  LODA,r     A    R(r) ← mem[EA]; sets CC

0x10 (undef)
0x11 (undef)
0x12       SPSU       —    R0 ← PSU
0x13       SPSL       —    R0 ← PSL
0x14–0x17  RETC,cc    —    Return if CC matches cc; does NOT re-enable interrupts
0x18–0x1B  BCTR,cc    R    Branch relative if CC matches cc
0x1C–0x1F  BCTA,cc    A    Branch absolute if CC matches cc

0x20–0x23  EORZ,r     Z    R0 ← R0 XOR R(r); sets CC
0x24–0x27  EORI,r     I    R(r) ← R(r) XOR imm; sets CC
0x28–0x2B  EORR,r     R    R(r) ← R(r) XOR mem[EA]; sets CC
0x2C–0x2F  EORA,r     A    R(r) ← R(r) XOR mem[EA]; sets CC

0x30–0x33  REDC,r     —    R(r) ← control port input
0x34–0x37  RETE,cc    —    Return + re-enable interrupts (II=0) if CC matches
0x38–0x3B  BSTR,cc    R    Call relative if CC matches (push return addr to RAS)
0x3C–0x3F  BSTA,cc    A    Call absolute if CC matches

0x40       HALT       —    Halt (IAR--; resume on interrupt)
0x41–0x43  ANDZ,r     Z    R0 ← R0 AND R(r); sets CC
0x44–0x47  ANDI,r     I    R(r) ← R(r) AND imm; sets CC
0x48–0x4B  ANDR,r     R    R(r) ← R(r) AND mem[EA]; sets CC
0x4C–0x4F  ANDA,r     A    R(r) ← R(r) AND mem[EA]; sets CC

0x50–0x53  RRR,r      —    Rotate R(r) right (with carry if WC=1); sets CC
0x54–0x57  REDE,r     I    R(r) ← extended I/O port[imm]
0x58–0x5B  BRNR,r     R    Branch relative if R(r) ≠ 0 (does NOT change R(r))
0x5C–0x5F  BRNA,r     A    Branch absolute if R(r) ≠ 0

0x60–0x63  IORZ,r     Z    R0 ← R0 IOR R(r); sets CC
0x64–0x67  IORI,r     I    R(r) ← R(r) IOR imm; sets CC
0x68–0x6B  IORR,r     R    R(r) ← R(r) IOR mem[EA]; sets CC
0x6C–0x6F  IORA,r     A    R(r) ← R(r) IOR mem[EA]; sets CC

0x70–0x73  REDD,r     —    R(r) ← data port input
0x74       CPSU       I    PSU &= ~imm (clear PSU bits); SI and bits 3-4 protected
0x75       CPSL       I    PSL &= ~imm (clear PSL bits)
0x76       PPSU       I    PSU |= imm (set PSU bits); SI and bits 3-4 protected
0x77       PPSL       I    PSL |= imm (set PSL bits); CC bits (7-6) cannot be set
0x78–0x7B  BSNR,r     R    Call relative if R(r) ≠ 0
0x7C–0x7F  BSNA,r     A    Call absolute if R(r) ≠ 0

0x80–0x83  ADDZ,r     Z    R0 ← R0 + R(r); sets CC, C, OVF, IDC
0x84–0x87  ADDI,r     I    R(r) ← R(r) + imm
0x88–0x8B  ADDR,r     R    R(r) ← R(r) + mem[EA]
0x8C–0x8F  ADDA,r     A    R(r) ← R(r) + mem[EA]

0x90 (undef)
0x91 (undef)
0x92       LPSU       —    PSU ← R0; SI and bits 3-4 masked
0x93       LPSL       —    PSL ← R0
0x94–0x97  DAR,r      —    Decimal Adjust R(r) (BCD correction after ADD)
0x98–0x9A  BCFR,cc    R    Branch relative if CC does NOT match cc (cc=0..2 only)
0x9B       ZBRR       R    Branch to page-0 relative (always; zero-page)
0x9C–0x9E  BCFA,cc    A    Branch absolute if CC does NOT match cc
0x9F       BXA        A    Branch absolute, EA += R3 (jump table)

0xA0–0xA3  SUBZ,r     Z    R0 ← R0 - R(r); sets CC, C, OVF, IDC
0xA4–0xA7  SUBI,r     I    R(r) ← R(r) - imm
0xA8–0xAB  SUBR,r     R    R(r) ← R(r) - mem[EA]
0xAC–0xAF  SUBA,r     A    R(r) ← R(r) - mem[EA]

0xB0–0xB3  WRTC,r     —    control port ← R(r)
0xB4       TPSU       I    Test PSU AND mask; sets CC (does not modify PSU)
0xB5       TPSL       I    Test PSL AND mask; sets CC
0xB6 (undef)
0xB7 (undef)
0xB8–0xBA  BSFR,cc    R    Call relative if CC does NOT match cc
0xBB       ZBSR       R    Call page-0 relative (always; zero-page)
0xBC–0xBE  BSFA,cc    A    Call absolute if CC does NOT match cc
0xBF       BSXA       A    Call absolute, EA += R3 (call table)

0xC0       NOP        —    No operation
0xC1–0xC3  STRZ,r     Z    R(r) ← R0 (store R0 into register; R0 unchanged)
0xC4–0xC7 (undef)
0xC8–0xCB  STRR,r     R    mem[EA] ← R(r)
0xCC–0xCF  STRA,r     A    mem[EA] ← R(r)

0xD0–0xD3  RRL,r      —    Rotate R(r) left (with carry if WC=1); sets CC
0xD4–0xD7  WRTE,r     I    extended I/O port[imm] ← R(r)
0xD8–0xDB  BIRR,r     R    R(r)++ then branch relative if R(r) ≠ 0
0xDC–0xDF  BIRA,r     A    R(r)++ then branch absolute if R(r) ≠ 0

0xE0–0xE3  COMZ,r     Z    Compare R0 vs R(r); sets CC only (not C/OVF)
0xE4–0xE7  COMI,r     I    Compare R(r) vs imm; sets CC only
0xE8–0xEB  COMR,r     R    Compare R(r) vs mem[EA]; sets CC only
0xEC–0xEF  COMA,r     A    Compare R(r) vs mem[EA]; sets CC only

0xF0–0xF3  WRTD,r     —    data port ← R(r)
0xF4–0xF7  TMI,r      I    if (R(r) AND mask) ≠ mask → CC=minus; else CC=plus
0xF8–0xFB  BDRR,r     R    R(r)-- then branch relative if R(r) ≠ 0
0xFC–0xFF  BDRA,r     A    R(r)-- then branch absolute if R(r) ≠ 0
```

---

## parseOpcode structure

The 2650 mnemonic syntax: `MNEM,r operand` where `,r` is the register suffix
(r0–r3) or condition code (EQ/GT/LT/UN / 0/1/2/3).

```js
export const S2650 = {
  endian: "big",
  cpu:    "s2650",
  ext:    "s26",
  set:    {},           // encoding is fully in parseOpcode
  parseOpcode,
};

// How parseLine tokenizes S2650 syntax (verified empirically):
//   "LODI,R1 $42"      → s.opcode="LODI",  s.params=["", "R1 $42"]
//   "LODA,R1 $800,R2+" → s.opcode="LODA",  s.params=["", "R1 $800", "R2+"]
//   "BCTR,EQ *+5"      → s.opcode="BCTR",  s.params=["", "EQ *+5"]
//   "ADDZ,R1"          → s.opcode="ADDZ",  s.params=["", "R1"]
//   "CPSU $20"         → s.opcode="CPSU",  s.params=["$20"]
//   "NOP"              → s.opcode="NOP",   s.params=[]
//
// Helpers:
//   getSuffix(s)  → s.params[1]?.split(" ")[0]   (register or condition code)
//   getOperand(s) → s.params[1]?.split(" ")[1]   (expression, may be undefined)
//   getIndex(s)   → s.params[2]                   ("R2+", "R2-", "R2" or undefined)
//   getImm(s)     → s.params[0] (for no-suffix instructions like CPSU)

function parseOpcode(s, vars, Parser) {
  const base = s.opcode.toUpperCase();
  const r  = parseReg(getSuffix(s));
  const cc = parseCC(getSuffix(s));
  const op = getOperand(s);
  const idx = getIndex(s);

  switch (base) {
    // --- Load/Store ---
    case "LODZ": { s.lens = [0x00 | r];                              s.bytes = 1; return s; }
    case "LODI": { s.lens = [0x04 | r, imm8(op, vars, Parser)];     s.bytes = 2; return s; }
    case "LODR": { return encodeR(s, 0x08 | r, op, vars, Parser); }
    case "LODA": { return encodeA(s, 0x0C | r, op, idx, vars, Parser, false); }
    case "STRZ": { s.lens = [0xC0 | r];                              s.bytes = 1; return s; }  // r=0→NOP(0xC0), like 8080 MOV M,M→HLT
    case "STRR": { return encodeR(s, 0xC8 | r, op, vars, Parser); }
    case "STRA": { return encodeA(s, 0xCC | r, op, idx, vars, Parser, false); }

    // --- Arithmetic ---
    case "ADDZ": { s.lens = [0x80 | r];                              s.bytes = 1; return s; }
    case "ADDI": { s.lens = [0x84 | r, imm8(op, vars, Parser)];     s.bytes = 2; return s; }
    case "ADDR": { return encodeR(s, 0x88 | r, op, vars, Parser); }
    case "ADDA": { return encodeA(s, 0x8C | r, op, idx, vars, Parser, false); }
    case "SUBZ": { s.lens = [0xA0 | r];                              s.bytes = 1; return s; }
    case "SUBI": { s.lens = [0xA4 | r, imm8(op, vars, Parser)];     s.bytes = 2; return s; }
    case "SUBR": { return encodeR(s, 0xA8 | r, op, vars, Parser); }
    case "SUBA": { return encodeA(s, 0xAC | r, op, idx, vars, Parser, false); }
    case "DAR":  { s.lens = [0x94 | r];                              s.bytes = 1; return s; }

    // --- Logical ---
    case "EORZ": { s.lens = [0x20 | r];                              s.bytes = 1; return s; }
    case "EORI": { s.lens = [0x24 | r, imm8(op, vars, Parser)];     s.bytes = 2; return s; }
    case "EORR": { return encodeR(s, 0x28 | r, op, vars, Parser); }
    case "EORA": { return encodeA(s, 0x2C | r, op, idx, vars, Parser, false); }
    case "ANDZ": { s.lens = [0x40 | r];                              s.bytes = 1; return s; }  // r=0→HALT(0x40), like 8080 MOV M,M→HLT
    case "ANDI": { s.lens = [0x44 | r, imm8(op, vars, Parser)];     s.bytes = 2; return s; }
    case "ANDR": { return encodeR(s, 0x48 | r, op, vars, Parser); }
    case "ANDA": { return encodeA(s, 0x4C | r, op, idx, vars, Parser, false); }
    case "IORZ": { s.lens = [0x60 | r];                              s.bytes = 1; return s; }
    case "IORI": { s.lens = [0x64 | r, imm8(op, vars, Parser)];     s.bytes = 2; return s; }
    case "IORR": { return encodeR(s, 0x68 | r, op, vars, Parser); }
    case "IORA": { return encodeA(s, 0x6C | r, op, idx, vars, Parser, false); }

    // --- Compare / Test ---
    case "COMZ": { s.lens = [0xE0 | r];                              s.bytes = 1; return s; }
    case "COMI": { s.lens = [0xE4 | r, imm8(op, vars, Parser)];     s.bytes = 2; return s; }
    case "COMR": { return encodeR(s, 0xE8 | r, op, vars, Parser); }
    case "COMA": { return encodeA(s, 0xEC | r, op, idx, vars, Parser, false); }
    case "TMI":  { s.lens = [0xF4 | r, imm8(op, vars, Parser)];     s.bytes = 2; return s; }
    case "TPSU": { s.lens = [0xB4, imm8(s.params[0], vars, Parser)]; s.bytes = 2; return s; }
    case "TPSL": { s.lens = [0xB5, imm8(s.params[0], vars, Parser)]; s.bytes = 2; return s; }

    // --- Rotate ---
    case "RRR": { s.lens = [0x50 | r]; s.bytes = 1; return s; }
    case "RRL": { s.lens = [0xD0 | r]; s.bytes = 1; return s; }

    // --- PSW access ---
    case "SPSU": { s.lens = [0x12]; s.bytes = 1; return s; }
    case "SPSL": { s.lens = [0x13]; s.bytes = 1; return s; }
    case "LPSU": { s.lens = [0x92]; s.bytes = 1; return s; }
    case "LPSL": { s.lens = [0x93]; s.bytes = 1; return s; }
    case "CPSU": { s.lens = [0x74, imm8(s.params[0], vars, Parser)]; s.bytes = 2; return s; }
    case "CPSL": { s.lens = [0x75, imm8(s.params[0], vars, Parser)]; s.bytes = 2; return s; }
    case "PPSU": { s.lens = [0x76, imm8(s.params[0], vars, Parser)]; s.bytes = 2; return s; }
    case "PPSL": { s.lens = [0x77, imm8(s.params[0], vars, Parser)]; s.bytes = 2; return s; }

    // --- I/O ---
    case "REDD": { s.lens = [0x70 | r]; s.bytes = 1; return s; }
    case "REDC": { s.lens = [0x30 | r]; s.bytes = 1; return s; }
    case "REDE": { s.lens = [0x54 | r, imm8(op, vars, Parser)]; s.bytes = 2; return s; }
    case "WRTD": { s.lens = [0xF0 | r]; s.bytes = 1; return s; }
    case "WRTC": { s.lens = [0xB0 | r]; s.bytes = 1; return s; }
    case "WRTE": { s.lens = [0xD4 | r, imm8(op, vars, Parser)]; s.bytes = 2; return s; }

    // --- Conditional branches (relative) ---
    case "BCTR": { return encodeR(s, 0x18 | cc, op, vars, Parser); }
    case "BCFR": { return encodeR(s, 0x98 | cc, op, vars, Parser); }  // cc 0–2 only
    case "ZBRR": { return encodeR_zp(s, 0x9B, op, vars, Parser); }    // zero-page

    // --- Conditional branches (absolute) ---
    case "BCTA": { return encodeA(s, 0x1C | cc, op, idx, vars, Parser, true); }
    case "BCFA": { return encodeA(s, 0x9C | cc, op, idx, vars, Parser, true); }
    case "BXA":  { return encodeA(s, 0x9F,      op, idx, vars, Parser, true); }

    // --- Subroutine calls (relative / absolute) ---
    case "BSTR": { return encodeR(s, 0x38 | cc, op, vars, Parser); }
    case "BSTA": { return encodeA(s, 0x3C | cc, op, idx, vars, Parser, true); }
    case "BSFR": { return encodeR(s, 0xB8 | cc, op, vars, Parser); }
    case "BSFA": { return encodeA(s, 0xBC | cc, op, idx, vars, Parser, true); }
    case "ZBSR": { return encodeR_zp(s, 0xBB, op, vars, Parser); }    // zero-page
    case "BSXA": { return encodeA(s, 0xBF, op, idx, vars, Parser, true); }

    // --- Branch/Call if register non-zero ---
    case "BRNR": { return encodeR(s, 0x58 | r, op, vars, Parser); }
    case "BRNA": { return encodeA(s, 0x5C | r, op, idx, vars, Parser, true); }
    case "BSNR": { return encodeR(s, 0x78 | r, op, vars, Parser); }
    case "BSNA": { return encodeA(s, 0x7C | r, op, idx, vars, Parser, true); }

    // --- Branch-increment/decrement ---
    case "BIRR": { return encodeR(s, 0xD8 | r, op, vars, Parser); }
    case "BIRA": { return encodeA(s, 0xDC | r, op, idx, vars, Parser, true); }
    case "BDRR": { return encodeR(s, 0xF8 | r, op, vars, Parser); }
    case "BDRA": { return encodeA(s, 0xFC | r, op, idx, vars, Parser, true); }

    // --- Returns ---
    case "RETC": { s.lens = [0x14 | cc]; s.bytes = 1; return s; }
    case "RETE": { s.lens = [0x34 | cc]; s.bytes = 1; return s; }

    // --- Misc ---
    case "NOP":  { s.lens = [0xC0]; s.bytes = 1; return s; }
    case "HALT": { s.lens = [0x40]; s.bytes = 1; return s; }

    default: return null;  // not an S2650 instruction
  }
}
```

---

## Encoding helpers

### Parser output — how params are structured

Because `parseLine` stops at comma in the opcode regex, the suffix (`,R1`, `,EQ`) is
absorbed into params as a leading empty string. Verified empirically:

```
"LODI,R1 $42"      → opcode="LODI",  params=["", "R1 $42"]
"LODA,R1 $800,R2+" → opcode="LODA",  params=["", "R1 $800", "R2+"]
"BCTR,EQ *+5"      → opcode="BCTR",  params=["", "EQ *+5"]
"ADDZ,R1"          → opcode="ADDZ",  params=["", "R1"]
"CPSU $20"         → opcode="CPSU",  params=["$20"]   ← no leading comma
"NOP"              → opcode="NOP",   params=[]
```

### Parser output helpers

```js
// First word of params[1] (register or condition code suffix)
function getSuffix(s) { return s.params[1]?.split(/\s+/)[0]; }

// Second word of params[1] (operand expression, may include @ prefix)
function getOperand(s) {
  const parts = s.params[1]?.split(/\s+/);
  return parts && parts.length > 1 ? parts.slice(1).join(" ") : undefined;
}

// params[2] = index register with optional +/- ("R2+", "R2-", "R2")
function getIndex(s) { return s.params[2]; }
```

### Register / condition code parsing

```js
const REG_MAP  = { R0:0, R1:1, R2:2, R3:3 };
const CC_MAP   = { EQ:0, GT:1, LT:2, UN:3, "0":0, "1":1, "2":2, "3":3 };

function parseReg(s) {
  if (!s) return 0;
  const v = REG_MAP[s.toUpperCase()];
  if (v === undefined) throw new Error(`S2650: unknown register: ${s}`);
  return v;
}
function parseCC(s) {
  if (!s) return 3;  // default UN
  const v = CC_MAP[s.toUpperCase()];
  if (v === undefined) throw new Error(`S2650: unknown condition: ${s}`);
  return v;
}
```

### Current address: `*` in expressions

Original S2650 assemblers use `*` as the current address symbol (like `$` in Z80).
ASM80's expression parser uses `$` for `_PC`. In the S2650 encoder, standalone `*`
is replaced with `$` before evaluation. Multiplication is unaffected because
`2*COUNT` has `*` preceded by a digit (alphanumeric boundary guards the replacement).

```js
// Replace standalone * (current address) with $ (ASM80 _PC) in an expression.
// Does NOT replace * used as multiplication (e.g. "2*COUNT" is preserved).
function resolvePC(expr) {
  return expr.replace(/(?<![a-zA-Z0-9_$])\*(?![a-zA-Z0-9_])/g, "$");
}
```

### Indirect addressing: `@` prefix

Following the original Signetics assembler convention, indirect addressing is
signalled by a leading `@` on the operand (not `*`). This avoids ambiguity with
`*` used as current address.

- Relative indirect: `LODR,R0 @+3`  → indirect, target = _PC + 3
- Absolute indirect: `LODA,R0 @$0800` → indirect, address = $0800

```js
function parseIndirect(operand) {
  const indirect = operand.startsWith("@");
  const expr = indirect ? operand.slice(1) : operand;
  return { indirect, expr };
}
```

### Immediate helper

```js
function imm8(expr, vars, Parser) {
  return (v) => Parser.evaluate(expr, v ?? vars);
}
```

### Relative mode encoder

Offset is computed as a **lambda** (deferred to pass2, same pattern as Z80 JR).
`vars._PC` = address of the current instruction (set by pass1 as `op.addr = PC`).

```js
function encodeR(s, opcode, operand, vars, Parser) {
  const { indirect, expr: rawExpr } = parseIndirect(operand);
  const expr = resolvePC(rawExpr);
  s.lens = [
    opcode,
    (v) => {
      const target = Parser.evaluate(expr, v);
      const iar = v._PC + 2;  // IAR after fetching opcode + offset byte
      const offset = target - iar;
      if (offset < -64 || offset > 63) throw `S2650: relative offset out of range: ${offset}`;
      return (indirect ? 0x80 : 0) | (offset & 0x7F);
    },
  ];
  s.bytes = 2;
  return s;
}

// Zero-page relative: target is forced to page 0 (0x0000–0x1FFF)
function encodeR_zp(s, opcode, operand, vars, Parser) {
  const { indirect, expr: rawExpr } = parseIndirect(operand);
  const expr = resolvePC(rawExpr);
  s.lens = [
    opcode,
    (v) => {
      const target = Parser.evaluate(expr, v) & 0x1FFF;
      const iar = (v._PC + 2) & 0x1FFF;
      const offset = target - iar;
      if (offset < -64 || offset > 63) throw `S2650: zero-page offset out of range`;
      return (indirect ? 0x80 : 0) | (offset & 0x7F);
    },
  ];
  s.bytes = 2;
  return s;
}
```

### Absolute mode encoder

Operand formats (addr part of `s.params[1]`, index from `s.params[2]`):
- `$1234` — direct absolute
- `@$1234` — indirect (bit 7 of hr)
- index in params[2]: `R1+` = auto-increment, `R1-` = auto-decrement, `R1` = indexed

```js
function encodeA(s, opcode, operand, indexParam, vars, Parser, isBranch) {
  const { indirect, expr } = parseIndirect(operand);

  let indexMode = 0;  // 0=none, 1=auto-inc, 2=auto-dec, 3=indexed
  let idxReg = 0;
  if (indexParam) {
    const m = indexParam.trim().match(/^[Rr]([0-3])\s*([+-]?)$/);
    if (m) {
      idxReg = parseInt(m[1]);
      indexMode = m[2] === "+" ? 1 : m[2] === "-" ? 2 : 3;
    }
  }

  s.lens = [
    opcode,
    (v) => {
      const addr = Parser.evaluate(expr, v) & 0x7FFF;
      const hr_addr = isBranch ? (addr >> 8) & 0x7F   // full 15-bit for branches
                               : (addr >> 8) & 0x1F;   // 13-bit page-relative for data
      return (indirect ? 0x80 : 0) | (indexMode << 5) | hr_addr;
    },
    (v) => Parser.evaluate(expr, v) & 0xFF,
  ];
  s.bytes = 3;
  return s;
}
```

---

## Syntax reference table

| Syntax | Meaning | Example |
|--------|---------|---------|
| `MNEM,r0` | Register R0 | `LODI,r0 $42` |
| `MNEM,r3` | Register R3 | `ADDZ,r3` |
| `MNEM,EQ` | Branch if CC=zero | `BCTR,EQ *+5` |
| `MNEM,GT` | Branch if CC=plus | `BCTA,GT $1800` |
| `MNEM,LT` | Branch if CC=minus | `RETC,LT` |
| `MNEM,UN` | Always | `BSTA,UN $2000` |
| `MNEM,0..3` | Numeric condition | `BCTR,0 *+5` |
| `*+n` / `*-n` | Relative addr (current PC ± n) | `BCTR,UN *+10` |
| `label` | Relative addr (direct label) | `BCTR,EQ LOOP` |
| `@+n` / `@label` | Relative addr (indirect) | `LODR,r0 @+3` |
| `$addr` | Absolute address | `BCTA,UN $2000` |
| `@$addr` / `@label` | Absolute indirect | `BCTA,UN @$0010` |
| `$addr,rN+` | Absolute indexed, auto-inc | `LODA,r1 $0800,r2+` |
| `$addr,rN-` | Absolute indexed, auto-dec | `STRA,r1 $0810,r3-` |
| `$addr,rN` | Absolute indexed (no change) | `LODA,r0 $1000,r1` |

---

## docs/cpu/s2650-code.json

```json
["LODZ","LODI","LODR","LODA",
 "STRZ","STRR","STRA",
 "ADDZ","ADDI","ADDR","ADDA",
 "SUBZ","SUBI","SUBR","SUBA",
 "EORZ","EORI","EORR","EORA",
 "ANDZ","ANDI","ANDR","ANDA",
 "IORZ","IORI","IORR","IORA",
 "COMZ","COMI","COMR","COMA",
 "TMI","TPSU","TPSL",
 "RRR","RRL","DAR",
 "SPSU","SPSL","LPSU","LPSL",
 "CPSU","CPSL","PPSU","PPSL",
 "REDD","REDC","REDE","WRTD","WRTC","WRTE",
 "BCTR","BCFR","BCTA","BCFA","ZBRR","BXA",
 "BSTR","BSFR","BSTA","BSFA","ZBSR","BSXA",
 "BRNR","BRNA","BSNR","BSNA",
 "BIRR","BIRA","BDRR","BDRA",
 "RETC","RETE",
 "NOP","HALT"]
```

---

## Gotchas for implementer

1. **NOP = 0xC0, not 0x00**. LODZ,r0 (0x00) loads R0 from R0 — sets CC but otherwise a NOP-like effect.

2. **ANDZ,r0 = 0x40 = HALT**. The assembler encodes what is written, same as 8080's `MOV M,M` → `HLT`. HALT is 0x40; ANDZ uses base 0x40, so `ANDZ,r0` → 0x40 = HALT. Similarly `STRZ,r0` → 0xC0 = NOP. These are valid (if unusual) encodings — not assembler errors.

3. **Absolute data addressing is page-confined**. For LODA/STRA/ADDA/SUBA etc., only the lower 13 bits of the operand address matter; the upper 2 bits always come from the current instruction's page. Emit a warning if the operand address page differs from the current `.org` section page.

4. **BCFR/BSFR only have 3 conditions (EQ/GT/LT)**. Opcodes 0x9B and 0xBB are ZBRR and ZBSR (not BCFR,UN / BSFR,UN). Attempting `BCFR,UN` should be an error.

5. **BCFR/BCFA condition codes are NOT inverted in the opcode bits** — the CPU inverts the test. `BCFR,EQ` = branch if NOT zero = opcode 0x98 (bits 1:0 = 00 = EQ). Same encoding as BCTR; different opcode base.

6. **Relative offset range is –64 to +63** (7-bit signed). This is half the range of Z80 JR. Label-relative branches within one page should work; cross-page branches require absolute mode.

7. **Auto-increment happens BEFORE EA computation** (mode 01 = auto-inc, mode 10 = auto-dec). `LODA,r1 $0800,r2+` → r2++, then EA = $0800 + r2. The result in r2 after the instruction is the value used for addressing.

8. **ZBRR/ZBSR compute offset relative to current IAR but target is in page 0**. The effective address is page-0 only; the offset must land within page 0 (0x0000–0x1FFF).

9. **No separate `BR` / `BSR` mnemonic** — use `BCTR,UN` (unconditional branch relative) and `BSTA,UN` (unconditional call absolute) etc.

---

## Implementation status

**Implemented in v1.0.13** — files: `cpu/s2650.js`, `test/asm-s2650.js`, registered in `asm.js`.

### Notes from implementation

- `parseLine.js` regex `[\.a-zA-Z0-9-_]+` stops at comma, so `LODI,R1 $42` yields
  `opcode="LODI"`, `params=["", "R1 $42"]`. The suffix (`,R1`) ends up as the empty
  first param; suffix + operand land in `params[1]` as a space-separated pair.
  Index register (`,R2+`) is `params[2]`.

- `parseReg` and `parseCC` must be **tolerant** (return default, not throw) because
  both are called unconditionally at the top of `parseOpcode`. Throwing on "unknown
  condition: R0" would break every register-mode instruction.

- Relative offset must be a **lambda** (deferred to pass2), not computed eagerly in
  pass1 — same pattern as Z80 JR. `vars._PC` = address of the opcode byte.

- `*` as current address: replaced with `$` by `resolvePC()` using a regex that
  guards against multiplication (`2*COUNT` is unaffected because `*` is preceded by
  alphanumeric). Original Signetics `@` prefix is used for indirect (not `*`).

- `ANDZ,R0` → 0x40 = HALT, `STRZ,R0` → 0xC0 = NOP: assembler encodes as written,
  consistent with 8080 `MOV M,M` → HLT.

---

## Tests (test/asm-s2650.js)

```
// Immediate
LODI,r0  $42          → [0x04, 0x42]
LODI,r3  255          → [0x07, 0xFF]
ADDI,r1  $10          → [0x85, 0x10]
COMI,r2  0            → [0xE6, 0x00]
TMI,r0   $F0          → [0xF4, 0xF0]

// Register
LODZ,r0               → [0x00]
LODZ,r3               → [0x03]
ADDZ,r1               → [0x81]
ANDZ,r0               → [0x40]   (= HALT; like 8080 MOV M,M → HLT — assembler encodes as written)
ANDZ,r1               → [0x41]
EORZ,r2               → [0x22]
STRZ,r0               → [0xC0]   (= NOP; same principle)
STRZ,r1               → [0xC1]   (R1 ← R0)
RRR,r0                → [0x50]
RRL,r2                → [0xD2]
DAR,r0                → [0x94]

// PSW
SPSU                  → [0x12]
SPSL                  → [0x13]
LPSU                  → [0x92]
LPSL                  → [0x93]
CPSU  $20             → [0x74, 0x20]
PPSL  $08             → [0x77, 0x08]

// Relative mode (instruction at $0100, so IAR=$0102 when computing offset)
; LODR,r0 at $0100: target = $0110 → offset = $0110 - $0102 = 14 = 0x0E
LODR,r0  $0110        → [0x08, 0x0E]
; indirect (@ prefix = Signetics convention):
LODR,r0  @$0110       → [0x08, 0x8E]

// Relative branches (at $0200, IAR=$0202 when computing)
BCTR,EQ  $0204        → [0x18, 0x02]    ; offset=2
BCTR,GT  $0200        → [0x19, 0xFE]    ; offset=-2 (backward to self - demo only)
BCTR,LT  $0210        → [0x1A, 0x0E]
BCTR,UN  $0204        → [0x1B, 0x02]
BCFR,EQ  $0204        → [0x98, 0x02]
BSTR,UN  $020C        → [0x3B, 0x0A]    ; call relative, offset=10
RETE,UN               → [0x37]
RETC,EQ               → [0x14]
RETC,UN               → [0x17]

// Absolute (branch — full 15-bit)
BCTA,UN  $2000        → [0x1F, 0x20, 0x00]
BSTA,UN  $4000        → [0x3F, 0x40, 0x00]
BCTA,EQ  $0100        → [0x1C, 0x01, 0x00]
BCFA,GT  $1800        → [0x9D, 0x18, 0x00]
BXA      $1000        → [0x9F, 0x10, 0x00]
BSXA     $0200        → [0xBF, 0x02, 0x00]

// Absolute (data — page-confined)
; Assuming .org $0000 (page 0)
LODA,r0  $0800        → [0x0C, 0x08, 0x00]
LODA,r1  $0800,r2+    → [0x0D, 0x28, 0x00]   ; auto-inc R2
LODA,r2  $0800,r3-    → [0x0E, 0x48, 0x00]   ; auto-dec R3
LODA,r0  $0810,r1     → [0x0C, 0x68, 0x10]   ; indexed by R1
LODA,r0  @$0800       → [0x0C, 0x88, 0x00]   ; indirect (@ = Signetics convention)

// BIRR/BDRR
BIRR,r1  $0210        → [0xD9, 0x0E]    ; r1++ then branch if r1≠0
BDRR,r3  $020C        → [0xFB, 0x0A]   ; r3-- then branch if r3≠0

// I/O
REDD,r0               → [0x70]
WRTD,r1               → [0xF1]
REDC,r2               → [0x32]
WRTC,r0               → [0xB0]
REDE,r3  $40          → [0x57, 0x40]
WRTE,r0  $10          → [0xD4, 0x10]

// Misc
NOP                   → [0xC0]
HALT                  → [0x40]
ZBRR     $0010        → [0x9B, offset...]   ; zero-page relative
ZBSR     $0008        → [0xBB, offset...]
```

---

## Reference

- **Signetics 2650 Programmer's Manual**: https://archive.org/search?query=signetics+2650+programmer
- **MAME s2650.cpp** (authoritative implementation): https://github.com/mamedev/mame/blob/master/src/devices/cpu/s2650/s2650.cpp
- **MAME 2650dasm.cpp** (complete opcode table): https://github.com/mamedev/mame/blob/master/src/devices/cpu/s2650/2650dasm.cpp
- **rileym65/Asm-2650** (lightweight C assembler): https://github.com/rileym65/Asm-2650
- **Dennis1000/VACS** (primary Arcadia 2001 assembler, Pascal): https://github.com/Dennis1000/VACS
- **ASxxxx as2650** (part of ASxxxx suite): http://shop-pdp.net/ashtml/as2650.htm
