import { H6309 } from "../cpu/h6309.js";
import { Parser } from "../expression-parser.js";

QUnit.config.hidepassed = true;

QUnit.module("ASM H6309");

var vars = { _PC: 0x0100 };

QUnit.test("Namespace", function () {
  QUnit.assert.notEqual(H6309, null, "H6309 is defined");
  QUnit.assert.equal(typeof H6309, "object", "H6309 is an object");
  QUnit.assert.equal(typeof H6309.parseOpcode, "function", "H6309.parseOpcode defined");
});

QUnit.module("H6309 no-param instructions");

QUnit.test("SEXW - 1-byte no-param", function () {
  var s = { opcode: "SEXW", params: [], addr: 0x100, lens: [], bytes: 0 };
  var p = H6309.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.bytes, 1, "bytes");
  QUnit.assert.equal(p.lens[0], 0x14, "opcode");
});

QUnit.test("NEGD - 2-byte no-param", function () {
  var s = { opcode: "NEGD", params: [], addr: 0x100, lens: [], bytes: 0 };
  var p = H6309.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.bytes, 2, "bytes");
  QUnit.assert.equal(p.lens[0], 0x10, "prefix");
  QUnit.assert.equal(p.lens[1], 0x40, "opcode");
});

QUnit.test("CLRE - E-reg unary", function () {
  var s = { opcode: "CLRE", params: [], addr: 0x100, lens: [], bytes: 0 };
  var p = H6309.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.bytes, 2, "bytes");
  QUnit.assert.equal(p.lens[0], 0x11, "prefix");
  QUnit.assert.equal(p.lens[1], 0x4f, "opcode");
});

QUnit.test("CLRF - F-reg unary", function () {
  var s = { opcode: "CLRF", params: [], addr: 0x100, lens: [], bytes: 0 };
  var p = H6309.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.bytes, 2, "bytes");
  QUnit.assert.equal(p.lens[0], 0x11, "prefix");
  QUnit.assert.equal(p.lens[1], 0x5f, "opcode");
});

QUnit.test("CLRW - W-reg unary", function () {
  var s = { opcode: "CLRW", params: [], addr: 0x100, lens: [], bytes: 0 };
  var p = H6309.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.bytes, 2, "bytes");
  QUnit.assert.equal(p.lens[0], 0x10, "prefix");
  QUnit.assert.equal(p.lens[1], 0x5f, "opcode");
});

QUnit.test("PSHSW - push W", function () {
  var s = { opcode: "PSHSW", params: [], addr: 0x100, lens: [], bytes: 0 };
  var p = H6309.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.bytes, 2, "bytes");
  QUnit.assert.equal(p.lens[0], 0x10, "prefix");
  QUnit.assert.equal(p.lens[1], 0x38, "opcode");
});

QUnit.module("H6309 EXG/TFR with extended registers");

QUnit.test("EXG W,D", function () {
  // parnibble(W)=6, parnibble(D)=0 → nibble = (6<<4)|0 = 0x60
  var s = { opcode: "EXG", params: ["W", "D"], addr: 0x100, lens: [], bytes: 0 };
  var p = H6309.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.bytes, 2, "bytes");
  QUnit.assert.equal(p.lens[0], 0x1e, "opcode");
  QUnit.assert.equal(p.lens[1], 0x60, "nibble byte");
});

QUnit.test("TFR E,A", function () {
  // parnibble(E)=14=0xE, parnibble(A)=8 → nibble = (0xE<<4)|8 = 0xE8
  var s = { opcode: "TFR", params: ["E", "A"], addr: 0x100, lens: [], bytes: 0 };
  var p = H6309.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.bytes, 2, "bytes");
  QUnit.assert.equal(p.lens[0], 0x1f, "opcode");
  QUnit.assert.equal(p.lens[1], 0xe8, "nibble byte");
});

QUnit.module("H6309 register-register instructions");

