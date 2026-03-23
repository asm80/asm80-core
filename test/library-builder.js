/**
 * Tests for libcode.js (buildLibrary) and semver-resolve.js (resolveLibrary)
 *
 * Uses the existing test/suite/relocable1.obj80 and relocable2.obj80 fixtures
 * to build a real library and verify its structure.
 */

import fs from "fs";
import path from "path";
import QUnit from "qunit";

import { buildLibrary } from "../libcode.js";
import { resolveLibrary } from "../semver-resolve.js";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const SUITE = "./test/suite/";

/**
 * Read an .objXX file and return its JSON content as a string.
 * .obj80 files written by older tooling may have a trailing ".pragma module"
 * line; we strip everything after the first line that does not start with "{".
 * A file written by JSON.stringify is always a single-line JSON object.
 */
const readObjFile = (filename) => {
  const raw = fs.readFileSync(SUITE + filename, "utf-8");
  // The JSON object always ends at the first newline after the closing "}"
  const firstNewline = raw.indexOf("\n");
  return firstNewline === -1 ? raw : raw.slice(0, firstNewline);
};

/**
 * Build a files snapshot from a list of [virtualPath, fsFilename] pairs.
 */
const makeFiles = (entries) => {
  const files = {};
  for (const [vpath, fsFile] of entries) {
    files[vpath] = readObjFile(fsFile);
  }
  return files;
};

// ─── QUnit module ────────────────────────────────────────────────────────────

QUnit.module("library-builder");

// ─── buildLibrary — happy path ───────────────────────────────────────────────

QUnit.test("build library from relocable1 + relocable2", (assert) => {
  const files = makeFiles([
    ["/proj/relocable1.obj80", "relocable1.obj80"],
    ["/proj/relocable2.obj80", "relocable2.obj80"],
  ]);

  const recipe = {
    name:        "relocable-lib",
    version:     "0.1.0",
    description: "Test library from relocable fixtures",
    author:      "ASM80 test suite",
    modules:     ["relocable1", "relocable2"],
  };

  const { libPath, libContent } = buildLibrary(recipe, files, "/proj");

  // Output path
  assert.strictEqual(libPath, "/proj/relocable-lib-0.1.0.lib80",
    "libPath uses name-version.libExt convention");

  // Parse and validate structure
  const lib = JSON.parse(libContent);

  assert.strictEqual(lib._libName,    "relocable-lib", "_libName");
  assert.strictEqual(lib._libVersion, "0.1.0",        "_libVersion");
  assert.strictEqual(lib._libCpuId,   "i8080",        "_libCpuId (inherited from obj.cpu)");
  assert.strictEqual(lib._libDescription, "Test library from relocable fixtures", "_libDescription");
  assert.strictEqual(lib._libAuthor,  "ASM80 test suite", "_libAuthor");

  // Modules array
  assert.strictEqual(lib.modules.length, 2, "two modules in library");
  assert.strictEqual(lib.modules[0].name, "relocable1.a80", "first module name");
  assert.strictEqual(lib.modules[1].name, "relocable2.a80", "second module name");

  // Each module carries the full obj structure
  assert.ok(Array.isArray(lib.modules[0].obj.code),   "module[0].obj.code is array");
  assert.ok(typeof lib.modules[0].obj.seglen === "object", "module[0].obj.seglen present");
  assert.ok(Array.isArray(lib.modules[1].obj.code),   "module[1].obj.code is array");

  // Symbol index — relocable1 exports KEYIN; relocable2 exports PRINT etc.
  assert.strictEqual(lib.symbolIndex["KEYIN"],      "relocable1.a80", "KEYIN → relocable1");
  assert.strictEqual(lib.symbolIndex["PRINT"],      "relocable2.a80", "PRINT → relocable2");
  assert.strictEqual(lib.symbolIndex["PRINT_CHAR"], "relocable2.a80", "PRINT_CHAR → relocable2");
  assert.strictEqual(lib.symbolIndex["DUMMY"],      "relocable2.a80", "DUMMY → relocable2");
  assert.strictEqual(lib.symbolIndex["LAST_CHAR"],  "relocable2.a80", "LAST_CHAR → relocable2");

  // Save output to suite for manual inspection
  fs.writeFileSync(SUITE + "relocable-lib-0.1.0.lib80", libContent);
  assert.ok(true, "library file written to test/suite/");
});

