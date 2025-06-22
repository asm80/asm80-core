import { toHex2, toHex4 } from "./utils.js";

/**
 * Generate a single Intel HEX record line
 * @param {number} addr - Starting address for this line
 * @param {number[]} buffer - Array of data bytes
 * @returns {string} Intel HEX record line
 */
const hexLine =  (addr, buffer) => {
    let s = ":";
    let len = buffer.length;
    let checksum = 0;
    s += toHex2(len);           // Record length
    s += toHex4(addr);          // Address
    s += "00";                  // Record type (00 = data)
    
    // Calculate checksum from length and address bytes
    checksum = len + Math.floor(addr / 256) + Math.floor(addr % 256);
    
    // Add data bytes and update checksum
    for (let i = 0; i < buffer.length; i++) {
      s += toHex2(buffer[i]);
      checksum += buffer[i];
    }
    
    // Add two's complement checksum
    s += toHex2(256 - (checksum % 256));
    return s;
  };

/**
 * Generate Intel HEX format from data array
 * @param {number} addr - Starting address
 * @param {number[]} dta - Data bytes
 * @param {number} linelen - Bytes per line (default 16)
 * @returns {string} Intel HEX formatted string
 */
const makeHex =  (addr, dta, linelen) => {
    let inter = 0;
    let buffer = [];
    let ilen = 16;
    if (linelen > 1) ilen = linelen;
    let out = "";
    
    for (let i = 0; i < dta.length; i++) {
      buffer.push(dta[i]);
      if (++inter === ilen) {
        // Flush buffer when line is full
        out += hexLine(addr, buffer) + "\n";
        buffer = [];
        inter = 0;
        addr += ilen;
      }
    }
    
    // Flush remaining bytes
    if (buffer.length) {
      out += hexLine(addr, buffer) + "\n";
    }

    return out;
  };

/**
 * Generate Intel HEX format output from compilation result
 * @param {Object} result - Compilation result containing dump array
 * @param {string} [segment] - Optional segment filter (e.g., "CSEG", "DSEG")
 * @returns {string} Complete Intel HEX file content with EOF record
 */
export const ihex =  (result, segment) => {
    let V = result.dump;
    let ln;
    let op;
    let addr = null;
    let len = 0;
    let dta = [];
    let out = "";
    let segments = false;
    let ilen = 16; // Default line length
    
    for (let i = 0, j = V.length; i < j; i++) {
      op = V[i];
      
      // Process pragma directives
      if (op.opcode === ".PRAGMA") {
        // Check for HEXLEN pragma to set line length
        if (op.params.length == 2 && op.params[0].toUpperCase() == "HEXLEN") {
          ilen = parseInt(op.params[1]);
          if (ilen < 1 || ilen > 64) ilen = 16;
        }
        // Check for SEGMENT pragma to enable segment filtering
        if (op.params.length == 1 && op.params[0].toUpperCase() == "SEGMENT") {
          segments = true;
        }
      }

      // Skip conditional assembly blocks
      if (op.ifskip) continue;
      
      // Filter by segment if specified
      if (typeof op.segment !== "undefined" && typeof segment !== "undefined" && op.segment != segment) continue;

      if (segments) {
        if (!segment) segment = "CSEG"; // Default to code segment
        if (op.segment != segment) continue;
      }

      let opaddr = op.addr;
      // Adjust for phase directive
      if (op.phase) opaddr -= op.phase;
      
      // Set initial address
      if (opaddr !== undefined && len === 0) {
        addr = opaddr;
      }
      
      // Check for address discontinuity
      if (opaddr != addr + len) {
        if (len) {
          // Flush current data block
          out += makeHex(addr, dta, ilen);
        }
        addr = opaddr;
        len = 0;
        dta = [];
      }
      
      // Add instruction bytes to data array
      if (op.lens) {
        for (var n = 0; n < op.lens.length; n++) {
          dta.push(op.lens[n]);
        }
        len += op.lens.length;
        continue;
      }
    }
    
    // Flush final data block
    if (dta.length) {
      out += makeHex(addr, dta, ilen);
    }
    
    // Add EOF record
    out += ":00000001FF";
    return out;
  };
