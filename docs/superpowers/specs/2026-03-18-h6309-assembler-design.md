# H6309 Assembler Core — Design Spec

Date: 2026-03-18

## Overview

Add HD6309 CPU support to asm80-core as a new ES6 module `cpu/h6309.js`. The H6309 is Hitachi's enhanced version of the Motorola 6809, adding new registers (E, F, W, V, Q) and ~60 new instructions. The implementation extends M6809 rather than duplicating it.

## Architecture

### File structure

| File | Action |
|------|--------|
| `cpu/h6309.js` | New — ES6 export `H6309`, builds on `M6809.set` |
| `test/asm-6309.js` | New — QUnit unit tests for H6309-specific instructions |
| `asm.js` | Modified — add H6309 to imports and `cpus` array |

### cpu/h6309.js

- Does NOT import `Parser` at module level — `Parser` is received as a parameter in `parseOpcode(s, vars, Parser)` matching M6809 pattern
- Imports `M6809` from `./m6809.js`
- Exports `H6309` object with:
  - `set`: `{ ...M6809.set, ...h6309Extensions }` — M6809 instructions plus H6309 additions/overrides
  - `parseOpcode(s, vars, Parser)`: handles H6309 special cases first, then standard addressing mode logic
  - `endian: true`, `cpu: "h6309"`, `ext: "a09"`

### Register name tables