QUnit.test("ADDR D,X", function () {
  // opcode=0x1030, parnibble(D)=0, parnibble(X)=1 → [0x10,0x30,0x01]
  var s = { opcode: "ADDR", params: ["D", "X"], addr: 0x100, lens: [], bytes: 0 };
  var p = H6309.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.bytes, 3, "bytes");
  QUnit.assert.equal(p.lens[0], 0x10, "prefix");
  QUnit.assert.equal(p.lens[1], 0x30, "opcode");
  QUnit.assert.equal(p.lens[2], 0x01, "nibble byte D,X");
});

QUnit.test("ADDR wrong param count throws", function () {
  QUnit.assert.throws(function () {
    var s = { opcode: "ADDR", params: ["D"], addr: 0x100, lens: [], bytes: 0 };
    H6309.parseOpcode(s, vars, Parser);
  });
});

QUnit.test("CMPR A,B", function () {
  // opcode=0x1037, parnibble(A)=8, parnibble(B)=9 → nibble=(8<<4)|9=0x89
  var s = { opcode: "CMPR", params: ["A", "B"], addr: 0x100, lens: [], bytes: 0 };
  var p = H6309.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.bytes, 3, "bytes");
  QUnit.assert.equal(p.lens[2], 0x89, "nibble byte A,B");
});

QUnit.module("H6309 TFM block transfer");

QUnit.test("TFM X+,Y+ mode 0x38", function () {
  // tfmnibble: D=0, X=1, Y=2, U=3, S=4. X=1, Y=2 → nibble=(1<<4)|2=0x12
  var s = { opcode: "TFM", params: ["X+", "Y+"], addr: 0x100, lens: [], bytes: 0 };
  var p = H6309.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.bytes, 3, "bytes");
  QUnit.assert.equal(p.lens[0], 0x11, "0x11 prefix");
  QUnit.assert.equal(p.lens[1], 0x38, "mode byte X+,Y+");
  QUnit.assert.equal(p.lens[2], 0x12, "nibble X=1,Y=2");
});

QUnit.test("TFM X-,Y- mode 0x39", function () {
  var s = { opcode: "TFM", params: ["X-", "Y-"], addr: 0x100, lens: [], bytes: 0 };
  var p = H6309.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.bytes, 3, "bytes");
  QUnit.assert.equal(p.lens[1], 0x39, "mode byte X-,Y-");
  QUnit.assert.equal(p.lens[2], 0x12, "nibble X=1,Y=2");
});

QUnit.test("TFM X+,Y mode 0x3A", function () {
  var s = { opcode: "TFM", params: ["X+", "Y"], addr: 0x100, lens: [], bytes: 0 };
  var p = H6309.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.bytes, 3, "bytes");
  QUnit.assert.equal(p.lens[1], 0x3a, "mode byte X+,Y");
});

QUnit.test("TFM X,Y+ mode 0x3B", function () {
  var s = { opcode: "TFM", params: ["X", "Y+"], addr: 0x100, lens: [], bytes: 0 };
  var p = H6309.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.bytes, 3, "bytes");
  QUnit.assert.equal(p.lens[1], 0x3b, "mode byte X,Y+");
});

QUnit.test("TFM invalid register throws", function () {
  QUnit.assert.throws(function () {
    // E is not a valid TFM register (only D/X/Y/U/S allowed)
    var s = { opcode: "TFM", params: ["E+", "F+"], addr: 0x100, lens: [], bytes: 0 };
    H6309.parseOpcode(s, vars, Parser);
  });
});

QUnit.module("H6309 AIM/EIM/OIM/TIM");

QUnit.test("AIM #$FF,<$10 direct", function () {
  // opcode=0x02, imm=0xFF, addr=0x10 → [0x02, 0xFF, 0x10], 3 bytes
  var s = { opcode: "AIM", params: ["#$FF", "<$10"], addr: 0x100, lens: [], bytes: 0 };
  var p = H6309.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.bytes, 3, "bytes");
  QUnit.assert.equal(p.lens[0], 0x02, "opcode");
  QUnit.assert.equal(p.lens[1], 0xff, "imm byte");
  QUnit.assert.equal(typeof p.lens[2], "function", "addr function");
  QUnit.assert.equal(p.lens[2](vars), 0x10, "addr value");
});

