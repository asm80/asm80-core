// Signetics 2650 / Mostek 2650A CPU encoder for asm80-core
//
// Syntax (verified against parseLine.js tokenizer):
//   "LODI,R1 $42"      → opcode="LODI",  params=["", "R1 $42"]
//   "LODA,R1 $800,R2+" → opcode="LODA",  params=["", "R1 $800", "R2+"]
//   "BCTR,EQ *+5"      → opcode="BCTR",  params=["", "EQ *+5"]
//   "ADDZ,R1"          → opcode="ADDZ",  params=["", "R1"]
//   "CPSU $20"         → opcode="CPSU",  params=["$20"]
//   "NOP"              → opcode="NOP",   params=[]
//
// Indirect addressing uses @ prefix (Signetics assembler convention):
//   LODR,R0 @$0110   → indirect relative
//   LODA,R0 @$0800   → indirect absolute
//
// Current address uses * in expressions (like Z80 $):
//   BCTR,UN *+10     → branch to _PC + 10

// ─── Parser output helpers ────────────────────────────────────────────────────

// First word of params[1] — the register or condition code suffix after the comma
function getSuffix(s) {
  return s.params[1]?.split(/\s+/)[0];
}

// Second word(s) of params[1] — the operand expression
function getOperand(s) {
  const parts = s.params[1]?.split(/\s+/);
  if (!parts || parts.length < 2) return undefined;
  return parts.slice(1).join(" ");
}

// params[2] — optional index register ("R2+", "R2-", "R2")
function getIndex(s) {
  return s.params[2];
}

// ─── Register / condition code parsing ───────────────────────────────────────

const REG_MAP = { R0: 0, R1: 1, R2: 2, R3: 3 };
const CC_MAP  = { EQ: 0, GT: 1, LT: 2, UN: 3, "0": 0, "1": 1, "2": 2, "3": 3 };

function parseReg(s) {
  if (!s) return 0;
  return REG_MAP[s.toUpperCase()] ?? 0;
}

function parseCC(s) {
  if (!s) return 3; // default UN
  return CC_MAP[s.toUpperCase()] ?? 3;
}

// ─── Current address: * → $ ──────────────────────────────────────────────────
// Replace standalone * (current address) with $ (ASM80 _PC symbol).
// Guards against multiplication: "2*COUNT" has * preceded by alphanumeric → not replaced.

function resolvePC(expr) {
  return expr.replace(/(?<![a-zA-Z0-9_$])\*(?![a-zA-Z0-9_])/g, "$");
}

// ─── Indirect: @ prefix ──────────────────────────────────────────────────────

function parseIndirect(operand) {
  const indirect = operand.startsWith("@");
  const expr = indirect ? operand.slice(1) : operand;
  return { indirect, expr };
}

// ─── Immediate helper ─────────────────────────────────────────────────────────

function imm8(expr, _vars, Parser) {
  return (v) => Parser.evaluate(expr, v);
}

// ─── Relative mode encoder ────────────────────────────────────────────────────
// Offset is a lambda (deferred to pass2) — same pattern as Z80 JR.
// vars._PC = address of the opcode byte; IAR after fetching both bytes = _PC + 2.

function encodeR(s, opcode, operand, _vars, Parser) {
  const { indirect, expr: rawExpr } = parseIndirect(operand);
  const expr = resolvePC(rawExpr);
  s.isRelJump = true;
  s.lens = [
    opcode,
    (v) => {
      const target = Parser.evaluate(expr, v);
      const iar = v._PC + 2;
      const offset = target - iar;
      if (offset < -64 || offset > 63)
        throw `S2650: relative offset out of range: ${offset}`;
      return (indirect ? 0x80 : 0) | (offset & 0x7F);
    },
  ];
  s.bytes = 2;
  return s;
}

