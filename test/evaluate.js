/// <reference path="../expression-parser.js" />

import {I8080} from "../cpu/i8080.js";

//QUnit test for expression-parser.js

import QUnit from "qunit";

import {Parser, Token} from "../expression-parser.js";

import { fptozx } from "../utils/fp.js";


QUnit.module('expression-parser');
QUnit.config.hidepassed = true;




const doParse = (data) => {
    try {

    
    let lines = Parser.evaluate(data);
    //console.log(Parser.parse(data).tokens.map(x=>x.toString()))
    return lines
    } catch (e) {
        console.log(e)
        return e
    }
}


QUnit.test('vanilla', assert => {
  assert.equal(doParse(`2+3*4`), 14, "2+3*4");
});

QUnit.test('2PI', assert => {
    assert.equal(doParse(`2*5`), 10, "2+3*4");
    assert.equal(doParse(`0x10`), 16, "0x10");
    assert.equal(doParse(`$10`), 16, "$10");
    assert.equal(doParse(`1 + +1 \t \n \r`), 2, "$10");

    assert.equal(doParse(`lsb(2)`), 2, "2+3*4");
  });
  

  
QUnit.test("(2+3*4", assert => {
    assert.throws(() => {
        let data = `(2+3*4`
        Parser.parse(data);
    })
})


  
QUnit.test("fptozx1", assert => {

    let data = fptozx(80, true);
    assert.deepEqual(data, [0,0,80,0,0], "fptozx1");
})
QUnit.test("fptozx-1", assert => {

    let data = fptozx(-1, true);
    assert.deepEqual(data, [0,255,255,255,0], "fptozx1");
})


QUnit.test("fptozx2", assert => {

    let data = fptozx(0.0000058, true);
    assert.deepEqual(data, [111,66,157,158,225], "fptozx2");
})

QUnit.test("fptozx3", assert => {
    assert.throws(() => {
        let data = fptozx(3e99, true);
    })
})
QUnit.test("fptozx4", assert => {

    let data = fptozx(23e-99);
    assert.deepEqual(data, [0,0,0,0,0], "fptozx2");
})

  
QUnit.test("(2+3*4))", assert => {
    assert.throws(() => {
        let data = `(2+3*4))`
        Parser.parse(data);
    })
})

// --- Token.toString() ---

QUnit.test('Token.toString() — all switch branches', assert => {
  // TNUMBER (0)
  assert.equal(new Token(0, 0, 0, 42).toString(), 42, "TNUMBER → number_");
  // TOP1 (1)
  assert.equal(new Token(1, "lsb", 0, 0).toString(), "lsb", "TOP1 → index_");
  // TOP2 (2)
  assert.equal(new Token(2, "+", 0, 0).toString(), "+", "TOP2 → index_");
  // TVAR (3)
  assert.equal(new Token(3, "X", 0, 0).toString(), "X", "TVAR → index_");
  // TFUNCALL (4)
  assert.equal(new Token(4, -1, 0, 0).toString(), "CALL", "TFUNCALL → 'CALL'");
  // default (5)
  assert.equal(new Token(99, 0, 0, 0).toString(), "Invalid Token", "default → 'Invalid Token'");
});

QUnit.test('Token number_ defaults to 0 when null/undefined', assert => {
  assert.equal(new Token(0, 0, 0, null).number_, 0, "null → 0");
  assert.equal(new Token(0, 0, 0, undefined).number_, 0, "undefined → 0");
});

// --- TFUNCALL in evaluate(): single-arg (f.call) and multi-arg (f.apply) ---
// Note: the parser uppercases variable names, so function keys in values must be UPPERCASE

QUnit.test('TFUNCALL — single-arg function call (f.call path)', assert => {
  // Pass function via values with uppercase key so TVAR lookup finds it
  const myFac = (n) => { let r = n; while (n > 1) r *= --n; return r; };
  assert.equal(Parser.parse("MYFAC(3)").evaluate({MYFAC: myFac}), 6, "MYFAC(3) = 6");
  assert.equal(Parser.parse("MYFAC(5)").evaluate({MYFAC: myFac}), 120, "MYFAC(5) = 120");
});

QUnit.test('TFUNCALL — multi-arg function call via f.apply (array arg)', assert => {
  // Comma operator builds an array: (3,4) → [3,4]; f.apply is used for array args
  assert.equal(Parser.parse("MYMAX(3,4)").evaluate({MYMAX: Math.max}), 4, "MYMAX(3,4) = 4");
  assert.equal(Parser.parse("MYMIN(3,4)").evaluate({MYMIN: Math.min}), 3, "MYMIN(3,4) = 3");
});