QUnit.test("OIM #$01,<$20 direct", function () {
  var s = { opcode: "OIM", params: ["#$01", "<$20"], addr: 0x100, lens: [], bytes: 0 };
  var p = H6309.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.bytes, 3, "bytes");
  QUnit.assert.equal(p.lens[0], 0x01, "opcode OIM direct");
  QUnit.assert.equal(p.lens[1], 0x01, "imm byte");
});

QUnit.module("H6309 bit manipulation");

QUnit.test("BAND A,3,2,$10 (4-param)", function () {
  // params order: [register, regBit, memBit, addr]
  // regnum(A)=1 (A is index 1 in ["CC","A","B"])
  // bitfield = (regnum<<6)|(memBit<<3)|regBit = (1<<6)|(2<<3)|3 = 0x40|0x10|0x03 = 0x53
  var s = { opcode: "BAND", params: ["A", "3", "2", "$10"], addr: 0x100, lens: [], bytes: 0 };
  var p = H6309.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.bytes, 4, "bytes");
  QUnit.assert.equal(p.lens[0], 0x11, "prefix");
  QUnit.assert.equal(p.lens[1], 0x30, "opcode");
  QUnit.assert.equal(p.lens[2], 0x53, "bitfield byte: regnum=1,memBit=2,regBit=3");
});

QUnit.test("BAND A.3,$10.2 (dot notation — same result)", function () {
  // "A.3" → register=A, regBit=3. "$10.2" → addr=$10, memBit=2.
  // Same bitfield: (1<<6)|(2<<3)|3 = 0x53
  var s = { opcode: "BAND", params: ["A.3", "$10.2"], addr: 0x100, lens: [], bytes: 0 };
  var p = H6309.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.bytes, 4, "bytes");
  QUnit.assert.equal(p.lens[2], 0x53, "same bitfield byte as 4-param form");
});

QUnit.test("LDBT A.0,$20.1", function () {
  // regBit=0, memBit=1: bitfield=(1<<6)|(1<<3)|0 = 0x40|0x08|0x00 = 0x48
  var s = { opcode: "LDBT", params: ["A.0", "$20.1"], addr: 0x100, lens: [], bytes: 0 };
  var p = H6309.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.bytes, 4, "bytes");
  QUnit.assert.equal(p.lens[2], 0x48, "bitfield byte: regnum=1,memBit=1,regBit=0");
});

QUnit.test("BAND out-of-range bit throws", function () {
  QUnit.assert.throws(function () {
    var s = { opcode: "BAND", params: ["A.8", "$10.0"], addr: 0x100, lens: [], bytes: 0 };
    H6309.parseOpcode(s, vars, Parser);
  });
});

QUnit.module("H6309 E/F/W/Q instructions");

QUnit.test("LDE #$42 immediate", function () {
  // LDE imm8 = 0x1186, 2-byte prefix + 1 imm byte = 3 bytes
  var s = { opcode: "LDE", params: ["#$42"], addr: 0x100, lens: [], bytes: 0 };
  var p = H6309.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.bytes, 3, "bytes");
  QUnit.assert.equal(p.lens[0], 0x11, "prefix");
  QUnit.assert.equal(p.lens[1], 0x86, "opcode");
  QUnit.assert.equal(typeof p.lens[2], "function", "value function");
  QUnit.assert.equal(p.lens[2](vars), 0x42, "value");
});

QUnit.test("LDF <$10 direct", function () {
  // LDF direct = 0x11D6, 2-byte prefix + 1 addr byte = 3 bytes
  var s = { opcode: "LDF", params: ["<$10"], addr: 0x100, lens: [], bytes: 0 };
  var p = H6309.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.bytes, 3, "bytes");
  QUnit.assert.equal(p.lens[0], 0x11, "prefix");
  QUnit.assert.equal(p.lens[1], 0xd6, "opcode");
});