// ─── buildLibrary — validation errors ────────────────────────────────────────

QUnit.test("buildLibrary rejects invalid semver", (assert) => {
  assert.throws(
    () => buildLibrary({ name: "x", version: "1.0",  modules: ["relocable1"] }, {}, "/"),
    (e) => /Invalid semver/.test(e.message),
    "rejects '1.0' (missing patch)"
  );
  assert.throws(
    () => buildLibrary({ name: "x", version: "1.0.0-alpha", modules: ["relocable1"] }, {}, "/"),
    (e) => /Invalid semver/.test(e.message),
    "rejects pre-release label"
  );
});

QUnit.test("buildLibrary rejects invalid name", (assert) => {
  assert.throws(
    () => buildLibrary({ name: "My Lib", version: "1.0.0", modules: ["x"] }, {}, "/"),
    (e) => /name/.test(e.message),
    "rejects name with spaces"
  );
  assert.throws(
    () => buildLibrary({ version: "1.0.0", modules: ["x"] }, {}, "/"),
    (e) => /name/.test(e.message),
    "rejects missing name"
  );
});

QUnit.test("buildLibrary rejects empty modules list", (assert) => {
  assert.throws(
    () => buildLibrary({ name: "x", version: "1.0.0", modules: [] }, {}, "/"),
    (e) => /at least one/.test(e.message),
    "empty modules array"
  );
});

QUnit.test("buildLibrary rejects missing obj file", (assert) => {
  assert.throws(
    () => buildLibrary(
      { name: "x", version: "1.0.0", modules: ["noexist"] },
      {},   // empty files
      "/proj"
    ),
    (e) => /not found/.test(e.message),
    "missing obj file → clear error"
  );
});

QUnit.test("buildLibrary rejects CPU mismatch", (assert) => {
  // relocable2z.obj is the Z80 compiled variant of relocable2 (cpu: "z80")
  // relocable1.obj80 targets i8080 → mixing them must throw
  const files = makeFiles([["/proj/relocable1.obj80", "relocable1.obj80"]]);
  files["/proj/relocable2z.objz80"] = fs.readFileSync(SUITE + "relocable2z.obj", "utf-8");

  assert.throws(
    () => buildLibrary(
      { name: "x", version: "1.0.0", modules: ["relocable1", "relocable2z"] },
      files,
      "/proj"
    ),
    (e) => /CPU mismatch/.test(e.message),
    "CPU mismatch → clear error"
  );
});

QUnit.test("buildLibrary rejects duplicate exported symbol", (assert) => {
  // Create a second module that also exports KEYIN
  const obj1 = JSON.parse(readObjFile("relocable1.obj80"));
  const obj2 = { ...obj1, name: "clone" }; // same exports as relocable1 → duplicate KEYIN

  const files = {
    "/proj/a.obj80": readObjFile("relocable1.obj80"),
    "/proj/b.obj80": JSON.stringify(obj2),
  };

  assert.throws(
    () => buildLibrary({ name: "x", version: "1.0.0", modules: ["a", "b"] }, files, "/proj"),
    (e) => /exported by both/.test(e.message),
    "duplicate export → clear error naming both modules"
  );
});

// ─── buildLibrary — additional branch coverage ───────────────────────────────

// Minimal valid obj payload for in-memory tests
const minObj = (cpu = "i8080", extra = {}) =>
  JSON.stringify({ cpu, code: [], seglen: {}, exports: { FUNC: 1 }, ...extra });

QUnit.test("buildLibrary — null recipe throws", (assert) => {
  assert.throws(
    () => buildLibrary(null, {}, "/"),
    (e) => /missing or not an object/.test(e.message),
    "null recipe rejected"
  );
});

