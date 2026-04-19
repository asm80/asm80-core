import { linkModules } from "../objcode.js";
import QUnit from "qunit";

QUnit.module("link-z80 multi-module relocation");

QUnit.test("extern call is relocated to module placement, not only segment base", function(assert) {
    const crt0 = {
        code: [
            { lens: [0xCD, 0x00, 0x00], segment: "CSEG", ext: "MAIN", wia: 1, add: 0 },
        ],
        externs: ["MAIN"],
        exports: {},
        cpu: "z80",
        endian: false,
        name: "crt0",
        seglen: { CSEG: 3 },
    };
    const app = {
        code: [
            { lens: [0xC9], segment: "CSEG" }, // RET
        ],
        externs: [],
        exports: { MAIN: { addr: 0, seg: "CSEG" } },
        cpu: "z80",
        endian: false,
        name: "app",
        seglen: { CSEG: 1 },
    };

    const out = linkModules(
        { segments: { CSEG: "0x0000" }, vars: {}, endian: false, entrypoint: "MAIN" },
        [crt0, app],
        []
    );

    const call = out.dump.find((x) => x.addr === 0 && x.lens && x.lens[0] === 0xCD);
    assert.ok(call, "found CALL instruction at start");
    assert.strictEqual(call.lens[1], 0x03, "CALL low byte patched to app module base (0x0003)");
    assert.strictEqual(call.lens[2], 0x00, "CALL high byte patched");
    assert.ok(out.entry, "entrypoint resolved");
    assert.strictEqual(out.entry.addr, 3, "entrypoint address includes module placement");
});

QUnit.test("internal absolute relocations use module placement offset", function(assert) {
    const first = {
        code: [{ lens: [0x00, 0x00], segment: "CSEG" }], // occupy 2 bytes
        externs: [],
        exports: {},
        cpu: "z80",
        endian: false,
        name: "first",
        seglen: { CSEG: 2 },
    };
    const second = {
        code: [
            { lens: [0xE2, 0x04, 0x00], segment: "CSEG", rel: true, relseg: "CSEG", wia: 1, add: 4 }, // JP PO,label
            { lens: [0x00], segment: "CSEG" },
            { lens: [0x00], segment: "CSEG" },
            { lens: [0x00], segment: "CSEG" },
            { lens: [0x00], segment: "CSEG" }, // label at module offset 4
        ],
        externs: [],
        exports: {},
        cpu: "z80",
        endian: false,
        name: "second",
        seglen: { CSEG: 7 },
    };

    const out = linkModules(
        { segments: { CSEG: "0x0000" }, vars: {}, endian: false },
        [first, second],
        []
    );

    const jp = out.dump.find((x) => x.addr === 2 && x.lens && x.lens[0] === 0xE2);
    assert.ok(jp, "found JP instruction in second module");
    assert.strictEqual(jp.lens[1], 0x06, "target low byte includes module offset (2 + 4)");
    assert.strictEqual(jp.lens[2], 0x00, "target high byte");
});
