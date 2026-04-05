# Fairchild F8 Assembler Support — Implementation Intent

## Goal

Add Fairchild F8 (Fairchild 3850/3851/Mostek MK3870) as a new CPU target in asm80-core.
This is a **from-scratch** implementation — F8 shares no ISA heritage with Z80, 6800, 6502
or any other CPU already in the project.

**New language ID:** `f8asm`
**Primary file extension:** `.f8`
**Assembler CPU directive:** `.cpu f8`

---

## Primary documentation sources

| Document | URL |
|----------|-----|
| **F8 Guide to Programming (1977) — PRIMARY** | http://www.bitsavers.org/components/fairchild/f8/F8_Guide_To_Programming_1977.pdf |
| F8 Guide to Programming (1976) | http://www.bitsavers.org/components/fairchild/f8/67095664_F8_Guide_To_Programming_1976.pdf |
| F3850 CPU Datasheet (1982) | https://datasheets.chipdb.org/Fairchild/F8/fairchild-3850.pdf |
| MK3870 Datasheet (Mostek) | https://datasheets.chipdb.org/Fairchild/F8/MK3870.pdf |
| VESWiki opcode table | https://channelf.se/veswiki/index.php?title=Opcode |
| Lowell Turner — F8 instruction set | http://www.nyx.net/~lturner/public_html/F8_ins.html |
| FreeChaF f8.c (ground-truth emulator) | https://github.com/libretro/FreeChaF/blob/master/src/f8.c |
| MAME f8.cpp | https://github.com/mamedev/mame/blob/master/src/devices/cpu/f8/f8.cpp |
| Tobias V. Langhoff opcode table | https://tobiasvl.github.io/optable/f8/ |

---

## Architecture overview

The F8 is unlike every other CPU in asm80-core. Key differences:

1. **No address bus on the CPU chip.** Program counter (PC0), stack register (PC1),
   and data counter (DC0) live in the 3851 PSU chip, not the 3850 CPU. For assembler
   purposes this is transparent — we emit code targeting a flat address space.

2. **64-byte on-chip scratchpad** replaces general-purpose registers. Registers 0–11
   are directly addressable in instructions (encoded in the low nibble). Registers 12–63
   are accessed only indirectly via the 6-bit ISAR register.

3. **8-bit accumulator (A)** is the only ALU register.

4. **ISAR** (Indirect Scratchpad Address Register, 6 bits): upper 3 bits select
   8-byte window, lower 3 bits select register within window. Auto-increment/decrement
   wraps **within the 8-byte window only** (bits 5:3 never change).

5. **One-level hardware stack** (PC1). Subroutine nesting beyond 1 level needs
   software management (save/restore via scratchpad + `LR K,P`/`LR P,K`).

6. **Sign flag is INVERTED** relative to all other CPUs: S=1 means result is
   non-negative (positive or zero); S=0 means result was negative. `BP` branches
   when S=1 ("positive"), `BM` when S=0 ("minus"). This is the single most common
   source of errors in F8 code.

---

## Instruction set structure

Every instruction is exactly 1 byte, except:
- **2-byte instructions**: those with an 8-bit immediate or 8-bit displacement
- **3-byte instructions**: JMP (0x29), PI (0x28), DCI (0x2A) — 16-bit address

Register encoding in the low 4 bits (for `LR A,r`, `LR r,A`, `AS`, `ASD`, `XS`, `NS`, `DS`):
```
0x0–0xB  → direct register r0–r11
0xC      → (IS)   — ISAR indirect, no change to ISAR
0xD      → (IS)+  — ISAR indirect, ISAR lower 3 bits += 1 (wraps in window)
0xE      → (IS)-  — ISAR indirect, ISAR lower 3 bits -= 1 (wraps in window)
0xF      → illegal / dedicated (used by specific LR variants)
```

---

## Complete opcode table

Source: F8 Guide to Programming (1977) + FreeChaF f8.c verification.

