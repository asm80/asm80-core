import { M6809 } from "./m6809.js";

const h6309Extensions = {
  //          0        1       2       3      4      5       6     7
  //       noparm  direct   idxd   xtded   rel8   imm8   imm16  rel16

  // 6309-only no-param instructions
  SEXW:  [0x14,    -1,     -1,     -1,     -1,    -1,    -1,    -1],

  // D-register unary ops
  NEGD:  [0x1040,  -1,     -1,     -1,     -1,    -1,    -1,    -1],
  COMD:  [0x1043,  -1,     -1,     -1,     -1,    -1,    -1,    -1],
  LSRD:  [0x1044,  -1,     -1,     -1,     -1,    -1,    -1,    -1],
  RORD:  [0x1046,  -1,     -1,     -1,     -1,    -1,    -1,    -1],
  ASRD:  [0x1047,  -1,     -1,     -1,     -1,    -1,    -1,    -1],
  ASLD:  [0x1048,  -1,     -1,     -1,     -1,    -1,    -1,    -1],
  LSLD:  [0x1048,  -1,     -1,     -1,     -1,    -1,    -1,    -1],
  ROLD:  [0x1049,  -1,     -1,     -1,     -1,    -1,    -1,    -1],
  DECD:  [0x104a,  -1,     -1,     -1,     -1,    -1,    -1,    -1],
  INCD:  [0x104c,  -1,     -1,     -1,     -1,    -1,    -1,    -1],
  TSTD:  [0x104d,  -1,     -1,     -1,     -1,    -1,    -1,    -1],
  CLRD:  [0x104f,  -1,     -1,     -1,     -1,    -1,    -1,    -1],

  // W-register unary ops
  COMW:  [0x1053,  -1,     -1,     -1,     -1,    -1,    -1,    -1],
  LSRW:  [0x1054,  -1,     -1,     -1,     -1,    -1,    -1,    -1],
  RORW:  [0x1056,  -1,     -1,     -1,     -1,    -1,    -1,    -1],
  ROLW:  [0x1059,  -1,     -1,     -1,     -1,    -1,    -1,    -1],
  DECW:  [0x105a,  -1,     -1,     -1,     -1,    -1,    -1,    -1],
  INCW:  [0x105c,  -1,     -1,     -1,     -1,    -1,    -1,    -1],
  TSTW:  [0x105d,  -1,     -1,     -1,     -1,    -1,    -1,    -1],
  CLRW:  [0x105f,  -1,     -1,     -1,     -1,    -1,    -1,    -1],

  // push/pull W
  PSHSW: [0x1038,  -1,     -1,     -1,     -1,    -1,    -1,    -1],
  PULSW: [0x1039,  -1,     -1,     -1,     -1,    -1,    -1,    -1],
  PSHUW: [0x103a,  -1,     -1,     -1,     -1,    -1,    -1,    -1],
  PULUW: [0x103b,  -1,     -1,     -1,     -1,    -1,    -1,    -1],

  // register-register ops (noparm slot holds opcode, handled as special case)
  ADCR:  [0x1031,  -1,     -1,     -1,     -1,    -1,    -1,    -1],
  ADDR:  [0x1030,  -1,     -1,     -1,     -1,    -1,    -1,    -1],
  SUBR:  [0x1032,  -1,     -1,     -1,     -1,    -1,    -1,    -1],
  SBCR:  [0x1033,  -1,     -1,     -1,     -1,    -1,    -1,    -1],
  ANDR:  [0x1034,  -1,     -1,     -1,     -1,    -1,    -1,    -1],
  ORR:   [0x1035,  -1,     -1,     -1,     -1,    -1,    -1,    -1],
  EORR:  [0x1036,  -1,     -1,     -1,     -1,    -1,    -1,    -1],
  CMPR:  [0x1037,  -1,     -1,     -1,     -1,    -1,    -1,    -1],

  // E-register ops
  COME:  [0x1143,  -1,     -1,     -1,     -1,    -1,    -1,    -1],
  DECE:  [0x114a,  -1,     -1,     -1,     -1,    -1,    -1,    -1],
  INCE:  [0x114c,  -1,     -1,     -1,     -1,    -1,    -1,    -1],
  TSTE:  [0x114d,  -1,     -1,     -1,     -1,    -1,    -1,    -1],
  CLRE:  [0x114f,  -1,     -1,     -1,     -1,    -1,    -1,    -1],

  // F-register ops
  COMF:  [0x1153,  -1,     -1,     -1,     -1,    -1,    -1,    -1],
  DECF:  [0x115a,  -1,     -1,     -1,     -1,    -1,    -1,    -1],
  INCF:  [0x115c,  -1,     -1,     -1,     -1,    -1,    -1,    -1],
  TSTF:  [0x115d,  -1,     -1,     -1,     -1,    -1,    -1,    -1],
  CLRF:  [0x115f,  -1,     -1,     -1,     -1,    -1,    -1,    -1],

  // E/F memory ops (imm8 in slot 5)
  CMPE:  [-1, 0x1191, 0x11a1, 0x11b1, -1, 0x1181,    -1,    -1],
  CMPF:  [-1, 0x11d1, 0x11e1, 0x11f1, -1, 0x11c1,    -1,    -1],
  LDE:   [-1, 0x1196, 0x11a6, 0x11b6, -1, 0x1186,    -1,    -1],
  LDF:   [-1, 0x11d6, 0x11e6, 0x11f6, -1, 0x11c6,    -1,    -1],
  STE:   [-1, 0x1197, 0x11a7, 0x11b7, -1,    -1,     -1,    -1],
  STF:   [-1, 0x11d7, 0x11e7, 0x11f7, -1,    -1,     -1,    -1],
  SUBE:  [-1, 0x1190, 0x11a0, 0x11b0, -1, 0x1180,    -1,    -1],
  SUBF:  [-1, 0x11d0, 0x11e0, 0x11f0, -1, 0x11c0,    -1,    -1],
  ADDE:  [-1, 0x119b, 0x11ab, 0x11bb, -1, 0x118b,    -1,    -1],
  ADDF:  [-1, 0x11db, 0x11eb, 0x11fb, -1, 0x11cb,    -1,    -1],

  // W memory ops (imm16 in slot 6)
  SUBW:  [-1, 0x1090, 0x10a0, 0x10b0, -1,    -1,  0x1080,  -1],
  CMPW:  [-1, 0x1091, 0x10a1, 0x10b1, -1,    -1,  0x1081,  -1],
  SBCD:  [-1, 0x1092, 0x10a2, 0x10b2, -1,    -1,  0x1082,  -1],
  ANDD:  [-1, 0x1094, 0x10a4, 0x10b4, -1,    -1,  0x1084,  -1],
  BITD:  [-1, 0x1095, 0x10a5, 0x10b5, -1,    -1,  0x1085,  -1],
  LDW:   [-1, 0x1096, 0x10a6, 0x10b6, -1,    -1,  0x1086,  -1],
  STW:   [-1, 0x1097, 0x10a7, 0x10b7, -1,    -1,  0x1087,  -1],
  EORD:  [-1, 0x1098, 0x10a8, 0x10b8, -1,    -1,  0x1088,  -1],
  ADCD:  [-1, 0x1099, 0x10a9, 0x10b9, -1,    -1,  0x1089,  -1],
  ORD:   [-1, 0x109a, 0x10aa, 0x10ba, -1,    -1,  0x108a,  -1],
  ADDW:  [-1, 0x109b, 0x10ab, 0x10bb, -1,    -1,  0x108b,  -1],

  // Q ops
  LDQ:   [-1, 0x10dc, 0x10ec, 0x10fc, -1,    -1,    0xcd,  -1],
  STQ:   [-1, 0x10dd, 0x10ed, 0x10fd, -1,    -1,    -1,    -1],

  // divide/multiply
  DIVD:  [-1, 0x119d, 0x11ad, 0x11bd, -1,    -1,  0x118d,  -1],
  DIVQ:  [-1, 0x119e, 0x11ae, 0x11be, -1,    -1,  0x118e,  -1],
  MULD:  [-1, 0x119f, 0x11af, 0x11bf, -1,    -1,  0x118f,  -1],

  // MD register
  BITMD: [-1,    -1,     -1,     -1,   -1, 0x113c,    -1,    -1],
  LDMD:  [-1,    -1,     -1,     -1,   -1, 0x113d,    -1,    -1],

  // bit manipulation (direct only, handled as special case)
  BAND:  [-1, 0x1130,    -1,     -1,   -1,    -1,    -1,    -1],
  BIAND: [-1, 0x1131,    -1,     -1,   -1,    -1,    -1,    -1],
  BOR:   [-1, 0x1132,    -1,     -1,   -1,    -1,    -1,    -1],
  BIOR:  [-1, 0x1133,    -1,     -1,   -1,    -1,    -1,    -1],
  BEOR:  [-1, 0x1134,    -1,     -1,   -1,    -1,    -1,    -1],
  BIEOR: [-1, 0x1135,    -1,     -1,   -1,    -1,    -1,    -1],
  LDBT:  [-1, 0x1136,    -1,     -1,   -1,    -1,    -1,    -1],
  STBT:  [-1, 0x1137,    -1,     -1,   -1,    -1,    -1,    -1],

  // immediate+memory ops (direct/indexed/extended, handled as special case)
  OIM:   [-1,  0x01,   0x61,   0x71,  -1,    -1,    -1,    -1],
  AIM:   [-1,  0x02,   0x62,   0x72,  -1,    -1,    -1,    -1],
  EIM:   [-1,  0x05,   0x65,   0x75,  -1,    -1,    -1,    -1],
  TIM:   [-1,  0x0b,   0x6b,   0x7b,  -1,    -1,    -1,    -1],
};

