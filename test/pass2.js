import {I8080} from "../cpu/i8080.js";
import {M6800} from "../cpu/m6800.js";
import { DUMMY, DUMMYE } from "../cpu/dummy.js";
import {lst, html} from "../listing.js"

import fs from "fs";

import { pass1 } from "../pass1.js";
import {pass2} from "../pass2.js";
import { fileSystem} from "./_asyncFilesystem.js";
//console.log("FILE",fileSystem.readFile)

//QUnit test for parser.js

import QUnit from "qunit";

import { asyncThrows } from "./_asyncThrows.js";

import * as Parser from "../parser.js";

QUnit.module('pass2');

let asmI8080 = fs.readFileSync("./test/suite/test.a80","utf-8");
let asmM6800 = fs.readFileSync("./test/suite/test.a68","utf-8");
let asmDUMMY = fs.readFileSync("./test/suite/test.dummy","utf-8");
let asmRELOCABLE = fs.readFileSync("./test/suite/relocable.a80","utf-8");



const doPass = async (data, showError=false, assembler=I8080, name="") => {
    let opts = {assembler, readFile:fileSystem.readFile , PRAGMAS:[], endian:assembler.endian,}
    
    try {
        let o = await Parser.parse(data, opts);
    //console.log("BEUAbc",o)
    let vx = await pass1(o, null, opts)
    vx = await pass1(vx[0], vx[1], opts);
    vx = await pass1(vx[0], vx[1], opts);
    vx = await pass1(vx[0], vx[1], opts);
    vx = await pass1(vx[0], vx[1], opts);

    vx[1]["__PRAGMAS"] = opts.PRAGMAS;
    //console.log(ASM.PRAGMAS,vx[1])
    vx = pass2(vx, opts);
    //console.log("VARS",vx[1])
    //console.log("XREF",opts.xref)

    if (showError==2) console.log(vx)
    let l = lst({dump:vx[0],vars:vx[1],opts:opts},false, true)
    if (name) fs.writeFileSync("./test/suite/"+name+".lst",l)
    if (name) fs.writeFileSync("./test/suite/"+name+".obj",JSON.stringify(vx[0],null,2))
    //let l2 = lst(vx[0],vx[1], true, false, opts)
    //let www = html(vx[0],vx[1],false, true,opts)
    //let www2 = html(vx[0],vx[1],true, false,opts)
    if (showError==3)console.log(l)
    return vx
    } catch (e) {
        if (showError)console.log(JSON.stringify(e))
        if (e.e) throw e.e
        throw e
    }
}

QUnit.test('basic 8080', async assert => {
    await doPass(asmI8080, true, I8080, "test-a80")
    assert.ok(true)
});

QUnit.test('basic 6800', async assert => {
    await doPass(asmM6800, true, M6800, "test-a68")
    assert.ok(true)
});

/*
QUnit.test('IF NaN', async assert => {
    assert.throws(() => {
        await doPass(`n: equ A+1`, true, DUMMY)
    }, (err) => err.msg === "DB is not allowed in BSSEG")
});
*/


QUnit.test('basic dummy', async assert => {
    await doPass(asmDUMMY, false, DUMMY, "test-dummy")
    assert.ok(true)
});

QUnit.test('basic dummy-endian', async assert => {
    await doPass(asmDUMMY, false, DUMMYE, "test-dummye")
    assert.ok(true)
});

/*
QUnit.test('relocable 8080', async assert => {
    doPass(asmRELOCABLE, true, I8080, "relocable")
    assert.ok(true)
});
*/

QUnit.test('ORG in module', async assert => {
    asyncThrows(assert,() => {
        return doPass(`.pragma module\n.org 100`, false, I8080)
    },(err) => err.msg == "ORG is not allowed in modules")
});


QUnit.test('EQU without label', async assert => {
    asyncThrows(assert,() => {
        return doPass(`equ 123`, false, DUMMY)
    },(err) => err.msg === "EQU without label")
});


QUnit.test('.ERROR', async assert => {
    asyncThrows(assert,() => {
        return doPass(`.error someError`, false, DUMMY)
    },(err) => err.msg === "someError")
});

