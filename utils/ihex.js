import { toHex2, toHex4 } from "./utils.js";

const hexLine =  (addr, buffer) => {
    let s = ":";
    let len = buffer.length;
    let checksum = 0;
    s += toHex2(len);
    s += toHex4(addr);
    s += "00";
    checksum = len + Math.floor(addr / 256) + Math.floor(addr % 256);
    for (let i = 0; i < buffer.length; i++) {
      s += toHex2(buffer[i]);
      checksum += buffer[i];
    }
    s += toHex2(256 - (checksum % 256));
    return s;
  };

const makeHex =  (addr, dta, linelen) => {
    let inter = 0;
    let buffer = [];
    let ilen = 16;
    if (linelen > 1) ilen = linelen;
    let out = "";
    for (let i = 0; i < dta.length; i++) {
      buffer.push(dta[i]);
      if (++inter === ilen) {
        //flush
        out += hexLine(addr, buffer) + "\n";
        buffer = [];
        inter = 0;
        addr += ilen;
      }
    }
    if (buffer.length) {
      out += hexLine(addr, buffer) + "\n";
    }

    return out;
  };

export const ihex =  (V, segment) => {
    let ln;
    let op;
    let addr = null;
    let len = 0;
    let dta = [];
    let out = "";
    let segments = false;
    let ilen = 16;
    for (let i = 0, j = V.length; i < j; i++) {
      op = V[i];
      if (op.opcode === ".PRAGMA") {
        //hex len?
        if (op.params.length == 2 && op.params[0].toUpperCase() == "HEXLEN") {
          ilen = parseInt(op.params[1]);
          if (ilen < 1 || ilen > 64) ilen = 16;
        }
        if (op.params.length == 1 && op.params[0].toUpperCase() == "SEGMENT") {
          segments = true;
        }
      }

      if (op.ifskip) continue;

      if (segments) {
        if (!segment) segment = "CSEG";
        if (op.segment != segment) continue;
      }

      let opaddr = op.addr;
      if (op.phase) opaddr -= op.phase;
      if (opaddr !== undefined && len === 0) {
        addr = opaddr;
      }
      if (opaddr != addr + len) {
        if (len) {
          //flush
          out += makeHex(addr, dta, ilen);
        }
        addr = opaddr;
        len = 0;
        dta = [];
      }
      if (op.lens) {
        for (var n = 0; n < op.lens.length; n++) {
          dta.push(op.lens[n]);
        }
        len += op.lens.length;
        continue;
      }
    }
    if (dta.length) {
      out += makeHex(addr, dta, ilen);
    }
    out += ":00000001FF";
    return out;
  };