QUnit.test("LDW #$1234 immediate", function () {
  // LDW imm16 = 0x1086, 2-byte prefix + 2 imm bytes = 4 bytes
  var s = { opcode: "LDW", params: ["#$1234"], addr: 0x100, lens: [], bytes: 0 };
  var p = H6309.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.bytes, 4, "bytes");
  QUnit.assert.equal(p.lens[0], 0x10, "prefix");
  QUnit.assert.equal(p.lens[1], 0x86, "opcode");
});

QUnit.test("STW <$10 direct", function () {
  // STW direct = 0x1097, 2-byte prefix + 1 addr byte = 3 bytes
  var s = { opcode: "STW", params: ["<$10"], addr: 0x100, lens: [], bytes: 0 };
  var p = H6309.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.bytes, 3, "bytes");
});

QUnit.test("ADDW #$0010 immediate", function () {
  // ADDW imm16 = 0x108B, 2-byte prefix + 2 imm bytes = 4 bytes
  var s = { opcode: "ADDW", params: ["#$0010"], addr: 0x100, lens: [], bytes: 0 };
  var p = H6309.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.bytes, 4, "bytes");
});

QUnit.test("DIVD <$10 direct", function () {
  // DIVD direct = 0x119D, 2-byte prefix + 1 addr byte = 3 bytes
  var s = { opcode: "DIVD", params: ["<$10"], addr: 0x100, lens: [], bytes: 0 };
  var p = H6309.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.bytes, 3, "bytes");
});

QUnit.test("LDQ #$00001234 immediate (32-bit)", function () {
  // LDQ imm opcode=0xCD (1-byte), amode=6: bytes = 1 + 2(imm16) + 2(addr32 extension) = 5
  // lens=[0xCD, parserfunc, "addr32", null, null]
  var s = { opcode: "LDQ", params: ["#$00001234"], addr: 0x100, lens: [], bytes: 0 };
  var p = H6309.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.bytes, 5, "bytes");
  QUnit.assert.equal(p.lens[0], 0xcd, "opcode");
  QUnit.assert.equal(p.lens[2], "addr32", "addr32 marker");
});

QUnit.test("LDMD #$01 immediate", function () {
  // LDMD imm8 = 0x113D, 2-byte prefix + 1 byte = 3 bytes
  var s = { opcode: "LDMD", params: ["#$01"], addr: 0x100, lens: [], bytes: 0 };
  var p = H6309.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.bytes, 3, "bytes");
  QUnit.assert.equal(p.lens[0], 0x11, "prefix");
  QUnit.assert.equal(p.lens[1], 0x3d, "opcode");
});

QUnit.module("H6309 W/E/F indexed mode");

QUnit.test("LDW ,W indexed zero offset", function () {
  // LDW indexed = 0x10A6 (>256, 2-byte opcode prefix).
  // ax[2]>256 → s.bytes++ (from 2 to 3), postbyte at index 2. W → postbyte=0x8F (no extra bytes).
  // Final: lens=[0x10, 0xA6, 0x8F], bytes=3.
  var s = { opcode: "LDW", params: ["", "W"], addr: 0x100, lens: [], bytes: 0 };
  var p = H6309.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.bytes, 3, "bytes");
  QUnit.assert.equal(p.lens[2], 0x8f, "postbyte ,W");
});

QUnit.test("LDA E,X indexed E accumulator", function () {
  // LDA indexed = 0xA6 (1-byte), p1=E, p2=X → ixreg(X)|0x87 = 0x00|0x87 = 0x87
  // bytes: 1(opcode) + 1(postbyte) = 2
  var s = { opcode: "LDA", params: ["E", "X"], addr: 0x100, lens: [], bytes: 0 };
  var p = H6309.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.bytes, 2, "bytes");
  QUnit.assert.equal(p.lens[1], 0x87, "postbyte E,X");
});

