// Sharp SM83 (LR35902) CPU encoder for asm80-core
// Used in Nintendo Game Boy (DMG) and Game Boy Color.
//
// Standalone encoder — does NOT extend Z80. Binary encoding is incompatible.
// Syntax follows RGBDS conventions (community-standard Game Boy assembler).
//
// Params arrive pre-split by comma and trimmed, e.g.:
//   LD A, B       → opcode="LD",  params=["A", "B"]
//   LD (HL+), A   → opcode="LD",  params=["(HL+)", "A"]
//   LD HL, SP+4   → opcode="LD",  params=["HL", "SP+4"]
//   BIT 3, B      → opcode="BIT", params=["3", "B"]

// ─── Register encoding tables ─────────────────────────────────────────────────

const R8 = { B: 0, C: 1, D: 2, E: 3, H: 4, L: 5, "(HL)": 6, A: 7 };

// 16-bit pairs for LD rr,nn / INC rr / DEC rr / ADD HL,rr
const R16 = { BC: 0, DE: 1, HL: 2, SP: 3 };

// Stack pairs for PUSH/POP (AF instead of SP)
const R16STK = { BC: 0, DE: 1, HL: 2, AF: 3 };

// Condition codes (only 4 — no PO/PE/P/M from Z80)
const CC = { NZ: 0, Z: 1, NC: 2, C: 3 };

const R8_NAMES  = Object.keys(R8);
const R16_NAMES = Object.keys(R16);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function r8(name) {
  const n = R8[name.toUpperCase().trim()];
  if (n === undefined) throw new Error(`SM83: unknown 8-bit register: ${name}`);
  return n;
}

function r16(name) {
  const n = R16[name.toUpperCase().trim()];
  if (n === undefined) throw new Error(`SM83: unknown 16-bit register: ${name}`);
  return n;
}

function r16stk(name) {
  const n = R16STK[name.toUpperCase().trim()];
  if (n === undefined) throw new Error(`SM83: unknown stack register: ${name}`);
  return n;
}

function cc(name) {
  const n = CC[name.toUpperCase().trim()];
  if (n === undefined) throw new Error(`SM83: unknown condition code: ${name} (SM83 supports only NZ/Z/NC/C)`);
  return n;
}

// Convert value to signed 8-bit byte (two's complement, result 0–255)
function toSigned8(n) {
  if (n < -128 || n > 127) throw new Error(`SM83: signed 8-bit value out of range: ${n}`);
  return n < 0 ? 256 + n : n;
}

function assertRst(n) {
  if (![0, 8, 16, 24, 32, 40, 48, 56].includes(n)) {
    throw new Error(`SM83: RST target must be 0,8,16,24,32,40,48,56 — got ${n}`);
  }
}

// ─── ALU mnemonic tables ──────────────────────────────────────────────────────

const ALU_REG_BASE  = { ADD: 0x80, ADC: 0x88, SUB: 0x90, SBC: 0x98, AND: 0xA0, XOR: 0xA8, OR: 0xB0, CP: 0xB8 };
const ALU_IMM_OPCODE = { ADD: 0xC6, ADC: 0xCE, SUB: 0xD6, SBC: 0xDE, AND: 0xE6, XOR: 0xEE, OR: 0xF6, CP: 0xFE };

const CB_OPS = { RLC: 0x00, RRC: 0x08, RL: 0x10, RR: 0x18, SLA: 0x20, SRA: 0x28, SWAP: 0x30, SRL: 0x38 };

// ─── parseLd ──────────────────────────────────────────────────────────────────

