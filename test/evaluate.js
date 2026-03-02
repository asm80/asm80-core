/// <reference path="../expression-parser.js" />

import {I8080} from "../cpu/i8080.js";

//QUnit test for expression-parser.js

import QUnit from "qunit";

import {Parser} from "../expression-parser.js";

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