QUnit.test("LDA F,X indexed F accumulator", function () {
  // ixreg(X)|0x8A = 0x00|0x8A = 0x8A
  var s = { opcode: "LDA", params: ["F", "X"], addr: 0x100, lens: [], bytes: 0 };
  var p = H6309.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.bytes, 2, "bytes");
  QUnit.assert.equal(p.lens[1], 0x8a, "postbyte F,X");
});

QUnit.module("H6309 indexed — 5-bit offset");

QUnit.test("LDA 5,X — positive 5-bit offset", function () {
  // zptest=5: 5<16 && 5>-17 → 5-bit path. postbyte = ixreg("X")|0|(5&0x1f) = 0x05
  var s = { opcode: "LDA", params: ["5", "X"], addr: 0x100, lens: [], bytes: 0 };
  var p = H6309.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.bytes, 2, "bytes");
  QUnit.assert.equal(p.lens[0], 0xa6, "opcode");
  QUnit.assert.equal(p.lens[1], 0x05, "postbyte 5-bit offset 5,X");
});

QUnit.test("LDA 65535,X — high-address 5-bit wrap", function () {
  // zptest=65535 > 65519: high-addr path. postbyte = (32-(65536-65535))&0x1f = 31 = 0x1f
  var s = { opcode: "LDA", params: ["65535", "X"], addr: 0x100, lens: [], bytes: 0 };
  var p = H6309.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.bytes, 2, "bytes");
  QUnit.assert.equal(p.lens[1], 0x1f, "postbyte high-addr wrap -1");
});

QUnit.module("H6309 indexed — 8-bit offset");

QUnit.test("LDA 100,X — 8-bit offset non-PC", function () {
  // zptest=100: 16≤100<128 → 8-bit path. postbyte = ixregPC("X")|0x88 = 0x00|0x88 = 0x88
  // bytes: start 2, s.bytes++ → 3. Offset func returns Parser.evaluate("100",vars) = 100
  var s = { opcode: "LDA", params: ["100", "X"], addr: 0x100, lens: [], bytes: 0 };
  var p = H6309.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.bytes, 3, "bytes");
  QUnit.assert.equal(p.lens[0], 0xa6, "opcode");
  QUnit.assert.equal(p.lens[1], 0x88, "postbyte 8-bit X");
  QUnit.assert.equal(typeof p.lens[2], "function", "offset is function");
  QUnit.assert.equal(p.lens[2](vars), 100, "offset value 100");
});

QUnit.test("LDA -5,X — negative offset in 5-bit range", function () {
  // zptest=-5: -5>-17 (strictly) → 5-bit path. postbyte = (-5)&0x1f = 27 = 0x1b. bytes=2.
  var s = { opcode: "LDA", params: ["-5", "X"], addr: 0x100, lens: [], bytes: 0 };
  var p = H6309.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.bytes, 2, "bytes — negative -5 is in 5-bit range");
  QUnit.assert.equal(p.lens[1], 0x1b, "postbyte 5-bit encoding of -5");
});

QUnit.test("LDA -20,X — 8-bit negative offset outside 5-bit range", function () {
  // zptest=-20: NOT in 5-bit range (-20 is NOT > -17). 8-bit path.
  // postbyte = 0x00|0x88 = 0x88. Offset func returns -20.
  var s = { opcode: "LDA", params: ["-20", "X"], addr: 0x100, lens: [], bytes: 0 };
  var p = H6309.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.bytes, 3, "bytes");
  QUnit.assert.equal(p.lens[1], 0x88, "postbyte 8-bit X negative");
  QUnit.assert.equal(typeof p.lens[2], "function", "offset is function");
  QUnit.assert.equal(p.lens[2](vars), -20, "raw offset value -20");
});

