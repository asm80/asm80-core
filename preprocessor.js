import { parseLine } from "./parseLine.js";
import { atobx } from "./utils/base64escaped.js";
import { toInternal, nonempty, norm } from "./utils/utils.js";

import { Parser } from "./expression-parser.js";

/**
 * Processes macro parameters and replaces placeholders in macro lines
 * @param {Object} d - Macro data object
 * @param {Array} params - Array of parameter values
 * @param {string} uniq - Unique identifier
 * @param {Array} pars - Parameter names
 * @param {number} qnumline - Line number
 * @returns {Object} Processed macro line with replaced parameters
 */
const macroParams = (d, params = [], uniq, pars, qnumline) => {
  const out = {
    line: d.line,
    addr: d.addr,
    macro: d.macro,
    numline: d.numline,
  };
  uniq = `${uniq}S${qnumline}`;
  //console.log(uniq, d, params, uniq, pars, qnumline);
  const xpars = pars;
  if (xpars?.length > params.length) {
    out.numline = qnumline;
    throw {
      msg: "Too few parameters for macro unrolling",
      s: out
    };
  }

  for (const [index, par] of params.entries()) {
    let processedPar = par;
    if (par.startsWith("00bb")) {
      processedPar = atobx(par.substring(4));
    }
    //console.log(d, params,uniq,pars)
    out.line = out.line.replace(`%%${index + 1}`, processedPar);
    if (xpars?.[index]) {
      out.line = out.line.replace(xpars[index], processedPar);
    }
  }
  out.line = out.line.replace("%%M", `M_${uniq}`);
  out.line = out.line.replace("%%m", `M_${uniq}`);
  return out;
};

/**
 * Finds a specific block in included files
 * @param {Array} ni - Array of lines to search
 * @param {string} block - Block name to find
 * @param {Object} opts - Options object
 * @returns {Array} Lines within the specified block
 * @throws {Object} Error if block not found
 */
const findBlock = (ni, block, opts) => {
  if (!block) return ni;
  const out = [];
  let f = null;
  for (const l of ni) {
    const p = parseLine(l, {}, opts);
    if (f) out.push(l);
    //if (!l.opcode) continue;
    if (p.opcode === ".ENDBLOCK") {
      if (f) {
        return out;
      }
    } else if (p.opcode === ".BLOCK") {
      if (f) return out;
      if (p.params[0].toUpperCase() === block.toUpperCase()) {
        out.push(l);
        f = true;
      }
    }
  }
  throw {
    msg: `Cannot find block ${block} in included file`
  };
};

/**
 * Preprocesses assembly code, handling includes, macros, and directives
 * @param {Array} V - Array of source lines
 * @param {Object} opts - Options object with includedFiles, readFile, etc.
 * @param {Array} fullfile - Full file content for block includes
 * @returns {Array} Array containing processed lines and macros object
 */
