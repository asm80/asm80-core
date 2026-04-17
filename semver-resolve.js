/**
 * semver-resolve.js — Semver version resolution for ASM80 library files
 *
 * Pure ES module, no external dependencies.
 * Resolves versioned library filenames (.libXX) from a files snapshot,
 * supporting exact, caret (^), and tilde (~) version ranges.
 *
 * Entry point: resolveLibrary(name, cpuExt, files, dir)
 */

// ─── Semver helpers ───────────────────────────────────────────────────────────

/**
 * Parse a semver string into a numeric triple.
 * @param {string} str  e.g. "1.2.3"
 * @returns {[number,number,number] | null}
 */
const parseSemver = (str) => {
  if (typeof str !== "string") return null;
  const m = str.match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!m) return null;
  return [Number(m[1]), Number(m[2]), Number(m[3])];
};

/**
 * Compare two semver triples.
 * @param {[number,number,number]} a
 * @param {[number,number,number]} b
 * @returns {-1 | 0 | 1}
 */
const semverCompare = (a, b) => {
  for (let i = 0; i < 3; i++) {
    if (a[i] < b[i]) return -1;
    if (a[i] > b[i]) return  1;
  }
  return 0;
};

/**
 * Test whether `version` satisfies `range`.
 *
 * Supported range formats:
 *   ""  / "*"       → any version
 *   "1.2.3"         → exact match
 *   "^1.2.3"        → >=1.2.3 <2.0.0
 *   "~1.2.3"        → >=1.2.3 <1.3.0
 *
 * @param {[number,number,number]} version  Parsed version triple
 * @param {string} range                    Range string (may include ^ or ~)
 * @returns {boolean}
 */
export const semverSatisfies = (version, range) => {
  if (!range || range === "*") return true;

  const caret = range.startsWith("^");
  const tilde = range.startsWith("~");
  const vStr  = caret || tilde ? range.slice(1) : range;
  const base  = parseSemver(vStr);
  if (!base) return false;

  // Must be >= base
  if (semverCompare(version, base) < 0) return false;

  if (caret) {
    // < [base[0]+1, 0, 0]
    const ceil = [base[0] + 1, 0, 0];
    return semverCompare(version, ceil) < 0;
  }
  if (tilde) {
    // < [base[0], base[1]+1, 0]
    const ceil = [base[0], base[1] + 1, 0];
    return semverCompare(version, ceil) < 0;
  }

  // Exact match
  return semverCompare(version, base) === 0;
};

// ─── Path helper (mirrors libcode.js) ────────────────────────────────────────

const joinPath = (...parts) =>
  parts.filter(p => p !== "").join("/").replace(/\/+/g, "/");

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Resolve a versioned library file from a `files` snapshot.
 *
 * The `name` argument may be:
 *   "mylib"           → returns the highest available version
 *   "mylib-1.2.3"     → exact match only
 *   "mylib-^1.0.0"    → highest version satisfying ^1.0.0
 *   "mylib-~2.1.0"    → highest version satisfying ~2.1.0
 *
 * @param {string} name     Library name, optionally with version suffix
 * @param {string} cpuExt   Expected file extension, e.g. "lib80"
 * @param {Record<string,string>} files  FS snapshot
 * @param {string} dir      Directory to search in
 * @returns {string | null}  Resolved file path, or null if not found
 */
export const resolveLibrary = (name, cpuExt, files, dir) => {
  // ── Parse name + optional version range ────────────────────────────────
  // Greedy match: bareName is everything before the last "-N.N.N" suffix
  // (including any ^ or ~ prefix on the version part).
  const m = name.match(/^([a-z0-9_-]+?)(?:-([~^]?\d+\.\d+\.\d+))?$/i);
  if (!m) return null;

  const bareName = m[1];
  const range    = m[2] ?? "";   // "" means "any version"

  const prefix = joinPath(dir, bareName + "-");
  const suffix = "." + cpuExt;

  // ── Shortcut: exact version (no range operator) ─────────────────────────
  const isExact = range && !range.startsWith("^") && !range.startsWith("~");
  if (isExact) {
    const exactPath = joinPath(dir, `${bareName}-${range}.${cpuExt}`);
    return files[exactPath] !== undefined ? exactPath : null;
  }

  // ── Scan all matching keys ──────────────────────────────────────────────
  const candidates = [];

  for (const key of Object.keys(files)) {
    if (!key.startsWith(prefix) || !key.endsWith(suffix)) continue;

    // Extract the version string from the filename
    const versionStr = key.slice(prefix.length, -suffix.length);
    const parsed = parseSemver(versionStr);
    if (!parsed) continue;

    if (!semverSatisfies(parsed, range)) continue;

    candidates.push({ path: key, ver: parsed });
  }

  // ── Fallback: unversioned file (e.g. "libc.lib65") ────────────────────────
  if (candidates.length === 0) {
    const unversionedPath = joinPath(dir, `${bareName}.${cpuExt}`);
    return files[unversionedPath] !== undefined ? unversionedPath : null;
  }

  // Return path of the highest satisfying version
  candidates.sort((a, b) => semverCompare(b.ver, a.ver));
  return candidates[0].path;
};