function parseLd(s, vars, Parser) {
  const dst = s.params[0].toUpperCase().trim();
  const src = s.params[1].toUpperCase().trim();

  // LD (HL+/-), A  /  LD A, (HL+/-)
  if (dst === "(HL+)" && src === "A") { s.bytes = 1; s.lens = [0x22]; return s; }
  if (dst === "(HL-)" && src === "A") { s.bytes = 1; s.lens = [0x32]; return s; }
  if (dst === "A" && src === "(HL+)") { s.bytes = 1; s.lens = [0x2A]; return s; }
  if (dst === "A" && src === "(HL-)") { s.bytes = 1; s.lens = [0x3A]; return s; }

  // LD (BC/DE), A  /  LD A, (BC/DE)
  if (dst === "(BC)" && src === "A") { s.bytes = 1; s.lens = [0x02]; return s; }
  if (dst === "(DE)" && src === "A") { s.bytes = 1; s.lens = [0x12]; return s; }
  if (dst === "A" && src === "(BC)") { s.bytes = 1; s.lens = [0x0A]; return s; }
  if (dst === "A" && src === "(DE)") { s.bytes = 1; s.lens = [0x1A]; return s; }

  // LD SP, HL
  if (dst === "SP" && src === "HL") { s.bytes = 1; s.lens = [0xF9]; return s; }

  // LD HL, SP+n  /  LD HL, SP-n
  if (dst === "HL" && src.startsWith("SP+")) {
    const expr = src.slice(3).trim();
    s.bytes = 2;
    s.lens = [0xF8, (vars2) => toSigned8(Parser.evaluate(expr, vars2))];
    return s;
  }
  if (dst === "HL" && src.startsWith("SP-")) {
    const expr = src.slice(3).trim();
    s.bytes = 2;
    s.lens = [0xF8, (vars2) => toSigned8(-Parser.evaluate(expr, vars2))];
    return s;
  }

  // LD rr, nn  (16-bit immediate)
  if (R16_NAMES.includes(dst)) {
    s.bytes = 3;
    s.lens = [
      0x01 | (r16(dst) << 4),
      (vars2) => Parser.evaluate(s.params[1], vars2) & 0xFF,
      (vars2) => (Parser.evaluate(s.params[1], vars2) >> 8) & 0xFF,
    ];
    return s;
  }

  // LD (nn), SP
  if (dst.startsWith("(") && src === "SP") {
    s.bytes = 3;
    s.lens = [
      0x08,
      (vars2) => Parser.evaluate(s.params[0].slice(1, -1), vars2) & 0xFF,
      (vars2) => (Parser.evaluate(s.params[0].slice(1, -1), vars2) >> 8) & 0xFF,
    ];
    return s;
  }

  // LD (nn), A
  if (dst.startsWith("(") && src === "A") {
    s.bytes = 3;
    s.lens = [
      0xEA,
      (vars2) => Parser.evaluate(s.params[0].slice(1, -1), vars2) & 0xFF,
      (vars2) => (Parser.evaluate(s.params[0].slice(1, -1), vars2) >> 8) & 0xFF,
    ];
    return s;
  }

  // LD A, (nn)  — only if src is NOT a register (e.g. not (HL), (BC), (DE))
  if (dst === "A" && src.startsWith("(") && !R8_NAMES.includes(src)) {
    s.bytes = 3;
    s.lens = [
      0xFA,
      (vars2) => Parser.evaluate(s.params[1].slice(1, -1), vars2) & 0xFF,
      (vars2) => (Parser.evaluate(s.params[1].slice(1, -1), vars2) >> 8) & 0xFF,
    ];
    return s;
  }

  // LD r, r'  /  LD r, (HL)  — both covered by R8 table ((HL) = entry 6)
  if (R8_NAMES.includes(dst) && R8_NAMES.includes(src)) {
    // HALT falls here: dst=(HL) enc=6, src=(HL) enc=6 → 0x76
    s.bytes = 1;
    s.lens = [0x40 | (r8(dst) << 3) | r8(src)];
    return s;
  }

  // LD r, n  (8-bit immediate)
  if (R8_NAMES.includes(dst)) {
    s.bytes = 2;
    s.lens = [
      0x06 | (r8(dst) << 3),
      (vars2) => Parser.evaluate(s.params[1], vars2) & 0xFF,
    ];
    return s;
  }

  throw new Error(`SM83: unrecognized LD form: LD ${s.params[0]}, ${s.params[1]}`);
}

// ─── parseLdh ─────────────────────────────────────────────────────────────────

function parseLdh(s, vars, Parser) {
  const dst = s.params[0].toUpperCase().trim();
  const src = s.params[1].toUpperCase().trim();

  // LDH (C), A  /  LDH A, (C)
  if (dst === "(C)" && src === "A") { s.bytes = 1; s.lens = [0xE2]; return s; }
  if (dst === "A" && src === "(C)") { s.bytes = 1; s.lens = [0xF2]; return s; }

  // LDH (n), A
  if (dst.startsWith("(") && src === "A") {
    s.bytes = 2;
    s.lens = [0xE0, (vars2) => Parser.evaluate(s.params[0].slice(1, -1), vars2) & 0xFF];
    return s;
  }

  // LDH A, (n)
  if (dst === "A" && src.startsWith("(")) {
    s.bytes = 2;
    s.lens = [0xF0, (vars2) => Parser.evaluate(s.params[1].slice(1, -1), vars2) & 0xFF];
    return s;
  }

  throw new Error(`SM83: unrecognized LDH form: LDH ${s.params[0]}, ${s.params[1]}`);
}

// ─── parseAlu ─────────────────────────────────────────────────────────────────
// SUB/AND/XOR/OR/CP accept one operand (implicit A destination).
// ADD/ADC/SBC require explicit "A" as first operand.
// Accept SUB A, r form for compatibility.