```
00  LR A,KU      1  2cy   A ← R12
01  LR A,KL      1  2cy   A ← R13
02  LR A,QU      1  2cy   A ← R14
03  LR A,QL      1  2cy   A ← R15
04  LR KU,A      1  2cy   R12 ← A
05  LR KL,A      1  2cy   R13 ← A
06  LR QU,A      1  2cy   R14 ← A
07  LR QL,A      1  2cy   R15 ← A
08  LR K,P       1  8cy   R12:R13 ← PC1 (save stack)
09  LR P,K       1  8cy   PC1 ← R12:R13 (restore stack)
0A  LR A,IS      1  2cy   A ← ISAR (6-bit → 8-bit, upper 2 bits = 0)
0B  LR IS,A      1  2cy   ISAR ← A (only lower 6 bits used)
0C  PK           1  5cy   PC1 ← PC0+1; PC0 ← R14:R15 (Q)
0D  LR P0,Q      1  8cy   PC0 ← R14:R15
0E  LR Q,DC      1  8cy   R14:R15 ← DC0
0F  LR DC,Q      1  8cy   DC0 ← R14:R15
10  LR DC,H      1  8cy   DC0 ← R10:R11
11  LR H,DC      1  8cy   R10:R11 ← DC0
12  SR 1         1  2cy   A >>= 1; MSB=0; flags: S,Z,O,C
13  SL 1         1  2cy   A <<= 1; LSB=0; flags: S,Z,O,C
14  SR 4         1  2cy   A >>= 4 (upper nibble=0); flags: S,Z,O,C
15  SL 4         1  2cy   A <<= 4 (lower nibble=0); flags: S,Z,O,C
16  LM           1  5cy   A ← mem[DC0]; DC0++
17  ST           1  5cy   mem[DC0] ← A; DC0++
18  COM          1  2cy   A ← A XOR 0xFF; flags: S,Z,O,C
19  LNK          1  2cy   A ← A + carry_flag; flags: S,Z,O,C
                           ** MAME had bug here (0.191-0.204), fixed in commit a4b24c24 **
1A  DI           1  2cy   W.I ← 0 (disable interrupts)
1B  EI           1  2cy   W.I ← 1 (enable interrupts)
1C  POP          1  4cy   PC0 ← PC1 (return from subroutine)
1D  LR W,J       1  2cy   W ← R9 (restore flags from J register)
1E  LR J,W       1  4cy   R9 ← W (save flags — 4cy vs 2cy for restore, asymmetric!)
1F  INC          1  2cy   A ← A + 1; flags: S,Z,O,C
20  LI n         2  5cy   A ← imm8
21  NI n         2  5cy   A ← A AND imm8; flags: S,Z,O,C
22  OI n         2  5cy   A ← A OR  imm8; flags: S,Z,O,C
23  XI n         2  5cy   A ← A XOR imm8; flags: S,Z,O,C
24  AI n         2  5cy   A ← A +   imm8; flags: S,Z,O,C
25  CI n         2  5cy   flags set by (imm8 - A), result discarded; S,Z,O,C
26  IN p         2  8cy   A ← port[p] (p=0..255, long form); flags: S,Z,O,C
27  OUT p        2  8cy   port[p] ← A (p=0..255, long form)
28  PI addr      3  13cy  PC1 ← PC0+3; PC0 ← addr (call absolute)
29  JMP addr     3  11cy  PC0 ← addr; A ← addr_hi (SIDE EFFECT: high byte→A)
2A  DCI addr     3  12cy  DC0 ← addr (load data counter immediate)
2B  NOP          1  2cy   No operation
2C  XDC          1  4cy   swap DC0 ↔ DC1
2D–2F  (illegal)  1  2cy  treat as NOP
30  DS r0        1  3cy   R0 ← R0 - 1; flags: S,Z,O,C
31  DS r1        ... (continues for r0..r11)
3B  DS r11
3C  DS (IS)      1  3cy   ISAR-indirect decrement
3D  DS (IS)+     1  3cy   ISAR-indirect decrement; ISAR.lo++
3E  DS (IS)-     1  3cy   ISAR-indirect decrement; ISAR.lo--
3F  (illegal)    1  2cy   NOP
40  LR A,r0      1  2cy   A ← R0
...
4B  LR A,r11
4C  LR A,(IS)    1  2cy   A ← scratchpad[ISAR]
4D  LR A,(IS)+   1  2cy   A ← scratchpad[ISAR]; ISAR.lo++
4E  LR A,(IS)-   1  2cy   A ← scratchpad[ISAR]; ISAR.lo--
4F  (illegal)    1  2cy   NOP
50  LR r0,A      1  2cy   R0 ← A
...
5B  LR r11,A
5C  LR (IS),A    1  2cy   scratchpad[ISAR] ← A
5D  LR (IS)+,A   1  2cy   scratchpad[ISAR] ← A; ISAR.lo++
5E  LR (IS)-,A   1  2cy   scratchpad[ISAR] ← A; ISAR.lo--
5F  (illegal)    1  2cy   NOP
60  LISU 0       1  2cy   ISAR[5:3] ← 0
...
67  LISU 7
68  LISL 0       1  2cy   ISAR[2:0] ← 0
...
6F  LISL 7
70  LIS 0        1  2cy   A ← 0  (4-bit immediate)
...
7F  LIS 15
80  BT 0,d       2  6/7cy Branch if (W AND 0) ≠ 0 → NEVER BRANCHES (use for padding)
81  BP d         2  6/7cy Branch if (W AND 1) ≠ 0 → Branch if S=1 (positive)
82  BC d         2  6/7cy Branch if (W AND 2) ≠ 0 → Branch if C=1
83  BT 3,d       2  6/7cy Branch if S=1 OR C=1
84  BZ d         2  6/7cy Branch if (W AND 4) ≠ 0 → Branch if Z=1
85  BT 5,d       2  6/7cy Branch if S=1 OR Z=1
86  BT 6,d       2  6/7cy Branch if C=1 OR Z=1
87  BT 7,d       2  6/7cy Branch if S=1 OR C=1 OR Z=1
88  AM           1  5cy   A ← A + mem[DC0]; DC0++; flags: S,Z,O,C
89  AMD          1  5cy   BCD add: A ← A +BCD mem[DC0]; DC0++
8A  NM           1  5cy   A ← A AND mem[DC0]; DC0++; flags: S,Z,O,C
8B  OM           1  5cy   A ← A OR  mem[DC0]; DC0++; flags: S,Z,O,C
8C  XM           1  5cy   A ← A XOR mem[DC0]; DC0++; flags: S,Z,O,C
8D  CM           1  5cy   flags ← mem[DC0] - A; DC0++; result discarded
8E  ADC          1  5cy   DC0 ← DC0 + (signed A); no flags
8F  BR7 d        2  6/7cy Branch if ISAR[2:0] ≠ 7 (loop helper for ISAR windows)
90  BR d         2  7cy   Unconditional relative branch
91  BM d         2  6/7cy Branch if (W AND 1) = 0 → Branch if S=0 (minus)
92  BNC d        2  6/7cy Branch if C=0
93  BF 3,d       2  6/7cy Branch if S=0 AND C=0
94  BNZ d        2  6/7cy Branch if Z=0
95  BF 5,d       2  6/7cy Branch if S=0 AND Z=0
96  BF 6,d       2  6/7cy Branch if C=0 AND Z=0
97  BF 7,d       2  6/7cy Branch if S=0 AND C=0 AND Z=0
98  BNO d        2  6/7cy Branch if O=0 (no overflow)
99–9F BF n,d    2  6/7cy  Various combinations (see BT/BF mask table)
A0  INS 0        1  4cy   A ← port[0] (short form, p=0..15); flags: S,Z,O,C
...
AF  INS 15
B0  OUTS 0       1  4cy   port[0] ← A (short form)
...
BF  OUTS 15
C0  AS r0        1  2cy   A ← A + R0; flags: S,Z,O,C
...
CB  AS r11
CC  AS (IS)      1  2cy
CD  AS (IS)+     1  2cy
CE  AS (IS)-     1  2cy
CF  (illegal)    1  2cy   NOP
D0  ASD r0       1  4cy   BCD add: A ← A +BCD R0; flags: S,Z,O,C
...
DB  ASD r11
DC  ASD (IS)     1  4cy
DD  ASD (IS)+    1  4cy
DE  ASD (IS)-    1  4cy
DF  (illegal)    1  4cy   NOP
E0  XS r0        1  2cy   A ← A XOR R0; flags: S,Z,O,C
...
EB  XS r11
EC  XS (IS)      1  2cy
ED  XS (IS)+     1  2cy
EE  XS (IS)-     1  2cy
EF  (illegal)    1  2cy   NOP
F0  NS r0        1  2cy   A ← A AND R0; flags: S,Z,O,C
...
FB  NS r11
FC  NS (IS)      1  2cy
FD  NS (IS)+     1  2cy
FE  NS (IS)-     1  2cy
FF  (illegal)    1  2cy   NOP
```

