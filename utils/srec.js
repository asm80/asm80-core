import { toHex2, toHex4, toHex6 } from "./utils.js";

/**
 * Generate a single S-Record line (S1 format, 16-bit addresses)
 * @param {number} addr - Starting address for this line
 * @param {number[]} buffer - Array of data bytes
 * @returns {string} S-Record line
 */
const srecLine = (addr, buffer) => {
    let s = "S1";
    let len = buffer.length;
    let checksum = 0;
    s += toHex2(len + 3);       // Record length (data + address + checksum)
    s += toHex4(addr);          // 16-bit address
    
    // Calculate checksum from length and address bytes
    checksum = len + 3 + Math.floor(addr / 256) + Math.floor(addr % 256);
    
    // Add data bytes and update checksum
    for (let i = 0; i < buffer.length; i++) {
      s += toHex2(buffer[i]);
      checksum += buffer[i];
    }
    
    // Add one's complement checksum
    s += toHex2(256 - (checksum % 256));
    return s;
  };

/**
 * Generate S-Record format from data array (16-bit addresses)
 * @param {number} addr - Starting address
 * @param {number[]} dta - Data bytes
 * @returns {string} S-Record formatted string
 */
const makeSrec = (addr, dta) => {
    let inter = 0;
    let buffer = [];
    let ilen = 16;
    let out = "";
    
    for (let i = 0; i < dta.length; i++) {
      buffer.push(dta[i]);
      if (++inter === ilen) {
        // Flush buffer when line is full
        out += srecLine(addr, buffer) + "\n";
        buffer = [];
        inter = 0;
        addr += ilen;
      }
    }
    
    // Flush remaining bytes
    if (buffer.length) {
      out += srecLine(addr, buffer) + "\n";
    }

    return out;
  };

/**
 * Generate Motorola S-Record format output (S1/S9 format for 16-bit addresses)
 * @param {Object} result - Compilation result containing dump array
 * @param {string} [segment] - Optional segment filter (e.g., "CSEG", "DSEG")
 * @returns {string} Complete S-Record file content with S9 termination record
 */
export const isrec = (result, segment) => {
    let V=result.dump;
    let op;
    let addr = null;
    let len = 0;
    let segments = false;
    let dta = [];
    let out = "";
    
    for (let i = 0, j = V.length; i < j; i++) {
      op = V[i];

      // Process pragma directives
      if (op.opcode === ".PRAGMA") {
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
          out += makeSrec(addr, dta);
        }
        addr = opaddr;
        len = 0;
        dta = [];
      }
      
      // Add instruction bytes to data array
      if (op.lens) {
        for (let n = 0; n < op.lens.length; n++) {
          dta.push(op.lens[n]);
        }
        len += op.lens.length;
        continue;
      }
    }
    
    // Flush final data block
    if (dta.length) {
      out += makeSrec(addr, dta);
    }
    
    // Add S9 termination record with entry point
    let ent = result.opts?result.opts.ENT: result.entry.address || 0;
    let checksum = 3 + Math.floor(ent / 256) + Math.floor(ent % 256);
    out += "S903" + toHex4(ent) + toHex2(255 - (checksum % 256));
    return out;
  };

/**
 * Generate a single S-Record line (S2 format, 24-bit addresses)
 * @param {number} addr - Starting address for this line
 * @param {number[]} buffer - Array of data bytes
 * @returns {string} S-Record line with 24-bit address
 */
const srecLine28 = (addr, buffer) => {
    let s = "S2";
    let len = buffer.length;
    let checksum = 0;
    s += toHex2(len + 4);       // Record length (data + 3-byte address + checksum)
    s += toHex6(addr);          // 24-bit address
    
    // Calculate checksum from length and all address bytes
    checksum =
      len +
      4 +
      Math.floor(addr / 65536) +          // High byte
      (Math.floor(addr / 256) % 256) +    // Middle byte
      Math.floor(addr % 256);             // Low byte
      
    // Add data bytes and update checksum
    for (let i = 0; i < buffer.length; i++) {
      s += toHex2(buffer[i]);
      checksum += buffer[i];
    }
    
    // Add one's complement checksum
    s += toHex2(255 - (checksum % 256));
    return s;
  };

/**
 * Generate S-Record format from data array (24-bit addresses)
 * @param {number} addr - Starting address
 * @param {number[]} dta - Data bytes
 * @returns {string} S-Record formatted string with 24-bit addresses
 */
  const makeSrec28 = (addr, dta) => {
    let inter = 0;
    let buffer = [];
    let ilen = 16;
    let out = "";
    
    for (let i = 0; i < dta.length; i++) {
      buffer.push(dta[i]);
      if (++inter === ilen) {
        // Flush buffer when line is full
        out += srecLine28(addr, buffer) + "\n";
        buffer = [];
        inter = 0;
        addr += ilen;
      }
    }
    
    // Flush remaining bytes
    if (buffer.length) {
      out += srecLine28(addr, buffer) + "\n";
    }

    return out;
  };

/**
 * Generate Motorola S-Record format output (S2/S8 format for 24-bit addresses)
 * @param {Object} result - Compilation result containing dump array
 * @param {string} [segment] - Optional segment filter (e.g., "CSEG", "DSEG")
 * @returns {string} Complete S-Record file content with S8 termination record
 */
  export const isrec28 = (result, segment) => {
    let V=result.dump;
    let ln;
    let op;
    let addr = null;
    let len = 0;
    let segments = false;
    let dta = [];
    let out = "";
    
    for (let i = 0, j = V.length; i < j; i++) {
      op = V[i];
      
      // Process pragma directives
      if (op.opcode === ".PRAGMA") {
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
          out += makeSrec28(addr, dta);
        }
        addr = opaddr;
        len = 0;
        dta = [];
      }
      
      // Add instruction bytes to data array
      if (op.lens) {
        for (let n = 0; n < op.lens.length; n++) {
          dta.push(op.lens[n]);
        }
        len += op.lens.length;
        continue;
      }
    }
    
    // Flush final data block
    if (dta.length) {
      out += makeSrec28(addr, dta);
    }
    
    // Add S8 termination record with 24-bit entry point
    let ent = result.opts?result.opts.ENT: result.entry.address || 0;
    let checksum = 3 + Math.floor(ent / 256) + Math.floor(ent % 256);
    out += "S804" + toHex6(ent) + toHex2(255 - (checksum % 256)) + "\n";
    return out;
  };