// Zero-page relative: target is page-0 address (bits 12:0 only)
function encodeR_zp(s, opcode, operand, _vars, Parser) {
  const { indirect, expr: rawExpr } = parseIndirect(operand);
  const expr = resolvePC(rawExpr);
  s.lens = [
    opcode,
    (v) => {
      const target = Parser.evaluate(expr, v) & 0x1FFF;
      const iar = (v._PC + 2) & 0x1FFF;
      const offset = target - iar;
      if (offset < -64 || offset > 63)
        throw `S2650: zero-page relative offset out of range`;
      return (indirect ? 0x80 : 0) | (offset & 0x7F);
    },
  ];
  s.bytes = 2;
  return s;
}

// ─── Absolute mode encoder ────────────────────────────────────────────────────
// isBranch=true  → full 15-bit address (bits 14:0) used in hr
// isBranch=false → only bits 12:0 used in hr (page bits from current PC, not operand)

function encodeA(s, opcode, operand, indexParam, _vars, Parser, isBranch) {
  const { indirect, expr } = parseIndirect(operand);

  let indexMode = 0; // 0=none, 1=auto-inc, 2=auto-dec, 3=indexed
  if (indexParam) {
    const m = indexParam.trim().match(/^[Rr]([0-3])\s*([+-]?)$/);
    if (m) {
      indexMode = m[2] === "+" ? 1 : m[2] === "-" ? 2 : 3;
    }
  }

  s.lens = [
    opcode,
    (v) => {
      const addr = Parser.evaluate(expr, v) & 0x7FFF;
      const hrAddr = isBranch
        ? (addr >> 8) & 0x7F  // full 15-bit
        : (addr >> 8) & 0x1F; // 13-bit page-relative
      return (indirect ? 0x80 : 0) | (indexMode << 5) | hrAddr;
    },
    (v) => Parser.evaluate(expr, v) & 0xFF,
  ];
  s.bytes = 3;
  return s;
}

// ─── Main parseOpcode ─────────────────────────────────────────────────────────

