export const Z80 = {
  set: {
    // 0 nebo 1 parametr
    //         0     1     2       3      4      5     6       7      8      9     10    11     12    13
    //         0 /  /A,r/ A,N /   R8  /   N   / R16 / R16A /  POP   COND /  IMM /  RST /  REL  / ABS / (HL)
//		ADC: [    -1,    -1,  0x88,  0xce,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1],
    DEC: [    -1,    -1,    -1,    -1,  0x05,    -1,  0x0b,    -1,    -1,    -1,    -1,    -1,    -1,    -1],
    INC: [    -1,    -1,    -1,    -1,  0x04,    -1,  0x03,    -1,    -1,    -1,    -1,    -1,    -1,    -1],
    AND: [    -1,    -1,    -1,    -1,  0xA0,  0xe6,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1],
    OR:  [    -1,    -1,    -1,    -1,  0xb0,  0xf6,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1],
    XOR: [    -1,    -1,    -1,    -1,  0xa8,  0xee,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1],
    SUB: [    -1,    -1,    -1,    -1,  0x90,  0xd6,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1],
    CP:  [    -1,    -1,    -1,    -1,  0xb8,  0xfe,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1],
    SLA: [    -1,    -1,    -1,    -1,0xcb20,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1],
    SRA: [    -1,    -1,    -1,    -1,0xcb28,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1],
    SLL: [    -1,    -1,    -1,    -1,0xcb30,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1],
    SRL: [    -1,    -1,    -1,    -1,0xcb38,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1],
    RR:  [    -1,    -1,    -1,    -1,0xcb18,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1],
    RL:  [    -1,    -1,    -1,    -1,0xcb10,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1],
    RRC: [    -1,    -1,    -1,    -1,0xcb08,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1],
    RLC: [    -1,    -1,    -1,    -1,0xcb00,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1],
    POP: [    -1,    -1,    -1,    -1,    -1,    -1,    -1,  0xc1,    -1,    -1,    -1,    -1,    -1,    -1],
    PUSH:[    -1,    -1,    -1,    -1,    -1,    -1,    -1,  0xc5,    -1,    -1,    -1,    -1,    -1,    -1],
    RET: [  0xc9,    -1,    -1,    -1,    -1,    -1,    -1,    -1,  0xc0,    -1,    -1,    -1,    -1,    -1],
    IM:  [    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,0xed46,    -1,    -1,    -1,    -1],
    RST: [    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,  0xc7,    -1,    -1,    -1],
    CALL:[    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,  0xcd,    -1],
    JP:  [    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,  0xc3,  0xe9],
    DJNZ:[    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,  0x10,    -1,    -1],
    JR:  [    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,  0x18,    -1,    -1],
    NOP: [     0,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1],
    CCF: [  0x3f,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1],
    CPD: [0xeda9,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1],
    CPDR:[0xedb9,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1],
    CPI: [0xeda1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1],
    CPIR:[0xedb1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1],
    CPL: [  0x2f,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1],
    DAA: [  0x27,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1],
    DI:  [  0xf3,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1],
    EI:  [  0xfb,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1],
    EXX: [  0xd9,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1],
    IND: [0xedaA,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1],
    INDR:[0xedbA,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1],
    INI: [0xeda2,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1],
    INIR:[0xedb2,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1],
    LDD: [0xeda8,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1],
    LDDR:[0xedb8,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1],
    LDI: [0xeda0,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1],
    LDIR:[0xedb0,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1],
    OUTD:[0xedab,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1],
    OTDR:[0xedbb,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1],
    OUTI:[0xeda3,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1],
    OTIR:[0xedb3,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1],
    HALT:[  0x76,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1],
    NEG: [0xed44,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1],
    RETI:[0xed4d,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1],
    RETN:[0xed45,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1],
    RLA: [  0x17,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1],
    RLCA:[  0x07,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1],
    RLD: [0xed6F,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1],
    RRA: [  0x1f,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1],
    RRCA:[  0x0f,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1],
    RRD: [0xed67,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1],
    SCF: [  0x37,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1,    -1],
},
set2: {
    // two params
      //    0      1    2       3      4     5
      // a,r8 /   a,n/HL,r16/XX,r16/  b,r8/  c,ABS/
    EX:  [     0],
    LD:  [     0],
        ADC: [  0x88,  0xce,0xed4a],
    ADD: [  0x80,  0xc6,  0x09,  0x09],
    SBC: [  0x98,  0xde,0xed42],
    BIT: [    -1,    -1,    -1,    -1,0xcb40],
    RES: [    -1,    -1,    -1,    -1,0xcb80],
    SET: [    -1,    -1,    -1,    -1,0xcbc0],
    CAL2:[    -1,    -1,    -1,    -1,    -1,  0xc4],
    JP2: [    -1,    -1,    -1,    -1,    -1,  0xc2],
    JR2: [    -1,    -1,    -1,    -1,    -1,  0x20],
    IN:  [0xed40,  0xdb,    -1,    -1,    -1,    -1],
    OUT: [0xed41,  0xd3,    -1,    -1,    -1,    -1]
  },

//r16 = BC, DE, HL, SP
//r16a = BC, DE, HL, AF

  R8: {
    DEC:3,INC:3
  },

  R16: {
    DEC:4,INC:4, POP:4, PUSH:4
  },

/*


 */

  parseOpcode: function(s, vars, Parser) {

    var R8 = function(reg) {
      var n = ["B","C","D","E","H","L","~","A"].indexOf(reg.toUpperCase());
      if (reg.toUpperCase()=="(HL)") return 6;
      return n;
    };
    var R8F = function(reg) {
      return ["B","C","D","E","H","L","F","A"].indexOf(reg.toUpperCase());
    };
    var R16 = function(reg) {
      var n = ["BC","DE","HL","SP"].indexOf(reg.toUpperCase());
      return n;
    };
    var R16IX = function(reg) {
      var n = ["BC","DE","IX","SP"].indexOf(reg.toUpperCase());
      return n;
    };
    var R16IY = function(reg) {
      var n = ["BC","DE","IY","SP"].indexOf(reg.toUpperCase());
      return n;
    };
    var R16A = function(reg) {
      var n = ["BC","DE","HL","AF"].indexOf(reg.toUpperCase());
      return n;
    };
    var COND = function(reg) {
      var n = ["NZ","Z","NC","C","PO","PE","P","M"].indexOf(reg.toUpperCase());
      return n;
    };
    var LINK = function(par) {
      if (par[0]=='(' && par[par.length-1]==')') {
        return par.substr(1,par.length-2);
      } else return null;
    };

    var indexes = function(par) {
      var disp=null;
      var prefix=null;
      var idx = par.replace(/\s/g,"").substr(0,4).toUpperCase();

      if (idx=='(IX)') {
        disp = "0";
        prefix = 0xdd;
        par="(HL)";
      }
      if (idx=='(IX+') {
        disp = par.substr(4,par.length-5);
        prefix = 0xdd;
        par="(HL)";
      }
      if (idx=='(IX-') {
        disp = "-"+par.substr(4,par.length-5);
        prefix = 0xdd;
        par="(HL)";
      }
      if (idx=='(IY)') {
        disp = "0";
        prefix = 0xfd;
        par="(HL)";
      }
      if (idx=='(IY+') {
        disp = par.substr(4,par.length-5);
        prefix = 0xfd;
        par="(HL)";
      }
      if (idx=='(IY-') {
        disp = "-"+par.substr(4,par.length-5);
        prefix = 0xfd;
        par="(HL)";
      }
      if (idx=='IX') {
        prefix = 0xdd;
        par = "HL";
      }
      if (idx=='IY') {
        prefix = 0xFd;
        par = "HL";
      }
      if (idx=='IXL') {
        prefix = 0xdd;
        par = "L";
      }
      if (idx=='IXH') {
        prefix = 0xdd;
        par = "H";
      }
      if (idx=='IYL') {
        prefix = 0xFd;
        par = "L";
      }
      if (idx=='IYH') {
        prefix = 0xFd;
        par = "H";
      }
      //console.log(idx,par,disp,prefix)
      return [par,disp,prefix];
    };

    var ax = Z80.set[s.opcode];
    var ax2 = Z80.set2[s.opcode];
    var op=-1, bytes=1,lens=[];
    var prefix=null, disp = null;
    var reg, param8, mode, idx;

    if (ax && !ax2) {
      if ((s.params?s.params.length:0) > 1) {
        if (s.opcode!=="JP" && s.opcode!=="JR" && s.opcode!=="CALL")
        throw "One parameter needed";
      }
    }


    if (!ax && ax2) {
      ax = ax2;
      if ((s.params?s.params.length:0) !== 2) {
        throw "Two parameters needed";
      }
    }

    s.wia = 1; //Where is address (for relocation)

    if (ax) {
      if (!s.params || s.params.length===0) {
        //no parameters
        op = ax[0];
      } else if(s.params.length==1) {
        var par = s.params[0];
        idx = indexes(par);
        par = idx[0];
        disp= idx[1];
        prefix = idx[2];
        if (ax[11]>0) {
          //rel jump
          s.bytes = 2;
          s.lens = [];
          s.lens[0] = ax[11];
          s.lens[1] = function(vars){
            var lab = Parser.evaluate(par,vars);
            var pc = vars._PC+2;
            var disp = lab - pc;
            if (disp>127) throw "Target is out of relative jump reach";
            if (disp<-128) throw "Target is out of relative jump reach";
            if (disp<0) {disp = 256+disp;}
            return disp;
            };
          return s;
        }

        if (ax[12]>0) {
          //abs jump
          s.lens = [];
          if (par.toUpperCase() =='(HL)' && ax[13]>0) {
            if (!idx[2]) {
            s.bytes = 1;
            s.lens[0] = ax[13];}
            else {
              s.bytes = 2;
              s.lens[0] = idx[2];
              s.lens[1] = ax[13];
            }
            return s;
          }
          /*
          if (par.toUpperCase() =='(IX)' && ax[13]>0) {
            s.bytes = 2;
            s.lens[0] = 0xdd;
            s.lens[1] = ax[13];
            return s;
          }
          if (par.toUpperCase() =='(IY)' && ax[13]>0) {
            s.bytes = 2;
            s.lens[0] = 0xfd;
            s.lens[1] = ax[13];
            return s;
          }
          */
          s.bytes = 3;
          s.lens[0] = ax[12];
          s.lens[1] = function(vars){return Parser.evaluate(par,vars); };
          s.lens[2] = null;
          return s;
        }
        if (ax[9]>0) {
          //IM x
          s.bytes = 2;
          s.lens = [];
          s.lens[0] = 0xed;
          mode = Parser.evaluate(par);
          switch (mode){
            case 0: s.lens[1] = 0x46; return s;
            case 1: s.lens[1] = 0x56; return s;
            case 2: s.lens[1] = 0x5e; return s;
          }
          throw "Invalid interrupt mode";
        }
        if (ax[10]>0) {
          //RST x
          s.bytes = 1;
          s.lens = [];
          mode = Parser.evaluate(par);
          switch (mode){
            case 0x00: s.lens[0] = 0xc7; return s;
            case 0x08: s.lens[0] = 0xcf; return s;
            case 0x10: s.lens[0] = 0xd7; return s;
            case 0x18: s.lens[0] = 0xdf; return s;
            case 0x20: s.lens[0] = 0xe7; return s;
            case 0x28: s.lens[0] = 0xef; return s;
            case 0x30: s.lens[0] = 0xf7; return s;
            case 0x38: s.lens[0] = 0xff; return s;
          }
          throw "Invalid RST";
        }

        reg = COND(par);
        if (reg >= 0 && ax[8]>0){
          op = ax[8];
          if (op>0) {
            op += reg<<3;
          }
        } else {

        reg = R16(par);
        if (reg>=0 && ax[6]>=0) {
          //instr R16
          op = ax[6];
          if (op>0) {
            if (Z80.R16[s.opcode]) {
              op+=reg<<Z80.R16[s.opcode];
            } else {
              op+=reg;
            }
          }
        } else {

        reg = R16A(par);
        if (reg>=0 && ax[7]>=0) {
          //instr R16
          op = ax[7];
          if (op>0) {
            if (Z80.R16[s.opcode]) {
              op+=reg<<Z80.R16[s.opcode];
            } else {
              op+=reg;
            }
          }
        } else {
          reg = R8(par);
          if (reg >=0 && ax[4]>0) {
            // INSTR R8
            op = ax[4];
            //console.log(par, op, reg, s)
            if (op>0) {
              if (Z80.R8[s.opcode]) {
                op+=reg<<Z80.R8[s.opcode];
              } else {
                op+=reg;
              }
            }
          } else {
            op = ax[5];
            param8 = function(vars){return Parser.evaluate(par,vars);};
          }
        }
        }
        }
      } else if(s.params.length==2) {
        var par1 = s.params[0];
        var par2 = s.params[1];
        //var idx;

        //console.log(s,ax)

        //speciality

        //instrukce EX
        if (s.opcode == 'EX') {
          if (par1.toUpperCase()=="DE" && par2.toUpperCase()=="HL") {
            s.lens = [0xeb];
            s.bytes = 1;
            return s;
          }
          if (par1.toUpperCase()=="AF" && par2.toUpperCase()=="AF'") {
            s.lens = [0x08];
            s.bytes = 1;
            return s;
          }
          if (par1.toUpperCase()=="(SP)" && par2.toUpperCase()=="HL") {
            s.lens = [0xe3];
            s.bytes = 1;
            return s;
          }
          if (par1.toUpperCase()=="(SP)" && par2.toUpperCase()=="IX") {
            s.lens = [0xdd,0xe3];
            s.bytes = 2;
            return s;
          }
          if (par1.toUpperCase()=="(SP)" && par2.toUpperCase()=="IY") {
            s.lens = [0xfd,0xe3];
            s.bytes = 2;
            return s;
          }

          return null;
        }
        if (s.opcode == 'CALL') {
          ax = Z80.set2.CAL2;
          reg = COND(par1);
          if (reg >= 0 && ax[5]>0){
            op = ax[5];
            if (op>0) {
              op += reg<<3;
              s.bytes = 3;
              s.lens=[];
              s.lens[0] = op;
              s.lens[1] = function(vars){return Parser.evaluate(par2,vars); };
              s.lens[2] = null;
              return s;

            }
          }
          return null;
        }
        if (s.opcode == 'JP') {
          ax = Z80.set2.JP2;
          reg = COND(par1);
          if (reg >= 0 && ax[5]>0){
            op = ax[5];
            if (op>0) {
              op += reg<<3;
              s.bytes = 3;
              s.lens=[];
              s.lens[0] = op;
              s.lens[1] = function(vars){return Parser.evaluate(par2,vars); };
              s.lens[2] = null;
              return s;

            }
          }
          return null;
        }
        if (s.opcode == 'JR') {
          ax = Z80.set2.JR2;
          reg = COND(par1);
          if (reg >= 0 && reg <4 && ax[5]>0){
            op = ax[5];
            if (op>0) {
              op += reg<<3;
              s.bytes = 2;
              s.lens = [];
              s.lens[0] = op;
              s.lens[1] = function(vars){
                var lab = Parser.evaluate(par2,vars);
                var pc = vars._PC+2;
                var disp = lab - pc;
                if (disp>127) throw "Target is out of relative jump reach";
                if (disp<-128) throw "Target is out of relative jump reach";
                if (disp<0) {disp = 256+disp;}
                return disp;
                };
              return s;

            }
          }
          return null;
        }

        if (s.opcode == 'IN') {
          if (par2.toUpperCase()=='(C)') {
            reg = R8F(par1);
            if (reg>=0 && ax[0]) {
              s.lens=[0xed, 0x40+(reg<<3)];
              s.bytes = 2;
              return s;
            }
          }
          if (par1.toUpperCase()=='A') {
            s.lens = [ax[1]];
            s.lens[1] = function(vars){return Parser.evaluate(par2,vars);};
            s.bytes = 2;
            return s;
          }
          return null;
        }
        if (s.opcode == 'OUT') {
          if (par1.toUpperCase()=='(C)') {
            reg = R8F(par2);
            if (reg>=0 && ax[0]) {
              s.lens=[0xed, 0x41+(reg<<3)];
              s.bytes = 2;
              return s;
            }
          }
          if (par2.toUpperCase()=='A') {
            s.lens = [ax[1]];
            s.lens[1] = function(vars){return Parser.evaluate(par1,vars);};
            s.bytes = 2;
            return s;
          }
          return null;
        }

        if (s.opcode == 'LD') {
          //MASAKR
          //

          if (par1.toUpperCase()=='A' && par2.toUpperCase()=='R') {
            s.bytes=2;
            s.lens=[0xed, 0x5f];
            return s;
          }
          if (par1.toUpperCase()=='A' && par2.toUpperCase()=='I') {
            s.bytes=2;
            s.lens=[0xed, 0x57];
            return s;
          }
          if (par1.toUpperCase()=='R' && par2.toUpperCase()=='A') {
            s.bytes=2;
            s.lens=[0xed, 0x4f];
            return s;
          }
          if (par1.toUpperCase()=='I' && par2.toUpperCase()=='A') {
            s.bytes=2;
            s.lens=[0xed, 0x47];
            return s;
          }

          //Syntaktic sugar
          if (par1.toUpperCase()=='HL' && par2.toUpperCase()=='DE') {
            s.bytes=2;s.lens=[0x62, 0x6b];return s;
          }
          if (par1.toUpperCase()=='HL' && par2.toUpperCase()=='BC') {
            s.bytes=2;s.lens=[0x60, 0x69];return s;
          }
          if (par1.toUpperCase()=='DE' && par2.toUpperCase()=='HL') {
            s.bytes=2;s.lens=[0x54, 0x5d];return s;
          }
          if (par1.toUpperCase()=='DE' && par2.toUpperCase()=='BC') {
            s.bytes=2;s.lens=[0x50, 0x59];return s;
          }
          if (par1.toUpperCase()=='BC' && par2.toUpperCase()=='HL') {
            s.bytes=2;s.lens=[0x44, 0x4d];return s;
          }
          if (par1.toUpperCase()=='BC' && par2.toUpperCase()=='DE') {
            s.bytes=2;s.lens=[0x42, 0x4b];return s;
          }


          var idx1 = indexes(par1);
          par1 = idx1[0];
          disp= idx1[1];
          prefix = idx1[2];
          var idx2 = indexes(par2);
          par2 = idx2[0];
          if (idx2[1]&&disp) {throw "Invalid parameters - two indexed";}
          if (idx2[1]) disp= idx2[1];
          if (idx2[2]&&prefix) {throw "Invalid parameters - two prefixed";}
          if (idx2[2]) prefix = idx2[2];
          var reg1 = R8(par1);
          var reg2 = R8(par2);
          lens=[];
          //console.log(reg1,reg2,par1,par2,disp,prefix);
          if (reg1 >=0 && reg2>=0) {
            //ld r8,r8
            s.bytes=1;
            lens[0] = 0x40 + (reg1<<3) + reg2;

          }
          if (par1.toUpperCase()=='A' && par2.toUpperCase()=='(BC)') {
            s.bytes=1;s.lens=[0x0a];return s;
          }
          if (par1.toUpperCase()=='A' && par2.toUpperCase()=='(DE)') {
            s.bytes=1;s.lens=[0x1a];return s;
          }
          if (par1.toUpperCase()=='A' && LINK(par2) && s.bytes===0) {
            s.bytes=3;s.lens=[0x3a,function(vars){return Parser.evaluate(LINK(par2),vars); },null];return s;
          }
          if (par1.toUpperCase()=='(BC)' && par2.toUpperCase()=='A') {
            s.bytes=1;s.lens=[0x02];return s;
          }
          if (par1.toUpperCase()=='(DE)' && par2.toUpperCase()=='A') {
            s.bytes=1;s.lens=[0x12];return s;
          }
          if (LINK(par1) && par2.toUpperCase()=='A' && s.bytes===0) {
            s.bytes=3;s.lens=[0x32,function(vars){return Parser.evaluate(LINK(par1),vars); },null];return s;
          }

          // FIX 6.4.2015 - LD A,(0123)
          //

          if (reg1==7 && reg2<0 && par2[0]=='(') {
            s.bytes=3;
            lens[0] = 0x3a;
            lens[1] = function(vars){return Parser.evaluate(par2,vars);};
            lens[2] = null;
            return s;
          }

          if (reg1 >= 0 && reg2<0 && par2[0]=='(') {
            //ld c,(1234)
            throw "Invalid combination: general register and memory";
          }

          if (reg1 >= 0 && reg2<0) {
            //ld r8,n
            s.bytes=2;
            lens[0] = 0x06 + (reg1<<3);
            lens[1] = function(vars){return Parser.evaluate(par2,vars);};
          }

          //16bit
          if (s.bytes===0) {
            reg1 = R16(par1);
            reg2 = R16(par2);
            var link1 = LINK(par1);
            var link2 = LINK(par2);
            //console.log(reg1,reg2,par1,par2,disp,prefix, link1, link2);
            if (reg1>=0 && !link2) {
              s.bytes = 3;
              lens = [0x01 + (reg1<<4), function(vars){return Parser.evaluate(par2,vars);}, null];
              //return s;
            }
            if (reg1>=0 && link2) {
              s.bytes = ([4,4,3,4])[reg1];
              lens = [0xed, 0x4b + (reg1<<4), function(vars){return Parser.evaluate(link2,vars);}, null];
              s.wia = 2; //Where is address (for relocation)
              if (s.bytes==3) {
                s.wia = 1; //Where is address (for relocation)
                lens = [0x2a, function(vars){return Parser.evaluate(link2,vars);}, null];
              }
              //return s;
            }
            if (link1 && reg2>=0) {
              s.bytes = ([4,4,3,4])[reg2];
              s.wia = 2; //Where is address (for relocation)
              lens = [0xed, 0x43 + (reg2<<4), function(vars){return Parser.evaluate(link1,vars);}, null];
              if (s.bytes==3) {
                s.wia = 1; //Where is address (for relocation)
                lens = [0x22, function(vars){return Parser.evaluate(link1,vars);}, null];
              }
              //return s;
            }

            if (reg1==3 && reg2==2) {
              s.bytes = 1;
              lens = [0xf9];
            }

          }

          //kontrola
          if (!lens.length) return null;
          if (prefix) {
            lens.unshift(prefix);
            s.bytes++;
          }
          if (disp) {
            if (s.bytes==3) {
              lens[3] = lens[2];
              lens[2] = function(vars){var d = Parser.evaluate(disp,vars); if (d>127 || d<-128) throw "Index out of range ("+d+")"; return d;};
              s.bytes = 4;
            }
            if (s.bytes==2) {
              //lens[2] = Parser.evaluate(disp,vars);
              lens[2] = function(vars){var d = Parser.evaluate(disp,vars); if (d>127 || d<-128) throw "Index out of range ("+d+")"; return d;};
              s.bytes = 3;
            }

          }
          s.lens = lens;
          //console.log(s);
          return s;
        }

        if (ax[4]>=0) {
          //BIT etc.
          var bit = parseInt(par1,10);
          idx = indexes(par2);
          par2 = idx[0];
          disp= idx[1];
          prefix = idx[2];
          reg = R8(par2);
          op = ax[4]+(8*bit)+reg;
        }

        if (par1.toUpperCase()=='A') {
          //INS A,xxx
          idx = indexes(par2);
          par2 = idx[0];
          disp= idx[1];
          prefix = idx[2];

          //A,r8
          if ((reg = R8(par2))>=0) {
            op = ax[0]+reg;
          } else {
            //A,n
            op = ax[1];
            param8 = function(vars){return Parser.evaluate(par2,vars);};
          }
        }
        if (par1.toUpperCase()=='IX') {
          //XX,r16 (<<4)
          if ((reg = R16IX(par2))>=0) {
            op = ax[2]+(reg<<4);
            prefix = 0xdd;
          }
        }
        if (par1.toUpperCase()=='IY') {
          //XX,r16 (<<4)
          if ((reg = R16IY(par2))>=0) {
            op = ax[2]+(reg<<4);
            prefix = 0xfd;
          }
        }

        if (par1.toUpperCase()=='HL') {
          //HL,r16 (<<4)
          if ((reg = R16(par2))>=0) {
            op = ax[2]+(reg<<4);
          }
        }


      }

      if (op<0) {throw "Bad addressing mode at line "+s.numline;}
      if (op>255) {
        //prefixed
        bytes++;
        lens[0] = (op&0xff00)>>8;
        lens[1] = (op&0xff);
      } else {
        lens[0] = (op&0xff);
      }

      var safeparse = function(d) {
        try {
          if (!vars) vars={};
          return Parser.evaluate(d,vars);
        } catch (e)
        {
          //console.log(e)
          return null;}
      };
      //console.log(lens, bytes, prefix,disp)

      if (prefix) {
        lens.unshift(prefix);
        bytes++;
      }
      if (disp!==null && disp!==undefined) {
        if (bytes==3) {
          lens[3]=lens[2];
          //lens[2] = safeparse(disp);
          lens[2] = (vars) => { var d = Parser.evaluate(disp, vars); if (d > 127 || d < -128) throw "Index out of range (" + d + ")"; return d; };
          bytes = 4;
        }
        if (bytes==2) {
//          lens[2] = safeparse(disp);
          lens[2] = (vars) => { var d = Parser.evaluate(disp, vars); if (d > 127 || d < -128) throw "Index out of range (" + d + ")"; return d; };
          bytes = 3;
        }
      }

      if (param8) {
        lens.push(param8);
        bytes++;
      }
      s.lens = lens;
      s.bytes = bytes;
      //console.log(s);
      return s;
    }
    return null;
  }
};