function parseAlu(s, vars, Parser) {
  const mn = s.opcode.toUpperCase();
  const implicitA = ["SUB", "AND", "XOR", "OR", "CP"].includes(mn);

  let regParam;
  if (implicitA) {
    // SUB r / SUB A, r (both forms accepted)
    regParam = (s.params.length === 2 && s.params[0].toUpperCase().trim() === "A")
      ? s.params[1]
      : s.params[0];
  } else {
    // ADD A, r / ADC A, r / SBC A, r — require explicit A
    if (s.params[0].toUpperCase().trim() !== "A") {
      throw new Error(`SM83: ${mn} requires explicit 'A' as first operand`);
    }
    regParam = s.params[1];
  }

  const regName = regParam.toUpperCase().trim();

  // Register or (HL) operand
  if (R8_NAMES.includes(regName)) {
    s.bytes = 1;
    s.lens = [ALU_REG_BASE[mn] | r8(regName)];
    return s;
  }

  // Immediate operand
  s.bytes = 2;
  s.lens = [ALU_IMM_OPCODE[mn], (vars2) => Parser.evaluate(regParam, vars2) & 0xFF];
  return s;
}

// ─── parseIncDec ──────────────────────────────────────────────────────────────

function parseIncDec(s, opR8, opR16) {
  const reg = s.params[0].toUpperCase().trim();

  if (R8_NAMES.includes(reg)) {
    s.bytes = 1;
    s.lens = [opR8 | (r8(reg) << 3)];
    return s;
  }
  if (R16_NAMES.includes(reg)) {
    s.bytes = 1;
    s.lens = [opR16 | (r16(reg) << 4)];
    return s;
  }
  throw new Error(`SM83: INC/DEC: unknown register ${reg}`);
}

// ─── parseJp ──────────────────────────────────────────────────────────────────

function parseJp(s, vars, Parser) {
  // JP HL
  if (s.params.length === 1 && s.params[0].toUpperCase().trim() === "HL") {
    s.bytes = 1; s.lens = [0xE9]; return s;
  }

  // JP nn (unconditional)
  if (s.params.length === 1) {
    s.bytes = 3;
    s.lens = [
      0xC3,
      (vars2) => Parser.evaluate(s.params[0], vars2) & 0xFF,
      (vars2) => (Parser.evaluate(s.params[0], vars2) >> 8) & 0xFF,
    ];
    return s;
  }

  // JP cc, nn
  const cond = cc(s.params[0]);
  s.bytes = 3;
  s.lens = [
    0xC2 | (cond << 3),
    (vars2) => Parser.evaluate(s.params[1], vars2) & 0xFF,
    (vars2) => (Parser.evaluate(s.params[1], vars2) >> 8) & 0xFF,
  ];
  return s;
}

// ─── parseJr ──────────────────────────────────────────────────────────────────

function parseJr(s, vars, Parser) {
  // JR n (unconditional)
  if (s.params.length === 1) {
    s.bytes = 2;
    s.lens = [
      0x18,
      (vars2) => {
        const target = Parser.evaluate(s.params[0], vars2);
        const disp = target - (vars2._PC + 2);
        if (disp > 127 || disp < -128) throw new Error("SM83: JR target out of relative jump reach");
        return disp < 0 ? 256 + disp : disp;
      },
    ];
    return s;
  }

  // JR cc, n
  const cond = cc(s.params[0]);
  s.bytes = 2;
  s.lens = [
    0x20 | (cond << 3),
    (vars2) => {
      const target = Parser.evaluate(s.params[1], vars2);
      const disp = target - (vars2._PC + 2);
      if (disp > 127 || disp < -128) throw new Error("SM83: JR target out of relative jump reach");
      return disp < 0 ? 256 + disp : disp;
    },
  ];
  return s;
}

// ─── parseCall ────────────────────────────────────────────────────────────────

function parseCall(s, vars, Parser) {
  // CALL nn
  if (s.params.length === 1) {
    s.bytes = 3;
    s.lens = [
      0xCD,
      (vars2) => Parser.evaluate(s.params[0], vars2) & 0xFF,
      (vars2) => (Parser.evaluate(s.params[0], vars2) >> 8) & 0xFF,
    ];
    return s;
  }
  // CALL cc, nn
  const cond = cc(s.params[0]);
  s.bytes = 3;
  s.lens = [
    0xC4 | (cond << 3),
    (vars2) => Parser.evaluate(s.params[1], vars2) & 0xFF,
    (vars2) => (Parser.evaluate(s.params[1], vars2) >> 8) & 0xFF,
  ];
  return s;
}

// ─── parseRet ─────────────────────────────────────────────────────────────────

function parseRet(s, vars, Parser) {
  if (!s.params || s.params.length === 0) {
    s.bytes = 1; s.lens = [0xC9]; return s;
  }
  s.bytes = 1;
  s.lens = [0xC0 | (cc(s.params[0]) << 3)];
  return s;
}