function parseOpcode(s, vars, Parser, opts) {
  const base = s.opcode.toUpperCase();
  const r   = parseReg(getSuffix(s));
  const cc  = parseCC(getSuffix(s));
  const op  = getOperand(s);
  const idx = getIndex(s);

  switch (base) {
    // --- Load/Store ---
    case "LODZ": { s.lens = [0x00 | r];                               s.bytes = 1; return s; }
    case "LODI": { s.lens = [0x04 | r, imm8(op, vars, Parser)];      s.bytes = 2; return s; }
    case "LODR": return encodeR(s, 0x08 | r, op, vars, Parser);
    case "LODA": return encodeA(s, 0x0C | r, op, idx, vars, Parser, false);
    case "STRZ": { s.lens = [0xC0 | r];                               s.bytes = 1; return s; } // r=0 → NOP
    case "STRR": return encodeR(s, 0xC8 | r, op, vars, Parser);
    case "STRA": return encodeA(s, 0xCC | r, op, idx, vars, Parser, false);

    // --- Arithmetic ---
    case "ADDZ": { s.lens = [0x80 | r];                               s.bytes = 1; return s; }
    case "ADDI": { s.lens = [0x84 | r, imm8(op, vars, Parser)];      s.bytes = 2; return s; }
    case "ADDR": return encodeR(s, 0x88 | r, op, vars, Parser);
    case "ADDA": return encodeA(s, 0x8C | r, op, idx, vars, Parser, false);
    case "SUBZ": { s.lens = [0xA0 | r];                               s.bytes = 1; return s; }
    case "SUBI": { s.lens = [0xA4 | r, imm8(op, vars, Parser)];      s.bytes = 2; return s; }
    case "SUBR": return encodeR(s, 0xA8 | r, op, vars, Parser);
    case "SUBA": return encodeA(s, 0xAC | r, op, idx, vars, Parser, false);
    case "DAR":  { s.lens = [0x94 | r];                               s.bytes = 1; return s; }

    // --- Logical ---
    case "EORZ": { s.lens = [0x20 | r];                               s.bytes = 1; return s; }
    case "EORI": { s.lens = [0x24 | r, imm8(op, vars, Parser)];      s.bytes = 2; return s; }
    case "EORR": return encodeR(s, 0x28 | r, op, vars, Parser);
    case "EORA": return encodeA(s, 0x2C | r, op, idx, vars, Parser, false);
    case "ANDZ": { s.lens = [0x40 | r];                               s.bytes = 1; return s; } // r=0 → HALT
    case "ANDI": { s.lens = [0x44 | r, imm8(op, vars, Parser)];      s.bytes = 2; return s; }
    case "ANDR": return encodeR(s, 0x48 | r, op, vars, Parser);
    case "ANDA": return encodeA(s, 0x4C | r, op, idx, vars, Parser, false);
    case "IORZ": { s.lens = [0x60 | r];                               s.bytes = 1; return s; }
    case "IORI": { s.lens = [0x64 | r, imm8(op, vars, Parser)];      s.bytes = 2; return s; }
    case "IORR": return encodeR(s, 0x68 | r, op, vars, Parser);
    case "IORA": return encodeA(s, 0x6C | r, op, idx, vars, Parser, false);

    // --- Compare / Test ---
    case "COMZ": { s.lens = [0xE0 | r];                               s.bytes = 1; return s; }
    case "COMI": { s.lens = [0xE4 | r, imm8(op, vars, Parser)];      s.bytes = 2; return s; }
    case "COMR": return encodeR(s, 0xE8 | r, op, vars, Parser);
    case "COMA": return encodeA(s, 0xEC | r, op, idx, vars, Parser, false);
    case "TMI":  { s.lens = [0xF4 | r, imm8(op, vars, Parser)];      s.bytes = 2; return s; }
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
    case "BCTR": return encodeR(s, 0x18 | cc, op, vars, Parser);
    case "BCFR": return encodeR(s, 0x98 | cc, op, vars, Parser); // cc 0–2 only
    case "ZBRR": return encodeR_zp(s, 0x9B, op, vars, Parser);

    // --- Conditional branches (absolute) ---
    case "BCTA": return encodeA(s, 0x1C | cc, op, idx, vars, Parser, true);
    case "BCFA": return encodeA(s, 0x9C | cc, op, idx, vars, Parser, true);
    case "BXA":  return encodeA(s, 0x9F,      op, idx, vars, Parser, true);

    // --- Subroutine calls (relative / absolute) ---
    case "BSTR": return encodeR(s, 0x38 | cc, op, vars, Parser);
    case "BSTA": return encodeA(s, 0x3C | cc, op, idx, vars, Parser, true);
    case "BSFR": return encodeR(s, 0xB8 | cc, op, vars, Parser);
    case "BSFA": return encodeA(s, 0xBC | cc, op, idx, vars, Parser, true);
    case "ZBSR": return encodeR_zp(s, 0xBB, op, vars, Parser);
    case "BSXA": return encodeA(s, 0xBF, op, idx, vars, Parser, true);

    // --- Branch/Call if register non-zero ---
    case "BRNR": return encodeR(s, 0x58 | r, op, vars, Parser);
    case "BRNA": return encodeA(s, 0x5C | r, op, idx, vars, Parser, true);
    case "BSNR": return encodeR(s, 0x78 | r, op, vars, Parser);
    case "BSNA": return encodeA(s, 0x7C | r, op, idx, vars, Parser, true);

    // --- Branch-increment/decrement ---
    case "BIRR": return encodeR(s, 0xD8 | r, op, vars, Parser);
    case "BIRA": return encodeA(s, 0xDC | r, op, idx, vars, Parser, true);
    case "BDRR": return encodeR(s, 0xF8 | r, op, vars, Parser);
    case "BDRA": return encodeA(s, 0xFC | r, op, idx, vars, Parser, true);

    // --- Returns ---
    case "RETC": { s.lens = [0x14 | cc]; s.bytes = 1; return s; }
    case "RETE": { s.lens = [0x34 | cc]; s.bytes = 1; return s; }

    // --- Misc ---
    case "NOP":  { s.lens = [0xC0]; s.bytes = 1; return s; }
    case "HALT": { s.lens = [0x40]; s.bytes = 1; return s; }

    default: return null;
  }
}

export const S2650 = {
  endian: "big",
  cpu: "s2650",
  ext: "s26",
  set: {},
  parseOpcode,
};