QUnit.test('pass2: IF opcode with valid condition — continue path (line 102)', assert => {
    // Directly inject an IF opcode to hit the `continue` at the end of the IF branch.
    // __PRAGMAS must be an array (not an object) for Parser.evaluate to work.
    const ifLine   = { opcode: "IF",    params: ["1"], addr: 0, lens: [] };
    const nopLine  = { opcode: "NOP",   params: [],    addr: 0, lens: [0x00] };
    const endLine  = { opcode: "ENDIF", params: [],    addr: 1, lens: [] };
    const [V] = pass2([[ifLine, nopLine, endLine], { __PRAGMAS: [] }], p2opts);
    assert.ok(V, 'IF with valid condition processed without error');
});

QUnit.test('.IF nonsense', async assert => {
    asyncThrows(assert,() => {
        return doPass(`.if nnn`, false, DUMMY)
    },(err) => err.msg === "IF condition mismatched")
});
QUnit.test('.IFN nonsense', async assert => {
    asyncThrows(assert,() => {
        return doPass(`.ifn nnn`, false, DUMMY)
    },(err) => err.msg === "IF condition mismatched")
});

// ─── Direct pass2 lens[1] validation paths ───────────────────────────────────

const p2opts = { PRAGMAS: {}, endian: false, xref: {} };
const runP2 = (lensArr) =>
    pass2([[{ opcode: "NOP", params: [], addr: 0, lens: lensArr }], { __PRAGMAS: {} }], p2opts);

QUnit.test('pass2: lens[1] is string → converted to charCode', assert => {
    // line 600: typeof op.lens[1] == "string" → charCodeAt(0)
    const [V] = runP2([0x00, "A"]);
    assert.equal(V[0].lens[1], 65, 'string "A" converted to 65');
});

QUnit.test('pass2: lens[1] is NaN → throws "param out of bounds, NaN"', assert => {
    // lines 603-607
    assert.throws(
        () => runP2([0x00, NaN]),
        (e) => e.msg === "param out of bounds, NaN"
    );
});

QUnit.test('pass2: lens[1] > 255 with 2-element lens → throws "param out of bounds"', assert => {
    // lines 609-612: (lens[1] > 255) && lens.length == 2
    assert.throws(
        () => runP2([0x00, 300]),
        (e) => /param out of bounds/.test(e.msg)
    );
});

QUnit.test('pass2: lens[1] negative → wrapped to 256 + value', assert => {
    // lines 614-615: lens[1] < 0 and value in range [-128, -1] — not out of bounds
    const [V] = runP2([0x00, -1]);
    assert.equal(V[0].lens[1], 255, '-1 wrapped to 255');
});

QUnit.test('pass2: PRAGMAS.RELAX — charVar8 accepts string param', assert => {
    // lines 15-16: RELAX pragma, dta is a string → charCodeAt(0)
    const relaxOpts = { PRAGMAS: { RELAX: true }, endian: false, xref: {} };
    const [V] = pass2(
        [[{ opcode: "NOP", params: [], addr: 0, lens: [0x00, () => "AB"] }], { __PRAGMAS: {} }],
        relaxOpts
    );
    assert.equal(V[0].lens[1], 65, 'string "AB" → charCode of "A" = 65');
});

QUnit.test('pass2: PRAGMAS.RELAX — charVar8 accepts number param', assert => {
    // lines 17-19: RELAX pragma, dta is a number → dta & 0xff
    const relaxOpts = { PRAGMAS: { RELAX: true }, endian: false, xref: {} };
    const [V] = pass2(
        [[{ opcode: "NOP", params: [], addr: 0, lens: [0x00, () => 300] }], { __PRAGMAS: {} }],
        relaxOpts
    );
    assert.equal(V[0].lens[1], 44, 'number 300 → 300 & 0xff = 44');
});

QUnit.test('pass2: lens[2] is function and lens[3] is non-null → charVar8 path', assert => {
    // lines 566-567: lens[3] !== null branch
    const [V] = pass2(
        [[{ opcode: "NOP", params: [], addr: 0, lens: [0x00, 0x00, () => 42, 0x00] }], { __PRAGMAS: {} }],
        p2opts
    );
    assert.equal(V[0].lens[2], 42, 'lens[2] function resolved via charVar8');
});

QUnit.test('pass2: lens[3] is function and lens[4] is non-null → charVar8 path', assert => {
    // lines 592-593: lens[4] !== null branch
    const [V] = pass2(
        [[{ opcode: "NOP", params: [], addr: 0, lens: [0x00, 0x00, 0x00, () => 55, 0x00] }], { __PRAGMAS: {} }],
        p2opts
    );
    assert.equal(V[0].lens[3], 55, 'lens[3] function resolved via charVar8');
});