// ─── parseAdd ─────────────────────────────────────────────────────────────────

function parseAdd(s, vars, Parser) {
  const dst = s.params[0].toUpperCase().trim();

  // ADD HL, rr
  if (dst === "HL") {
    s.bytes = 1;
    s.lens = [0x09 | (r16(s.params[1]) << 4)];
    return s;
  }

  // ADD SP, n (signed 8-bit)
  if (dst === "SP") {
    s.bytes = 2;
    s.lens = [0xE8, (vars2) => toSigned8(Parser.evaluate(s.params[1], vars2))];
    return s;
  }

  // ADD A, r / ADD A, n — handled by parseAlu
  return parseAlu(s, vars, Parser);
}

// ─── parseOpcode (main entry) ─────────────────────────────────────────────────

function parseOpcode(s, vars, Parser) {
  const mn = s.opcode.toUpperCase();

  // LDI / LDD aliases → map to canonical LD with modified params
  if (mn === "LDI" || mn === "LDD") {
    const suffix = mn === "LDI" ? "+" : "-";
    const dst = s.params[0].toUpperCase().trim();
    const src = s.params[1].toUpperCase().trim();
    // LDI (HL), A → LD (HL+), A
    if (dst === "(HL)" && src === "A") {
      s.bytes = 1; s.lens = [mn === "LDI" ? 0x22 : 0x32]; return s;
    }
    // LDI A, (HL) → LD A, (HL+)
    if (dst === "A" && src === "(HL)") {
      s.bytes = 1; s.lens = [mn === "LDI" ? 0x2A : 0x3A]; return s;
    }
    throw new Error(`SM83: unrecognized ${mn} form`);
  }

  if (mn === "LD")   return parseLd(s, vars, Parser);
  if (mn === "LDH")  return parseLdh(s, vars, Parser);

  if (mn === "ADD")  return parseAdd(s, vars, Parser);

  if (ALU_REG_BASE[mn] !== undefined) return parseAlu(s, vars, Parser);

  if (mn === "INC") return parseIncDec(s, 0x04, 0x03);
  if (mn === "DEC") return parseIncDec(s, 0x05, 0x0B);

  if (mn === "PUSH") { s.bytes = 1; s.lens = [0xC5 | (r16stk(s.params[0]) << 4)]; return s; }
  if (mn === "POP")  { s.bytes = 1; s.lens = [0xC1 | (r16stk(s.params[0]) << 4)]; return s; }

  if (mn === "JP")   return parseJp(s, vars, Parser);
  if (mn === "JR")   return parseJr(s, vars, Parser);
  if (mn === "CALL") return parseCall(s, vars, Parser);
  if (mn === "RET")  return parseRet(s, vars, Parser);
  if (mn === "RETI") { s.bytes = 1; s.lens = [0xD9]; return s; }

  if (mn === "RST") {
    const n = Parser.evaluate(s.params[0], vars);
    assertRst(n);
    s.bytes = 1; s.lens = [0xC7 | n]; return s;
  }

  if (mn === "BIT") {
    s.bytes = 2;
    s.lens = [0xCB, 0x40 | (Parser.evaluate(s.params[0], vars) << 3) | r8(s.params[1])];
    return s;
  }
  if (mn === "RES") {
    s.bytes = 2;
    s.lens = [0xCB, 0x80 | (Parser.evaluate(s.params[0], vars) << 3) | r8(s.params[1])];
    return s;
  }
  if (mn === "SET") {
    s.bytes = 2;
    s.lens = [0xCB, 0xC0 | (Parser.evaluate(s.params[0], vars) << 3) | r8(s.params[1])];
    return s;
  }

  if (CB_OPS[mn] !== undefined) {
    s.bytes = 2; s.lens = [0xCB, CB_OPS[mn] | r8(s.params[0])]; return s;
  }

  // Single-byte fixed opcodes
  const FIXED = {
    NOP: 0x00, RLCA: 0x07, RRCA: 0x0F, RLA: 0x17, RRA: 0x1F,
    DAA: 0x27, CPL: 0x2F, SCF: 0x37, CCF: 0x3F,
    HALT: 0x76, DI: 0xF3, EI: 0xFB,
  };
  if (FIXED[mn] !== undefined) { s.bytes = 1; s.lens = [FIXED[mn]]; return s; }

  if (mn === "STOP") {
    s.bytes = 2;
    s.lens = [0x10, s.params && s.params.length ? (vars2) => Parser.evaluate(s.params[0], vars2) & 0xFF : 0x00];
    return s;
  }

  throw new Error(`SM83: unknown mnemonic ${mn}`);
}

// ─── Export ───────────────────────────────────────────────────────────────────

export const SM83 = {
  endian: false,   // little-endian
  cpu: "sm83",
  ext: "sm83",
  set: {},
  parseOpcode,
};
