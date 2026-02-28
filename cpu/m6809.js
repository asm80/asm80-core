export const M6809 = {
    set: {
      //          0        1     2      3      4      5       6     7
      //       noparm  direct idxd   xtded   rel8    imm8  imm16  rel16
      NEG: [-1, 0x00, 0x60, 0x70, -1, -1, -1, -1],
      COM: [-1, 0x03, 0x63, 0x73, -1, -1, -1, -1],
      LSR: [-1, 0x04, 0x64, 0x74, -1, -1, -1, -1],
      ROR: [-1, 0x06, 0x66, 0x76, -1, -1, -1, -1],
      ASR: [-1, 0x07, 0x67, 0x77, -1, -1, -1, -1],
      LSL: [-1, 0x08, 0x68, 0x78, -1, -1, -1, -1],
      ASL: [-1, 0x08, 0x68, 0x78, -1, -1, -1, -1],
      ROL: [-1, 0x09, 0x69, 0x79, -1, -1, -1, -1],
      DEC: [-1, 0x0a, 0x6a, 0x7a, -1, -1, -1, -1],
      INC: [-1, 0x0c, 0x6c, 0x7c, -1, -1, -1, -1],
      TST: [-1, 0x0d, 0x6d, 0x7d, -1, -1, -1, -1],
      JMP: [-1, 0x0e, 0x6e, 0x7e, -1, -1, -1, -1],
      CLR: [-1, 0x0f, 0x6f, 0x7f, -1, -1, -1, -1],
      LEAX: [-1, -1, 0x30, -1, -1, -1, -1, -1],
      LEAY: [-1, -1, 0x31, -1, -1, -1, -1, -1],
      LEAS: [-1, -1, 0x32, -1, -1, -1, -1, -1],
      LEAU: [-1, -1, 0x33, -1, -1, -1, -1, -1],
      NOP: [0x12, -1, -1, -1, -1, -1, -1, -1],
      SYNC: [0x13, -1, -1, -1, -1, -1, -1, -1],
      DAA: [0x19, -1, -1, -1, -1, -1, -1, -1],
      SEX: [0x1d, -1, -1, -1, -1, -1, -1, -1],
      RTS: [0x39, -1, -1, -1, -1, -1, -1, -1],
      ABX: [0x3a, -1, -1, -1, -1, -1, -1, -1],
      RTI: [0x3b, -1, -1, -1, -1, -1, -1, -1],
      CWAI: [-1, -1, -1, -1, -1, 0x3c, -1, -1],
      MUL: [0x3d, -1, -1, -1, -1, -1, -1, -1],
      SWI: [0x3f, -1, -1, -1, -1, -1, -1, -1],
      SWI2: [0x103f, -1, -1, -1, -1, -1, -1, -1],
      SWI3: [0x113f, -1, -1, -1, -1, -1, -1, -1],
      NEGA: [0x40, -1, -1, -1, -1, -1, -1, -1],
      COMA: [0x43, -1, -1, -1, -1, -1, -1, -1],
      LSRA: [0x44, -1, -1, -1, -1, -1, -1, -1],
      RORA: [0x46, -1, -1, -1, -1, -1, -1, -1],
      ASRA: [0x47, -1, -1, -1, -1, -1, -1, -1],
      LSLA: [0x48, -1, -1, -1, -1, -1, -1, -1],
      ASLA: [0x48, -1, -1, -1, -1, -1, -1, -1],
      ROLA: [0x49, -1, -1, -1, -1, -1, -1, -1],
      DECA: [0x4a, -1, -1, -1, -1, -1, -1, -1],
      INCA: [0x4c, -1, -1, -1, -1, -1, -1, -1],
      TSTA: [0x4d, -1, -1, -1, -1, -1, -1, -1],
      CLRA: [0x4f, -1, -1, -1, -1, -1, -1, -1],
      NEGB: [0x50, -1, -1, -1, -1, -1, -1, -1],
      COMB: [0x53, -1, -1, -1, -1, -1, -1, -1],
      LSRB: [0x54, -1, -1, -1, -1, -1, -1, -1],
      RORB: [0x56, -1, -1, -1, -1, -1, -1, -1],
      ASRB: [0x57, -1, -1, -1, -1, -1, -1, -1],
      LSLB: [0x58, -1, -1, -1, -1, -1, -1, -1],
      ASLB: [0x58, -1, -1, -1, -1, -1, -1, -1],
      ROLB: [0x59, -1, -1, -1, -1, -1, -1, -1],
      DECB: [0x5a, -1, -1, -1, -1, -1, -1, -1],
      INCB: [0x5c, -1, -1, -1, -1, -1, -1, -1],
      TSTB: [0x5d, -1, -1, -1, -1, -1, -1, -1],
      CLRB: [0x5f, -1, -1, -1, -1, -1, -1, -1],

      SUBA: [-1, 0x90, 0xa0, 0xb0, -1, 0x80, -1, -1],
      CMPA: [-1, 0x91, 0xa1, 0xb1, -1, 0x81, -1, -1],
      SBCA: [-1, 0x92, 0xa2, 0xb2, -1, 0x82, -1, -1],
      ANDA: [-1, 0x94, 0xa4, 0xb4, -1, 0x84, -1, -1],
      BITA: [-1, 0x95, 0xa5, 0xb5, -1, 0x85, -1, -1],
      LDA: [-1, 0x96, 0xa6, 0xb6, -1, 0x86, -1, -1],
      STA: [-1, 0x97, 0xa7, 0xb7, -1, -1, -1, -1],
      EORA: [-1, 0x98, 0xa8, 0xb8, -1, 0x88, -1, -1],
      ADCA: [-1, 0x99, 0xa9, 0xb9, -1, 0x89, -1, -1],
      ORA: [-1, 0x9a, 0xaa, 0xba, -1, 0x8a, -1, -1],
      ADDA: [-1, 0x9b, 0xab, 0xbb, -1, 0x8b, -1, -1],
      JSR: [-1, 0x9d, 0xad, 0xbd, -1, -1, -1, -1],

      SUBD: [-1, 0x93, 0xa3, 0xb3, -1, -1, 0x83, -1],
      CMPX: [-1, 0x9c, 0xac, 0xbc, -1, -1, 0x8c, -1],
      LDX: [-1, 0x9e, 0xae, 0xbe, -1, -1, 0x8e, -1],
      STX: [-1, 0x9f, 0xaf, 0xbf, -1, -1, -1, -1],

      CMPD: [-1, 0x1093, 0x10a3, 0x10b3, -1, -1, 0x1083, -1],
      CMPY: [-1, 0x109c, 0x10ac, 0x10bc, -1, -1, 0x108c, -1],
      LDY: [-1, 0x109e, 0x10ae, 0x10be, -1, -1, 0x108e, -1],
      STY: [-1, 0x109f, 0x10af, 0x10bf, -1, -1, -1, -1],
      LDS: [-1, 0x10de, 0x10ee, 0x10fe, -1, -1, 0x10ce, -1],
      STS: [-1, 0x10df, 0x10ef, 0x10ff, -1, -1, -1, -1],

      SUBB: [-1, 0xd0, 0xe0, 0xf0, -1, 0xc0, -1, -1],
      CMPB: [-1, 0xd1, 0xe1, 0xf1, -1, 0xc1, -1, -1],
      SBCB: [-1, 0xd2, 0xe2, 0xf2, -1, 0xc2, -1, -1],
      ANDB: [-1, 0xd4, 0xe4, 0xf4, -1, 0xc4, -1, -1],
      BITB: [-1, 0xd5, 0xe5, 0xf5, -1, 0xc5, -1, -1],
      LDB: [-1, 0xd6, 0xe6, 0xf6, -1, 0xc6, -1, -1],
      STB: [-1, 0xd7, 0xe7, 0xf7, -1, -1, -1, -1],
      EORB: [-1, 0xd8, 0xe8, 0xf8, -1, 0xc8, -1, -1],
      ADCB: [-1, 0xd9, 0xe9, 0xf9, -1, 0xc9, -1, -1],
      ORB: [-1, 0xda, 0xea, 0xfa, -1, 0xca, -1, -1],
      ADDB: [-1, 0xdb, 0xeb, 0xfb, -1, 0xcb, -1, -1],

      ADDD: [-1, 0xd3, 0xe3, 0xf3, -1, -1, 0xc3, -1],
      LDD: [-1, 0xdc, 0xec, 0xfc, -1, -1, 0xcc, -1],
      STD: [-1, 0xdd, 0xed, 0xfd, -1, -1, -1, -1],
      LDU: [-1, 0xde, 0xee, 0xfe, -1, -1, 0xce, -1],
      STU: [-1, 0xdf, 0xef, 0xff, -1, -1, -1, -1],

      CMPS: [-1, 0x119c, 0x11ac, 0x11bc, -1, -1, 0x118c, -1],
      CMPU: [-1, 0x1193, 0x11a3, 0x11b3, -1, -1, 0x1183, -1],

      LBRA: [-1, -1, -1, -1, -1, -1, -1, 0x16],
      LBSR: [-1, -1, -1, -1, -1, -1, -1, 0x17],
      BSR: [-1, -1, -1, -1, 0x8d, -1, -1, -1],
      BRA: [-1, -1, -1, -1, 0x20, -1, -1, -1],
      BRN: [-1, -1, -1, -1, 0x21, -1, -1, -1],
      BHI: [-1, -1, -1, -1, 0x22, -1, -1, -1],
      BLS: [-1, -1, -1, -1, 0x23, -1, -1, -1],
      BHS: [-1, -1, -1, -1, 0x24, -1, -1, -1],
      BCC: [-1, -1, -1, -1, 0x24, -1, -1, -1],
      BLO: [-1, -1, -1, -1, 0x25, -1, -1, -1],
      BCS: [-1, -1, -1, -1, 0x25, -1, -1, -1],
      BNE: [-1, -1, -1, -1, 0x26, -1, -1, -1],
      BEQ: [-1, -1, -1, -1, 0x27, -1, -1, -1],
      BVC: [-1, -1, -1, -1, 0x28, -1, -1, -1],
      BVS: [-1, -1, -1, -1, 0x29, -1, -1, -1],
      BPL: [-1, -1, -1, -1, 0x2a, -1, -1, -1],
      BMI: [-1, -1, -1, -1, 0x2b, -1, -1, -1],
      BGE: [-1, -1, -1, -1, 0x2c, -1, -1, -1],
      BLT: [-1, -1, -1, -1, 0x2d, -1, -1, -1],
      BGT: [-1, -1, -1, -1, 0x2e, -1, -1, -1],
      BLE: [-1, -1, -1, -1, 0x2f, -1, -1, -1],

      LBRN: [-1, -1, -1, -1, -1, -1, -1, 0x1021],
      LBHI: [-1, -1, -1, -1, -1, -1, -1, 0x1022],
      LBLS: [-1, -1, -1, -1, -1, -1, -1, 0x1023],
      LBHS: [-1, -1, -1, -1, -1, -1, -1, 0x1024],
      LBCC: [-1, -1, -1, -1, -1, -1, -1, 0x1024],
      LBLO: [-1, -1, -1, -1, -1, -1, -1, 0x1025],
      LBCS: [-1, -1, -1, -1, -1, -1, -1, 0x1025],
      LBNE: [-1, -1, -1, -1, -1, -1, -1, 0x1026],
      LBEQ: [-1, -1, -1, -1, -1, -1, -1, 0x1027],
      LBVC: [-1, -1, -1, -1, -1, -1, -1, 0x1028],
      LBVS: [-1, -1, -1, -1, -1, -1, -1, 0x1029],
      LBPL: [-1, -1, -1, -1, -1, -1, -1, 0x102a],
      LBMI: [-1, -1, -1, -1, -1, -1, -1, 0x102b],
      LBGE: [-1, -1, -1, -1, -1, -1, -1, 0x102c],
      LBLT: [-1, -1, -1, -1, -1, -1, -1, 0x102d],
      LBGT: [-1, -1, -1, -1, -1, -1, -1, 0x102e],
      LBLE: [-1, -1, -1, -1, -1, -1, -1, 0x102f],

      ORCC: [-1, -1, -1, -1, -1, 0x1a, -1, -1],
      ANDCC: [-1, -1, -1, -1, -1, 0x1c, -1, -1],
    },

    parseOpcode: function (s, vars, Parser) {
      if (!s._dp) s._dp = 0;

      var dptest = function (par, vars, s) {
        if (s._dp < 0 || s._dp > 255) return false;
        try {
          zptest = Parser.evaluate(par, vars);

          if (zptest !== null && zptest !== undefined) {
            var zpp = zptest >> 8;
            //console.log("ZPTEST",zptest,s,zpp)
            if (zpp === s._dp) return true;
          }
        } catch (e) {
          return false;
        }
        return false;
      };

      var parnibble = function (par) {
        var r = [
          "D",
          "X",
          "Y",
          "U",
          "S",
          "PC",
          "",
          "",
          "A",
          "B",
          "CC",
          "DP",
        ].indexOf(par.toUpperCase());
        if (r < 0) throw "Not recognized register name";
        return r;
      };
      var pshsbyte = function (par) {
        if (par.toUpperCase() == "D") {
          return 6;
        }
        var r = ["CC", "A", "B", "DP", "X", "Y", "U", "PC"].indexOf(
          par.toUpperCase()
        );
        if (r < 0) throw "Not recognized register name";
        return 1 << r;
      };
      var pshubyte = function (par) {
        if (par.toUpperCase() == "D") {
          return 6;
        }
        var r = ["CC", "A", "B", "DP", "X", "Y", "S", "PC"].indexOf(
          par.toUpperCase()
        );
        if (r < 0) throw "Not recognized register name";
        return 1 << r;
      };

      var ax = M6809.set[s.opcode];
      var zptest,
        p1,
        p2,
        p1x,
        p2x,
        amode = 0,
        code = -1,
        i;
      var prefixed = 0,
        parserfunc = null;
      s.lens = [];

      //special cases
      if (s.opcode == "EXG") {
        s.lens[0] = 0x1e;
      }
      if (s.opcode == "TFR") {
        s.lens[0] = 0x1f;
      }
      if (s.opcode == "EXG" || s.opcode == "TFR") {
        s.bytes = 2;
        //2 params to nibbles
        if (s.params.length != 2)
          throw s.opcode + " needs exactly 2 registers  at line " + s.numline;
        s.lens[1] = (parnibble(s.params[0]) << 4) + parnibble(s.params[1]);

        return s;
      }
      if (s.opcode == "PSHS") {
        s.lens[0] = 0x34;
        s.bytes = 2;
        s.lens[1] = 0;
        for (i = 0; i < s.params.length; i++) {
          s.lens[1] |= pshsbyte(s.params[i]);
        }
        return s;
      }
      if (s.opcode == "PULS") {
        s.lens[0] = 0x35;
        s.bytes = 2;
        s.lens[1] = 0;
        for (i = 0; i < s.params.length; i++) {
          s.lens[1] |= pshsbyte(s.params[i]);
        }
        return s;
      }
      if (s.opcode == "PSHU") {
        s.lens[0] = 0x36;
        s.bytes = 2;
        s.lens[1] = 0;
        for (i = 0; i < s.params.length; i++) {
          s.lens[1] |= pshubyte(s.params[i]);
        }
        return s;
      }
      if (s.opcode == "PULU") {
        s.lens[0] = 0x37;
        s.bytes = 2;
        s.lens[1] = 0;
        for (i = 0; i < s.params.length; i++) {
          s.lens[1] |= pshubyte(s.params[i]);
        }
        return s;
      }

      if (ax) {
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

        //1 parametr
        if (s.params.length == 1 && s.params[0][0] !== "[") {
          s.bytes = 0;
          p1 = s.params[0];
          if (p1[0] == "#") {
            // imm
            //p1 = p1.substr(1);
            prefixed = 1;
            amode = 5;
            if (ax[5] < 0 && ax[6] >= 0) amode = 6;
          } else if (p1[0] == "<") {
            // forced direct
            //p1 = p1.substr(1);
            prefixed = 1;
            amode = 1;
          } else if (p1[0] == ">") {
            // forced extended
            //p1 = p1.substr(1);
            prefixed = 1;
            amode = 3;
          } else {
            //no decoration. Perform ZP test
            if (ax[1] >= 0) amode = 1;
            if (ax[3] >= 0) amode = 3;
            if (ax[4] >= 0) amode = 4; //rel8
            if (ax[7] >= 0) amode = 7; //rel16


            if (dptest(p1, vars, s) && ax[1] >= 0) amode = 1;
            /*
          try {
            zptest = Parser.evaluate(p1,vars);
            console.log("ZPTEST",zptest,s)
            if (zptest !== null && zptest !== undefined && zptest<0x100 && ax[1]>=0) amode = 1;
          } catch (e) {}
          */
          }
          //if (amode === 0) throw "Not detected addressing mode at line "+s.numline;
          if (ax[amode] == -1) throw "Bad addressing mode at line " + s.numline;
          code = ax[amode];
          if (amode != 4 && amode != 7) {
            parserfunc = prefixed
              ? function (vars) {
                  return Parser.evaluate(p1.substr(1), vars);
                }
              : function (vars) {
                  return Parser.evaluate(p1, vars);
                };
          }
          if (amode === 1 && s._dp != 0) {
            //direct page fix
            //console.log("LDP",s._dp)
            var ldp = s._dp * 256;
            parserfunc = prefixed
              ? function (vars) {
                  return Parser.evaluate(p1.substr(1), vars) - ldp;
                }
              : function (vars) {
                  return Parser.evaluate(p1, vars) - ldp;
                };
          }
          if (code > 0xff) {
            s.bytes += 2;
          } else {
            s.bytes += 1;
          }

          if (amode == 4) {
            parserfunc = /*prefixed ? (function(vars){
            var n = Parser.evaluate(p1.substr(1),vars)-vars._PC-2;
            //console.log(n)
            if (n>127) throw "Target out of range"
            if (n<-128) throw "Target out of range"
            if (n<0) {n=256+n;}
            return n;
          }):*/ function (
              vars
            ) {
              var n = Parser.evaluate(p1, vars) - vars._PC - 2;
              //console.log(n)
              if (n > 127) throw {msg:"Target out of range, diff is "+n, s:s};
              if (n < -128) throw {msg:"Target out of range, diff is "+n, s:s};
              if (n < 0) {
                n = 256 + n;
              }
              return n;
            };
          }
          if (amode == 7) {
            parserfunc = /* prefixed ? (function(vars){
            var n = Parser.evaluate(p1.substr(1),vars)-vars._PC-s.bytes;
            if (n<0) {n=65536+n;}
            return n;
          }):*/ function (
              vars
            ) {
              var n = Parser.evaluate(p1, vars) - vars._PC - s.bytes;
              if (n < 0) {
                n = 65536 + n;
              }
              return n;
            };
          }

          if (code > 0xff) {
            s.lens = [code >> 8, code & 0xff, parserfunc];
          } else {
            s.lens = [code, parserfunc];
          }
          if (amode == 1) s.bytes++;
          if (amode == 5) s.bytes++;
          if (amode == 4) s.bytes++;
          if (amode == 3) {
            s.bytes += 2;
            s.lens[s.bytes - 1] = null;
          }
          if (amode == 6) {
            s.bytes += 2;
            s.lens[s.bytes - 1] = null;
          }
          if (amode == 7) {
            s.bytes += 2;
            s.lens[s.bytes - 1] = null;
          }
          return s;
        }

        var postbyte = 1;
        s.bytes = 2;

        if (s.params.length == 1 && s.params[0][0] === "[") {
          if (ax[2] > 256) {
            s.lens[0] = ax[2] >> 8;
            s.lens[1] = ax[2] & 0xff;
            postbyte = 2;
            s.bytes++;
          } else {
            s.lens[0] = ax[2];
          }
          p1 = s.params[0];
          s.lens[postbyte] = 0x9f;
          s.lens[postbyte + 1] = function (vars) {
            return Parser.evaluate(p1.substr(1, p1.length - 2), vars);
          };
          s.lens[postbyte + 2] = null;
          s.bytes += 2;
          return s;
        }

        // Indexed mode
        if (ax[2] <= 0 || s.params.length !== 2)
          throw "Bad addressing mode at line " + s.numline;
        if (ax[2] > 256) {
          s.lens[0] = ax[2] >> 8;
          s.lens[1] = ax[2] & 0xff;
          postbyte = 2;
          s.bytes++;
        } else {
          s.lens[0] = ax[2];
        }

        var indir = 0;

        p1 = s.params[0];
        p2 = s.params[1];
        p1x = p1;
        p2x = p2;
        if (p1[0] == "[" && p2[p2.length - 1] == "]") {
          indir = 0x10;
          p1 = p1.substr(1);
          p2 = p2.substr(0, p2.length - 1);
        }

        var ixreg = function (par) {
          var r = ["X", "Y", "U", "S"].indexOf(par.toUpperCase());
          if (r < 0) throw "Register name not recognized: " + par;
          return r << 5;
        };
        var ixregPC = function (par) {
          var r = ["X", "Y", "U", "S", "PC"].indexOf(par.toUpperCase());
          if (r == 4) return 0x04;
          if (r < 0) throw "Register name not recognized: " + par;
          return r << 5;
        };

        if (p1 === "") {
          //INS ,R
          if (p2[0] == "-") {
            //-R
            if (p2[1] == "-") {
              //--R
              s.lens[postbyte] = ixreg(p2.substr(2)) | 0x83 | indir;
            } else {
              if (indir > 0) throw "Cannot use predecrement with 1";
              s.lens[postbyte] = ixreg(p2.substr(1)) | 0x82;
            }
          } else if (p2[1] == "+") {
            //R+
            if (p2[2] == "+") {
              //R++
              s.lens[postbyte] = ixreg(p2.substr(0, 1)) | 0x81 | indir;
            } else {
              if (indir > 0) throw "Cannot use postincrement with 1";
              s.lens[postbyte] = ixreg(p2.substr(0, 1)) | 0x80;
            }
          } else {
            s.lens[postbyte] = ixreg(p2) | 0x84 | indir;
          }
          return s;
        }

        if (p1.toUpperCase() === "A") {
          //INS A,R
          s.lens[postbyte] = ixreg(p2) | 0x86 | indir;
          return s;
        }
        if (p1.toUpperCase() === "B") {
          //INS B,R
          s.lens[postbyte] = ixreg(p2) | 0x85 | indir;
          return s;
        }
        if (p1.toUpperCase() === "D") {
          //INS A,R
          //console.log("INS D,R",p1,p2,ixreg(p2),indir);
          s.lens[postbyte] = ixreg(p2) | 0x8b | indir;
          return s;
        }

        let originalZptest=null;

        try {
          zptest = Parser.evaluate(p1, vars);
          originalZptest = zptest;
          if (p2.toUpperCase() == "PC") {
            zptest -= vars._PC;
          }
          //console.log("ZPTEST",s,zptest,vars._PC-zptest-3);
        } catch (e) {
          zptest = null;
        }


        /*
        console.log(
          "AZP",
          p1,
          p2,
          ixreg(p2),
          indir,
          zptest,
          (32 - (65536 - zptest)) & 0x1f
        );
*/
        if (zptest > 65536 - 17 && ixregPC(p2) != 4) {
          //direct
          s.lens[postbyte] =
            ixreg(p2) | indir | ((32 - (65536 - zptest)) & 0x1f);
          return s;
        }


        //thanks Ian Goodacre for this fix
        if (zptest < 16 && zptest > -17 && ixregPC(p2) != 4 && !indir) {
          //direct
          s.lens[postbyte] = ixreg(p2) | indir | (zptest & 0x1f);
          return s;
        }

        /*
        if (p2.toUpperCase() == "PC" && originalZptest !== null) {
          zptest = originalZptest;
        }
          */

        if (zptest < 128 && zptest > -129 && zptest !== null) {
          //direct
          if (zptest < 0) zptest = 256 + zptest;
          s.lens[postbyte] = ixregPC(p2) | indir | 0x88;
          s.bytes++;
          if (p2.toUpperCase() == "PC") {
            s.lens[postbyte + 1] = indir
              ? function (vars) {
                  var n =
                    Parser.evaluate(p1x.substr(1), vars) - vars._PC - s.bytes;
                  if (n < 0) n = 256 + n;
                  return n;
                }
              : function (vars) {
                  var n = Parser.evaluate(p1x, vars) - vars._PC - s.bytes;
                  if (n < 0) n = 256 + n;
                  return n;
                };
          } else {
            s.lens[postbyte + 1] = indir
              ? function (vars) {
                  return Parser.evaluate(p1x.substr(1), vars);
                }
              : function (vars) {
                  return Parser.evaluate(p1x, vars);
                };
          }
          return s;
        }

        s.bytes += 2;
        s.lens[postbyte] = ixregPC(p2) | indir | 0x89;
        if (p2.toUpperCase() == "PC") {
          s.lens[postbyte + 1] = indir
            ? function (vars) {
                var n =
                  Parser.evaluate(p1x.substr(1), vars) - vars._PC - s.bytes;
                if (n < 0) n += 65536;
                return n;
              }
            : function (vars) {
                var n = Parser.evaluate(p1x, vars) - vars._PC - s.bytes;
                if (n < 0) n += 65536;
                return n;
              };
        } else {
          s.lens[postbyte + 1] = indir
            ? function (vars) {
                return Parser.evaluate(p1x.substr(1), vars);
              }
            : function (vars) {
                return Parser.evaluate(p1x, vars);
              };
        }

        //			s.lens[postbyte+1] = function(vars){return Parser.evaluate(p1x,vars);};
        s.lens[postbyte + 2] = null;

        return s;
      }
      return null;
    },
    endian: true,
    cpu: "m6809",
    ext: "a09",
  };