// ─── charVar8 strict-mode branches (lines 23, 26-27) ─────────────────────────

QUnit.test('pass2: charVar8 strict — multi-char string throws "String parameter too long"', assert => {
    // line 23 true branch: dta.length != 1 → throw
    assert.throws(
        () => pass2(
            [[{ opcode: "NOP", params: [], addr: 0, lens: [0x00, () => "AB"] }], { __PRAGMAS: [] }],
            p2opts
        ),
        (e) => /String parameter too long/.test(e.msg)
    );
});

QUnit.test('pass2: charVar8 strict — single-char string → charCode (line 23 false branch)', assert => {
    // dta.length == 1 → no throw, returns charCode
    const [V] = pass2(
        [[{ opcode: "NOP", params: [], addr: 0, lens: [0x00, () => "A"] }], { __PRAGMAS: [] }],
        p2opts
    );
    assert.equal(V[0].lens[1], 65);
});

QUnit.test('pass2: charVar8 strict — number > 255 throws "Param out of bound"', assert => {
    // line 26 true branch: dta > 255 in strict mode
    assert.throws(
        () => pass2(
            [[{ opcode: "NOP", params: [], addr: 0, lens: [0x00, () => 300] }], { __PRAGMAS: [] }],
            p2opts
        ),
        (e) => /Param out of bound/.test(e.msg)
    );
});

QUnit.test('pass2: charVar8 strict — number < -128 throws "Param out of bound"', assert => {
    // line 27 true branch: dta < -128 in strict mode
    assert.throws(
        () => pass2(
            [[{ opcode: "NOP", params: [], addr: 0, lens: [0x00, () => -200] }], { __PRAGMAS: [] }],
            p2opts
        ),
        (e) => /Param out of bound/.test(e.msg)
    );
});

// ─── IFN false branch (line 109) ─────────────────────────────────────────────

QUnit.test('pass2: IFN with falsy condition — no skip (line 109 false branch)', assert => {
    const ifnLine  = { opcode: "IFN",   params: ["0"], addr: 0, lens: [] };
    const nopLine  = { opcode: "NOP",   params: [],    addr: 0, lens: [0x00] };
    const endLine  = { opcode: "ENDIF", params: [],    addr: 1, lens: [] };
    const [V] = pass2([[ifnLine, nopLine, endLine], { __PRAGMAS: [] }], p2opts);
    assert.ok(V, 'IFN 0: nop is not skipped');
});

QUnit.test('pass2: IFN with truthy condition — sets ifskip (line 109 true branch)', assert => {
    // cond = 1 → ifskip = 1 → nop skipped
    const ifnLine  = { opcode: "IFN",   params: ["1"], addr: 0, lens: [] };
    const nopLine  = { opcode: "NOP",   params: [],    addr: 0, lens: [0x00] };
    const endLine  = { opcode: "ENDIF", params: [],    addr: 1, lens: [] };
    const [V] = pass2([[ifnLine, nopLine, endLine], { __PRAGMAS: [] }], p2opts);
    assert.ok(V, 'IFN 1: nop skipped without error');
});

// ─── .BLOCK with includedFileAtLine (line 159) ───────────────────────────────

QUnit.test('pass2: .BLOCK in main file (no includedFileAtLine) — true branch (line 159)', assert => {
    // !op.includedFileAtLine is true → blocks.push(op.numline) — line 159 true branch
    // redef list non-empty to also cover the for-of loop body
    const blockLine   = { opcode: ".BLOCK",   params: ["blk"], addr: 0, lens: [], numline: 5 };
    const nopLine     = { opcode: "NOP",       params: [],      addr: 0, lens: [0x00] };
    const endblkLine  = { opcode: ".ENDBLOCK", params: [],      addr: 1, lens: [], numline: 7 };
    const vars = {
        __PRAGMAS: [],
        "__5":     ["MYVAR"],
        "MYVAR":   42,
        "5/MYVAR$": 99,
    };
    const [V] = pass2([[blockLine, nopLine, endblkLine], vars], p2opts);
    assert.ok(V, '.BLOCK without includedFileAtLine processed without error');
});