// --- Pragmas in evaluate() ---

QUnit.test('__PRAGMAS — ROUNDFLOAT rounds result', assert => {
  const v = {__PRAGMAS: ["ROUNDFLOAT"]};
  assert.equal(Parser.parse("1.7").evaluate(v), 2, "1.7 → 2 with ROUNDFLOAT");
  assert.equal(Parser.parse("1.2").evaluate(v), 1, "1.2 → 1 with ROUNDFLOAT");
});

QUnit.test('__PRAGMAS — FLOAT returns float unchanged', assert => {
  const v = {__PRAGMAS: ["FLOAT"]};
  assert.ok(Math.abs(Parser.parse("1.7").evaluate(v) - 1.7) < 0.0001, "FLOAT → returns 1.7");
});

QUnit.test('__PRAGMAS — NOFLOAT truncates to integer', assert => {
  const v = {__PRAGMAS: ["NOFLOAT"]};
  assert.equal(Parser.parse("1.9").evaluate(v), 1, "NOFLOAT → 1");
});

// --- usage() ---

QUnit.test('usage() without argument uses {} fallback (|| {} branch)', assert => {
  const refs = Parser.parse("1+2").usage();
  assert.deepEqual(refs, [], "no variables referenced → []");
});

QUnit.test('usage() — TFUNCALL single-arg', assert => {
  const myFn = (n) => n * 2;
  const refs = Parser.parse("MYFN(3)").usage({MYFN: myFn});
  // usage() lists every symbol referenced, including the called function name
  assert.deepEqual(refs, ["MYFN"], "MYFN is listed as referenced symbol");
});

QUnit.test('usage() — TFUNCALL multi-arg', assert => {
  const refs = Parser.parse("MYMAX(3,4)").usage({MYMAX: Math.max});
  assert.deepEqual(refs, ["MYMAX"], "MYMAX is listed as referenced symbol");
});

// --- Parser.prototype.evaluate() instance method ---

QUnit.test('Parser instance evaluate() method', assert => {
  const p = new Parser();
  assert.equal(p.evaluate("1+2"), 3, "instance evaluate() works");
  assert.equal(p.evaluate("3*4"), 12, "instance evaluate() 3*4");
});

// --- fbequ true branch ---

QUnit.test('fbequ operator — equal values return 1', assert => {
  assert.equal(Parser.evaluate("2=2"), 1, "2=2 → 1");
  assert.equal(Parser.evaluate("2=3"), 0, "2=3 → 0");
});

// --- shouldbehex && base !== 16 → isNumber returns false ---

QUnit.test('hex letter without hex prefix causes isNumber to return false → throws', assert => {
  // "1A" — digit then hex letter, no 0x prefix → shouldbehex=true, base=10 → return false
  assert.throws(() => Parser.parse("1A"), "1A is not a valid token");
});

// --- isComment() with unclosed /* → pos=1 branch ---

QUnit.test('unclosed /* comment is swallowed (pos===1 branch)', assert => {
  // "1 /* unclosed" — operator '/' triggers isComment, no '*/' found → indexOf=-1 → pos=1
  const result = Parser.evaluate("1 /* unclosed comment");
  assert.equal(result, 1, "expression before /* is returned");
});

// --- unexpected function error ---

QUnit.test('"unexpected function" error when op1 appears after primary', assert => {
  // "1 lsb" — after number, FUNCTION is not expected → throws {msg: "...unexpected function..."}
  assert.throws(
    () => Parser.parse("1 lsb"),
    (e) => /unexpected function/.test(e.msg),
    "op1 after primary throws with 'unexpected function' in msg"
  );
});

// --- Parser.usage static ---

QUnit.test('Parser.usage() static method', assert => {
  assert.deepEqual(Parser.usage("X+1", {X: 5}), ["X"], "X is referenced");
});

// --- ! operator (bare, not !=) tokenizer branch ---

QUnit.test('bare ! operator tokenizes then throws in evaluate', assert => {
  // isOperator: code===33, next char not '=' → tokenindex="!", tokenprio=5
  // In evaluate ops2["!"] is undefined → TypeError when called
  assert.throws(() => Parser.evaluate("2!1"), "bare ! throws in evaluate");
});

// --- string operands in arithmetic ---

