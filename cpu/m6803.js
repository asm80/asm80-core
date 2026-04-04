import { M6800 } from "./m6800.js";

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

// Merged instruction set: 6800 base + 6803 extensions
const m6803set = { ...M6800.set, ...m6803Extensions };

function parseOpcode(s, vars, Parser, opts) {
  let p1;
  let auxopcode = s.opcode;
  if (!s.opcode) return null;

  if (s.params && auxopcode.length === 3) {
    if (s.params[0] === "A" || s.params[0] === "B") {
      if ((s.params[0].indexOf(" ") === 1) || (s.params[0].length === 1)) {
        let p0 = s.params[0] + "";
        s.reg6800 = p0.substr(0, 1).toUpperCase();
        s.params[0] = p0.substr(2).trim();
        s.paramstring = s.paramstring.substr(2).trim();
        auxopcode += s.reg6800;
      }
    }
  }

  let ax = m6803set[auxopcode];

  s.opcode = auxopcode;
  s.lens = [];
  s.wia = 1;

  if (ax) {
    if (ax[0] >= 0) {
      s.lens = [ax[0]];
      s.bytes = 1;
      return s;
    }

    p1 = s.params[0] + "";

    if (s.params[0] && s.params[0].length > 0 && !s.params[1]) {
      let o1 = ax[1];
      let o2 = ax[2];
      let o3 = ax[3];
      let o5 = ax[5];
      let o6 = ax[6];

      if (o6 > -1) {
        s.lens[0] = o6;
        s.lens[1] = function(vars) {
          let n = Parser.evaluate(p1, vars) - vars._PC - 2;
          if (n < 0) { n = 256 + n; }
          return n;
        };
        s.bytes = 2;
        return s;
      }

      if (p1[0] === "#" && o2 > -1) {
        s.lens[0] = o2;
        s.lens[1] = function(vars) { return Parser.evaluate(p1.substr(1), vars); };
        s.lens[2] = null;
        s.bytes = 3;
        return s;
      }
      if (p1[0] === "#" && o5 > -1) {
        s.lens[0] = o5;
        s.lens[1] = function(vars) { return Parser.evaluate(p1.substr(1), vars); };
        s.bytes = 2;
        return s;
      }

      if (o1 > -1 && vars) {
        let zptest = null;
        try {
          zptest = Parser.evaluate(p1, vars);
        } catch(e) { /* pass */ }

        if (zptest < 256 && zptest >= 0) {
          s.lens[0] = o1;
          s.lens[1] = function(vars) { return Parser.evaluate(p1, vars); };
          s.bytes = 2;
          return s;
        }
      }

      if (o3 > -1) {
        s.lens[0] = o3;
        s.lens[1] = function(vars) { return Parser.evaluate(p1, vars); };
        s.lens[2] = null;
        s.bytes = 3;
        return s;
      }
    }

    if (ax[4] > -1) {
      if (s.params[1].toUpperCase() === "X") {
        s.lens[0] = ax[4];
        s.lens[1] = function(vars) { return Parser.evaluate(p1, vars); };
        s.bytes = 2;
        return s;
      }
    }
  }

  return null;
}

export const M6803 = {
  ...M6800,
  cpu: "m6803",
  ext: "a83",
  set: m6803set,
  parseOpcode,
};