Branch displacement timing: 6 cycles if branch NOT taken, 7 cycles if taken.
Branch displacement is **signed 8-bit**, relative to PC after fetching 2-byte instruction
(i.e., displacement of -2 = branch to self = infinite loop).

**BT/BF mask bits in W register:**
```
bit 0 = S (sign:   1=positive, 0=negative — INVERTED vs all other CPUs)
bit 1 = C (carry:  1=carry)
bit 2 = Z (zero:   1=zero)
bit 3 = O (overflow: 1=overflow)
```
BT 0 (opcode 0x80) never branches (mask=0, so W AND 0 = 0 ≠ 0 is always false).
BF 0 = BR (opcode 0x90) always branches (W AND 0 = 0 = 0 always true).

---

## Assembler architecture

The F8 instruction set does NOT fit the column-based table format used by Z80/6800.
It requires a **custom `parseOpcode` function from scratch**. No `set` table is used.

### Register syntax (accept both Fairchild original and DASM aliases)

```
Scratchpad registers (direct):
  r0..r11  OR  0..11      (direct register number)
  r12..r15 = KU, KL, QU, QL (named aliases, accessible via LR A,xx / LR xx,A)

ISAR indirect modes:
  (IS)  or  S    → encoding nibble 0xC
  (IS)+ or  I    → encoding nibble 0xD (post-increment)
  (IS)- or  D    → encoding nibble 0xE (post-decrement)

Named pairs (used in specific LR forms only):
  K  = R12:R13  (maps to PC1 stack register)
  Q  = R14:R15  (maps to PC0/DC0 address pair)
  H  = R10:R11  (maps to DC0)
  J  = R9       (flag save register)
  IS = ISAR register itself
  W  = status register
  P  = PC1 (stack, used in LR K,P / LR P,K)
  P0 = PC0 (used in LR P0,Q)
  DC = DC0 (used in LR DC,Q / LR Q,DC / LR DC,H / LR H,DC / DCI)

I/O ports (for IN/OUT/INS/OUTS):
  Any expression 0..255 → port number
  INS/OUTS accept only 0..15 (encoded in opcode); IN/OUT accept 0..255
```

