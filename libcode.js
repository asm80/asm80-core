/**
 * libcode.js — Library builder for ASM80 relocatable modules
 *
 * Packages one or more relocatable object modules (.objXX) into a single
 * versioned library file (.libXX), which the linker can later pull from
 * selectively.
 *
 * Entry point: buildLibrary(recipe, files, dir)
 */

// ─── CPU extension maps ───────────────────────────────────────────────────────
// Mirrors CPU_TO_OBJ_EXT in assembler-worker.js; kept as a local copy so
// asm80-core has no dependency on the UI layer.

const CPU_TO_OBJ_EXT = {
  i8080:   "obj80",
  z80:     "objz80",
  c6502:   "obj65",
  c65816:  "obj816",
  m6800:   "obj68",
  m6809:   "obj09",
  i8008:   "obj08",
  cdp1802: "obj18",
};

/** Maps object-file extension to the corresponding library extension. */
const OBJ_EXT_TO_LIB_EXT = {
  obj80:  "lib80",
  objz80: "libz80",
  obj65:  "lib65",
  obj816: "lib816",
  obj68:  "lib68",
  obj09:  "lib09",
  obj08:  "lib08",
  obj18:  "lib18",
};

// ─── Path helper ─────────────────────────────────────────────────────────────

const joinPath = (...parts) =>
  parts
    .filter(p => p !== "")
    .join("/")
    .replace(/\/+/g, "/");

// ─── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Resolve a module entry from the .lbr recipe to an existing .objXX path
 * inside the `files` snapshot.
 *
 * Resolution rules:
 *  1. If `entry` contains a dot (explicit extension) → look for
 *     joinPath(dir, entry) verbatim.
 *  2. Otherwise scan all known CPU obj extensions until one matches.
 *
 * @param {string} entry   Module name or relative path from recipe.modules[]
 * @param {string} dir     Directory of the .lbr file
 * @param {Record<string,string>} files  FS snapshot
 * @returns {{ path: string, ext: string }}
 * @throws {{ message: string }}
 */
const resolveObjPath = (entry, dir, files) => {
  // Normalise: strip leading "./" from relative paths
  const normalised = entry.replace(/^\.\//, "");

  // Case 1 — explicit extension (entry contains a dot in its last segment)
  const lastSeg = normalised.split("/").pop();
  if (lastSeg.includes(".")) {
    const path = joinPath(dir, normalised);
    if (files[path] !== undefined) {
      const ext = lastSeg.slice(lastSeg.lastIndexOf(".") + 1);
      return { path, ext };
    }
    throw { message: `Library module '${entry}' not found` };
  }

  // Case 2 — bare name, try all known obj extensions
  for (const ext of Object.values(CPU_TO_OBJ_EXT)) {
    const path = joinPath(dir, `${normalised}.${ext}`);
    if (files[path] !== undefined) {
      return { path, ext };
    }
  }

  const searchDir = dir || "/";
  throw { message: `Library module '${entry}' not found in ${searchDir}` };
};

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Build a versioned library file from a pre-parsed .lbr recipe.
 *
 * YAML parsing is the caller's responsibility; this function receives the
 * already-parsed JS object.  It does NOT compile source files — it only reads
 * pre-existing .objXX files from the `files` snapshot.
 *
 * @param {object} recipe         Pre-parsed .lbr recipe object
 * @param {string}   recipe.name        Library base name (e.g. "mylib")
 * @param {string}   recipe.version     Semver string "MAJOR.MINOR.PATCH"
 * @param {string[]} recipe.modules     List of module names / relative paths
 * @param {string}  [recipe.description]
 * @param {string}  [recipe.author]
 * @param {Record<string,string>} files  FS snapshot (path → content)
 * @param {string} dir            Directory that contains the .lbr file
 * @returns {{ libPath: string, libContent: string }}
 * @throws {{ message: string }}
 */
export const buildLibrary = (recipe, files, dir) => {
  // ── 1. Validate recipe ──────────────────────────────────────────────────
  if (!recipe || typeof recipe !== "object") {
    throw { message: "Library recipe is missing or not an object" };
  }
  if (!recipe.name || !/^[a-z0-9_-]+$/.test(recipe.name)) {
    throw { message: "Library recipe missing/invalid field: name (must match [a-z0-9_-]+)" };
  }
  if (!recipe.version || !/^\d+\.\d+\.\d+$/.test(recipe.version)) {
    throw { message: `Invalid semver '${recipe.version ?? ""}' in library recipe — expected MAJOR.MINOR.PATCH` };
  }
  if (!Array.isArray(recipe.modules) || recipe.modules.length === 0) {
    throw { message: "Library recipe must contain at least one entry in 'modules'" };
  }

  // ── 2. Resolve + parse each module ─────────────────────────────────────
  const resolved = [];
  for (const entry of recipe.modules) {
    if (typeof entry !== "string" || !entry.trim()) {
      throw { message: `Invalid module entry in library recipe: ${JSON.stringify(entry)}` };
    }

    const { path, ext } = resolveObjPath(entry.trim(), dir, files);

    let obj;
    try {
      obj = JSON.parse(files[path]);
    } catch {
      throw { message: `Library module '${entry}' has malformed obj file at ${path}` };
    }

    resolved.push({ name: obj.name ?? entry, obj, ext });
  }

  // ── 3. CPU homogeneity ──────────────────────────────────────────────────
  const firstCpuId = resolved[0].obj._cpuId ?? resolved[0].obj.cpu;
  for (const { name, obj } of resolved.slice(1)) {
    const cpuId = obj._cpuId ?? obj.cpu;
    if (cpuId !== firstCpuId) {
      throw {
        message: `CPU mismatch: module '${name}' is ${cpuId}, expected ${firstCpuId}`,
      };
    }
  }

  const libExt = OBJ_EXT_TO_LIB_EXT[resolved[0].ext] ?? "lib";

  // ── 4. Build symbol index ───────────────────────────────────────────────
  const symbolIndex = {};
  for (const { name, obj } of resolved) {
    for (const sym of Object.keys(obj.exports ?? {})) {
      if (sym in symbolIndex) {
        throw {
          message: `Symbol '${sym}' exported by both '${symbolIndex[sym]}' and '${name}'`,
        };
      }
      symbolIndex[sym] = name;
    }
  }

  // ── 5. Assemble output ──────────────────────────────────────────────────
  const output = {
    _libVersion:     recipe.version,
    _libName:        recipe.name,
    _libCpuId:       firstCpuId,
    _libDescription: recipe.description ?? "",
    _libAuthor:      recipe.author ?? "",
    modules:         resolved.map(({ name, obj }) => ({ name, obj })),
    symbolIndex,
  };

  const libPath    = joinPath(dir, `${recipe.name}-${recipe.version}.${libExt}`);
  const libContent = JSON.stringify(output);

  return { libPath, libContent };
};
