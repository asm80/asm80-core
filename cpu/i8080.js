/*
including undocumented instructions, see http://www.vintage-computer.com/vcforum/archive/index.php/t-11718.html
DDh JNK (Jump if 'K' Flag is NOT set)
FDh JK (Jump if 'K' Flag is set)

A few other oddballs:

08h DSUB (BC Pair is subtracted from HL Pair affecting all flags)

Sounds self-explanatory, but why are there no other double byte subs?

10h RRHL (Rotate Right HL Pair)

Why is there no instruction for rotating HL Left? Or rotating other pairs right? Or am I just missing these instructions somewhere? There are other vacant OpCode numbers available...

18h RLDE (Rotate Left DE Pair)

Same as above, why can DE only be rotated Left, and why are there no other instructions for rotating pairs left.

28h ADI HL (Add immediate an 8-bit value to HL Pair)
38h ADI SP (Add immediate an 8-bit value to Stack Pointer)

Don't need much help on these...unless someone has some juicy tidbits that aren't included in the description.

CBh RSTV (Does a RST 8 when the overflow flag is sent)

I'm assuming a Restart 8 is actually a Restart 7, and this was a typographical error on the part of the person who transcribed this originally.

EDh LHLX (Load HL pair with contents of address stored in DE pair)
D9h SHLX (Stores the HL pair contents to the address specified in DE pair)
*/