QUnit.test("LDA 300,PC — 8-bit PC-relative (exercises ixregPC PC branch)", function () {
  // zptest = 300 - vars._PC = 300 - 256 = 44 (subtracted because p2==="PC").
  // 44 is in 8-bit range (16 ≤ 44 < 128, not in 5-bit range).
  // ixregPC("PC")=0x04 → postbyte = 0x04|0x88 = 0x8c. bytes=3.
  // Offset func: n = 300 - vars._PC - s.bytes = 300 - 256 - 3 = 41. 41≥0 → 41.
  var s = { opcode: "LDA", params: ["300", "PC"], addr: 0x100, lens: [], bytes: 0 };
  var p = H6309.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.bytes, 3, "bytes");
  QUnit.assert.equal(p.lens[1], 0x8c, "postbyte 8-bit PC (ixregPC r===4 branch)");
  QUnit.assert.equal(typeof p.lens[2], "function", "offset is function");
  QUnit.assert.equal(p.lens[2](vars), 41, "PC-relative 8-bit: 300-256-3=41");
});

QUnit.test("LDA [100,X] — 8-bit indirect indexed", function () {
  // indir=0x10, zptest=100 → 8-bit. postbyte = 0x00|0x10|0x88 = 0x98. bytes=3.
  var s = { opcode: "LDA", params: ["[100", "X]"], addr: 0x100, lens: [], bytes: 0 };
  var p = H6309.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.bytes, 3, "bytes");
  QUnit.assert.equal(p.lens[1], 0x98, "postbyte 8-bit indirect X");
  QUnit.assert.equal(typeof p.lens[2], "function", "offset function");
  QUnit.assert.equal(p.lens[2](vars), 100, "offset value 100");
});

QUnit.module("H6309 indexed — 16-bit offset");

QUnit.test("LDA 500,X — 16-bit offset non-PC", function () {
  // zptest=500: outside 8-bit range → 16-bit path. s.bytes+=2 → 4.
  // postbyte = ixregPC("X")|0|0x89 = 0x00|0x89 = 0x89
  // lens[2] = offset func returning 500, lens[3] = null
  var s = { opcode: "LDA", params: ["500", "X"], addr: 0x100, lens: [], bytes: 0 };
  var p = H6309.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.bytes, 4, "bytes");
  QUnit.assert.equal(p.lens[0], 0xa6, "opcode");
  QUnit.assert.equal(p.lens[1], 0x89, "postbyte 16-bit X");
  QUnit.assert.equal(typeof p.lens[2], "function", "offset is function");
  QUnit.assert.equal(p.lens[2](vars), 500, "offset value 500");
  QUnit.assert.equal(p.lens[3], null, "null terminator");
});

QUnit.test("LDA 500,W — 16-bit W register (must be ≥128 to skip 8-bit path)", function () {
  // zptest=500 ≥ 128: skips 8-bit path (which has no W guard).
  // W guard at 16-bit path: p2[0]==="W" → postbyte = 0xaf|0 = 0xaf. bytes=4.
  var s = { opcode: "LDA", params: ["500", "W"], addr: 0x100, lens: [], bytes: 0 };
  var p = H6309.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.bytes, 4, "bytes");
  QUnit.assert.equal(p.lens[1], 0xaf, "postbyte W register 16-bit");
});

QUnit.test("LDA 1000,PC — 16-bit PC-relative", function () {
  // zptest=1000: outside 8-bit. ixregPC("PC")=0x04, postbyte=0x04|0x89=0x8d. bytes=4.
  // Offset func (PC path): n = 1000 - vars._PC - s.bytes = 1000 - 256 - 4 = 740
  var s = { opcode: "LDA", params: ["1000", "PC"], addr: 0x100, lens: [], bytes: 0 };
  var p = H6309.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.bytes, 4, "bytes");
  QUnit.assert.equal(p.lens[1], 0x8d, "postbyte 16-bit PC");
  QUnit.assert.equal(p.lens[2](vars), 740, "PC-relative offset 1000-256-4=740");
});