export const prepro = async (V, opts = {}, fullfile) => {
  if (!opts.includedFiles) opts.includedFiles = {};
  let op, ln, paramstring = null, px, params = null;
  const macros = {};
  //let macroPars = {};
  let macroDefine = null;
  let reptCount = null;
  const out = [];
  let outi = 0;
  
  for (const item of V) {
    op = item.line;
    const remark = op.match(/\s*(.)/);
    if (remark?.[1] === ";") {
      out.push(item);
      continue;
    }

    ln = op.match(/\s*(\.[^\s]+)(.*)/);

    if (!ln) {
      if (macroDefine) {
        macros[macroDefine].push(item);
        //console.log(item)
        //out.push({remark:";"+item.line});
        continue;
      } else {
        out.push(item);
      }
      continue;
    }
    //console.log(op,ln)
    const opcode = ln[1].toUpperCase();
    const pp = ln[2].match(/^\s*([^;]*)(.*)/);
    if (pp?.[1].length) {
      paramstring = pp[1];
      px = pp[1].split(/\s*,\s*/);
      params = px.map(q => q.trim());
    } else {
      params = null;
    }

    if (opcode === ".INCLUDE" && opts.noinclude) continue;
    if (opcode === ".INCLUDE") {
      //block selective include
      let block = "";
      if (!params?.[0]) throw {
        msg: "No file name given",
        s: item
      };
      if (params[0].includes(":")) {
        const px = params[0].split(":");
        params[0] = px[0];
        block = px[1];
        if (px.length === 3) {
          block = px[2];
        } else {
          //only 2 pars.
          //console.log(ln,px,px[0],block)
          if (opts.includedFiles[`*${px[0].toUpperCase()}:${block.toUpperCase()}`]) {
            //ignore multiple partials
            continue;
          }
        }
        opts.includedFiles[`*${px[0].toUpperCase()}:${block.toUpperCase()}`] = "used";
      }

      let ni, fullni, nf;

      if (params[0].toUpperCase() === "THIS" && block) {
        //console.log(fullfile);
        ni = findBlock(fullfile, block, opts);
        //console.log(tni)
      } else {
        //if (includedFiles[params[0].replace(/\"/g,"")]) throw {"msg":"File "+params[0].replace(/\"/g,"")+" is already included elsewhere - maybe recursion","s":item};
        //console.log("Include "+params[0]);
        nf = await opts.readFile(params[0].replace(/\"/g, ""));
        if (!nf) throw {
          msg: `File ${params[0]} not found`,
          s: item
        };
        //console.log(nf);
        ni = toInternal(nf.split(/\n/));
        ni = nonempty(ni);
        ni = norm(ni);
        //console.log(ni)
        fullni = ni;
        ni = findBlock(ni, block, opts);
      }

      //console.log(ni)
      const preni = await prepro(ni, {}, fullni);
      for (const preniItem of preni[0]) {
        preniItem.includedFile = params[0].replace(/\"/g, "");
        preniItem.includedFileAtLine = item.numline;
        out.push(preniItem);
      }
      for (const k of Object.keys(preni[1])) {
        macros[k] = preni[1][k];
      }
      //console.log(params[0].replace(/\"/g,""));
      opts.includedFiles[params[0].replace(/\"/g, "")] = nf;
      continue;
    }

    if (opcode === ".ENDM") {
      //console.log("endm")
      if (!macroDefine) {
        throw {
          msg: `ENDM without MACRO at line ${item.numline}`,
          s: item
        };
      }
      if (reptCount) {
        //je to REPT makro, co ted?
        out.push({
          numline: item.numline,
          line: ";rept unroll",
          addr: null,
          bytes: 0,
          remark: "REPT unroll",
        });
        for (const _ of Array(reptCount)) {
          for (const macline of macros[macroDefine]) {
            out.push({
              numline: item.numline,
              line: macline.line,
              addr: null,
              bytes: 0,
            });
          }
        }
      } else {
        const pars = macros[macroDefine]?.[0] ?? [];
        out.push({
          numline: item.numline,
          line: `;Macro define ${macroDefine}`,
          addr: null,
          bytes: 0,
          listing: `.macro ${macroDefine}${pars ? ',' : ''}${pars.join(',')}`,
        });
        const md = macros[macroDefine];
        //console.log(md)
        for (const macroLine of md) {
          if (!macroLine) continue;
          out.push({
            line: ";",
            listing: macroLine.line
          });
        }
        out.push({
          line: ";",
          listing: ".endm"
        });
        out.push({
          line: ";",
          listing: " "
        });
      }
      macroDefine = null;
      reptCount = null;
      continue;
    }

    if (opcode === ".MACRO") {
      //console.log("endms",params,ln,op);
      if (op[0] === ";") continue;
      let macroName = null;
      const test = op.match(/^(\S+)\s+\.MACRO/i);
      //console.log(params,test)
      if (test) {
        macroName = test[1];
      } else {
        if (params?.[0]) macroName = params.shift();
      }

      if (!macroName)
        throw {
          msg: `Bad macro name at line ${item.numline}`,
          s: item
        };
      if (macroName.endsWith(":"))
        macroName = macroName.slice(0, -1);

      macroDefine = macroName.toUpperCase();
      if (macros[macroDefine])
        throw {
          msg: `Macro ${macroDefine} redefinition at line ${item.numline}`,
          s: item,
        };
      macros[macroDefine] = [params];
      //macroPars[macroDefine] = params;
      continue;
    }

    if (opcode === ".REPT") {
      if (!params?.[0]) throw {
        msg: "No repeat count given",
        s: item
      };
      reptCount = Parser.evaluate(params[0]);
      if (!reptCount || reptCount < 1) throw {
        msg: "Bad repeat count given",
        s: item
      };
      macroDefine = `*REPT${item.numline}`;
      if (macros[macroDefine])
        throw {
          msg: `Macro redefinition at line ${item.numline}`,
          s: item
        };
      macros[macroDefine] = [];
      continue;
    }

    if (macroDefine) {
      macros[macroDefine].push(item);
      continue;
    }
    out.push(item);
  }
  if (macroDefine) {
    throw {
      msg: `MACRO ${macroDefine} has no appropriate ENDM`,
      //s: item,
    };
  }
  //console.log(macros)
  return [out, macros];
};

/**
 * Unrolls macros in the processed assembly code
 * @param {Array} V - Array of processed lines
 * @param {Object} macros - Object containing macro definitions
 * @param {string} uniqseed - Unique seed for macro expansion
 * @param {Object} opts - Options object
 * @returns {Array} Array of lines with expanded macros
 */
export const unroll = (V, macros, uniqseed, opts) => {
  if (!uniqseed) uniqseed = "";
  const out = [];
  for (const [i, s] of V.entries()) {
    if (!s) console.log("V", V, i);
    if (!s.macro) {
      out.push(s);
      continue;
    }
    const m = macros[s.macro];
    const pars = m[0];

    //console.log(s,pars)
    //console.log("Macro unroll: " + s.line);
    out.push({
      remark: `*Macro unroll: ${s.line}`
    });
    //console.log(macros);
    for (const [j, macroItem] of m.entries()) {
      if (j === 0) continue;
      const preline = macroParams(
        macroItem,
        s.params,
        i + uniqseed,
        pars,
        s.numline
      );
      preline.bytes = 0;
      //console.log("PL",preline)
      const ng = parseLine(preline, macros, { assembler: opts.assembler });

      if (ng.macro) {
        //nested unroll
        //console.log("NG",ng);
        //console.log("nest", ng, i, j);
        const nest = unroll([ng], macros, `${uniqseed}_${i}`, opts);
        //console.log(nest)
        for (const nestItem of nest) {
          out.push(nestItem);
        }
        continue;
      }
      if (s.label) ng.label = s.label;
      s.label = "";
      ng.remark = s.remark;
      ng.macro = s.macro;
      s.macro = null;
      s.remark = "";
      out.push(ng);
    }
  }
  //console.log(out);
  return out;
};
