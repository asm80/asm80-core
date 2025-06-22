/*

http://pastraiser.com/cpu/i8008/i8008_opcodes.html
http://petsd.net/8008.php

*/

export const I8008 = {
  endian: false,
  cpu: "i8008",
  ext: "a08",
  set: {
    //old syntax

    ADA: { o: 0x80, t: "0" },
    ADB: { o: 0x81, t: "0" },
    ADC: { o: 0x82, t: "0" },
    ADD: { o: 0x83, t: "0" },
    ADE: { o: 0x84, t: "0" },
    ADH: { o: 0x85, t: "0" },
    ADL: { o: 0x86, t: "0" },
    ADM: { o: 0x87, t: "0" },

    ACA: { o: 0x88, t: "0" },
    ACB: { o: 0x89, t: "0" },
    ACC: { o: 0x8a, t: "0" },
    ACD: { o: 0x8b, t: "0" },
    ACE: { o: 0x8c, t: "0" },
    ACH: { o: 0x8d, t: "0" },
    ACL: { o: 0x8e, t: "0" },
    ACM: { o: 0x8f, t: "0" },

    SUA: { o: 0x90, t: "0" },
    SUB: { o: 0x91, t: "0" },
    SUC: { o: 0x92, t: "0" },
    SUD: { o: 0x93, t: "0" },
    SUE: { o: 0x94, t: "0" },
    SUH: { o: 0x95, t: "0" },
    SUL: { o: 0x96, t: "0" },
    SUM: { o: 0x97, t: "0" },

    SBA: { o: 0x98, t: "0" },
    SBB: { o: 0x99, t: "0" },
    SBC: { o: 0x9a, t: "0" },
    SBD: { o: 0x9b, t: "0" },
    SBE: { o: 0x9c, t: "0" },
    SBH: { o: 0x9d, t: "0" },
    SBL: { o: 0x9e, t: "0" },
    SBM: { o: 0x9f, t: "0" },

    NDA: { o: 0xa0, t: "0" },
    NDB: { o: 0xa1, t: "0" },
    NDC: { o: 0xa2, t: "0" },
    NDD: { o: 0xa3, t: "0" },
    NDE: { o: 0xa4, t: "0" },
    NDH: { o: 0xa5, t: "0" },
    NDL: { o: 0xa6, t: "0" },
    NDM: { o: 0xa7, t: "0" },

    XRA: { o: 0xa8, t: "0" },
    XRB: { o: 0xa9, t: "0" },
    XRC: { o: 0xaa, t: "0" },
    XRD: { o: 0xab, t: "0" },
    XRE: { o: 0xac, t: "0" },
    XRH: { o: 0xad, t: "0" },
    XRL: { o: 0xae, t: "0" },
    XRM: { o: 0xaf, t: "0" },

    ORA: { o: 0xb0, t: "0" },
    ORB: { o: 0xb1, t: "0" },
    ORC: { o: 0xb2, t: "0" },
    ORD: { o: 0xb3, t: "0" },
    ORE: { o: 0xb4, t: "0" },
    ORH: { o: 0xb5, t: "0" },
    ORL: { o: 0xb6, t: "0" },
    ORM: { o: 0xb7, t: "0" },

    CPA: { o: 0xb8, t: "0" },
    CPB: { o: 0xb9, t: "0" },
    CPC: { o: 0xba, t: "0" },
    CPD: { o: 0xbb, t: "0" },
    CPE: { o: 0xbc, t: "0" },
    CPH: { o: 0xbd, t: "0" },
    CPL: { o: 0xbe, t: "0" },
    CPM: { o: 0xbf, t: "0" },

    LAA: { o: 0xc0, t: "0" },
    LAB: { o: 0xc1, t: "0" },
    LAC: { o: 0xc2, t: "0" },
    LAD: { o: 0xc3, t: "0" },
    LAE: { o: 0xc4, t: "0" },
    LAH: { o: 0xc5, t: "0" },
    LAL: { o: 0xc6, t: "0" },
    LAM: { o: 0xc7, t: "0" },

    LBA: { o: 0xc8, t: "0" },
    LBB: { o: 0xc9, t: "0" },
    LBC: { o: 0xca, t: "0" },
    LBD: { o: 0xcb, t: "0" },
    LBE: { o: 0xcc, t: "0" },
    LBH: { o: 0xcd, t: "0" },
    LBL: { o: 0xce, t: "0" },
    LBM: { o: 0xcf, t: "0" },

    LCA: { o: 0xd0, t: "0" },
    LCB: { o: 0xd1, t: "0" },
    LCC: { o: 0xd2, t: "0" },
    LCD: { o: 0xd3, t: "0" },
    LCE: { o: 0xd4, t: "0" },
    LCH: { o: 0xd5, t: "0" },
    LCL: { o: 0xd6, t: "0" },
    LCM: { o: 0xd7, t: "0" },

    LDA: { o: 0xd8, t: "0" },
    LDB: { o: 0xd9, t: "0" },
    LDC: { o: 0xda, t: "0" },
    LDD: { o: 0xdb, t: "0" },
    LDE: { o: 0xdc, t: "0" },
    LDH: { o: 0xdd, t: "0" },
    LDL: { o: 0xde, t: "0" },
    LDM: { o: 0xdf, t: "0" },

    LEA: { o: 0xe0, t: "0" },
    LEB: { o: 0xe1, t: "0" },
    LEC: { o: 0xe2, t: "0" },
    LED: { o: 0xe3, t: "0" },
    LEE: { o: 0xe4, t: "0" },
    LEH: { o: 0xe5, t: "0" },
    LEL: { o: 0xe6, t: "0" },
    LEM: { o: 0xe7, t: "0" },

    LHA: { o: 0xe8, t: "0" },
    LHB: { o: 0xe9, t: "0" },
    LHC: { o: 0xea, t: "0" },
    LHD: { o: 0xeb, t: "0" },
    LHE: { o: 0xec, t: "0" },
    LHH: { o: 0xed, t: "0" },
    LHL: { o: 0xee, t: "0" },
    LHM: { o: 0xef, t: "0" },

    LLA: { o: 0xf0, t: "0" },
    LLB: { o: 0xf1, t: "0" },
    LLC: { o: 0xf2, t: "0" },
    LLD: { o: 0xf3, t: "0" },
    LLE: { o: 0xf4, t: "0" },
    LLH: { o: 0xf5, t: "0" },
    LLL: { o: 0xf6, t: "0" },
    LLM: { o: 0xf7, t: "0" },

    LMA: { o: 0xf8, t: "0" },
    LMB: { o: 0xf9, t: "0" },
    LMC: { o: 0xfa, t: "0" },
    LMD: { o: 0xfb, t: "0" },
    LME: { o: 0xfc, t: "0" },
    LMH: { o: 0xfd, t: "0" },
    LML: { o: 0xfe, t: "0" },
    LMM: { o: 0xff, t: "0" },

    JMP: { o: 0x44, t: "IW" },
    CAL: { o: 0x46, t: "IW" },
    CALL: { o: 0x46, t: "IW" },
    RET: { o: 0x07, t: "0" },

    JFC: { o: 0x40, t: "IW" },
    JFZ: { o: 0x48, t: "IW" },
    JFS: { o: 0x50, t: "IW" },
    JFP: { o: 0x58, t: "IW" },
    JTC: { o: 0x60, t: "IW" },
    JTZ: { o: 0x68, t: "IW" },
    JTS: { o: 0x70, t: "IW" },
    JTP: { o: 0x78, t: "IW" },

    CFC: { o: 0x42, t: "IW" },
    CFZ: { o: 0x4a, t: "IW" },
    CFS: { o: 0x52, t: "IW" },
    CFP: { o: 0x5a, t: "IW" },
    CTC: { o: 0x62, t: "IW" },
    CTZ: { o: 0x6a, t: "IW" },
    CTS: { o: 0x72, t: "IW" },
    CTP: { o: 0x7a, t: "IW" },

    RFC: { o: 0x03, t: "0" },
    RFZ: { o: 0x0b, t: "0" },
    RFS: { o: 0x13, t: "0" },
    RFP: { o: 0x1b, t: "0" },
    RTC: { o: 0x23, t: "0" },
    RTZ: { o: 0x2b, t: "0" },
    RTS: { o: 0x33, t: "0" },
    RTP: { o: 0x3b, t: "0" },

    //new syntax
    JNC: { o: 0x40, t: "IW" },
    JNZ: { o: 0x48, t: "IW" },
    JP: { o: 0x50, t: "IW" },
    JPO: { o: 0x58, t: "IW" },
    JC: { o: 0x60, t: "IW" },
    JZ: { o: 0x68, t: "IW" },
    JM: { o: 0x70, t: "IW" },
    JPE: { o: 0x78, t: "IW" },

    CNC: { o: 0x42, t: "IW" },
    CNZ: { o: 0x4a, t: "IW" },
    CP: { o: 0x52, t: "IW" },
    CPO: { o: 0x5a, t: "IW" },
    CC: { o: 0x62, t: "IW" },
    CZ: { o: 0x6a, t: "IW" },
    CM: { o: 0x72, t: "IW" },
    //'CPE': {o:0x7a, t:"IW"},   //duplicate, fixed below
    "CPE-": { o: 0x7a, t: "IW" }, //fixed CPE

    RNC: { o: 0x03, t: "0" },
    RNZ: { o: 0x0b, t: "0" },
    RP: { o: 0x13, t: "0" },
    RPO: { o: 0x1b, t: "0" },
    RC: { o: 0x23, t: "0" },
    RZ: { o: 0x2b, t: "0" },
    RM: { o: 0x33, t: "0" },
    RPE: { o: 0x3b, t: "0" },

    RST: { o: 0x05, t: "RST" },
    INP: { o: 0x41, t: "INP" },
    IN: { o: 0x41, t: "INP" }, //new syntax
    OUT: { o: 0x51, t: "OUT" },

    LAI: { o: 0x06, t: "B" },
    LBI: { o: 0x0e, t: "B" },
    LCI: { o: 0x16, t: "B" },
    LDI: { o: 0x1e, t: "B" },
    LEI: { o: 0x26, t: "B" },
    LHI: { o: 0x2e, t: "B" },
    LLI: { o: 0x36, t: "B" },
    LMI: { o: 0x3e, t: "B" },

    RLC: { o: 0x02, t: "0" },
    RRC: { o: 0x0a, t: "0" },
    RAL: { o: 0x12, t: "0" },
    RAR: { o: 0x1a, t: "0" },

    ADI: { o: 0x04, t: "B" },
    ACI: { o: 0x0c, t: "B" },
    SUI: { o: 0x14, t: "B" },
    SBI: { o: 0x1c, t: "B" },
    NDI: { o: 0x24, t: "B" },
    ANI: { o: 0x24, t: "B" }, //new syntax
    XRI: { o: 0x2c, t: "B" },
    ORI: { o: 0x34, t: "B" },
    CPI: { o: 0x3c, t: "B" },

    INB: { o: 0x08, t: "0" },
    INC: { o: 0x10, t: "0" },
    IND: { o: 0x18, t: "0" },
    INE: { o: 0x20, t: "0" },
    INH: { o: 0x28, t: "0" },
    INL: { o: 0x30, t: "0" },

    DCB: { o: 0x09, t: "0" },
    DCC: { o: 0x11, t: "0" },
    DCD: { o: 0x19, t: "0" },
    DCE: { o: 0x21, t: "0" },
    DCH: { o: 0x29, t: "0" },
    DCL: { o: 0x31, t: "0" },

    //new syntax
    MVI: { o: 0x06, t: "RB" },
    MOV: { o: 0xc0, t: "RRR" },

    //duplicates
    "ADD-": { o: 0x80, t: "RR0" },
    "ADC-": { o: 0x88, t: "RR0" },
    "SUB-": { o: 0x90, t: "RR0" },
    "SBB-": { o: 0x98, t: "RR0" },
    ANA: { o: 0xa0, t: "RR0" },
    "XRA-": { o: 0xa8, t: "RR0" },
    "ORA-": { o: 0xb0, t: "RR0" },
    CMP: { o: 0xb8, t: "RR0" },
    INR: { o: 0x00, t: "RR-" },
    DCR: { o: 0x01, t: "RR" },

    HLT: { o: 0xff, t: "0" },
    NOP: { o: 0xc0, t: "0" },
  },
  lens: {
    R: function (reg) {
      return "ABCDEHLM".indexOf(reg.toUpperCase());
    },
    RDD: function (reg) {
      return "BDHSP".indexOf(reg.toUpperCase());
    },
    RBD: function (reg) {
      return "BD".indexOf(reg.toUpperCase());
    },
    RQQ: function (reg) {
      return "BDHPSW".indexOf(reg.toUpperCase());
    },
    RB: function (op, params, Parser) {
      var reg = this.R(params[0]);
      if (reg < 0) throw "Unknown register " + params[0];
      reg <<= 3;
      return [
        reg | op,
        function (vars) {
          return Parser.evaluate(params[1], vars);
        },
      ];
    },
    B: function (op, params, Parser) {
      return [
        op,
        function (vars) {
          return Parser.evaluate(params[0], vars);
        },
      ];
    },
    RR: function (op, params, Parser) {
      var reg = this.R(params[0]);
      if (reg < 0) throw "Unknown register " + params[0];
      reg <<= 3;
      return [reg | op];
    },
    "RR-": function (op, params, Parser) {
      var reg = this.R(params[0]);
      if (reg < 0) throw "Unknown register " + params[0];
      if (reg === 0) throw "Cannot use A register here";
      reg <<= 3;
      return [reg | op];
    },
    RR0: function (op, params, Parser) {
      var reg = this.R(params[0]);
      if (reg < 0) throw "Unknown register " + params[0];
      return [reg | op];
    },
    RRR: function (op, params, Parser) {
      var reg1 = this.R(params[0]);
      if (reg1 < 0) throw "Unknown register " + params[0];
      if (!params[1]) throw "Missing second register";
      var reg2 = this.R(params[1]);
      if (reg2 < 0) throw "Unknown register " + params[1];
      reg1 <<= 3;
      return [reg1 | reg2 | op];
    },
    RPW: function (op, params, Parser) {
      var reg = this.RDD(params[0]);
      if (reg < 0 || reg > 3) throw "Unknown register " + params[0];
      reg <<= 4;
      return [
        reg | op,
        function (vars) {
          return Parser.evaluate(params[1], vars);
        },
        null,
      ];
    },
    RPWD: function (op, params, Parser) {
      var reg = this.RDD(params[0]);
      if (reg < 0 || reg > 3) throw "Unknown register " + params[0];
      reg <<= 4;
      return [reg | op];
    },
    BD: function (op, params, Parser) {
      var reg = this.RBD(params[0]);
      if (reg < 0 || reg > 1) throw "Unknown register " + params[0];
      reg <<= 4;
      return [reg | op];
    },
    RQW: function (op, params, Parser) {
      var reg = this.RQQ(params[0]);
      if (reg < 0 || reg > 3) throw "Unknown register " + params[0];
      reg <<= 4;
      return [reg | op];
    },
    IW: function (op, params, Parser) {
      return [
        op,
        function (vars) {
          return Parser.evaluate(params[0], vars);
        },
        null,
      ];
    },
    INP: function (op, params, Parser) {
      var v = Parser.evaluate(params[0], {});
      if (v < 0 || v > 7) throw "INP address out of limit (0-7): " + params[0];
      return [op + (v << 1)];
    },
    OUT: function (op, params, Parser) {
      var v = Parser.evaluate(params[0], {});
      if (v < 8 || v > 31)
        throw "OUT address out of limit (8-31): " + params[0];
      v -= 8;
      return [op + (v << 1)];
    },
    RST: function (op, params, Parser) {
      var v = parseInt(params[0], 10);
      return [op | (v << 3)];
    },
    "0": function (op, params, Parser) {
      return [op];
    },
  },

  parseOpcode: function (s, vars, Parser) {
    var ax = I8008.set[s.opcode];
    if (ax) {
      if (
        s.params &&
        ["CPE", "ADD", "ADC", "SBB", "SUB", "XRA", "ORA"].indexOf(s.opcode) >=
          0 &&
        s.params.length
      ) {
        ax = I8008.set[s.opcode + "-"];
      }
      var typ = ax.t;
      var lens = I8008.lens[typ](ax.o, s.params, Parser);
      s.bytes = lens.length;
      s.lens = lens;
      s.wia = 1; //Where is address (for relocation)
      s.resolve = lens.reduce(function (inter, v) {
        return typeof v == "function" ? inter + 1 : inter;
      }, 0);
      return s;
    }
    return null;
  },
};

//types
/*
IW - 3 bytes (opcode, LO, HI), format: INSTR num16
RPW - 3 bytes, (opcode, LO, HI), format: INSTR regpair, num16
0 - 1 byte, just instruction
RB - 2  bytes, (opcode, NN), format INSTR reg, NN
*/