### parseOpcode structure

```js
export function parseOpcode(s, vars, Parser) {
  const mn = s.mn.toUpperCase();
  const params = s.params || [];

  // Helper: parse register — returns 0..14 (0-11=direct, 12=(IS), 13=(IS)+, 14=(IS)-)
  // Throws on unrecognized name
  function parseReg(p) { ... }

  // Helper: parse 4-bit literal (for LIS)
  function parse4(p) { ... }

  // Helper: parse 3-bit literal (for LISU, LISL)
  function parse3(p) { ... }

  // Helper: parse 8-bit immediate
  function parseImm8(p) { return () => Parser.evaluate(p.replace(/^#/,''), vars) & 0xFF; }

  // Helper: parse 16-bit address
  function parseAddr16(p) { ... returns [hi_fn, lo_fn] }

  // Helper: relative displacement
  function parseRel(p) {
    return () => { const n = Parser.evaluate(p,vars) - vars._PC - 2; return n & 0xFF; };
  }

  switch (mn) {
    // ── No-operand instructions ───────────────────────────────────────────────
    case "NOP":  return bytes(0x2B);
    case "COM":  return bytes(0x18);
    case "LNK":  return bytes(0x19);
    case "DI":   return bytes(0x1A);
    case "EI":   return bytes(0x1B);
    case "POP":  return bytes(0x1C);
    case "INC":  return bytes(0x1F);
    case "LM":   return bytes(0x16);
    case "ST":   return bytes(0x17);
    case "AM":   return bytes(0x88);
    case "AMD":  return bytes(0x89);
    case "NM":   return bytes(0x8A);
    case "OM":   return bytes(0x8B);
    case "XM":   return bytes(0x8C);
    case "CM":   return bytes(0x8D);
    case "ADC":  return bytes(0x8E);
    case "XDC":  return bytes(0x2C);
    case "PK":   return bytes(0x0C);
    case "SR":   // SR 1 = 0x12, SR 4 = 0x14
      const n = Parser.evaluate(params[0], vars);
      if (n === 1) return bytes(0x12);
      if (n === 4) return bytes(0x14);
      throw "SR: operand must be 1 or 4";
    case "SL":
      const n = Parser.evaluate(params[0], vars);
      if (n === 1) return bytes(0x13);
      if (n === 4) return bytes(0x15);
      throw "SL: operand must be 1 or 4";

    // ── LR — Load Register (many specific forms) ─────────────────────────────
    case "LR": return parseLR(params, vars, Parser);

    // ── Immediate instructions ────────────────────────────────────────────────
    case "LI":  return bytes(0x20, parseImm8(params[0]));
    case "NI":  return bytes(0x21, parseImm8(params[0]));
    case "OI":  return bytes(0x22, parseImm8(params[0]));
    case "XI":  return bytes(0x23, parseImm8(params[0]));
    case "AI":  return bytes(0x24, parseImm8(params[0]));
    case "CI":  return bytes(0x25, parseImm8(params[0]));

    // ── LIS — Load Immediate Short (4-bit) ───────────────────────────────────
    case "LIS": return bytes(0x70 | parse4(params[0]));

    // ── LISU / LISL ──────────────────────────────────────────────────────────
    case "LISU": return bytes(0x60 | parse3(params[0]));
    case "LISL": return bytes(0x68 | parse3(params[0]));

    // ── I/O ───────────────────────────────────────────────────────────────────
    case "IN":  return bytes(0x26, parseImm8(params[0]));  // 0..255
    case "OUT": return bytes(0x27, parseImm8(params[0]));
    case "INS": {                                           // 0..15 encoded in opcode
      const p = Parser.evaluate(params[0], vars) & 0xFF;
      if (p > 15) throw "INS: port must be 0..15";
      return bytes(0xA0 | p);
    }
    case "OUTS": {
      const p = Parser.evaluate(params[0], vars) & 0xFF;
      if (p > 15) throw "OUTS: port must be 0..15";
      return bytes(0xB0 | p);
    }

    // ── Absolute address instructions ─────────────────────────────────────────
    case "PI":  return bytes3(0x28, params[0], vars, Parser);  // [0x28, hi, lo]
    case "JMP": return bytes3(0x29, params[0], vars, Parser);
    case "DCI": return bytes3(0x2A, params[0], vars, Parser);

    // ── Register-group instructions (r0..r11 + ISAR modes) ────────────────────
    case "DS":  return regGroup(0x30, params[0], vars, Parser);
    case "LRA": return regGroup(0x40, params[0], vars, Parser);  // internal: LR A,r
    case "LAR": return regGroup(0x50, params[0], vars, Parser);  // internal: LR r,A
    case "AS":  return regGroup(0xC0, params[0], vars, Parser);
    case "ASD": return regGroup(0xD0, params[0], vars, Parser);
    case "XS":  return regGroup(0xE0, params[0], vars, Parser);
    case "NS":  return regGroup(0xF0, params[0], vars, Parser);

    // ── Branch instructions ────────────────────────────────────────────────────
    case "BR":  return bytes(0x90, parseRel(params[0]));
    case "BP":  return bytes(0x81, parseRel(params[0]));
    case "BC":  return bytes(0x82, parseRel(params[0]));
    case "BZ":  return bytes(0x84, parseRel(params[0]));
    case "BM":  return bytes(0x91, parseRel(params[0]));
    case "BNC": return bytes(0x92, parseRel(params[0]));
    case "BNZ": return bytes(0x94, parseRel(params[0]));
    case "BNO": return bytes(0x98, parseRel(params[0]));
    case "BR7": return bytes(0x8F, parseRel(params[0]));
    case "BT":  {  // BT mask,disp
      const mask = Parser.evaluate(params[0], vars) & 0x7;
      return bytes(0x80 | mask, parseRel(params[1]));
    }
    case "BF":  {  // BF mask,disp
      const mask = Parser.evaluate(params[0], vars) & 0xF;
      return bytes(0x90 | mask, parseRel(params[1]));
    }

    default: return null;
  }
}
```

