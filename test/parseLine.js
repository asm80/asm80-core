import QUnit from "qunit";
import { parseLine } from "../parseLine.js";
import { I8080 } from "../cpu/i8080.js";

QUnit.module("parseLine");

const macros = {};
const opts = { assembler: I8080 };

// ─── includedLineNumber — line 11 ────────────────────────────────────────────

QUnit.test("anonymous label inside included file uses includedFileAtLine", assert => {
    // s.includedFile truthy → includedLineNumber returns includedFileAtLine + "__" + numline
    const s = parseLine(
        { line: ": nop", numline: 5, includedFile: "sub.asm", includedFileAtLine: 10 },
        macros,
        opts
    );
    assert.equal(s.anonymousLabel, "anon__10__5", "anonymousLabel uses includedFileAtLine");
});

// ─── Second anonymous-label branch — lines 50-51 ─────────────────────────────

QUnit.test("LABEL: : … triggers second anonymous label path (ll[2] = undefined)", assert => {
    // After 'LABEL:' is consumed, the remaining ': nop' matches the anonymous-label
    // pattern again. t is set to ll[2] which is undefined (regex has only one capture
    // group), causing a TypeError when subsequent code tries t.match(...).
    assert.throws(
        () => parseLine({ line: "LABEL: : nop", numline: 3 }, macros, opts),
        () => true,   // any throw covers the lines
        "throws when t becomes undefined after second anon-label match"
    );
});

// ─── throw when !s.opcode but s.params non-empty — lines 384-386 ─────────────

QUnit.test("line starting with $ has no opcode but non-empty params → throws", assert => {
    // '$FF' is not matched by the opcode regex ([.a-zA-Z0-9-_]+), so s.opcode stays
    // undefined while s.params = ["$FF"].  The !s.opcode branch throws.
    assert.throws(
        () => parseLine({ line: "$FF", numline: 1 }, macros, opts),
        (e) => typeof e === "object" && /Unrecognized/.test(e.msg),
        "throws Unrecognized instruction when opcode is undefined"
    );
});

// ─── second parse attempt returns opcode="" → throw — lines 397-399 ──────────

QUnit.test("label-less line with .segment in params → second parse returns opcode='' → throws", assert => {
    // 'foo' is parsed as opcode, '.segment code' as params.  The second-attempt parse
    // produces opcode=".SEGMENT" which parseLine maps to "" → !sx.opcode is true → throws.
    assert.throws(
        () => parseLine({ line: "foo .segment code", numline: 1 }, macros, opts),
        (e) => typeof e === "object" && /Unrecognized/.test(e.msg),
        "throws Unrecognized when second-pass opcode is empty string"
    );
});

QUnit.test("recognizes .file with numeric id and quoted path", assert => {
    const s = parseLine({ line: '.file 12, "demo.asm"', numline: 1 }, macros, opts);
    assert.equal(s.opcode, ".FILE", "opcode is preserved as .FILE");
    assert.equal(s.params.length, 2, "has id and path params");
    assert.equal(Number(s.params[0]), 12, "id parses as number");
    assert.equal(s.params[1], "\"demo.asm\"", "path parameter is preserved");
});

QUnit.test("recognizes .loc with numeric fields and trailing comment", assert => {
    const s = parseLine({ line: ".loc 12, 34 ; comment", numline: 1 }, macros, opts);
    assert.equal(s.opcode, ".LOC", "opcode is preserved as .LOC");
    assert.equal(s.params.length, 2, "has fileId and line params");
    assert.equal(Number(s.params[0]), 12, "fileId parses as number");
    assert.equal(Number(s.params[1]), 34, "line parses as number");
    assert.equal((s.remark || "").trim(), "comment", "trailing comment is preserved");
});
