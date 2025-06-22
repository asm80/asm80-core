/*
The MIT License (MIT)

Copyright (c) 2014 Martin Maly, maly@maly.cz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.



 */

export const CDP1802 = {
  endian: true,
  cpu: "cdp1802",
  ext: "a18",
  set: {
    //typ 0 - bez parm.
    //1 - IMM
    //2 - reg
    //3 - addr. 8bit
    //4 - addr 16bit
    //5 - port (1-7)
    "ADC" :[0x74,0],
    "ADCI":[0x7C,1],
    "ADD" :[0xF4,0],
    "ADI" :[0xFC,1],
    "AND" :[0xF2,0],
    "ANI" :[0xFA,1],
    "B1"  :[0x34,3],
    "B2"  :[0x35,3],
    "B3"  :[0x36,3],
    "B4"  :[0x37,3],
    "BDF" :[0x33,3],
    "BN1" :[0x3C,3],
    "BN2" :[0x3D,3],
    "BN3" :[0x3E,3],
    "BN4" :[0x3F,3],
    "BNF" :[0x3B,3],
    "BNQ" :[0x39,3],
    "BNZ" :[0x3A,3],
    "BQ"  :[0x31,3],
    "BR"  :[0x30,3],
    "BZ"  :[0x32,3],
    "DEC" :[0x20,2],
    "DIS" :[0x71,0],
    "GHI" :[0x90,2],
    "GLO" :[0x80,2],
    "IDL" :[0x00,0],
    "INC" :[0x10,2],
    "INP" :[0x68,5],
    "IRX" :[0x60,0],
    "LBDF":[0xC3,4],
    "LBNF":[0xCB,4],
    "LBNQ":[0xC9,4],
    "LBNZ":[0xCA,4],
    "LBQ" :[0xC1,4],
    "LBR" :[0xC0,4],
    "LBZ" :[0xC2,4],
    "LDA" :[0x40,2],
    "LDI" :[0xF8,1],
    "LDN" :[0x00,2],
    "LDX" :[0xF0,0],
    "LDXA":[0x72,0],
    "LSDF":[0xCF,0],
    "LSIE":[0xCC,0],
    "LSKP":[0xC8,0],
    "LSNF":[0xC7,0],
    "LSNQ":[0xC5,0],
    "LSNZ":[0xC6,0],
    "LSQ" :[0xCD,0],
    "LSZ" :[0xCE,0],
    "MARK":[0x79,0],
    "NOP" :[0xC4,0],
    "OR"  :[0xF1,0],
    "ORI" :[0xF9,1],
    "OUT" :[0x60,5],
    "PHI" :[0xB0,2],
    "PLO" :[0xA0,2],
    "REQ" :[0x7A,0],
    "RET" :[0x70,0],
    "SAV" :[0x78,0],
    "SD"  :[0xF5,0],
    "SDB" :[0x75,0],
    "SDBI":[0x7D,1],
    "SDI" :[0xFD,1],
    "SEP" :[0xD0,2],
    "SEQ" :[0x7B,0],
    "SEX" :[0xE0,2],
    "SHL" :[0xFE,0],
    "SHLC":[0x7E,0],
    "SHR" :[0xF6,0],
    "SHRC":[0x76,0],
    "SKP" :[0x38,0],
    "SM"  :[0xF7,0],
    "SMB" :[0x77,0],
    "SMBI":[0x7F,1],
    "SMI" :[0xFF,1],
    "STR" :[0x50,2],
    "STXD":[0x73,0],
    "XOR" :[0xF3,0],
    "XRI" :[0xFB,1]
  },



  parseOpcode: function(s, vars, Parser) {
    var p1;
    var ax = CDP1802.set[s.opcode];

    s.lens=[];

    var fixhash = function(p) {
      return p.replace("#","$");
    };


    if (ax) {
      switch(ax[1]) {
        case 0: //0 params.
          s.lens = [ax[0]];
          s.bytes = 1;
          return s;
        case 1: //IMM param.
          p1 = fixhash(s.params[0]+'');
          s.lens = [ax[0], function(vars){return Parser.evaluate(p1,vars) & 0xFF;}];
          s.bytes = 2;
          return s;

        case 4: //Long address
          p1 = s.params[0]+'';
          s.lens = [ax[0], function(vars){return Parser.evaluate(p1,vars) & 0xFF;}, function(vars){return (Parser.evaluate(p1,vars) >> 8) & 0xFF;}];
          s.bytes = 3;
          return s;

        case 3: //Short address
          p1 = s.params[0]+'';
          s.lens = [ax[0], function(vars){
            var n= Parser.evaluate(p1,vars);
            var nx = n & 0xff;
            var npc = vars._PC;
            var nt = npc & 0xff00 | nx;
            if (nt!=n) throw "Cross page jump";
            return nx;}];
          s.bytes = 2;
          return s;


        case 2: //REGNUM
          p1 = s.params[0]+'';
          var regnum;
          if(p1.length==1) {regnum = parseInt(p1,16);} else
          if((p1.length==2 || p1.length==3) && p1[0].toUpperCase()=='R') {regnum = parseInt(p1.substr(1),10);} else
          {
            try {
              regnum = Parser.evaluate(p1,vars);
            } catch (e){
              regnum = NaN;
            }
          }
          if (isNaN(regnum) || regnum>15 || regnum<0) {
            throw "Unrecognized register: "+p1;
          }
          s.lens = [ax[0]+regnum];
          s.bytes = 1;
          return s;
        case 5: //PORT
          p1 = s.params[0]+'';
          var portnum;
          if(p1.length==1) {portnum = parseInt(p1,10);} else
          {
            try {
              portnum = Parser.evaluate(p1,vars);
            } catch (e){
              portnum = NaN;
            }
          }
          if (isNaN(portnum) || portnum>7 || portnum<1) {
            throw "Unrecognized port: "+p1;
          }
          s.lens = [ax[0]+portnum];
          s.bytes = 1;
          return s;
      }

    }
    // not found
    return null;
  }
};
