/**
 * Normalize line structures by cleaning up whitespace and HTML entities
 * @param {Object[]} xs - Array of line objects with 'line' property
 * @returns {Object[]} Array of normalized line objects
 */
export const norm = (xs) => xs.map((lx) => {
    let l = lx.line;
    // Decode HTML entities
    l = l.replace("&lt;", "<");
    l = l.replace("&gt;", ">");
    
    // Remove trailing spaces
    while (l[l.length - 1] == " ") {
      l = l.substr(0, l.length - 1);
    }
    lx.line = l;
    
    // If line doesn't start with space, return as-is
    if (l[0] != " ") {
      return lx;
    }
    
    // Remove leading spaces but keep one space prefix
    while (l[0] == " ") {
      l = l.substr(1);
    }
    lx.line = " " + l;
    return lx;
  });

/**
 * Filter out empty lines from line array
 * @param {Object[]} xs - Array of line objects with 'line' property
 * @returns {Object[]} Array with empty lines removed
 */
export const nonempty = (xs) => xs.filter((lx) => {
    let l = lx.line;
    // Remove leading spaces to check if line has content
    while (l[0] == " ") {
      l = l.substr(1);
    }
    return l.length ? true : false;
  });

/**
 * Convert string array to internal line structure with metadata
 * @param {string[]} xs - Array of source code lines
 * @returns {Object[]} Array of line objects with line number and metadata
 */
export const toInternal = (xs) => {
    let numLine = 1;
    return xs.map((line) => ({
      line: line,           // Original line text
      numline: numLine++,   // Line number (1-based)
      addr: null,           // Address in code (filled later)
      bytes: 0,             // Number of bytes for this instruction (filled later)
    }));
  };

/**
 * Convert number to hexadecimal string with specified digit count
 * @param {number} n - Number to convert
 * @param {number} d - Number of hex digits
 * @returns {string} Uppercase hexadecimal string with leading zeros
 */
  const toHexN = (n, d) => {
    let s = n.toString(16);
    // Pad with leading zeros
    while (s.length < d) {
      s = "0" + s;
    }
    return s.toUpperCase();
  };

/**
 * Convert number to 2-digit hexadecimal string (byte)
 * @param {number} n - Number to convert (0-255)
 * @returns {string} 2-character uppercase hex string
 */
  export const toHex2 = (n) => toHexN(n & 0xff, 2);

/**
 * Convert number to 4-digit hexadecimal string (word)
 * @param {number} n - Number to convert (0-65535)
 * @returns {string} 4-character uppercase hex string
 */
  export const toHex4 = (n) => toHexN(n, 4);

/**
 * Convert number to 6-digit hexadecimal string (24-bit)
 * @param {number} n - Number to convert (0-16777215)
 * @returns {string} 6-character uppercase hex string
 */
  export const toHex6 = (n) => toHexN(n, 6);

/**
 * Convert number to 8-digit hexadecimal string (dword)
 * @param {number} n - Number to convert
 * @returns {string} 8-character uppercase hex string
 */
  export const toHex8 = (n) => toHexN(n, 8);