export const I8080 = {
  endian:false,
  cpu:"i8080",
  ext:"a80",
  'set': {
    'RST': {o:0xc7, t:"RST"},
    'LDA': {o:0x3a, t:"IW"},
    'STA': {o:0x32, t:"IW"},
    'LDAX': {o:0x0a, t:"BD"},
    'STAX': {o:0x02, t:"BD"},
    'LHLD': {o:0x2a, t:"IW"},
    'SHLD': {o:0x22, t:"IW"},
    'JMP': {o:0xc3, t:"IW"},
    'JNZ': {o:0xc2, t:"IW"},
    'JZ' : {o:0xca, t:"IW"},
    'JNC': {o:0xd2, t:"IW"},
    'JC' : {o:0xda, t:"IW"},
    'JPO': {o:0xe2, t:"IW"},
    'JPE': {o:0xea, t:"IW"},
    'JP' : {o:0xf2, t:"IW"},
    'JM' : {o:0xfa, t:"IW"},
    'JNK' : {o:0xdd, t:"IW"}, //8085 undocumented
    'JK' : {o:0xfd, t:"IW"}, //8085 undocumented
    'CALL': {o:0xcd, t:"IW"},
    'CNZ': {o:0xc4, t:"IW"},
    'CZ' : {o:0xcc, t:"IW"},
    'CNC': {o:0xd4, t:"IW"},
    'CC' : {o:0xdc, t:"IW"},
    'CPO': {o:0xe4, t:"IW"},
    'CPE': {o:0xec, t:"IW"},
    'CP' : {o:0xf4, t:"IW"},
    'CM' : {o:0xfc, t:"IW"},
    'LXI': {o:0x01, t:"RPW"},
    'DAD': {o:0x09, t:"RPWD"},
    'INX': {o:0x03, t:"RPWD"},
    'DCX': {o:0x0b, t:"RPWD"},
    'PUSH': {o:0xc5, t:"RQW"},
    'POP': {o:0xc1, t:"RQW"},

    'MVI': {o:0x06, t:"RB"},

    'ADI': {o:0xc6, t:"B"},
    'ACI': {o:0xce, t:"B"},
    'SUI': {o:0xd6, t:"B"},
    'SBI': {o:0xde, t:"B"},
    'ANI': {o:0xe6, t:"B"},
    'XRI': {o:0xee, t:"B"},
    'ORI': {o:0xf6, t:"B"},
    'CPI': {o:0xfe, t:"B"},

    'INR': {o:0x04, t:"RR"},
    'DCR': {o:0x05, t:"RR"},
    'MOV': {o:0x40, t:"RRR"},
    'HLT': {o:0x76, t:"0"},
    'NOP': {o:0x00, t:"0"},
    'IN': {o:0xdb, t:"B"},
    'OUT': {o:0xd3, t:"B"},
    'RIM': {o:0x20, t:"0"},
    'SIM': {o:0x30, t:"0"},

    'ADD': {o:0x80, t:"RR0"},
    'ADC': {o:0x88, t:"RR0"},
    'SUB': {o:0x90, t:"RR0"},
    'SBB': {o:0x98, t:"RR0"},
    'ANA': {o:0xa0, t:"RR0"},
    'XRA': {o:0xa8, t:"RR0"},
    'ORA': {o:0xb0, t:"RR0"},
    'CMP': {o:0xb8, t:"RR0"},

    'EI': {o:0xfb, t:"0"},
    'DI': {o:0xf3, t:"0"},
    'SPHL': {o:0xf9, t:"0"},
    'XCHG': {o:0xeb, t:"0"},
    'XTHL': {o:0xe3, t:"0"},
    'DAA': {o:0x27, t:"0"},
    'CMA': {o:0x2f, t:"0"},
    'STC': {o:0x37, t:"0"},
    'CMC': {o:0x3f, t:"0"},
    'RLC': {o:0x07, t:"0"},
    'RRC': {o:0x0f, t:"0"},
    'RAL': {o:0x17, t:"0"},
    'RAR': {o:0x1f, t:"0"},
    'RRHL': {o:0x10, t:"0"}, //8085 undocumented
    'RLDE': {o:0x18, t:"0"}, //8085 undocumented
    'PCHL': {o:0xe9, t:"0"},
    'DSUB': {o:0x08, t:"0"}, //8085 undocumented
    'RSTV': {o:0xcb, t:"0"}, //8085 undocumented
    'RET': {o:0xc9, t:"0"},
    'RNZ': {o:0xc0, t:"0"},
    'RZ': {o:0xc8, t:"0"},
    'RNC': {o:0xd0, t:"0"},
    'RC': {o:0xd8, t:"0"},
    'RPO': {o:0xe0, t:"0"},
    'RPE': {o:0xe8, t:"0"},
    'RP': {o:0xf0, t:"0"},
    'RM': {o:0xf8, t:"0"}

  },
  "lens": {
    'R': function(reg) {return "BCDEHLMA".indexOf(reg.toUpperCase());},
    'RDD': function(reg) {return "BDHSP".indexOf(reg.toUpperCase());},
    'RBD': function(reg) {return "BD".indexOf(reg.toUpperCase());},
    'RQQ': function(reg) {return "BDHPSW".indexOf(reg.toUpperCase());},
    'RB': function(op, params, Parser) {
      let reg = this.R(params[0]);
      if (reg<0) throw "Unknown register "+params[0];
      reg <<=3 ;
      return [reg | op, (vars) => Parser.evaluate(params[1], vars)];
    },
    'B': function(op, params, Parser) {
      return [op, function(vars){return Parser.evaluate(params[0],vars);}];
    },
    'RR': function(op, params, Parser) {
      let reg = this.R(params[0]);
      if (reg<0) throw "Unknown register "+params[0];
      reg <<=3 ;
      return [reg | op];
    },
    'RR0': function(op, params, Parser) {
      let reg = this.R(params[0]);
      if (reg<0) throw "Unknown register "+params[0];
      return [reg | op];
    },
    'RRR': function(op, params, Parser) {
      let reg1 = this.R(params[0]);
      if (reg1<0) throw "Unknown register "+params[0];
      if (!params[1]) throw "Missing second register";
      let reg2 = this.R(params[1]);
      if (reg2<0) throw "Unknown register "+params[1];
      reg1 <<=3 ;
      return [reg1 | reg2 | op];
    },
    'RPW': function(op, params, Parser) {
      let reg = this.RDD(params[0]);
      if (reg<0 || reg>3) throw "Unknown register "+params[0];
      reg <<=4 ;
      return [reg | op, function(vars){return Parser.evaluate(params[1],vars);}, null];
    },
    'RPWD': function(op, params, Parser) {
      let reg = this.RDD(params[0]);
      if (reg<0 || reg>3) throw "Unknown register "+params[0];
      reg <<=4 ;
      return [reg | op];
    },
    'BD': function(op, params, Parser) {
      let reg = this.RBD(params[0]);
      if (reg<0 || reg>1) throw "Unknown register "+params[0];
      reg <<=4 ;
      return [reg | op];
    },
    'RQW': function(op, params, Parser) {
      let reg = this.RQQ(params[0]);
      if (reg<0 || reg>3) throw "Unknown register "+params[0];
      reg <<=4 ;
      return [reg | op];
    },
    'IW': function(op, params, Parser) {
      return [op, function(vars){return Parser.evaluate(params[0],vars);}, null];
    },
    'RST': function(op, params, Parser) {
      let v = parseInt(params[0], 10);
      return [op | (v<<3)];
    },
    '0': function(op, params, Parser) {
      return [op];
    }
  },

  parseOpcode: function (s, vars, Parser) {
    let ax = I8080.set[s.opcode];
    if (ax) {
      let typ = ax.t;
      let lens = I8080.lens[typ](ax.o,s.params, Parser);
      s.bytes = lens.length;
      s.lens = lens;
      s.wia = 1; //Where is address (for relocation)
      s.resolve = lens.reduce(function(inter,v){return typeof(v)=="function"?inter+1:inter;},0);
      return s;
    }
    return null;
  }

};

//types
/*
IW - 3 bytes (opcode, LO, HI), format: INSTR num16
RPW - 3 bytes, (opcode, LO, HI), format: INSTR regpair, num16
0 - 1 byte, just instruction
RB - 2  bytes, (opcode, NN), format INSTR reg, NN
*/
//return I8080;}))