### parseLR helper — full LR encoding table

`LR` is the most complex instruction with 20+ distinct forms. Dispatch by operand pair:

```js
function parseLR(params, vars, Parser) {
  const dst = params[0].toUpperCase().replace(/\s/g,'');
  const src = params[1].toUpperCase().replace(/\s/g,'');

  // Named-to-named forms (fixed opcodes)
  const namedForms = {
    'A,KU':  0x00,  'A,KL':  0x01,  'A,QU':  0x02,  'A,QL':  0x03,
    'KU,A':  0x04,  'KL,A':  0x05,  'QU,A':  0x06,  'QL,A':  0x07,
    'K,P':   0x08,  'P,K':   0x09,  'A,IS':  0x0A,  'IS,A':  0x0B,
    'P0,Q':  0x0D,  'Q,DC':  0x0E,  'DC,Q':  0x0F,
    'DC,H':  0x10,  'H,DC':  0x11,
    'W,J':   0x1D,  'J,W':   0x1E,
  };
  const key = `${dst},${src}`;
  if (namedForms[key] !== undefined) return bytes(namedForms[key]);

  // LR A,rN — register to accumulator
  if (dst === 'A') {
    const r = parseReg(src);  // 0..14
    return bytes(0x40 | r);
  }

  // LR rN,A — accumulator to register
  if (src === 'A') {
    const r = parseReg(dst);
    return bytes(0x50 | r);
  }

  throw `LR: unrecognized operand pair: ${dst},${src}`;
}
```