QUnit.test("LDA [500,X] — 16-bit indirect indexed", function () {
  // indir=0x10, zptest=500 → 16-bit. postbyte = 0x00|0x10|0x89 = 0x99. bytes=4.
  var s = { opcode: "LDA", params: ["[500", "X]"], addr: 0x100, lens: [], bytes: 0 };
  var p = H6309.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.bytes, 4, "bytes");
  QUnit.assert.equal(p.lens[1], 0x99, "postbyte 16-bit indirect X");
  QUnit.assert.equal(typeof p.lens[2], "function", "offset function");
  QUnit.assert.equal(p.lens[2](vars), 500, "offset value 500");
});

QUnit.module("H6309 indexed — null offset fallthrough");

QUnit.test("LDA UNDEF,PC — undefined symbol falls through to 16-bit (zptest===null)", function () {
  // Parser.evaluate("UNDEF", vars) throws → zptest=null.
  // 5-bit gate: ixregPC("PC")===4 → condition false, 5-bit path skipped.
  // 8-bit gate: zptest!==null is false → 8-bit path skipped.
  // Falls to 16-bit block: s.bytes+=2 → 4. W guard: "P"!=="W" → ixregPC("PC")|0x89 = 0x8d.
  var s = { opcode: "LDA", params: ["UNDEF", "PC"], addr: 0x100, lens: [], bytes: 0 };
  var p = H6309.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.bytes, 4, "bytes — null zptest falls through to 16-bit");
  QUnit.assert.equal(p.lens[1], 0x8d, "postbyte 0x8d (PC 16-bit)");
  QUnit.assert.equal(p.lens[3], null, "null terminator");
});

QUnit.module("H6309 indexed — indirect extended");

QUnit.test("LDA [$1000] — indirect extended 1-byte opcode", function () {
  // Single param starting with "[": indirect extended path.
  // ax[2]=0xa6 ≤ 256: lens[0]=0xa6, postbyte=1. lens[1]=0x9f, lens[2]=func, lens[3]=null.
  // bytes: start 2, s.bytes+=2 → 4.
  var s = { opcode: "LDA", params: ["[$1000]"], addr: 0x100, lens: [], bytes: 0 };
  var p = H6309.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.bytes, 4, "bytes");
  QUnit.assert.equal(p.lens[0], 0xa6, "opcode");
  QUnit.assert.equal(p.lens[1], 0x9f, "indirect extended postbyte 0x9f");
  QUnit.assert.equal(typeof p.lens[2], "function", "address function");
  QUnit.assert.equal(p.lens[2](vars), 0x1000, "address value $1000");
  QUnit.assert.equal(p.lens[3], null, "null terminator");
});

QUnit.test("LDW [$1000] — indirect extended 2-byte opcode", function () {
  // ax[2]=0x10a6 > 256: 2-byte prefix at lens[0..1], postbyte at lens[2]. s.bytes++ → 3.
  // Then s.bytes+=2 → 5. lens[2]=0x9f, lens[3]=func, lens[4]=null.
  var s = { opcode: "LDW", params: ["[$1000]"], addr: 0x100, lens: [], bytes: 0 };
  var p = H6309.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.bytes, 5, "bytes");
  QUnit.assert.equal(p.lens[0], 0x10, "prefix high byte");
  QUnit.assert.equal(p.lens[1], 0xa6, "prefix low byte");
  QUnit.assert.equal(p.lens[2], 0x9f, "indirect extended postbyte 0x9f");
  QUnit.assert.equal(typeof p.lens[3], "function", "address function");
  QUnit.assert.equal(p.lens[3](vars), 0x1000, "address value $1000");
});

QUnit.module("H6309 AIM indexed/extended");

