import {I8080} from "../cpu/i8080.js";
import * as Parser from "../parser.js";

QUnit.module("ASM8080")

//test suite
let data = `label: 
jmp label   
MOV A,C
MvI a, 0x0f
lxi b, 1234
stax b
push psw
`


const doParse = (data) => {
    try {

    
    let lines = Parser.parse(data, {assembler:I8080});
    //console.log(lines)
    return lines
    } catch (e) {
        console.log(e)
        return e
    }
}

const testParse = (data, showError=false) => {
    try {

    
    let lines = Parser.parse(data, {assembler:I8080});
    return "OK"
    } catch (e) {
        if (showError) console.log(e)
        throw e
    }
}

QUnit.test('vanilla', assert => {
  assert.equal(typeof doParse(data), "object", "toLines returns an object");
});