### regGroup helper

```js
function regGroup(base, operand, vars, Parser) {
  const r = parseReg(operand);  // 0..14
  // 0..11 = direct, 12=(IS), 13=(IS)+, 14=(IS)-
  return bytes(base | r);
}
```

The ISAR modes (12, 13, 14) map to opcodes base+0xC, base+0xD, base+0xE — exactly right.

---

## DS directive conflict

**CRITICAL:** In DASM, `DS` means both the F8 instruction (Decrement Scratchpad) and
the data-space directive. In ASM80, `DS` is not a standard directive — but be aware
that if any conflict arises, the instruction must take precedence in `.cpu f8` mode.
Document in user-facing error messages: use `.BYTE 0` or `.DS` (with a dot prefix)
for data space if needed.

---

## docs/cpu/f8-code.json

```json
["LR","LI","LIS","NI","OI","XI","AI","CI","IN","INS","OUT","OUTS","PI","JMP","DCI",
 "DS","AS","ASD","XS","NS","LM","ST","AM","AMD","NM","OM","XM","CM","ADC","COM",
 "LNK","DI","EI","POP","INC","NOP","XDC","PK","SR","SL","LISU","LISL",
 "BR","BP","BC","BZ","BM","BNC","BNZ","BNO","BT","BF","BR7"]
```

