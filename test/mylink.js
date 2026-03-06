import { asm } from "../asm.js";
import { parseLnk } from "../parseLnk.js";
import { ihex } from "../utils/ihex.js";

import fs from "fs";
import QUnit from "qunit";

QUnit.module('mylink');

const SUITE = "./test/suite/";

// Minimal in-memory filesystem adapter for the linker.
// Reads files from SUITE directory by bare filename.
const fileSystem = {
    readFile: (filename) => {
        // filename may be a bare name (legacy) or include path/extension
        const base = filename.includes("/") ? filename : SUITE + filename;
        return fs.readFileSync(base, "utf-8");
    }
};

// ── Tests ──────────────────────────────────────────────────────────────────

QUnit.test('parseLnk — parse mytest.lnk', assert => {
    const raw = fs.readFileSync(SUITE + "mytest.lnk", "utf-8");
    const lnk = parseLnk(raw);

    assert.strictEqual(lnk.segments.CSEG, "0x8000", "CSEG base address");
    assert.strictEqual(lnk.segments.DSEG, "0x8100", "DSEG base address");
    assert.strictEqual(lnk.vars.BIOS_PRINT, "0x5", "BIOS_PRINT var");
    assert.deepEqual(lnk.modules, ["relocable.obj80"], "modules list");
    assert.deepEqual(lnk.library, ["mylib-0.1.0.lib80"], "library list");
    assert.strictEqual(lnk.entrypoint, "main", "entrypoint");
});

QUnit.test('asm.link — link mytest.lnk', async assert => {
    const raw = fs.readFileSync(SUITE + "mytest.lnk", "utf-8");
    const lnk = parseLnk(raw);

    const out = await asm.link(lnk, fileSystem);
    const hex = ihex(out);
    fs.writeFileSync(SUITE + "mytest.hex", hex);

    assert.ok(out, "link returned a result");
    assert.ok(Array.isArray(out.dump), "dump is an array");
    assert.ok(out.dump.length > 0, "dump is non-empty");
    assert.ok(out.entry, "entry point is resolved");
    assert.strictEqual(out.CSEG, 0x8000, "CSEG placed at 0x8000");
    assert.strictEqual(out.DSEG, 0x8100, "DSEG placed at 0x8100");
});

QUnit.test('asm.link — entry point is in CSEG', async assert => {
    const raw = fs.readFileSync(SUITE + "mytest.lnk", "utf-8");
    const lnk = parseLnk(raw);
    const out = await asm.link(lnk, fileSystem);

    assert.strictEqual(out.entry.seg, "CSEG", "entry segment");
    assert.ok(out.entry.addr >= 0x8000, "entry addr >= CSEG base");
});

QUnit.test('asm.link — produces Intel HEX', async assert => {
    const raw = fs.readFileSync(SUITE + "mytest.lnk", "utf-8");
    const lnk = parseLnk(raw);
    const out = await asm.link(lnk, fileSystem);

    out.dump.unshift({ opcode: ".PRAGMA", params: ["SEGMENT"] });
    out.dump.unshift({ opcode: ".PRAGMA", params: ["HEXLEN", "32"] });

    const hex = ihex(out);
    assert.ok(typeof hex === "string", "ihex returns a string");
    assert.ok(hex.includes(":"), "output contains HEX records");

    fs.writeFileSync(SUITE + "mytest.combined.hex", hex);
    assert.ok(true, "HEX written to mytest.combined.hex");
});
