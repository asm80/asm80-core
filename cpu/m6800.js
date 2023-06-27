/*
The MIT License (MIT)

Copyright (c) 2014 Martin Maly, maly@maly.cz

6800 part - with a help of Jiri Sutera, jiri.sutera@gmail.com

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

export const M6800 = {
  "set": {
    //          0        1     2      3      4      5       6
    //         INH    DIR   IMM3   EXT     IDX    IMM     REL
    "ABA":  [  0x1B,    -1,    -1,    -1,    -1,    -1,    -1], // Sice je to správně ACC, ale nemá to operandy, takže INH
    "ADCA": [    -1,  0x99,    -1,  0xB9,  0xA9,  0x89,    -1],
    "ADCB": [    -1,  0xD9,    -1,  0xF9,  0xE9,  0xC9,    -1],
    "ADDA": [    -1,  0x9B,    -1,  0xBB,  0xAB,  0x8B,    -1],
    "ADDB": [    -1,  0xDB,    -1,  0xFB,  0xEB,  0xCB,    -1],
    "ANDA": [    -1,  0x94,    -1,  0xB4,  0xA4,  0x84,    -1],
    "ANDB": [    -1,  0xD4,    -1,  0xF4,  0xE4,  0xC4,    -1],
    "ASL":  [    -1,    -1,    -1,  0x78,  0x68,    -1,    -1],
    "ASLA": [  0x48,    -1,    -1,    -1,    -1,    -1,    -1],
    "ASLB": [  0x58,    -1,    -1,    -1,    -1,    -1,    -1],
    "ASR":  [    -1,    -1,    -1,  0x77,  0x67,    -1,    -1],
    "ASRA": [  0x47,    -1,    -1,    -1,    -1,    -1,    -1],
    "ASRB": [  0x57,    -1,    -1,    -1,    -1,    -1,    -1],
    "BCC":  [    -1,    -1,    -1,    -1,    -1,    -1,  0x24],
    "BCS":  [    -1,    -1,    -1,    -1,    -1,    -1,  0x25],
    "BEQ":  [    -1,    -1,    -1,    -1,    -1,    -1,  0x27],
    "BGE":  [    -1,    -1,    -1,    -1,    -1,    -1,  0x2C],
    "BGT":  [    -1,    -1,    -1,    -1,    -1,    -1,  0x2E],
    "BHI":  [    -1,    -1,    -1,    -1,    -1,    -1,  0x22],
    "BITA": [    -1,  0x95,    -1,  0xB5,  0xA5,  0x85,    -1],
    "BITB": [    -1,  0xD5,    -1,  0xF5,  0xE5,  0xC5,    -1],
    "BLE":  [    -1,    -1,    -1,    -1,    -1,    -1,  0x2F],
    "BLS":  [    -1,    -1,    -1,    -1,    -1,    -1,  0x23],
    "BLT":  [    -1,    -1,    -1,    -1,    -1,    -1,  0x2D],
    "BMI":  [    -1,    -1,    -1,    -1,    -1,    -1,  0x2B],
    "BNE":  [    -1,    -1,    -1,    -1,    -1,    -1,  0x26],
    "BPL":  [    -1,    -1,    -1,    -1,    -1,    -1,  0x2A],
    "BRA":  [    -1,    -1,    -1,    -1,    -1,    -1,  0x20],
    "BSR":  [    -1,    -1,    -1,    -1,    -1,    -1,  0x8D],
    "BVC":  [    -1,    -1,    -1,    -1,    -1,    -1,  0x28],
    "BVS":  [    -1,    -1,    -1,    -1,    -1,    -1,  0x29],
    "CBA":  [  0x11,    -1,    -1,    -1,    -1,    -1,    -1],
    "CLC":  [  0x0C,    -1,    -1,    -1,    -1,    -1,    -1],
    "CLI":  [  0x0E,    -1,    -1,    -1,    -1,    -1,    -1],
    "CLR":  [    -1,    -1,    -1,  0x7F,  0x6F,    -1,    -1], //nutno osetrit ACC dle registru A/B - pokud B, tak pricist 0x10
    "CLRA": [  0x4F,    -1,    -1,    -1,    -1,    -1,    -1], //nutno osetrit ACC dle registru A/B - pokud B, tak pricist 0x10
    "CLRB": [  0x5F,    -1,    -1,    -1,    -1,    -1,    -1], //nutno osetrit ACC dle registru A/B - pokud B, tak pricist 0x10
    "CLV":  [  0x0A,    -1,    -1,    -1,    -1,    -1,    -1],
    "CMPA": [    -1,  0x91,    -1,  0xB1,  0xA1,  0x81,    -1],
    "CMPB": [    -1,  0xD1,    -1,  0xF1,  0xE1,  0xC1,    -1],
    "COM":  [    -1,    -1,    -1,  0x73,  0x63,    -1,    -1], //nutno osetrit ACC dle registru A/B - pokud B, tak pricist 0x10
    "COMA": [  0x43,    -1,    -1,    -1,    -1,    -1,    -1], //nutno osetrit ACC dle registru A/B - pokud B, tak pricist 0x10
    "COMB": [  0x53,    -1,    -1,    -1,    -1,    -1,    -1], //nutno osetrit ACC dle registru A/B - pokud B, tak pricist 0x10
    "CPX":  [    -1,  0x9C,  0x8C,  0xBC,  0xAC,    -1,    -1],
    "DAA":  [  0x19,    -1,    -1,    -1,    -1,    -1,    -1],
    "DEC":  [    -1,    -1,    -1,  0x7A,  0x6A,    -1,    -1],
    "DECA": [  0x4A,    -1,    -1,    -1,    -1,    -1,    -1],
    "DECB": [  0x5A,    -1,    -1,    -1,    -1,    -1,    -1],
    "DES":  [  0x34,    -1,    -1,    -1,    -1,    -1,    -1],
    "DEX":  [  0x09,    -1,    -1,    -1,    -1,    -1,    -1],
    "EORA": [    -1,  0x98,    -1,  0xB8,  0xA8,  0x88,    -1],
    "EORB": [    -1,  0xD8,    -1,  0xF8,  0xE8,  0xC8,    -1],
    "INC":  [    -1,    -1,    -1,  0x7C,  0x6C,    -1,    -1], //nutno osetrit ACC dle registru A/B - pokud B, tak pricist 0x10
    "INCA": [  0x4C,    -1,    -1,    -1,    -1,    -1,    -1], //nutno osetrit ACC dle registru A/B - pokud B, tak pricist 0x10
    "INCB": [  0x5C,    -1,    -1,    -1,    -1,    -1,    -1], //nutno osetrit ACC dle registru A/B - pokud B, tak pricist 0x10
    "INS":  [  0x31,    -1,    -1,    -1,    -1,    -1,    -1],
    "INX":  [  0x08,    -1,    -1,    -1,    -1,    -1,    -1],
    "JMP":  [    -1,    -1,    -1,  0x7E,  0x6E,    -1,    -1],
    "JSR":  [    -1,    -1,    -1,  0xBD,  0xAD,    -1,    -1],
    "LDAA": [    -1,  0x96,    -1,  0xB6,  0xA6,  0x86,    -1],
    "LDAB": [    -1,  0xD6,    -1,  0xF6,  0xE6,  0xC6,    -1],
    "LDS":  [    -1,  0x9E,  0x8E,  0xBE,  0xAE,    -1,    -1],
    "LDX":  [    -1,  0xDE,  0xCE,  0xFE,  0xEE,    -1,    -1],
    "LSR":  [    -1,    -1,    -1,  0x74,  0x64,    -1,    -1], //nutno osetrit ACC dle registru A/B - pokud B, tak pricist 0x10
    "LSRA": [  0x44,    -1,    -1,    -1,    -1,    -1,    -1], //nutno osetrit ACC dle registru A/B - pokud B, tak pricist 0x10
    "LSRB": [  0x54,    -1,    -1,    -1,    -1,    -1,    -1], //nutno osetrit ACC dle registru A/B - pokud B, tak pricist 0x10
    "NEG":  [    -1,    -1,    -1,  0x70,  0x60,    -1,    -1], //nutno osetrit ACC dle registru A/B - pokud B, tak pricist 0x10
    "NEGA": [  0x40,    -1,    -1,    -1,    -1,    -1,    -1], //nutno osetrit ACC dle registru A/B - pokud B, tak pricist 0x10
    "NEGB": [  0x50,    -1,    -1,    -1,    -1,    -1,    -1], //nutno osetrit ACC dle registru A/B - pokud B, tak pricist 0x10
    "NOP":  [  0x01,    -1,    -1,    -1,    -1,    -1,    -1],
    "ORAA": [    -1,  0x9A,    -1,  0xBA,  0xAA,  0x8A,    -1],
    "ORAB": [    -1,  0xDA,    -1,  0xFA,  0xEA,  0xCA,    -1],
    "PSHA": [  0x36,    -1,    -1,    -1,    -1,    -1,    -1], //nutno osetrit ACC dle registru A/B - pokud B, tak pricist 0x01 !
    "PSHB": [  0x37,    -1,    -1,    -1,    -1,    -1,    -1], //nutno osetrit ACC dle registru A/B - pokud B, tak pricist 0x01 !
    "PULA": [  0x32,    -1,    -1,    -1,    -1,    -1,    -1], //nutno osetrit ACC dle registru A/B - pokud B, tak pricist 0x01 !
    "PULB": [  0x33,    -1,    -1,    -1,    -1,    -1,    -1], //nutno osetrit ACC dle registru A/B - pokud B, tak pricist 0x01 !
    "ROL":  [    -1,    -1,    -1,  0x79,  0x69,    -1,    -1], //nutno osetrit ACC dle registru A/B - pokud B, tak pricist 0x10
    "ROLA": [  0x49,    -1,    -1,    -1,    -1,    -1,    -1], //nutno osetrit ACC dle registru A/B - pokud B, tak pricist 0x10
    "ROLB": [  0x59,    -1,    -1,    -1,    -1,    -1,    -1], //nutno osetrit ACC dle registru A/B - pokud B, tak pricist 0x10
    "ROR":  [    -1,    -1,    -1,  0x76,  0x66,    -1,    -1], //nutno osetrit ACC dle registru A/B - pokud B, tak pricist 0x10
    "RORA": [  0x46,    -1,    -1,    -1,    -1,    -1,    -1], //nutno osetrit ACC dle registru A/B - pokud B, tak pricist 0x10
    "RORB": [  0x56,    -1,    -1,    -1,    -1,    -1,    -1], //nutno osetrit ACC dle registru A/B - pokud B, tak pricist 0x10
    "RTI":  [  0x3B,    -1,    -1,    -1,    -1,    -1,    -1],
    "RTS":  [  0x39,    -1,    -1,    -1,    -1,    -1,    -1],
    "SBA":  [  0x10,    -1,    -1,    -1,    -1,    -1,    -1],
    "SBCA": [    -1,  0x92,    -1,  0xB2,  0xA2,  0x82,    -1],
    "SBCB": [    -1,  0xD2,    -1,  0xF2,  0xE2,  0xC2,    -1],
    "SEC":  [  0x0D,    -1,    -1,    -1,    -1,    -1,    -1],
    "SEI":  [  0x0F,    -1,    -1,    -1,    -1,    -1,    -1],
    "SEV":  [  0x0B,    -1,    -1,    -1,    -1,    -1,    -1],
    "STAA": [    -1,  0x97,    -1,  0xB7,  0xA7,    -1,    -1],
    "STAB": [    -1,  0xD7,    -1,  0xF7,  0xE7,    -1,    -1],
    "STS":  [    -1,  0x9F,    -1,  0xBF,  0xAF,    -1,    -1],
    "STX":  [    -1,  0xDF,    -1,  0xFF,  0xEF,    -1,    -1],
    "SUBA": [    -1,  0x90,    -1,  0xB0,  0xA0,  0x80,    -1],
    "SUBB": [    -1,  0xD0,    -1,  0xF0,  0xE0,  0xC0,    -1],
    "SWI":  [  0x3F,    -1,    -1,    -1,    -1,    -1,    -1],
    "TAB":  [  0x16,    -1,    -1,    -1,    -1,    -1,    -1],
    "TAP":  [  0x06,    -1,    -1,    -1,    -1,    -1,    -1],
    "TBA":  [  0x17,    -1,    -1,    -1,    -1,    -1,    -1],
    "TPA":  [  0x07,    -1,    -1,    -1,    -1,    -1,    -1],
    "TST":  [    -1,    -1,    -1,  0x7D,  0x6D,    -1,    -1], //nutno osetrit ACC dle registru A/B - pokud B, tak pricist 0x10
    "TSTA": [  0x4D,    -1,    -1,    -1,    -1,    -1,    -1], //nutno osetrit ACC dle registru A/B - pokud B, tak pricist 0x10
    "TSTB": [  0x5D,    -1,    -1,    -1,    -1,    -1,    -1], //nutno osetrit ACC dle registru A/B - pokud B, tak pricist 0x10
    "TSX":  [  0x30,    -1,    -1,    -1,    -1,    -1,    -1],
    "TXS":  [  0x35,    -1,    -1,    -1,    -1,    -1,    -1],
    "WAI":  [  0x3E,    -1,    -1,    -1,    -1,    -1,    -1]
  },



  "parseOpcode": function(s,vars, Parser) {
    var p1;
    var auxopcode = s.opcode;
    //fix param
    if (!s.opcode) return null;
    //console.log(s,s.params, s.opcode)

    if (s.params && auxopcode.length==3) {
      if (s.params[0]=="A" ||s.params[0]=="B" ) {
        if ((s.params[0].indexOf(" ")==1) || (s.params[0].length==1)) {
          var p0 = s.params[0]+'';
          s.reg6800 = p0.substr(0,1).toUpperCase();
          s.params[0]= p0.substr(2).trim();

          s.paramstring = s.paramstring.substr(2).trim();
          auxopcode+=s.reg6800;

        }
      }
    };



    var ax = M6800.set[auxopcode];

    s.opcode = auxopcode;
    s.lens=[];

    if (ax) {
      if (ax[0]>=0) { //0 params.
        if (ax[0]>0xff) {
          s.lens = [ax[0]>>8,ax[0]&0xff];
          s.bytes = 2;
          return s;
        }
        s.lens = [ax[0]];
        s.bytes = 1;
        return s;
      }
      // vice parametru...
      //
      p1 = s.params[0]+'';

      if (s.params[0] && s.params[0].length>0 && !s.params[1]) {
        //1 parametr
        //DIR(1), EXT(3) nebo IMM(5), IMMdlouhe(2), mozna i REL(6)
        var o1 = ax[1];
        var o2 = ax[2];
        var o3 = ax[3];
        var o5 = ax[5];
        var o6 = ax[6];

        if (o6>-1) {
          //REL
          s.lens[0] = o6;
          s.lens[1] = function(vars){
                        var n= Parser.evaluate(p1,vars) - vars._PC-2;
                        if (n<0) {n=256+n;}
                        return n;};
          s.bytes = 2;
          return s;

        }

        if (p1[0]=='#' && o2>-1) {
          //IMM3
          s.lens[0] = o2;
          s.lens[1] = function(vars){return Parser.evaluate(p1.substr(1),vars);};
          s.lens[2] = null;
          s.bytes = 3;
          return s;
        }
        if (p1[0]=='#' && o5>-1) {
          //IMM
          s.lens[0] = o5;
          s.lens[1] = function(vars){return Parser.evaluate(p1.substr(1),vars);};
          s.bytes = 2;
          return s;
        }

        if (o1>-1 && vars) {
          //otestujeme, jestli se kvalifikuje na DIR
          var zptest = null;
          try {
            zptest = Parser.evaluate(p1,vars);
          } catch(e) {;}

          if (zptest<256 && zptest>=0) {
            //je to DIR
            s.lens[0] = o1;
            s.lens[1] = function(vars){return Parser.evaluate(p1,vars);};
            s.bytes = 2;
            return s;
          }

        }

        if (o3>-1) {
          //IMM
          s.lens[0] = o3;
          s.lens[1] = function(vars){return Parser.evaluate(p1,vars);};
          s.lens[2] = null;
          s.bytes = 3;
          return s;
        }



      }

      //2 parms
      if (ax[4]>-1) {
        if (s.params[1].toUpperCase()=='X') {
          s.lens[0] = ax[4];
          s.lens[1] = function(vars){return Parser.evaluate(p1,vars);};
          s.bytes = 2;
          return s;
        }
      }
    }
    // not found
    return null;
  },
  "endian":true
};
