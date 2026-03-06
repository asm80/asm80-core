/**
 * parseLnk — YAML parser for .lnk link recipe files.
 *
 * Supports the minimal YAML subset used in ASM80 link recipes:
 *   - Top-level scalar keys  (entrypoint: main)
 *   - Nested string maps     (segments: / vars: with indented key: value pairs)
 *   - Sequence lists         (modules: / library: with "- item" entries)
 *   - Single- and double-quoted scalar values
 *   - Inline comments  (# ...)
 *
 * Full YAML features (anchors, multi-document, block scalars, etc.) are NOT supported.
 */

/**
 * Remove surrounding single or double quotes from a scalar string.
 * @param {string} s
 * @returns {string}
 */
const unquote = (s) => {
    if (
        (s.startsWith("'") && s.endsWith("'")) ||
        (s.startsWith('"') && s.endsWith('"'))
    ) {
        return s.slice(1, -1);
    }
    return s;
};

/**
 * Parse a .lnk YAML string into a plain JavaScript object.
 *
 * Expected top-level keys for a link recipe:
 *   segments  {Object}  - map of segment name → base address string
 *   vars      {Object}  - map of symbol name  → value string
 *   modules   {Array}   - ordered list of module filenames
 *   library   {Array}   - list of library filenames
 *   entrypoint {string} - entry-point symbol name
 *   output    {string}  - (optional) output hint for the IDE
 *
 * @param {string} text - Raw YAML content of the .lnk file
 * @returns {Object} Parsed recipe object
 */
export const parseLnk = (text) => {
    const result = {};
    let currentParent = null;  // name of the current top-level key being filled

    for (const line of text.split("\n")) {
        // Strip inline comments, then trim trailing whitespace
        const raw = line.replace(/#.*$/, "").trimEnd();
        if (!raw.trim()) continue;

        const indent = raw.length - raw.trimStart().length;
        const trimmed = raw.trimStart();

        if (indent === 0) {
            // Top-level key: value  or  top-level key:
            const m = trimmed.match(/^(\w+)\s*:\s*(.*)$/);
            if (!m) continue;
            const [, key, val] = m;
            currentParent = key;
            if (val.trim()) {
                // Inline scalar value — no children expected
                result[key] = unquote(val.trim());
                currentParent = null;
            }
            // else: value is on following indented lines
        } else {
            // Child line under currentParent
            if (trimmed.startsWith("- ")) {
                // Sequence item
                const val = unquote(trimmed.slice(2).trim());
                if (!Array.isArray(result[currentParent])) result[currentParent] = [];
                result[currentParent].push(val);
            } else {
                // Nested key: value  (map entry)
                const m = trimmed.match(/^([\w]+)\s*:\s*(.*)$/);
                if (!m) continue;
                const [, key, val] = m;
                if (typeof result[currentParent] !== "object" || Array.isArray(result[currentParent])) {
                    result[currentParent] = {};
                }
                result[currentParent][key] = unquote(val.trim());
            }
        }
    }

    return result;
};