---

## DASM compatibility note

Existing Channel F projects assembled with DASM use `processor f8` syntax. ASM80
should accept the same mnemonic names and operand syntax. Key DASM conventions to
support:
- `(IS)`, `(IS)+`, `(IS)-` for ISAR modes (also accept `S`, `I`, `D` aliases)
- `R0`..`R11` for scratchpad registers (also accept bare `0`..`11`)
- `$` prefix for hex literals (standard ASM80)

DASM quirk NOT to replicate: DASM never optimizes `LI 0` → `LIS 0`. ASM80 may
optionally warn when `LI n` where n fits in 4 bits (0..15) could use `LIS`.

---

## Registration

```js
import { F8 } from "./cpu/f8.js";
// in CPU registry:
"f8": F8,
"3850": F8,   // alias for 3850 chip family
```

---

## Tests to write (`test/f8.js`)

```
✓ NOP                    → [0x2B]
✓ LI 0x42                → [0x20, 0x42]
✓ LIS 5                  → [0x75]
✓ LIS 15                 → [0x7F]
✓ LIS 16                 → error (out of range)
✓ LISU 3                 → [0x63]
✓ LISL 7                 → [0x6F]
✓ AS r0                  → [0xC0]
✓ AS r11                 → [0xCB]
✓ AS (IS)                → [0xCC]
✓ AS (IS)+               → [0xCD]
✓ AS (IS)-               → [0xCE]
✓ DS r5                  → [0x35]
✓ LR A,r7                → [0x47]
✓ LR r3,A                → [0x53]
✓ LR A,(IS)+             → [0x4D]
✓ LR (IS)-,A             → [0x5E]
✓ LR A,KU                → [0x00]
✓ LR K,P                 → [0x08]
✓ LR DC,H                → [0x10]
✓ LR W,J                 → [0x1D]
✓ LR J,W                 → [0x1E]
✓ LR IS,A                → [0x0B]
✓ SR 1                   → [0x12]
✓ SR 4                   → [0x14]
✓ SL 1                   → [0x13]
✓ INS 0                  → [0xA0]
✓ INS 15                 → [0xAF]
✓ OUTS 5                 → [0xB5]
✓ IN 0x80                → [0x26, 0x80]
✓ OUT 0xFF               → [0x27, 0xFF]
✓ JMP $1234              → [0x29, 0x12, 0x34]
✓ PI $0800               → [0x28, 0x08, 0x00]
✓ DCI $4000              → [0x2A, 0x40, 0x00]
✓ BR *-1  (infinite loop) → [0x90, 0xFE]  (disp = -2)
✓ BP label               → [0x81, computed_disp]
✓ BM label               → [0x91, computed_disp]
✓ BT 3,label             → [0x83, computed_disp]
✓ BF 6,label             → [0x96, computed_disp]
✓ BR7 loop               → [0x8F, computed_disp]
✓ XDC                    → [0x2C]
✓ PK                     → [0x0C]
✓ LNK                    → [0x19]
✓ DI                     → [0x1A]
✓ EI                     → [0x1B]
✓ POP                    → [0x1C]
✓ ASD r0                 → [0xD0]
✓ XS (IS)                → [0xEC]
✓ NS r11                 → [0xFB]
```

---

## Reference implementations to consult

- **FreeChaF f8.c** — most accurate F8 emulator, best reference for flag behavior:
  https://github.com/libretro/FreeChaF/blob/master/src/f8.c
- **DASM F8 backend** — reference assembler syntax:
  https://github.com/dasm-assembler/dasm/blob/master/src/f8.c
- **Tobias V. Langhoff opcode table** — clean HTML reference:
  https://tobiasvl.github.io/optable/f8/
