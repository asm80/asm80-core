import { parseLine } from "./parseLine.js";
import { toInternal, nonempty, norm } from "./utils/utils.js";
import { prepro } from "./preprocessor.js";
import { I8080 } from "./cpu/i8080.js";
import { M6800 } from "./cpu/m6800.js";
import { C6502 } from "./cpu/c6502.js";
import { Z80 } from "./cpu/z80.js";
import { I8008 } from "./cpu/i8008.js";
import { CDP1802 } from "./cpu/cdp1802.js";
import { M6809 } from "./cpu/m6809.js";
import { H6309 } from "./cpu/h6309.js";
import { C65816 } from "./cpu/c65816.js";

const CPUS = [I8080, M6800, C6502, Z80, I8008, CDP1802, M6809, H6309, C65816];

const emptymask = (xs) => xs.map((lx) => {
    let l = lx.line;
    let lx2 = {
      addr: 0,
      line: ";;;EMPTYLINE",
      numline: lx.numline
    };
    while (l[0] == " ") {
      l = l.substr(1);
    }
    return l.length ? lx : lx2;
  });

/**
 * Captures original-case label and opcode tokens from a line object
 * before parseLine uppercases them. Stored as line._origLabel / line._origOpcode.
 * @param {Object} line
 */
const _captureOrigTokens = (line) => {
  let t = line.line;
  // strip anonymous label prefix (": foo")
  t = t.replace(/^\s*:\s*/, "");
  // label: identifier followed by colon
  const lblM = t.match(/^\s*(\@{0,1}[a-zA-Z0-9-_]+):\s*(.*)/);
  if (lblM) {
    line._origLabel = lblM[1];
    t = lblM[2];
  } else {
    t = t.replace(/^\s+/, "");
  }
  // skip pure comment lines
  if (!t || t[0] === ";") return;
  // special "= value" EQU syntax
  if (t[0] === "=") { line._origOpcode = "="; return; }
  // opcode: first word (identifier or dot-prefixed directive)
  const opcM = t.match(/^([a-zA-Z_.][a-zA-Z0-9_.]*)/);
  if (opcM) line._origOpcode = opcM[1];
};

export const beautify = async (s, opts = {}) => {
    const labelCol = opts.labelCol  ?? 12;
    const opcodeCol = opts.opcodeCol ?? 20;
    const autoCase  = opts.autoCase  ?? true;

    // Resolve string assembler name to CPU object (same as asm.js compile()).
    // parseLine requires an actual CPU object with a parseOpcode() method.
    if (typeof opts.assembler === "string") {
      const found = CPUS.find(x => x.cpu.toUpperCase() === opts.assembler.toUpperCase());
      opts = { ...opts, assembler: found ?? CPUS[3] }; // default Z80
    } else if (!opts.assembler) {
      opts = { ...opts, assembler: CPUS[3] }; // default Z80
    }

    let i = toInternal(s.split(/\n/));
    i = emptymask(i);
    i = nonempty(i);
    i = norm(i);
    let prei = await prepro(i, {
      noinclude: true,
      ...opts
    });
    // Strip formatter-only keys before forwarding opts to parseLine.
    // The resolved assembler object MUST be kept — parseLine calls
    // opts.assembler.parseOpcode() for every CPU instruction.
    const { labelCol: _l, opcodeCol: _o, autoCase: _c, ...parseOpts } = opts;
    i = i.map((line) => {
      if (!autoCase) {
        _captureOrigTokens(line);
      }
      const origLine = line.line;
      line.line = line.line.replace(/\%\%M/gi, "__m");
      try {
        return parseLine(line, prei[1], parseOpts);
      } catch (e) {
        // parseLine failed (unresolved symbol, unrecognised opcode, …).
        // Return the line marked as unparsed so the output loop can
        // pass it through verbatim rather than aborting the whole format.
        return { ...line, line: origLine, _unparsed: true };
      }
    });
    let out = "";
    let op, ln;
    for (let q = 0; q < i.length; q++) {
      op = i[q];
      ln = "";
      if (op._unparsed) {
        // parseLine failed for this line — pass it through verbatim.
        out += op.line.replace(/__m/gi, "%%M") + "\n";
        continue;
      }
      if (op.remark == "EMPTYLINE") {
        out += "\n";
        continue;
      }

      if (!op.label && !op.opcode && op.remark) {
        out += ";" + op.remark + "\n";
        continue;
      }

      const displayLabel  = (!autoCase && op._origLabel)  ? op._origLabel  : op.label;
      const displayOpcode = (!autoCase && op._origOpcode) ? op._origOpcode : op.opcode;

      if (displayLabel) {
        ln += displayLabel;
        if (op.opcode != "EQU" && op.opcode != "=" && op.opcode != ".SET")
          ln += ":";
        ln += " ";
      }
      while (ln.length < labelCol) {
        ln += " ";
      }
      if (displayOpcode) {
        ln += displayOpcode + " ";
      }
      while (ln.length < opcodeCol) {
        ln += " ";
      }
      if (op.params) {
        ln += op.params + " ";
      }
      if (op.remark) {
        ln += ";" + op.remark;
      }
      ln = ln.replace(/__m/gi, "%%M");
      out += ln + "\n";
    }
    return out;
  };
