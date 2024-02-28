import { toHex2, toHex4, toHex6 } from "./utils.js";
const srecLine = (addr, buffer) => {
    let s = "S1";
    let len = buffer.length;
    let checksum = 0;
    s += toHex2(len + 3);
    s += toHex4(addr);
    //s += '00';
    checksum = len + 3 + Math.floor(addr / 256) + Math.floor(addr % 256);
    for (let i = 0; i < buffer.length; i++) {
      s += toHex2(buffer[i]);
      checksum += buffer[i];
    }
    s += toHex2(256 - (checksum % 256));
    return s;
  };

const makeSrec = (addr, dta) => {
    let inter = 0;
    let buffer = [];
    let ilen = 16;
    let out = "";
    for (let i = 0; i < dta.length; i++) {
      buffer.push(dta[i]);
      if (++inter === ilen) {
        //flush
        out += srecLine(addr, buffer) + "\n";
        buffer = [];
        inter = 0;
        addr += ilen;
      }
    }
    if (buffer.length) {
      out += srecLine(addr, buffer) + "\n";
    }

    return out;
  };

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

      if (op.opcode === ".PRAGMA") {
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
          out += makeSrec(addr, dta);
        }
        addr = opaddr;
        len = 0;
        dta = [];
      }
      if (op.lens) {
        for (let n = 0; n < op.lens.length; n++) {
          dta.push(op.lens[n]);
        }
        len += op.lens.length;
        continue;
      }
    }
    if (dta.length) {
      out += makeSrec(addr, dta);
    }
    let ent = result.opts.ENT || 0;
    let checksum = 3 + Math.floor(ent / 256) + Math.floor(ent % 256);
    out += "S903" + toHex4(ent) + toHex2(255 - (checksum % 256));
    return out;
  };

const srecLine28 = (addr, buffer) => {
    let s = "S2";
    let len = buffer.length;
    let checksum = 0;
    s += toHex2(len + 4);
    s += toHex6(addr);
    //s += '00';
    checksum =
      len +
      4 +
      Math.floor(addr / 65536) +
      (Math.floor(addr / 256) % 256) +
      Math.floor(addr % 256);
    for (let i = 0; i < buffer.length; i++) {
      s += toHex2(buffer[i]);
      checksum += buffer[i];
    }
    s += toHex2(255 - (checksum % 256));
    return s;
  };

  const makeSrec28 = (addr, dta) => {
    let inter = 0;
    let buffer = [];
    let ilen = 16;
    let out = "";
    for (let i = 0; i < dta.length; i++) {
      buffer.push(dta[i]);
      if (++inter === ilen) {
        //flush
        out += srecLine28(addr, buffer) + "\n";
        buffer = [];
        inter = 0;
        addr += ilen;
      }
    }
    if (buffer.length) {
      out += srecLine28(addr, buffer) + "\n";
    }

    return out;
  };

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
      if (op.opcode === ".PRAGMA") {
        if (op.params.length == 1 && op.params[0].toUpperCase() == "SEGMENT") {
          segments = true;
        }
      }

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
          out += makeSrec28(addr, dta);
        }
        addr = opaddr;
        len = 0;
        dta = [];
      }
      if (op.lens) {
        for (let n = 0; n < op.lens.length; n++) {
          dta.push(op.lens[n]);
        }
        len += op.lens.length;
        continue;
      }
    }
    if (dta.length) {
      out += makeSrec28(addr, dta);
    }
    let ent = result.opts.ENT || 0;
    let checksum = 3 + Math.floor(ent / 256) + Math.floor(ent % 256);
    out += "S804" + toHex6(ent) + toHex2(255 - (checksum % 256)) + "\n";
    return out;
  };