QUnit.test("buildLibrary — version field undefined → ?? '' branch", (assert) => {
  // recipe.version is undefined → `recipe.version ?? ""` evaluates the right side
  assert.throws(
    () => buildLibrary({ name: "x", modules: ["a"] }, {}, "/"),
    (e) => /Invalid semver ''/.test(e.message),
    "undefined version triggers ?? '' fallback"
  );
});

QUnit.test("buildLibrary — invalid module entry (non-string)", (assert) => {
  assert.throws(
    () => buildLibrary({ name: "x", version: "1.0.0", modules: [null] }, {}, "/"),
    (e) => /Invalid module entry/.test(e.message),
    "null module entry rejected"
  );
});

QUnit.test("buildLibrary — malformed obj JSON → catch branch", (assert) => {
  const files = { "/proj/mod.obj80": "not-valid-json" };
  assert.throws(
    () => buildLibrary({ name: "x", version: "1.0.0", modules: ["mod"] }, files, "/proj"),
    (e) => /malformed obj file/.test(e.message),
    "malformed JSON in obj file triggers catch"
  );
});

QUnit.test("buildLibrary — obj without name uses entry as fallback (obj.name ?? entry)", (assert) => {
  // obj has no `name` field → `obj.name ?? entry` evaluates the right side
  const files = { "/proj/mymod.obj80": minObj("i8080", { name: undefined }) };
  // JSON.stringify drops undefined fields, so name is genuinely absent
  const files2 = { "/proj/mymod.obj80": JSON.stringify({ cpu: "i8080", code: [], seglen: {}, exports: {} }) };
  const { libContent } = buildLibrary(
    { name: "x", version: "1.0.0", modules: ["mymod"] },
    files2, "/proj"
  );
  const lib = JSON.parse(libContent);
  assert.strictEqual(lib.modules[0].name, "mymod", "entry name used when obj.name absent");
});

QUnit.test("buildLibrary — obj without exports uses {} fallback (obj.exports ?? {})", (assert) => {
  // obj has no `exports` field → `obj.exports ?? {}` evaluates the right side
  const files = { "/proj/mod.obj80": JSON.stringify({ cpu: "i8080", code: [], seglen: {} }) };
  const { libContent } = buildLibrary(
    { name: "x", version: "1.0.0", modules: ["mod"] },
    files, "/proj"
  );
  const lib = JSON.parse(libContent);
  assert.deepEqual(lib.symbolIndex, {}, "empty symbolIndex when no exports");
});

QUnit.test("buildLibrary — recipe without description/author uses '' fallback", (assert) => {
  // recipe.description and recipe.author both absent → ?? '' fallback
  const files = { "/proj/mod.obj80": minObj() };
  const { libContent } = buildLibrary(
    { name: "x", version: "1.0.0", modules: ["mod"] },
    files, "/proj"
  );
  const lib = JSON.parse(libContent);
  assert.strictEqual(lib._libDescription, "", "description defaults to ''");
  assert.strictEqual(lib._libAuthor,      "", "author defaults to ''");
});

QUnit.test("buildLibrary — entry with explicit extension (file found)", (assert) => {
  // lastSeg.includes(".") → true branch of resolveObjPath, file exists
  const files = { "/proj/mod.obj80": minObj() };
  const { libContent } = buildLibrary(
    { name: "x", version: "1.0.0", modules: ["mod.obj80"] },
    files, "/proj"
  );
  const lib = JSON.parse(libContent);
  assert.ok(lib.modules.length === 1, "module resolved via explicit extension");
});

QUnit.test("buildLibrary — entry with explicit extension (file not found) throws", (assert) => {
  assert.throws(
    () => buildLibrary(
      { name: "x", version: "1.0.0", modules: ["missing.obj80"] },
      {}, "/proj"
    ),
    (e) => /not found/.test(e.message),
    "explicit-ext entry with missing file throws"
  );
});

