import { Z80 } from "./z80.js";

// Metadata table — all -1 (instructions are handled as special cases in parseOpcode,
// not via table dispatch). Used only by external tooling (Monaco autocomplete).
const z180Extensions = {
  TST:   [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  TSTIO: [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  MLT:   [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  SLP:   [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  OTIM:  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  OTDM:  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  OTIMR: [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  OTDMR: [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  IN0:   [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
  OUT0:  [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
};

// Register order for R8 and IN0/OUT0 encoding.
// Index 6 is the (HL) slot — not valid for IN0/OUT0.
const R8ORDER = ["B","C","D","E","H","L",null,"A"];
const R16ORDER = ["BC","DE","HL","SP"];

const NOOPS = { SLP:0xed76, OTIM:0xed83, OTDM:0xed8b, OTIMR:0xed93, OTDMR:0xed9b };

function parseOpcode(s, vars, Parser, opts) {

  if (s.opcode === "TST" && s.params && s.params.length === 1) {
    const p = s.params[0].toUpperCase().trim();
    if (p === "(HL)") {
      s.lens = [0xed, 0x34]; s.bytes = 2; return s;
    }
    const ri = R8ORDER.indexOf(p);
    if (ri >= 0) {
      s.lens = [0xed, 0x04 + ri * 8]; s.bytes = 2; return s;
    }
    // immediate
    const imm = s.params[0];
    s.lens = [0xed, 0x64, (v) => Parser.evaluate(imm, v)];
    s.bytes = 3; return s;
  }

  if (s.opcode === "TSTIO" && s.params && s.params.length === 1) {
    const imm = s.params[0];
    s.lens = [0xed, 0x74, (v) => Parser.evaluate(imm, v)];
    s.bytes = 3; return s;
  }

  if (s.opcode === "MLT" && s.params && s.params.length === 1) {
    const ri = R16ORDER.indexOf(s.params[0].toUpperCase().trim());
    if (ri < 0) throw "MLT: invalid register pair " + s.params[0];
    s.lens = [0xed, 0x4c + ri * 16]; s.bytes = 2; return s;
  }

  if (NOOPS[s.opcode] !== undefined) {
    const op = NOOPS[s.opcode];
    s.lens = [op >> 8, op & 0xff]; s.bytes = 2; return s;
  }

  if (s.opcode === "IN0" && s.params && s.params.length === 2) {
    const ri = R8ORDER.indexOf(s.params[0].toUpperCase().trim());
    if (ri < 0 || ri === 6) throw "IN0: invalid register " + s.params[0];
    const portExpr = s.params[1].trim().slice(1, -1); // strip ( )
    s.lens = [0xed, ri * 8, (v) => Parser.evaluate(portExpr, v)];
    s.bytes = 3; return s;
  }

  if (s.opcode === "OUT0" && s.params && s.params.length === 2) {
    const ri = R8ORDER.indexOf(s.params[1].toUpperCase().trim());
    if (ri < 0 || ri === 6) throw "OUT0: invalid register " + s.params[1];
    const portExpr = s.params[0].trim().slice(1, -1); // strip ( )
    s.lens = [0xed, ri * 8 + 1, (v) => Parser.evaluate(portExpr, v)];
    s.bytes = 3; return s;
  }

  return Z80.parseOpcode(s, vars, Parser, opts);
}

export const Z180 = {
  ...Z80,
  cpu: "z180",
  ext: "z180",
  set: { ...Z80.set, ...z180Extensions },
  parseOpcode,
};