QUnit.test("AIM #$FF,$1000 — extended addressing", function () {
  // After shift: aimPar="#$FF", params=["$1000"]. 1-param path, amode=3 (extended).
  // opcode ax[3]=0x72 (1-byte). bytes: 0→+1=1, amode=3→+2=3, aim block→+1=4.
  // lens=[0x72, 0xff, parserfunc, null]
  var s = { opcode: "AIM", params: ["#$FF", "$1000"], addr: 0x100, lens: [], bytes: 0 };
  var p = H6309.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.bytes, 4, "bytes");
  QUnit.assert.equal(p.lens[0], 0x72, "AIM extended opcode");
  QUnit.assert.equal(p.lens[1], 0xff, "immediate byte $FF");
  QUnit.assert.equal(typeof p.lens[2], "function", "address function");
  QUnit.assert.equal(p.lens[2](vars), 0x1000, "address $1000");
  QUnit.assert.equal(p.lens[3], null, "null terminator");
});

QUnit.test("AIM #$FF,0,X — indexed addressing", function () {
  // After shift: aimPar="#$FF", params=["0","X"]. 2-param indexed path.
  // s.bytes=2. aim block: lens[1]=0xff, postbyte=2, s.bytes=3.
  // ax[2]=0x62 (1-byte opcode), lens[0]=0x62. p1="0", zptest=0.
  // 5-bit path: lens[2] = ixreg("X")|(0&0x1f) = 0x00.
  var s = { opcode: "AIM", params: ["#$FF", "0", "X"], addr: 0x100, lens: [], bytes: 0 };
  var p = H6309.parseOpcode(s, vars, Parser);
  QUnit.assert.equal(p.bytes, 3, "bytes");
  QUnit.assert.equal(p.lens[0], 0x62, "AIM indexed opcode");
  QUnit.assert.equal(p.lens[1], 0xff, "immediate byte $FF");
  QUnit.assert.equal(p.lens[2], 0x00, "postbyte 5-bit 0,X = 0x00");
});

QUnit.module("H6309 error paths");

QUnit.test("PSHS with unrecognized register throws", function () {
  QUnit.assert.throws(function () {
    var s = { opcode: "PSHS", params: ["BADREGISTER"], addr: 0x100, lens: [], bytes: 0 };
    H6309.parseOpcode(s, vars, Parser);
  }, "PSHS with invalid register should throw");
});

QUnit.test("PSHU with unrecognized register throws", function () {
  QUnit.assert.throws(function () {
    var s = { opcode: "PSHU", params: ["BADREGISTER"], addr: 0x100, lens: [], bytes: 0 };
    H6309.parseOpcode(s, vars, Parser);
  }, "PSHU with invalid register should throw");
});

QUnit.test("EXG with only 1 parameter throws", function () {
  QUnit.assert.throws(function () {
    var s = { opcode: "EXG", params: ["A"], addr: 0x100, lens: [], bytes: 0 };
    H6309.parseOpcode(s, vars, Parser);
  }, "EXG with 1 param should throw");
});

QUnit.test("TFM with only 1 parameter throws", function () {
  QUnit.assert.throws(function () {
    var s = { opcode: "TFM", params: ["X+"], addr: 0x100, lens: [], bytes: 0 };
    H6309.parseOpcode(s, vars, Parser);
  }, "TFM with 1 param should throw");
});

QUnit.test("AIM without # prefix throws", function () {
  QUnit.assert.throws(function () {
    var s = { opcode: "AIM", params: ["$FF", "<$10"], addr: 0x100, lens: [], bytes: 0 };
    H6309.parseOpcode(s, vars, Parser);
  }, "AIM without # prefix should throw");
});

QUnit.test("Indexed mode with invalid base register throws", function () {
  QUnit.assert.throws(function () {
    // "Z" is not a valid indexed register (only X/Y/U/S/PC/W/E/F/D/A/B valid)
    var s = { opcode: "LDA", params: ["100", "Z"], addr: 0x100, lens: [], bytes: 0 };
    H6309.parseOpcode(s, vars, Parser);
  }, "Invalid base register should throw");
});

QUnit.test("parnibble with invalid register name throws", function () {
  QUnit.assert.throws(function () {
    var s = { opcode: "ADDR", params: ["D", "NOTAREG"], addr: 0x100, lens: [], bytes: 0 };
    H6309.parseOpcode(s, vars, Parser);
  }, "parnibble with unrecognized register should throw");
});