QUnit.test('string subtraction — typeof a === string branch in sub()', assert => {
  // 'ab' is a string literal; sub() calls stringCode('ab') = 97*256+98 = 24930
  assert.equal(Parser.evaluate("'ab'-0"), 24930, "string code of 'ab'");
  assert.equal(Parser.evaluate("1-'b'"), 1 - 98, "subtract string 'b'");
});

QUnit.test('string multiplication — typeof a === string branch in mul()', assert => {
  // mul("ab", 3) → "ababab"
  assert.equal(Parser.evaluate("'ab'*3"), "ababab", "string * n = repetition");
});

// --- comparison operators (fblt, fbgt, fble, fbge — both branches) ---

QUnit.test('comparison operators via ?< and ?> syntax', assert => {
  // fblt true branch: 1?<2 → 1
  assert.equal(Parser.evaluate("1?<2"), 1, "1 < 2 → 1");
  // fblt false branch: 2?<1 → 0
  assert.equal(Parser.evaluate("2?<1"), 0, "2 < 1 → 0");
  // fbgt false branch: 1?>2 → 0
  assert.equal(Parser.evaluate("1?>2"), 0, "1 > 2 → 0");
  // fble true branch: 1?<=2 → 1
  assert.equal(Parser.evaluate("1?<=2"), 1, "1 <= 2 → 1");
  // fbge false branch: 1?>=2 → 0
  assert.equal(Parser.evaluate("1?>=2"), 0, "1 >= 2 → 0");
});

// --- fbnequ both branches ---

QUnit.test('!= operator — equal values return 0 (true branch)', assert => {
  assert.equal(Parser.evaluate("1!=1"), 0, "1 != 1 → 0");
  assert.equal(Parser.evaluate("1!=2"), 1, "1 != 2 → 1");
});

// --- nullary function call: func() → NULLARY_CALL branch ---

QUnit.test('nullary function call MYFUNC() — NULLARY_CALL branch', assert => {
  // isRightParenth with NULLARY_CALL expected → pushes empty array token
  const result = Parser.parse("MYFUNC()").evaluate({MYFUNC: () => 42});
  assert.equal(result, 42, "nullary call returns 42");
});

// --- unexpected ) and , error paths ---

QUnit.test('unexpected ")" at start of expression throws', assert => {
  // RPAREN not expected when PRIMARY is expected (empty nstack state)
  assert.throws(
    () => Parser.parse(")1+2"),
    (e) => /unexpected/.test(e.msg),
    'unexpected ")" path covered'
  );
});

QUnit.test('unexpected "," at start of expression throws', assert => {
  // COMMA not expected when PRIMARY is expected
  assert.throws(
    () => Parser.parse(",1+2"),
    (e) => /unexpected/.test(e.msg),
    'unexpected "," path covered'
  );
});

QUnit.test('HIGH and LOW functions', assert => {
    // Základní funkčnost - uppercase
    assert.equal(doParse(`HIGH(0x1234)`), 0x12, "HIGH(0x1234) = 0x12");
    assert.equal(doParse(`LOW(0x1234)`),  0x34, "LOW(0x1234) = 0x34");

    // Lowercase varianta
    assert.equal(doParse(`high(0x1234)`), 0x12, "high(0x1234) = 0x12");
    assert.equal(doParse(`low(0x1234)`),  0x34, "low(0x1234) = 0x34");

    // Hranice hodnot
    assert.equal(doParse(`HIGH(0xFF)`),   0x00, "HIGH(0xFF) = 0");
    assert.equal(doParse(`LOW(0xFF)`),    0xFF, "LOW(0xFF) = 0xFF");
    assert.equal(doParse(`HIGH(0x100)`),  0x01, "HIGH(0x100) = 1");
    assert.equal(doParse(`LOW(0x100)`),   0x00, "LOW(0x100) = 0");
    assert.equal(doParse(`HIGH(0)`),      0x00, "HIGH(0) = 0");
    assert.equal(doParse(`LOW(0)`),       0x00, "LOW(0) = 0");
    assert.equal(doParse(`HIGH(0xFFFF)`), 0xFF, "HIGH(0xFFFF) = 0xFF");
    assert.equal(doParse(`LOW(0xFFFF)`),  0xFF, "LOW(0xFFFF) = 0xFF");

    // V kombinaci s výrazy
    assert.equal(doParse(`HIGH(256*3 + 5)`), 3, "HIGH(256*3+5) = 3");
    assert.equal(doParse(`LOW(256*3 + 5)`),  5, "LOW(256*3+5) = 5");
});