QUnit.test("buildLibrary — unknown obj extension maps to libExt 'lib' (?? 'lib' branch)", (assert) => {
  // Use explicit extension "objXXX" which is not in OBJ_EXT_TO_LIB_EXT
  const files = { "/proj/mod.objxxx": minObj() };
  const { libPath } = buildLibrary(
    { name: "x", version: "1.0.0", modules: ["mod.objxxx"] },
    files, "/proj"
  );
  assert.ok(libPath.endsWith(".lib"), "unknown obj ext falls back to .lib extension");
});

QUnit.test("buildLibrary — empty dir uses '/' as searchDir (dir || '/' branch)", (assert) => {
  // dir="" is falsy → searchDir = "/" in the error message
  assert.throws(
    () => buildLibrary({ name: "x", version: "1.0.0", modules: ["nonexist"] }, {}, ""),
    (e) => /not found in \//.test(e.message),
    "empty dir → searchDir defaults to '/'"
  );
});

// ─── resolveLibrary ───────────────────────────────────────────────────────────

QUnit.module("semver-resolve");

QUnit.test("resolveLibrary — highest available version", (assert) => {
  const files = {
    "/proj/mylib-1.0.0.lib80": "{}",
    "/proj/mylib-1.2.0.lib80": "{}",
    "/proj/mylib-2.0.0.lib80": "{}",
  };
  assert.strictEqual(
    resolveLibrary("mylib", "lib80", files, "/proj"),
    "/proj/mylib-2.0.0.lib80",
    "bare name → highest version"
  );
});

QUnit.test("resolveLibrary — exact version", (assert) => {
  const files = {
    "/proj/mylib-1.0.0.lib80": "{}",
    "/proj/mylib-1.2.0.lib80": "{}",
  };
  assert.strictEqual(
    resolveLibrary("mylib-1.0.0", "lib80", files, "/proj"),
    "/proj/mylib-1.0.0.lib80",
    "exact match"
  );
  assert.strictEqual(
    resolveLibrary("mylib-9.9.9", "lib80", files, "/proj"),
    null,
    "exact match — not found → null"
  );
});

QUnit.test("resolveLibrary — caret range ^", (assert) => {
  const files = {
    "/proj/mylib-1.0.0.lib80": "{}",
    "/proj/mylib-1.2.0.lib80": "{}",
    "/proj/mylib-2.0.0.lib80": "{}",
  };
  assert.strictEqual(
    resolveLibrary("mylib-^1.0.0", "lib80", files, "/proj"),
    "/proj/mylib-1.2.0.lib80",
    "^1.0.0 → highest 1.x.x"
  );
  assert.strictEqual(
    resolveLibrary("mylib-^2.0.0", "lib80", files, "/proj"),
    "/proj/mylib-2.0.0.lib80",
    "^2.0.0 → 2.0.0"
  );
  assert.strictEqual(
    resolveLibrary("mylib-^3.0.0", "lib80", files, "/proj"),
    null,
    "^3.0.0 → not found"
  );
});

QUnit.test("resolveLibrary — tilde range ~", (assert) => {
  const files = {
    "/proj/mylib-1.2.0.lib80": "{}",
    "/proj/mylib-1.2.5.lib80": "{}",
    "/proj/mylib-1.3.0.lib80": "{}",
  };
  assert.strictEqual(
    resolveLibrary("mylib-~1.2.0", "lib80", files, "/proj"),
    "/proj/mylib-1.2.5.lib80",
    "~1.2.0 → highest 1.2.x"
  );
  assert.strictEqual(
    resolveLibrary("mylib-~1.3.0", "lib80", files, "/proj"),
    "/proj/mylib-1.3.0.lib80",
    "~1.3.0 → 1.3.0 exact"
  );
});

QUnit.test("resolveLibrary — wrong cpuExt returns null", (assert) => {
  const files = { "/proj/mylib-1.0.0.lib80": "{}" };
  assert.strictEqual(
    resolveLibrary("mylib", "libz80", files, "/proj"),
    null,
    "lib80 file not matched when cpuExt=libz80"
  );
});

QUnit.test("resolveLibrary — empty files returns null", (assert) => {
  assert.strictEqual(
    resolveLibrary("mylib", "lib80", {}, "/proj"),
    null,
    "empty snapshot → null"
  );
});