function parseOpcode(s, vars, Parser, opts) {
  if (!s._dp) s._dp = 0;

  // --- Helper functions ---

  const parnibble = function (par) {
    const r = ["D","X","Y","U","S","PC","W","V","A","B","CC","DP","","0","E","F"]
      .indexOf(par.toUpperCase());
    if (r < 0) throw "Not recognized register name";
    return r;
  };

  const tfmnibble = function (par) {
    const r = ["D","X","Y","U","S"].indexOf(par.toUpperCase()[0]);
    if (r < 0) throw "Not recognized register name";
    return r;
  };

  const pshsbyte = function (par) {
    if (par.toUpperCase() === "D") return 6;
    const r = ["CC","A","B","DP","X","Y","U","PC"].indexOf(par.toUpperCase());
    if (r < 0) throw "Not recognized register name";
    return 1 << r;
  };

  const pshubyte = function (par) {
    if (par.toUpperCase() === "D") return 6;
    const r = ["CC","A","B","DP","X","Y","S","PC"].indexOf(par.toUpperCase());
    if (r < 0) throw "Not recognized register name";
    return 1 << r;
  };

  const dptest = function (par, vars, s) {
    if (s._dp < 0 || s._dp > 255) return false;
    // In relocatable modules, final load address is unknown — never auto-select direct mode
    if (vars.__PRAGMAS && vars.__PRAGMAS.indexOf('MODULE') >= 0) return false;
    try {
      const v = Parser.evaluate(par, vars);
      if (v !== null && v !== undefined && (v >> 8) === s._dp) return true;
    } catch (e) { return false; }
    return false;
  };

  const ixreg = function (par) {
    const r = ["X","Y","U","S"].indexOf(par.toUpperCase());
    if (r < 0) throw "Register name not recognized: " + par;
    return r << 5;
  };

  const ixregPC = function (par) {
    const r = ["X","Y","U","S","PC"].indexOf(par.toUpperCase());
    if (r === 4) return 0x04;
    if (r < 0) throw "Register name not recognized: " + par;
    return r << 5;
  };

  const ax = H6309.set[s.opcode];
  let zptest, p1, p2, p1x, p2x, amode = 0, code = -1, i;
  let prefixed = 0, parserfunc = null;
  s.lens = [];

  // --- Special cases ---

  if (s.opcode === "EXG") s.lens[0] = 0x1e;
  if (s.opcode === "TFR") s.lens[0] = 0x1f;
  if (s.opcode === "EXG" || s.opcode === "TFR") {
    s.bytes = 2;
    if (s.params.length !== 2) throw s.opcode + " needs exactly 2 registers at line " + s.numline;
    s.lens[1] = (parnibble(s.params[0]) << 4) + parnibble(s.params[1]);
    s.noReloc = true;
    return s;
  }

  if (s.opcode === "TFM") {
    if (s.params.length !== 2) throw s.opcode + " needs exactly 2 registers at line " + s.numline;
    const sg0 = s.params[0][1];
    const sg1 = s.params[1][1];
    if (sg0 === "+" && sg1 === "+")              s.lens[1] = 0x38;
    else if (sg0 === "-" && sg1 === "-")         s.lens[1] = 0x39;
    else if (sg0 === "+" && sg1 === undefined)   s.lens[1] = 0x3a;
    else if (sg0 === undefined && sg1 === "+")   s.lens[1] = 0x3b;
    else throw "Invalid TFM parameter combination at line " + s.numline;
    s.lens[0] = 0x11;
    s.bytes = 3;
    s.lens[2] = (tfmnibble(s.params[0]) << 4) + tfmnibble(s.params[1]);
    s.noReloc = true;
    return s;
  }

  const ADDR_CLASS = ["ADDR","ADCR","SUBR","SBCR","ANDR","ORR","EORR","CMPR"];
  if (ADDR_CLASS.indexOf(s.opcode) >= 0) {
    s.lens[0] = ax[0] >> 8;
    s.lens[1] = ax[0] & 0xff;
    s.bytes = 3;
    if (s.params.length !== 2) throw s.opcode + " needs exactly 2 registers at line " + s.numline;
    s.lens[2] = (parnibble(s.params[0]) << 4) + parnibble(s.params[1]);
    s.noReloc = true;
    return s;
  }

  if (s.opcode === "PSHS") {
    s.lens[0] = 0x34; s.bytes = 2; s.lens[1] = 0;
    for (i = 0; i < s.params.length; i++) s.lens[1] |= pshsbyte(s.params[i]);
    s.noReloc = true;
    return s;
  }
  if (s.opcode === "PULS") {
    s.lens[0] = 0x35; s.bytes = 2; s.lens[1] = 0;
    for (i = 0; i < s.params.length; i++) s.lens[1] |= pshsbyte(s.params[i]);
    s.noReloc = true;
    return s;
  }
  if (s.opcode === "PSHU") {
    s.lens[0] = 0x36; s.bytes = 2; s.lens[1] = 0;
    for (i = 0; i < s.params.length; i++) s.lens[1] |= pshubyte(s.params[i]);
    s.noReloc = true;
    return s;
  }
  if (s.opcode === "PULU") {
    s.lens[0] = 0x37; s.bytes = 2; s.lens[1] = 0;
    for (i = 0; i < s.params.length; i++) s.lens[1] |= pshubyte(s.params[i]);
    s.noReloc = true;
    return s;
  }

  if (!ax) return null;

  // --- BAND/BOR/BEOR/BIAND/BIOR/BIEOR/LDBT/STBT ---
  const BIT_OPS = ["BAND","BOR","BEOR","BIAND","BIOR","BIEOR","LDBT","STBT"];
  if (BIT_OPS.indexOf(s.opcode) >= 0) {
    if (s.bandPar === undefined) {
      let br, brb, bmb;
      if (s.params.length === 4) {
        br  = s.params[0];
        brb = s.params[1];
        bmb = s.params[2];
        s.params.shift(); s.params.shift(); s.params.shift();
      } else if (s.params.length === 2) {
        const brr = s.params[0].split(".");
        br  = brr[0];
        brb = brr[1];
        const bmm = s.params[1].split(".");
        bmb = bmm[1];
        s.params[0] = bmm[0];
      } else throw s.opcode + " needs 4 or 2 parameters at line " + s.numline;
      s.bandPar = [br, brb, bmb];
    }
    const [br, brb, bmb] = s.bandPar;
    const regnum = ["CC","A","B"].indexOf(br.toUpperCase());
    if (regnum < 0) throw s.opcode + " needs A, B or CC register at line " + s.numline;
    const bitr = Parser.evaluate(brb, vars);
    if (bitr < 0 || bitr > 7) throw s.opcode + " register bit must be 0-7 at line " + s.numline;
    const bitm = Parser.evaluate(bmb, vars);
    if (bitm < 0 || bitm > 7) throw s.opcode + " memory bit must be 0-7 at line " + s.numline;
    const ldp = s._dp * 256;
    const p1addr = s.params[0];
    s.bytes = 4;
    s.lens[0] = ax[1] >> 8;
    s.lens[1] = ax[1] & 0xff;
    s.lens[2] = (regnum << 6) | (bitm << 3) | bitr;
    s.lens[3] = function (vars) { return Parser.evaluate(p1addr, vars) - ldp; };
    return s;
  }

  // --- AIM/EIM/OIM/TIM ---
  let aim = false;
  const AIM_OPS = ["AIM","EIM","OIM","TIM"];
  if (AIM_OPS.indexOf(s.opcode) >= 0) {
    if (s.aimPar === undefined) {
      s.aimPar = s.params.shift();
      if (s.aimPar[0] !== "#") throw s.opcode + " needs #imm as parameter 1 at line " + s.numline;
    }
    // aim must be set on EVERY pass (not just first) so imm byte is inserted on Pass1 re-runs
    aim = true;
  }

  // --- no-param (noparm slot) ---
  if (ax[0] >= 0) {
    if (ax[0] > 0xff) {
      s.lens = [ax[0] >> 8, ax[0] & 0xff];
      s.bytes = 2;
      return s;
    }
    s.lens = [ax[0]];
    s.bytes = 1;
    return s;
  }

  // --- 1-param non-indexed ---
  if (s.params.length === 1 && s.params[0][0] !== "[") {
    s.bytes = 0;
    p1 = s.params[0];
    if (p1[0] === "#") {
      prefixed = 1; amode = 5;
      if (ax[5] < 0 && ax[6] >= 0) amode = 6;
    } else if (p1[0] === "<") {
      prefixed = 1; amode = 1;
    } else if (p1[0] === ">") {
      prefixed = 1; amode = 3;
    } else {
      if (ax[1] >= 0) amode = 1;
      if (ax[3] >= 0) amode = 3;
      if (ax[4] >= 0) amode = 4;
      if (ax[7] >= 0) amode = 7;
      if (dptest(p1, vars, s) && ax[1] >= 0) amode = 1;
    }
    if (ax[amode] === -1) throw "Bad addressing mode at line " + s.numline;
    code = ax[amode];

    if (amode !== 4 && amode !== 7) {
      parserfunc = prefixed
        ? function (vars) { return Parser.evaluate(p1.substr(1), vars); }
        : function (vars) { return Parser.evaluate(p1, vars); };
    }
    if (amode === 1 && s._dp !== 0) {
      const ldp = s._dp * 256;
      parserfunc = prefixed
        ? function (vars) { return Parser.evaluate(p1.substr(1), vars) - ldp; }
        : function (vars) { return Parser.evaluate(p1, vars) - ldp; };
    }
    if (code > 0xff) s.bytes += 2; else s.bytes += 1;

    s.wia = code > 0xff ? 2 : 1;

    if (amode === 4) {
      s.isRelJump = true;
      parserfunc = function (vars) {
        const n = Parser.evaluate(p1, vars) - vars._PC - 2;
        if (n > 127) throw { msg: "Target out of range, diff is " + n, s: s };
        if (n < -128) throw { msg: "Target out of range, diff is " + n, s: s };
        return n < 0 ? 256 + n : n;
      };
    }
    if (amode === 7) {
      s.isRelJump = true;
      parserfunc = function (vars) {
        const n = Parser.evaluate(p1, vars) - vars._PC - s.bytes;
        return n < 0 ? 65536 + n : n;
      };
    }

    if (code > 0xff) s.lens = [code >> 8, code & 0xff, parserfunc];
    else             s.lens = [code, parserfunc];

    if (amode === 1) s.bytes++;
    if (amode === 5) s.bytes++;
    if (amode === 4) s.bytes++;
    if (amode === 3) { s.bytes += 2; s.lens[s.bytes - 1] = null; }
    if (amode === 6) { s.bytes += 2; s.lens[s.bytes - 1] = null; }
    if (amode === 7) { s.bytes += 2; s.lens[s.bytes - 1] = null; }

    if (aim) {
      const aimpar = s.aimPar.substr(1);
      let n = Parser.evaluate(aimpar, vars);
      if (n < 0) n = 256 + n;
      if (s.bytes > 2) s.lens[3] = s.lens[2];
      s.lens[2] = s.lens[1];
      s.lens[1] = n;
      s.bytes++;
    }

    if (s.opcode === "LDQ" && amode === 6) {
      s.lens[s.bytes - 1] = "addr32";
      s.lens[s.bytes]     = null;
      s.lens[s.bytes + 1] = null;
      s.bytes += 2;
    }

    return s;
  }

  // --- indirect extended [...] ---
  let postbyte = 1;
  s.bytes = 2;

  if (aim) {
    const aimpar = s.aimPar.substr(1);
    let n = Parser.evaluate(aimpar, vars);
    if (n < 0) n = 256 + n;
    s.lens[1] = n;
    postbyte++;
    s.bytes++;
  }

  if (s.params.length === 1 && s.params[0][0] === "[") {
    if (ax[2] > 256) {
      s.lens[0] = ax[2] >> 8; s.lens[1] = ax[2] & 0xff;
      postbyte = 2; s.bytes++;
    } else {
      s.lens[0] = ax[2];
    }
    p1 = s.params[0];
    s.lens[postbyte]     = 0x9f;
    s.lens[postbyte + 1] = function (vars) { return Parser.evaluate(p1.substr(1, p1.length - 2), vars); };
    s.lens[postbyte + 2] = null;
    s.bytes += 2;
    s.wia = postbyte + 1;
    return s;
  }

  // --- indexed mode ---
  if (ax[2] <= 0 || s.params.length !== 2) throw "Bad addressing mode at line " + s.numline;
  if (ax[2] > 256) {
    s.lens[0] = ax[2] >> 8; s.lens[1] = ax[2] & 0xff;
    postbyte = 2; s.bytes++;
  } else {
    s.lens[0] = ax[2];
  }

  let indir = 0;
  p1 = s.params[0]; p2 = s.params[1];
  p1x = p1; p2x = p2;
  if (p1[0] === "[" && p2[p2.length - 1] === "]") {
    indir = 0x10;
    p1 = p1.substr(1);
    p2 = p2.substr(0, p2.length - 1);
  }

  if (p1 === "") {
    if (p2[0] === "-") {
      if (p2[1] === "-") {
        // W guard BEFORE ixreg() — ixreg throws on "W", so check first
        if (p2[2].toUpperCase() === "W") {
          s.lens[postbyte] = 0xef | indir;
        } else {
          s.lens[postbyte] = ixreg(p2.substr(2)) | 0x83 | indir;
        }
      } else {
        if (indir > 0) throw "Cannot use predecrement with 1";
        s.lens[postbyte] = ixreg(p2.substr(1)) | 0x82;
      }
    } else if (p2[1] === "+") {
      if (p2[2] === "+") {
        // W guard BEFORE ixreg()
        if (p2[0].toUpperCase() === "W") {
          s.lens[postbyte] = 0xcf | indir;
        } else {
          s.lens[postbyte] = ixreg(p2.substr(0, 1)) | 0x81 | indir;
        }
      } else {
        if (indir > 0) throw "Cannot use postincrement with 1";
        s.lens[postbyte] = ixreg(p2.substr(0, 1)) | 0x80;
      }
    } else {
      // W guard BEFORE ixreg()
      if (p2[0].toUpperCase() === "W") {
        s.lens[postbyte] = 0x8f | indir;
      } else {
        s.lens[postbyte] = ixreg(p2) | 0x84 | indir;
      }
    }
    return s;
  }

  if (p1.toUpperCase() === "A") { s.lens[postbyte] = ixreg(p2) | 0x86 | indir; return s; }
  if (p1.toUpperCase() === "B") { s.lens[postbyte] = ixreg(p2) | 0x85 | indir; return s; }
  if (p1.toUpperCase() === "E") { s.lens[postbyte] = ixreg(p2) | 0x87 | indir; return s; }
  if (p1.toUpperCase() === "F") { s.lens[postbyte] = ixreg(p2) | 0x8a | indir; return s; }
  if (p1.toUpperCase() === "D") { s.lens[postbyte] = ixreg(p2) | 0x8b | indir; return s; }
  if (p1.toUpperCase() === "W") { s.lens[postbyte] = ixreg(p2) | 0x8e | indir; return s; }

  let originalZptest = null;
  try {
    zptest = Parser.evaluate(p1, vars);
    originalZptest = zptest;
    if (p2.toUpperCase() === "PC") zptest -= vars._PC;
  } catch (e) { zptest = null; }

  if (zptest > 65536 - 17 && ixregPC(p2) !== 4) {
    s.lens[postbyte] = ixreg(p2) | indir | ((32 - (65536 - zptest)) & 0x1f);
    s.noReloc = true; // 5-bit offset baked into postbyte — no address field to relocate
    return s;
  }

  if (zptest < 16 && zptest > -17 && ixregPC(p2) !== 4 && !indir) {
    s.lens[postbyte] = ixreg(p2) | indir | (zptest & 0x1f);
    s.noReloc = true; // 5-bit offset baked into postbyte — no address field to relocate
    return s;
  }

  if (zptest < 128 && zptest > -129 && zptest !== null) {
    if (zptest < 0) zptest = 256 + zptest;
    s.lens[postbyte] = ixregPC(p2) | indir | 0x88;
    s.bytes++;
    if (p2.toUpperCase() === "PC") {
      s.lens[postbyte + 1] = indir
        ? function (vars) { const n = Parser.evaluate(p1x.substr(1), vars) - vars._PC - s.bytes; return n < 0 ? 256 + n : n; }
        : function (vars) { const n = Parser.evaluate(p1x, vars) - vars._PC - s.bytes; return n < 0 ? 256 + n : n; };
    } else {
      s.lens[postbyte + 1] = indir
        ? function (vars) { return Parser.evaluate(p1x.substr(1), vars); }
        : function (vars) { return Parser.evaluate(p1x, vars); };
    }
    return s;
  }

  s.bytes += 2;
  // W guard BEFORE ixregPC() — ixregPC also throws on "W"
  if (p2[0].toUpperCase() === "W") {
    s.lens[postbyte] = 0xaf | indir;
  } else {
    s.lens[postbyte] = ixregPC(p2) | indir | 0x89;
  }
  if (p2.toUpperCase() === "PC") {
    s.lens[postbyte + 1] = indir
      ? function (vars) { const n = Parser.evaluate(p1x.substr(1), vars) - vars._PC - s.bytes; return n < 0 ? n + 65536 : n; }
      : function (vars) { const n = Parser.evaluate(p1x, vars) - vars._PC - s.bytes; return n < 0 ? n + 65536 : n; };
  } else {
    s.lens[postbyte + 1] = indir
      ? function (vars) { return Parser.evaluate(p1x.substr(1), vars); }
      : function (vars) { return Parser.evaluate(p1x, vars); };
  }
  s.lens[postbyte + 2] = null;

  return s;
}

export const H6309 = {
  set: { ...M6809.set, ...h6309Extensions },
  parseOpcode,
  endian: true,
  cpu: "h6309",
  ext: "h09",
};
