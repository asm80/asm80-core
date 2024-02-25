export const C6502 = {
  "set": {
    //illegal opcodes - http://www.oxyron.de/html/opcodes02.html
    //    imp  ima imm  abs  abx  aby   zpg  zpx  zpy  ind  izx  izy  rel  izp
    SLO:[  -1,  -1,  -1,0x0F,0x1F,0x1B,0x07,0x17,  -1,  -1,0x03,0x13,  -1,  -1,  -1],
    RLA:[  -1,  -1,  -1,0x2F,0x3F,0x3B,0x27,0x37,  -1,  -1,0x23,0x33,  -1,  -1,  -1],
    SRE:[  -1,  -1,  -1,0x4F,0x5F,0x5B,0x47,0x57,  -1,  -1,0x43,0x53,  -1,  -1,  -1],
    RRA:[  -1,  -1,  -1,0x6F,0x7F,0x7B,0x67,0x77,  -1,  -1,0x63,0x73,  -1,  -1,  -1],
    SAX:[  -1,  -1,  -1,0x8F,  -1,  -1,0x87,  -1,0x97,  -1,0x83,  -1,  -1,  -1,  -1],
    LAX:[  -1,  -1,0xaB,0xaF,  -1,0xbF,0xa7,  -1,0xb7,  -1,0xa3,0xb3,  -1,  -1,  -1],
    DCP:[  -1,  -1,  -1,0xcF,0xdF,0xdB,0xc7,0xd7,  -1,  -1,0xc3,0xd3,  -1,  -1,  -1],
    ISC:[  -1,  -1,  -1,0xeF,0xfF,0xfB,0xe7,0xf7,  -1,  -1,0xe3,0xf3,  -1,  -1,  -1],

    ANC:[  -1,  -1,0x0B,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    ALR:[  -1,  -1,0x4B,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    ARR:[  -1,  -1,0x6B,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    XAA:[  -1,  -1,0x8B,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    //LAX:[  -1,  -1,0xaB,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    AXS:[  -1,  -1,0xcB,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    //SBC:[  -1,  -1,0xeB,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],

    AHX:[  -1,  -1,  -1,  -1,  -1,0x9f,  -1,  -1,  -1,  -1,  -1,0x93,  -1,  -1,  -1],
    SHY:[  -1,  -1,  -1,  -1,0x9C,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    SHX:[  -1,  -1,  -1,  -1,  -1,0x9E,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    TAS:[  -1,  -1,  -1,  -1,  -1,0x9B,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    LAS:[  -1,  -1,  -1,  -1,  -1,0xBB,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],

    //65C02 opcodes
    //    imp  ima imm  abs  abx  aby   zpg  zpx  zpy  ind  izx  izy  rel  izp
    //      0    1   2    3    4    5     6    7    8    9   10   11   12   13
    BRA: [  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,0x80,  -1,  -1],
    PHX: [0xda,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    PHY: [0x5a,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    PLX: [0xfa,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    PLY: [0x7a,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    RMB0:[  -1,  -1,  -1,  -1,  -1,  -1,0x07,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    RMB1:[  -1,  -1,  -1,  -1,  -1,  -1,0x17,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    RMB2:[  -1,  -1,  -1,  -1,  -1,  -1,0x27,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    RMB3:[  -1,  -1,  -1,  -1,  -1,  -1,0x37,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    RMB4:[  -1,  -1,  -1,  -1,  -1,  -1,0x47,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    RMB5:[  -1,  -1,  -1,  -1,  -1,  -1,0x57,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    RMB6:[  -1,  -1,  -1,  -1,  -1,  -1,0x67,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    RMB7:[  -1,  -1,  -1,  -1,  -1,  -1,0x77,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    SMB0:[  -1,  -1,  -1,  -1,  -1,  -1,0x87,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    SMB1:[  -1,  -1,  -1,  -1,  -1,  -1,0x97,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    SMB2:[  -1,  -1,  -1,  -1,  -1,  -1,0xa7,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    SMB3:[  -1,  -1,  -1,  -1,  -1,  -1,0xb7,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    SMB4:[  -1,  -1,  -1,  -1,  -1,  -1,0xc7,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    SMB5:[  -1,  -1,  -1,  -1,  -1,  -1,0xd7,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    SMB6:[  -1,  -1,  -1,  -1,  -1,  -1,0xe7,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    SMB7:[  -1,  -1,  -1,  -1,  -1,  -1,0xf7,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    //    imp  ima imm  abs  abx  aby   zpg  zpx  zpy  ind  izx  izy  rel  izp

    BBR0:[  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,0x0F,  -1,  -1],
    BBR1:[  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,0x1F,  -1,  -1],
    BBR2:[  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,0x2F,  -1,  -1],
    BBR3:[  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,0x3F,  -1,  -1],
    BBR4:[  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,0x4F,  -1,  -1],
    BBR5:[  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,0x5F,  -1,  -1],
    BBR6:[  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,0x6F,  -1,  -1],
    BBR7:[  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,0x7F,  -1,  -1],
    BBS0:[  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,0x8F,  -1,  -1],
    BBS1:[  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,0x9F,  -1,  -1],
    BBS2:[  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,0xaF,  -1,  -1],
    BBS3:[  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,0xbF,  -1,  -1],
    BBS4:[  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,0xcF,  -1,  -1],
    BBS5:[  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,0xdF,  -1,  -1],
    BBS6:[  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,0xeF,  -1,  -1],
    BBS7:[  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,0xfF,  -1,  -1],
    //    imp  ima imm  abs  abx  aby   zpg  zpx  zpy  ind  izx  izy  rel  izp
    TRB: [  -1,  -1,  -1,0x1C,  -1,  -1,0x14,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    TSB: [  -1,  -1,  -1,0x0C,  -1,  -1,0x04,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    STZ: [  -1,  -1,  -1,0x9C,0x9E,  -1,0x64,0x74,  -1,  -1,  -1,  -1,  -1,  -1,  -1],


    //legal opcodes
    //    imp  ima imm  abs  abx  aby   zpg  zpx  zpy  ind  izx  izy  rel  izp
    ADC:[  -1,  -1,0x69,0x6d,0x7d,0x79,0x65,0x75,  -1,  -1,0x61,0x71,  -1,0x72,  -1],
    AND:[  -1,  -1,0x29,0x2d,0x3d,0x39,0x25,0x35,  -1,  -1,0x21,0x31,  -1,0x32,  -1],
    ASL:[  -1,0x0a,  -1,0x0e,0x1e,  -1,0x06,0x16,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    BCC:[  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,0x90,  -1,  -1],
    BCS:[  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,0xb0,  -1,  -1],
    BEQ:[  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,0xf0,  -1,  -1],
    BIT:[  -1,  -1,0x89,0x2c,0x3c,  -1,0x24,0x34,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    BMI:[  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,0x30,  -1,  -1],
    BNE:[  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,0xd0,  -1,  -1],
    BPL:[  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,0x10,  -1,  -1],
    BRK:[0x00,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    BVC:[  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,0x50,  -1,  -1],
    BVS:[  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,0x70,  -1,  -1],
    CLC:[0x18,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    CLD:[0xd8,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    CLI:[0x58,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    CLV:[0xb8,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    CMP:[  -1,  -1,0xc9,0xcd,0xdd,0xd9,0xc5,0xd5,  -1,  -1,0xc1,0xd1,  -1,0xd2,  -1],
    CPX:[  -1,  -1,0xe0,0xec,  -1,  -1,0xe4,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    CPY:[  -1,  -1,0xc0,0xcc,  -1,  -1,0xc4,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    DEC:[0x3A,  -1,  -1,0xce,0xde,  -1,0xc6,0xd6,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    DEX:[0xca,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    DEY:[0x88,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    //    imp  ima imm  abs  abx  aby   zpg  zpx  zpy  ind  izx  izy  rel  izp
    EOR:[  -1,  -1,0x49,0x4d,0x5d,0x59,0x45,0x55,  -1,  -1,0x41,0x51,  -1,0x52,  -1],
    INC:[0x1a,  -1,  -1,0xee,0xfe,  -1,0xe6,0xf6,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    INX:[0xe8,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    INY:[0xc8,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    JMP:[  -1,  -1,  -1,0x4c,  -1,  -1,  -1,  -1,  -1,0x6c,  -1,  -1,  -1,  -1,0x7c],
    JSR:[  -1,  -1,  -1,0x20,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    LDA:[  -1,  -1,0xa9,0xad,0xbd,0xb9,0xa5,0xb5,  -1,  -1,0xa1,0xb1,  -1,0xb2,  -1],
    LDX:[  -1,  -1,0xa2,0xae,  -1,0xbe,0xa6,  -1,0xb6,  -1,  -1,  -1,  -1,  -1,  -1],
    LDY:[  -1,  -1,0xa0,0xac,0xbc,  -1,0xa4,0xb4,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    LSR:[  -1,0x4a,  -1,0x4e,0x5e,  -1,0x46,0x56,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    NOP:[0xea,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    ORA:[  -1,  -1,0x09,0x0d,0x1d,0x19,0x05,0x15,  -1,  -1,0x01,0x11,  -1,0x12,  -1],
    PHA:[0x48,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    PHP:[0x08,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    PLA:[0x68,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    PLP:[0x28,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    ROL:[  -1,0x2a,  -1,0x2e,0x3e,  -1,0x26,0x36,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    ROR:[  -1,0x6a,  -1,0x6e,0x7e,  -1,0x66,0x76,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    RTI:[0x40,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    RTS:[0x60,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    SBC:[  -1,  -1,0xe9,0xed,0xfd,0xf9,0xe5,0xf5,  -1,  -1,0xe1,0xf1,  -1,0xf2,  -1],
    SEC:[0x38,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    SED:[0xf8,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    //    imp  ima imm  abs  abx  aby   zpg  zpx  zpy  ind  izx  izy  rel  izp
    SEI:[0x78,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    STA:[  -1,  -1,  -1,0x8d,0x9d,0x99,0x85,0x95,  -1,  -1,0x81,0x91,  -1,0x92,  -1],
    STX:[  -1,  -1,  -1,0x8e,  -1,  -1,0x86,  -1,0x96,  -1,  -1,  -1,  -1,  -1,  -1],
    STY:[  -1,  -1,  -1,0x8c,  -1,  -1,0x84,0x94,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    TAX:[0xaa,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    TAY:[0xa8,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    TSX:[0xba,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    TXA:[0x8a,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    TXS:[0x9a,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    TYA:[0x98,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1],
    //    imp  ima  imm  abs  abx  aby   zpg  zpx  zpy  ind  izx  izy  rel  izp
    //      0    1    2    3    4    5     6    7    8    9   10   11   12   13
  },

  "steptab": [1,1,2,3,3,3,2,2,2,3,2,2,2,2,3],


  parseOpcode: function (s, vars, Parser) {
    var ax = C6502.set[s.opcode];
    var addr, p1, p2, ins, lens, zptest;
    if (ax) {
      lens=[];
      //addr decision
      //    imp  ima imm  abs  abx  aby   zpg  zpx  zpy  ind  izx  izy  rel

      //if (s.opcode=="ROL") console.log(s)

      if (!s.params || !s.params.length) {
        addr = 0; //imp
        if (ax[0]===-1) addr = 1;
        //console.log(s.opcode,addr)

      } //implied

      else if (s.params.length == 1 && s.params[0].toUpperCase()==="A") {

        addr = 1;
      }

      else if (s.params.length == 1) {
        p1 = s.params[0];
        addr = 3; //abs
        if (p1 === 'A') {addr = 1;}
        if (p1[0] === '#') {
          addr = 2; //imm
          //s.params[0] = p1.substr(1);
          lens[1] = function(vars){return Parser.evaluate(p1.substr(1),vars);};
        }


        if (p1[0] === '*') {
          addr = 6; //zpg
          //s.params[0] = p1.substr(1);
          lens[1] = function(vars){return Parser.evaluate(p1.substr(1),vars);};
        }

        //test na <256
        //var zptest = Parser.evaluate(p1,vars);
        if (vars) {
          try {
            zptest = Parser.evaluate(p1,vars);
            if (zptest<0x100 && ax[6]>=0) {
              addr = 6;
              lens[1] = function(vars){return Parser.evaluate(p1,vars);};
            }
          } catch (e) {
           // console.log("ZDECH",p1,vars)
            //;
          }
        }


        if (p1[0] === '(' && p1[p1.length-1]===')') {
          if (ax[9]!==-1) addr = 9; //ind
          if (ax[13]!==-1) addr = 13; //izp

          p1 = p1.substr(1, p1.length-2);
          //s.params[0] = p1;
          lens[1] = function(vars){return Parser.evaluate(p1,vars);};
          if (addr==9) lens[2] = null;
        }
        if (p1.match(/^\$[0-9a-f]{1,2}$/i) && ax[6]>=0 && addr!==13) {
          addr = 6; //zero page hack
          lens[1] = function(vars){return Parser.evaluate(p1,vars);};
        }

        if (addr === 3) {
          //maybe 12?
          if (ax[3]==-1 && ax[12]) {
            addr = 12;
            lens[1] = function(vars){
              var n= Parser.evaluate(p1,vars) - vars._PC-2;
              if (n<0) {n=256+n;}
              return n;};
          } else {
            lens[1] = function(vars){return Parser.evaluate(p1,vars);};
            lens[2] = null;
          }
        }
      }
      else if (s.params.length == 2) {
        p1 = s.params[0];
        zptest = null;
        if (vars) {
          try {
            zptest = Parser.evaluate(p1,vars);
          } catch (e) {
            //;
          }
        }
        //console.log(zptest,"ZP",vars,p1,p2)
        p2 = s.params[1].toUpperCase();
        if (p1.match(/^\$[0-9a-f]{1,2}$/i) && ((ax[7]>=0) || (ax[8]>=0) )) {
          //console.log(p2)
          if (p2 === 'X' && (ax[7]>=0)) {addr = 7;}
          if (p2 === 'Y' && (ax[8]>=0)) {addr = 8;}
          lens[1] = function(vars){return Parser.evaluate(p1,vars);};
        }
        else if (p1[0]==='*') {
          p1 = p1.substr(1);
          if (p2 === 'X') {addr = 7;}
          if (p2 === 'Y') {addr = 8;}
          lens[1] = function(vars){return Parser.evaluate(p1,vars);};
        }
        else if (zptest!==null && zptest<0x100 && (ax[7]>=0 && p2 === 'X')  && p1[0] !== '(') {
          if (p2 === 'X' && p1[0] !== '(') {addr = 7;}
          lens[1] = function(vars){return Parser.evaluate(p1,vars);};
        }
        /*
        else if (ax[4]<0 && p2 === 'X' && (ax[7]>=0)) {
          //maybe obsolete, never reached
          addr = 7;
          lens[1] = function(vars){return Parser.evaluate(p1,vars);};
        }*/

        /*
        else if (zptest!==null && zptest<0x100 && (ax[8]>=0 && p2 === 'Y')  && p1[0] !== '(') {
          //maybe obsolete, never reached
          if (p2 === 'Y' && p1[0] !== '(') {addr = 8;}
          lens[1] = function(vars){return Parser.evaluate(p1,vars);};
        }
        */
        else {
          if (p2 === 'X') {
            addr = 4;
            lens[1] = function(vars){return Parser.evaluate(p1,vars);};
            lens[2] = null;

          }
          if (p2 === 'Y' && p1[0] !== '(') {
            addr = 5;
            lens[1] = function(vars){return Parser.evaluate(p1,vars);};
            lens[2] = null;

          }
          if (p2 === 'Y' && p1[0] === '(') {
            addr = 11;
            //p1 = p1.substr(1, p1.length-2);
            //s.params[0] = p1;
            lens[1] = function(vars){return Parser.evaluate(p1.substr(1, p1.length-2),vars);};

          }
          if (p2 === 'X)' && p1[0] === '(') {
            addr = 10;
            if (ax[14]!==-1 && ax[10]===-1) addr = 14;
            //p1 = p1.substr(1);
            //s.params[0] = p1;
            lens[1] = function(vars){return Parser.evaluate(p1.substr(1),vars);};
            if (addr==14) lens[2] = null;

          }
        }

      }

      //console.log(p1,p2,addr);

      if (addr===undefined){
        throw "Bad addressing mode at line "+s.numline;
      }

      lens[0] = ax[addr];


      if(lens[0]===null || lens[0] == "-1") {
        throw "Bad addressing mode at line "+s.numline;
      }

      s.admode = addr;
      s.lens = lens;
      s.bytes = this.steptab[addr];

      s.wia = 1; //Where is address (for relocation)


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

