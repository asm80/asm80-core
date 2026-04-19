import QUnit from "qunit";
import { promises as fs } from "fs";

import { asm } from "../asm.js";
import { parseLnk } from "../parseLnk.js";
import { fileSystem } from "./_asyncFilesystem.js";

QUnit.module("segments-generalization");

QUnit.test("compile supports .SEGMENT and .HEAPSEG alias", async assert => {
    const source = `
.cseg
ENTRY: dw DATA_LABEL
.segment foo
DATA_LABEL: db 0x42
.heapseg
HEAP_LABEL: db 0x99
`;
    const out = await asm.compile(source, fileSystem, { assembler: "I8080" });

    assert.strictEqual(out.vars["ENTRY$$seg"], "CSEG", "ENTRY label remains in CSEG");
    assert.strictEqual(out.vars["DATA_LABEL$$seg"], "FOO", "custom segment name is tracked");
    assert.strictEqual(out.vars["HEAP_LABEL$$seg"], "HEAPSEG", "HEAPSEG alias is tracked");
});

QUnit.test("E2E: asm.link honors custom segments from linker script", async assert => {
    const suiteDir = "./test/suite/";
    const srcName = "segments-generalization-main.a80";
    const objName = "segments-generalization-main.obj80";
    const lnkName = "segments-generalization-main.lnk";

    const source = `
.pragma module
.export ENTRY
.cseg
ENTRY: dw DATA_LABEL
.segment foo
DATA_LABEL: db 0x42
.heapseg
HEAP_LABEL: db 0x99
`;

    const lnkText = `
segments:
  CSEG: 0x1000
  FOO: 0x2200
  HEAPSEG: 0x3300
modules:
  - ${objName}
entrypoint: ENTRY
`;

    await fs.writeFile(suiteDir + srcName, source, "utf-8");
    await fs.writeFile(suiteDir + lnkName, lnkText, "utf-8");

    try {
        const { obj } = await asm.compileFromFile(srcName, fileSystem, { assembler: "I8080" });
        await fs.writeFile(suiteDir + objName, JSON.stringify(obj, null, 2), "utf-8");

        const parsed = parseLnk(await fs.readFile(suiteDir + lnkName, "utf-8"));
        parsed.library = parsed.library || [];
        const linked = await asm.link(parsed, fileSystem, "segments-generalization-main");

        const csegWord = linked.dump.find((x) => x.segment === "CSEG" && x.lens && x.lens.length >= 2);
        const fooData = linked.dump.find((x) => x.segment === "FOO" && x.lens && x.lens.length > 0);
        const heapData = linked.dump.find((x) => x.segment === "HEAPSEG" && x.lens && x.lens.length > 0);

        assert.ok(csegWord, "cseg word exists");
        assert.ok(fooData, "foo segment output exists");
        assert.ok(heapData, "heapseg output exists");
        assert.strictEqual(fooData.addr, 0x2200, "FOO base comes from linker script");
        assert.strictEqual(heapData.addr, 0x3300, "HEAPSEG base comes from linker script");
        assert.deepEqual(csegWord.lens.slice(0, 2), [0x00, 0x22], "dw DATA_LABEL is relocated to FOO base");
    } finally {
        for (const f of [srcName, objName, lnkName]) {
            try { await fs.unlink(suiteDir + f); } catch (_e) {}
        }
    }
});
