export const C65816 = {
  endian: false,
  cpu: "c65816",
  ext: "65816",
  "set": {
    //illegal opcodes - http://www.oxyron.de/html/opcodes02.html
    //
    //             imm  abs  abx  aby    dp  dpx  dpy  ind  idx  idy  rel  idp  idl idly  isy  abl  alx  iax  ial rell   bm   sr
    //    imp  ima imm  abs  abx  aby   zpg  zpx  zpy  ind  izx  izy  rel

    //65816 opcodes
    COP: [-1, -1, 0x02, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    REP: [-1, -1, 0xC2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    SEP: [-1, -1, 0xE2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    PHB: [0x8B, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    PHD: [0x0B, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    PHK: [0x4B, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    PHX: [0xDA, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    PHY: [0x5A, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    PLB: [0xAB, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    PLD: [0x2B, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    //  PLK:[0x4B,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    PLX: [0xFA, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    PLY: [0x7A, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    RTL: [0x6B, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],

    TCS: [0x1B, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    TSC: [0x3B, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    TCD: [0x5B, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    TDC: [0x7B, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    TXY: [0x9B, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    TYX: [0xBB, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    WAI: [0xCB, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    WDM: [0x42, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    STP: [0xDB, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    XBA: [0xEB, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    XCE: [0xFB, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],

    TSB: [-1, -1, -1, 0x0C, -1, -1, 0x04, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    TRB: [-1, -1, -1, 0x1C, -1, -1, 0x14, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    STZ: [-1, -1, -1, 0x9C, 0x9E, -1, 0x64, 0x74, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],

    BRA: [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0x80, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    BRL: [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0x82, -1, -1],
    PER: [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0x62, -1, -1],


    PEI: [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0xD4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    PEA: [-1, -1, -1, 0xF4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],

    MVP: [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0x44, -1],
    MVN: [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0x54, -1],


    //end of C02 part

    //natives
    //             imm  abs  abx  aby    dp  dpx  dpy  ind  idx  idy  rel  idp  idl idly  isy  abl  alx  iax  ial rell   bm   sr
    ORA: [-1, -1, 0x09, 0x0d, 0x1d, 0x19, 0x05, 0x15, -1, -1, 0x01, 0x11, -1, 0x12, 0x07, 0x17, 0x13, 0x0F, 0x1F, -1, -1, -1, -1, 0x03],
    AND: [-1, -1, 0x29, 0x2d, 0x3d, 0x39, 0x25, 0x35, -1, -1, 0x21, 0x31, -1, 0x32, 0x27, 0x37, 0x33, 0x2F, 0x3F, -1, -1, -1, -1, 0x23],
    EOR: [-1, -1, 0x49, 0x4d, 0x5d, 0x59, 0x45, 0x55, -1, -1, 0x41, 0x51, -1, 0x52, 0x47, 0x57, 0x53, 0x4F, 0x5F, -1, -1, -1, -1, 0x43],
    ADC: [-1, -1, 0x69, 0x6d, 0x7d, 0x79, 0x65, 0x75, -1, -1, 0x61, 0x71, -1, 0x72, 0x67, 0x77, 0x73, 0x6F, 0x7F, -1, -1, -1, -1, 0x63],
    STA: [-1, -1, -1, 0x8d, 0x9d, 0x99, 0x85, 0x95, -1, -1, 0x81, 0x91, -1, 0x92, 0x87, 0x97, 0x93, 0x8F, 0x9F, -1, -1, -1, -1, 0x83],
    LDA: [-1, -1, 0xa9, 0xad, 0xbd, 0xb9, 0xa5, 0xb5, -1, -1, 0xa1, 0xb1, -1, 0xB2, 0xA7, 0xB7, 0xB3, 0xAF, 0xBF, -1, -1, -1, -1, 0xA3],
    CMP: [-1, -1, 0xc9, 0xcd, 0xdd, 0xd9, 0xc5, 0xd5, -1, -1, 0xc1, 0xd1, -1, 0xD2, 0xC7, 0xD7, 0xD3, 0xCF, 0xDF, -1, -1, -1, -1, 0xC3],
    SBC: [-1, -1, 0xe9, 0xed, 0xfd, 0xf9, 0xe5, 0xf5, -1, -1, 0xe1, 0xf1, -1, 0xF2, 0xE7, 0xF7, 0xF3, 0xEF, 0xFF, -1, -1, -1, -1, 0xE3],

    JMP: [-1, -1, -1, 0x4c, -1, -1, -1, -1, -1, 0x6c, -1, -1, -1, -1, -1, -1, -1, 0x5C, -1, 0xDC, 0x7C, -1, -1, -1],
    JSR: [-1, -1, -1, 0x20, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0x22, -1, -1, 0xFC, -1, -1, -1],
    JML: [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0x5C, -1, 0xDC, -1, -1, -1, -1],
    JSL: [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0x22, -1, -1, -1, -1, -1, -1],


    //legal opcodes
    ASL: [-1, 0x0a, -1, 0x0e, 0x1e, -1, 0x06, 0x16, -1, -1, -1, -1, -1],
    BCC: [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0x90],
    BCS: [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0xb0],
    BEQ: [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0xf0],
    BIT: [-1, -1, 0x89, 0x2c, 0x3C, -1, 0x24, 0x34, -1, -1, -1, -1, -1],
    BMI: [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0x30],
    BNE: [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0xd0],
    BPL: [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0x10],
    BRK: [0x00, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    BVC: [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0x50],
    BVS: [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 0x70],
    CLC: [0x18, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    CLD: [0xd8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    CLI: [0x58, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    CLV: [0xb8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    CPX: [-1, -1, 0xe0, 0xec, -1, -1, 0xe4, -1, -1, -1, -1, -1, -1],
    CPY: [-1, -1, 0xc0, 0xcc, -1, -1, 0xc4, -1, -1, -1, -1, -1, -1],
    DEC: [0x3A, -1, -1, 0xce, 0xde, -1, 0xc6, 0xd6, -1, -1, -1, -1, -1],
    DEX: [0xca, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    DEY: [0x88, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    INC: [0x1A, -1, -1, 0xee, 0xfe, -1, 0xe6, 0xf6, -1, -1, -1, -1, -1],
    INX: [0xe8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    INY: [0xc8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    LDX: [-1, -1, 0xa2, 0xae, -1, 0xbe, 0xa6, -1, 0xb6, -1, -1, -1, -1],
    LDY: [-1, -1, 0xa0, 0xac, 0xbc, -1, 0xa4, 0xb4, -1, -1, -1, -1, -1],
    LSR: [-1, 0x4a, -1, 0x4e, 0x5e, -1, 0x46, 0x56, -1, -1, -1, -1, -1],
    NOP: [0xea, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    PHA: [0x48, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    PHP: [0x08, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    PLA: [0x68, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    PLP: [0x28, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    ROL: [-1, 0x2a, -1, 0x2e, 0x3e, -1, 0x26, 0x36, -1, -1, -1, -1, -1],
    ROR: [-1, 0x6a, -1, 0x6e, 0x7e, -1, 0x66, 0x76, -1, -1, -1, -1, -1],
    RTI: [0x40, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    RTS: [0x60, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    SEC: [0x38, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    SED: [0xf8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    SEI: [0x78, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    STX: [-1, -1, -1, 0x8e, -1, -1, 0x86, -1, 0x96, -1, -1, -1, -1],
    STY: [-1, -1, -1, 0x8c, -1, -1, 0x84, 0x94, -1, -1, -1, -1, -1],
    TAX: [0xaa, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    TAY: [0xa8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    TSX: [0xba, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    TXA: [0x8a, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    TXS: [0x9a, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    TYA: [0x98, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1]
  },
  //                                                                 10   11   12   13   14   15   16   17   18   19   20   21   22   23
  //             imp  ima  imm  abs  abx  aby    dp  dpx  dpy  ind  idx  idy  rel  idp  idl idly  isy  abl  alx  iax  ial rell   bm   sr

  "steptab": [1, 1, 2, 3, 3, 3, 2, 2, 2, 3, 2, 2, 2, 2, 2, 2, 2, 4, 4, 3, 3, 3, 3, 2],


  parseOpcode: function (s, vars, Parser) {

    if (s.opcode === ".m16") {
      console.log("M16");
      return null;
    }


    var ax = C65816.set[s.opcode];
    var addr, p1, p2, p3, ins, lens, zptest;
    if (ax) {
      lens = [];
      //addr decision
      //    imp  ima imm  abs  abx  aby   zpg  zpx  zpy  ind  izx  izy  rel
      if (!s.params || !s.params.length) {
        addr = 0; //imp
        if (ax[0] === -1) addr = 1;
      } //implied
      else if (s.params.length == 1) {
        p1 = s.params[0];
        addr = 3; //abs
        if (p1 === 'A') {
          addr = 1;
        }
        if (p1[0] === '#') {
          addr = 2; //imm
          //s.params[0] = p1.substr(1);
          lens[1] = function (vars) {
            return Parser.evaluate(p1.substr(1), vars);
          };
        }


        if (p1[0] === '*') {
          addr = 6; //zpg
          //s.params[0] = p1.substr(1);
          lens[1] = function (vars) {
            return Parser.evaluate(p1.substr(1), vars);
          };
        }

        //test na <256
        //var zptest = Parser.evaluate(p1,vars);
        if (vars) {
          try {
            zptest = Parser.evaluate(p1, vars);
            //console.log(p1,zptest);
            if (zptest < 0x100 && ax[6] >= 0) {
              addr = 6;
              lens[1] = function (vars) {
                return Parser.evaluate(p1, vars);
              };
            }
            if (zptest > 0xffff && ax[17] >= 0) {
              addr = 17;
              lens[1] = function (vars) {
                return Parser.evaluate(p1, vars);
              };
              lens[2] = "addr24";
              lens[3] = null;
            }
          } catch (e) {
            //;
          }
        }



        if (p1[0] === '(' && p1[p1.length - 1] === ')') {
          addr = 9;
          p1 = p1.substr(1, p1.length - 2);
          //s.params[0] = p1;
          lens[1] = function (vars) {
            return Parser.evaluate(p1, vars);
          };
          lens[2] = null;
          //65816 hack - dp indirect
          try {
            zptest = Parser.evaluate(p1, vars);
            //console.log(p1,zptest, ax[13]);
            if (zptest < 0x100 && ax[13] >= 0) {
              addr = 13;
              //console.log(p1,zptest, addr);
              lens[1] = function (vars) {
                return Parser.evaluate(p1, vars);
              };
            }


          } catch (e) {}
        }
        if (p1.match(/^\$[0-9a-f]{1,2}$/i) && ax[6] >= 0 && addr != 13) {
          addr = 6; //zero page hack
          lens[1] = function (vars) {
            return Parser.evaluate(p1, vars);
          };
        }

        //65816 DP Indirect Long
        if (p1[0] === '[' && p1[p1.length - 1] === ']') {
          addr = 14;
          if (ax[19] >= 0) addr = 19; //JMP IAX fix
          p1 = p1.substr(1, p1.length - 2);
          //s.params[0] = p1;
          lens[1] = function (vars) {
            return Parser.evaluate(p1, vars);
          };
        }

        if (addr === 3) {
          //maybe 12?
          if (ax[3] == -1 && ax[12] >= 0) {
            addr = 12;
            lens[1] = function (vars) {
              var n = Parser.evaluate(p1, vars) - vars._PC - 2;
              if (n < 0) {
                n = 256 + n;
              }
              return n;
            };
          } else if (ax[3] == -1 && ax[21] >= 0) {
            addr = 21;
            //console.log(s.opcode,addr, ax);
            lens[1] = function (vars) {
              var n = Parser.evaluate(p1, vars) - vars._PC - 2;
              if (n < 0) {
                n = 65536 + n;
              }
              return n;
            };
          } else {
            lens[1] = function (vars) {
              return Parser.evaluate(p1, vars);
            };
            lens[2] = null;
          }
        }
      } else if (s.params.length == 3) {
        //Co dodat? Je to ISY (16), tak jen check parametru
        p1 = s.params[0];
        p2 = s.params[1].toUpperCase();
        p3 = s.params[2].toUpperCase();
        //console.log(p1,p2,p3);
        if (p3 === "Y" && p2 === "S)" && ax[16] >= 0) {
          addr = 16;
          lens[1] = function (vars) {
            return Parser.evaluate(p1.substr(1), vars);
          };
        }
      }

      // 2 parametry
      else if (s.params.length == 2) {
        p1 = s.params[0];
        zptest = null;
        if (vars) {
          try {
            zptest = Parser.evaluate(p1, vars);
          } catch (e) {
            //;
          }
        }
        p2 = s.params[1].toUpperCase();

        //BM mode
        if (ax[22] >= 0) {
          //it should be BM mode
          //it is a hack, but it works
          addr = 22;
          p2 = s.params[1];
          lens[1] = function (vars) {
            return Parser.evaluate(p1, vars);
          };
          lens[2] = function (vars) {
            return Parser.evaluate(p2, vars);
          };
        }

        //65816 sr mode
        else if (p2 === 'S' || p2 === 's') {
          addr = 23;
          lens[1] = function (vars) {
            return Parser.evaluate(p1, vars);
          };
          //lens[2] = null;
        } else if (p1.match(/^\$[0-9a-f]{1,2}$/i)) {
          if (p2 === 'X') {
            addr = 7;
          }
          if (p2 === 'Y') {
            addr = 8;
          }
          lens[1] = function (vars) {
            return Parser.evaluate(p1, vars);
          };
        } else if (p1[0] === '*') {
          p1 = p1.substr(1);
          if (p2 === 'X') {
            addr = 7;
          }
          if (p2 === 'Y') {
            addr = 8;
          }
          lens[1] = function (vars) {
            return Parser.evaluate(p1, vars);
          };
        } else if (zptest && zptest < 0x100 && (ax[7] >= 0 && p2 === 'X') && p1[0] !== '(' && p1[0] !== '[') {
          if (p2 === 'X' && p1[0] !== '(') {
            addr = 7;
          }
          lens[1] = function (vars) {
            return Parser.evaluate(p1, vars);
          };
        } else if (zptest && zptest < 0x100 && (ax[8] >= 0 && p2 === 'Y') && p1[0] !== '(' && p1[0] !== '[') {
          if (p2 === 'Y' && p1[0] !== '(') {
            addr = 8;
          }

          lens[1] = function (vars) {
            return Parser.evaluate(p1, vars);
          };
        } else {


          if (p2 === 'X') {
            addr = 4;
            lens[1] = function (vars) {
              return Parser.evaluate(p1, vars);
            };
            lens[2] = null;

          }
          /////alx - 18 - nutno zptest

          try {
            zptest = Parser.evaluate(p1, vars);
            if (zptest > 0x0ffff && ax[18] >= 0 && p2 === "X") {
              addr = 18;
              lens[1] = function (vars) {
                return Parser.evaluate(p1, vars);
              };
              lens[2] = "addr24";
              lens[3] = null;
            }


          } catch (e) {}


          if (p2 === 'Y' && p1[0] !== '(') {
            addr = 5;
            lens[1] = function (vars) {
              return Parser.evaluate(p1, vars);
            };
            lens[2] = null;

          }
          if (p2 === 'Y' && p1[0] === '(') {
            addr = 11;
            //p1 = p1.substr(1, p1.length-2);
            //s.params[0] = p1;
            lens[1] = function (vars) {
              return Parser.evaluate(p1.substr(1, p1.length - 2), vars);
            };

          }
          if (p2 === 'Y' && p1[0] === '[') {
            addr = 15;
            //p1 = p1.substr(1, p1.length-2);
            //s.params[0] = p1;
            lens[1] = function (vars) {
              return Parser.evaluate(p1.substr(1, p1.length - 2), vars);
            };

          }
          if (p2 === 'X)' && p1[0] === '(') {
            addr = 10;
            if (ax[20] >= 0) {
              addr = 20;
            } //JMP ial hack
            //p1 = p1.substr(1);
            //s.params[0] = p1;
            lens[1] = function (vars) {
              return Parser.evaluate(p1.substr(1), vars);
            };

          }
        }

      }

      //			console.log(p1,p2,addr);

      lens[0] = ax[addr];


      if (lens[0] === null || lens[0] == "-1") {
        //console.log(addr,s);
        throw "Bad addressing mode at line " + s.numline;
      }

      s.admode = addr;
      s.lens = lens;
      s.bytes = C65816.steptab[addr];

      //M16
      if (vars && addr === 2) {
        if (s.opcode === "LDX" || s.opcode === "LDY") {
          if (vars.__MX && vars.__MX === 16) {
            s.bytes++;
            s.lens[2] = null;
          }
        } else if (s.opcode === "ADC" || s.opcode === "AND" || s.opcode === "BIT" || s.opcode === "CMP" ||
          s.opcode === "EOR" || s.opcode === "LDA" || s.opcode === "ORA" || s.opcode === "SBC") {
          if (vars.__AX && vars.__AX === 16) {
            s.bytes++;
            s.lens[2] = null;
          }
        }
      }

      return s;
    }
    return null;
  }
};
