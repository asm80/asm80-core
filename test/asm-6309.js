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