**parnibble** — used by EXG, TFR, ADDR/ADCR/... — complete 16-entry array (must be declared in full, not extended from M6809's 12-entry version):

```
index: 0    1    2    3    4    5     6    7    8    9    10    11    12   13   14   15
value: "D" "X" "Y" "U" "S" "PC" "W" "V" "A" "B" "CC" "DP" ""   "0"  "E"  "F"
```

Index 13 `"0"` = zero-constant for inter-register ops. Index 12 is unused (`""`).

**tfmnibble** — used only by TFM — receives the first character of a parameter string and indexes into `["D","X","Y","U","S"]` (indices 0–4). Implementation: `["D","X","Y","U","S"].indexOf(par.toUpperCase()[0])`. W, V, E, F are not valid TFM operands. Note: the `[0]` (first-char extraction) happens INSIDE `tfmnibble`, not at the call site.

### Special case: TFM (block transfer)

Syntax: `TFM r0sig,r1sig`. Encoding: `[0x11, modeByte, (tfmnibble(p0)<<4)|tfmnibble(p1)]` (3 bytes).

`tfmnibble` receives the full parameter string — it internally extracts `[0]` (first char).

| Form | sg0 | sg1 | modeByte |
|------|-----|-----|----------|
| `TFM X+,Y+` | `+` | `+` | `0x38` |
| `TFM X-,Y-` | `-` | `-` | `0x39` |
| `TFM X+,Y`  | `+` | undefined | `0x3A` |
| `TFM X,Y+`  | undefined | `+` | `0x3B` |

Parsing: `sg0 = s.params[0][1]` (second char of first param), `sg1 = s.params[1][1]` (second char of second param, `undefined` when param is single character like `"Y"`).

### Special case: ADDR/ADCR/SUBR/SBCR/ANDR/ORR/EORR/CMPR

3-byte: `[opcode>>8, opcode&0xff, (parnibble(p0)<<4)|parnibble(p1)]`. Exactly 2 params required.

### Special case: AIM/EIM/OIM/TIM

`s.aimPar` caches the `#imm` operand (persists across Pass1 re-runs). If not set: strip first param, validate `#` prefix, store in `s.aimPar`. Remaining param = address. Immediate byte inserted before address byte in `s.lens`. Encoding (direct): `[opcode, imm_byte, addr_byte]` (3 bytes).

### Special case: BAND/BOR/BEOR/BIAND/BIOR/BIEOR/LDBT/STBT

Two syntaxes:
- **4-param**: `BAND A,3,2,$10` → register, register-bit, mem-bit, address. First 3 params shifted off.
- **2-param dot notation**: `BAND A.3,$10.2` → split `s.params[0]` on `.` → register + register-bit; split `s.params[1]` on `.` → address + mem-bit; `s.params[0]` replaced with address only.

`s.bandPar = [register, registerBit, memBit]` caches parsed values (like `s.aimPar`).

Encoding: `[opcode>>8, opcode&0xff, (regnum<<6)|(memBit<<3)|registerBit, direct_addr_byte]` (4 bytes).
`regnum` = index in `["CC","A","B"]`.

### W/E/F indexed mode postbytes

H6309 extends indexed addressing with W, E, F. These are handled before the general numeric-offset path.

| Form | Postbyte |
|------|----------|
| `,W` (zero offset) | `0x8F` |
| `W++` (auto-increment) | `0xCF` |
| `--W` (auto-decrement) | `0xEF` |
| `n,W` (any numeric offset — always 16-bit) | `0xAF` |
| `E,R` (E accumulator offset) | `ixreg(R) \| 0x87` |
| `F,R` (F accumulator offset) | `ixreg(R) \| 0x8A` |
| `W,R` (W accumulator offset) | `ixreg(R) \| 0x8E` |

**Important:** W is NOT in `ixreg`/`ixregPC`, so offset-to-W always uses the 16-bit postbyte `0xAF` — the 5-bit and 8-bit offset paths are not taken for W. The `p2[0]=="W"` check to set `0xAF` is applied after the 8-bit test, skipping 8-bit W encoding entirely.

### LDQ 32-bit immediate

`LDQ #value` uses `amode==6` (imm16 slot) but the value is 32-bit. After standard imm16 processing, extra handling applies **only when `amode==6`**:

```javascript
s.lens[s.bytes-1] = "addr32"  // replaces the null slot
s.lens[s.bytes]   = null
s.lens[s.bytes+1] = null
s.bytes += 2                   // total: 5 bytes (0xCD + parserfunc + addr32 + null + null)
```

`"addr32"` is an existing framework marker recognized by pass2/objcode to insert a full 32-bit value. LDQ in direct/indexed/extended modes (0x10DC, 0x10EC, 0x10FC) access a 32-bit value in memory and do NOT use `addr32`.

### New instruction categories

| Category | Examples |
|----------|---------|
| No-param 1-byte (misc) | SEXW |
| No-param 2-byte (D-reg unary) | NEGD, COMD, LSRD, RORD, ASRD, ASLD/LSLD, ROLD, DECD, TSTD, CLRD |
| No-param 2-byte (W-reg unary) | COMW, LSRW, RORW, ROLW, DECW, INCW, TSTW, CLRW |
| No-param 2-byte (E-reg unary) | COME, DECE, INCE, TSTE, CLRE |
| No-param 2-byte (F-reg unary) | COMF, DECF, INCF, TSTF, CLRF |
| No-param 2-byte (push/pull W) | PSHSW, PULSW, PSHUW, PULUW |
| Register-register | ADDR, ADCR, SUBR, SBCR, ANDR, ORR, EORR, CMPR |
| Block transfer | TFM (4 variants) |
| Immediate+memory | AIM, EIM, OIM, TIM |
| Bit manipulation | BAND, BIAND, BOR, BIOR, BEOR, BIEOR, LDBT, STBT |
| W/Q load/store | LDW, STW, LDQ, STQ |
| E/F accumulator load/store | LDE, STE, LDF, STF |
| E/F arithmetic | ADDE, ADDF, SUBE, SUBF, CMPE, CMPF |
| W arithmetic | ADDW, SUBW, CMPW, SBCD, ANDD, BITD, EORD, ADCD, ORD |
| Divide/multiply | DIVD, DIVQ, MULD |
| MD register | LDMD, BITMD |

## Testing strategy

Tests in `test/asm-6309.js` follow `test/asm-6809.js` style: direct `H6309.parseOpcode(s, vars, Parser)` calls, asserting `s.bytes` and `s.lens[]` values.

Required test coverage:

| Test | Expected |
|------|----------|
| Namespace: H6309 defined | notEqual null |
| Namespace: parseOpcode is function | typeof === "function" |
| SEXW no-param | bytes=1, lens=[0x14] |
| NEGD no-param 2-byte | bytes=2, lens=[0x10,0x40] |
| CLRE E-reg unary | bytes=2, lens=[0x11,0x4F] |
| CLRF F-reg unary | bytes=2, lens=[0x11,0x5F] |
| CLRW W-reg unary | bytes=2, lens=[0x10,0x5F] |
| PSHSW push W | bytes=2, lens=[0x10,0x38] |
| EXG W,D | bytes=2, lens=[0x1E, (6<<4)\|0] = [0x1E,0x60] |
| TFR E,A | bytes=2, lens=[0x1F, (14<<4)\|8] = [0x1F,0xE8] |
| ADDR D,X | bytes=3, lens=[0x10,0x30,(0<<4)\|1]==[0x10,0x30,0x01] |
| ADDR wrong param count | throws |
| TFM X+,Y+ | bytes=3, lens[0]=0x11, lens[1]=0x38 |
| TFM X-,Y- | lens[1]=0x39 |
| TFM X+,Y | lens[1]=0x3A |
| TFM X,Y+ | lens[1]=0x3B |
| AIM #$FF,<$10 | bytes=3 |
| BAND A,3,2,$10 (4-param) | bytes=4, verify bitfield byte |
| BAND A.3,$10.2 (dot notation) | bytes=4, same result as above |
| LDBT A.0,$20.1 | bytes=4 |
| LDE #$42 | bytes=3, lens[0]=0x11, lens[1]=0x86 |
| LDF <$10 | bytes=3 |
| LDW #$1234 | bytes=4 |
| STW <$10 | bytes=3 |
| ADDW #$0010 | bytes=4 |
| DIVD <$10 | bytes=3 |
| LDMD #$01 | bytes=3 |
| LDW ,W | bytes=3, lens=[0x10,0xA6,0x8F] |
| LDA E,X | bytes=2, postbyte=0x87 |
| LDA F,X | bytes=2, postbyte=0x8A |

## Implementation notes

- `STQ` appears twice in reference — use only `[-1,0x10DD,0x10ED,0x10FD,-1,-1,-1,-1]`
- `CMPW` appears twice — keep only one: `[-1,0x1091,0x10A1,0x10B1,-1,-1,0x1081,-1]`
- Do not include commented-out instructions (NEGW, ASRW, ASLW/LSLW)
- `s.aimPar` and `s.bandPar` must be checked before processing for Pass1 repeatability

## Out of scope

- Native mode cycle count differences
- FIRQ / MD register semantics
- `docs/cpu/h6309-code.json` content
