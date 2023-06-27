import { parseLine } from "./parseLine.js";
import {atobx} from "./utils/base64escaped.js";
import { toInternal, nonempty, norm } from "./utils/utils.js";

import {Parser} from "./expression-parser.js";

const macroParams = (d, params=[], uniq, pars, qnumline) => {
    let out = {
      line: d.line,
      addr: d.addr,
      macro: d.macro,
      numline: d.numline,
    };
    uniq = uniq + "S" + qnumline;
    //console.log(uniq, d, params, uniq, pars, qnumline);
    let xpars = pars;
    if (xpars && xpars.length > params.length) {
      out.numline = qnumline;
      throw {
        msg: "Too few parameters for macro unrolling",
        s: out
      };
    }

    for (let i = params.length - 1; i >= 0; i--) {
      let par = params[i];
      if (par.indexOf("00bb") === 0) {
        par = atobx(par.substr(4));
      }
      //console.log(d, params,uniq,pars)
      out.line = out.line.replace("%%" + (i + 1), par);
      if (xpars && xpars[i]) {
        out.line = out.line.replace(xpars[i], par);
      }
    }
    out.line = out.line.replace("%%M", "M_" + uniq);
    out.line = out.line.replace("%%m", "M_" + uniq);
    return out;
  };

  const findBlock = (ni, block, opts) => {
    if (!block) return ni;
    let out = [];
    let f = null;
    for (let i = 0; i < ni.length; i++) {
      let l = ni[i];
      let p = parseLine(l, {},  opts);
      if (f) out.push(l);
      //if (!l.opcode) continue;
      if (p.opcode == ".ENDBLOCK") {
        if (f) {
          return out;
        }
      } else if (p.opcode == ".BLOCK") {
        if (f) return out;
        if (p.params[0].toUpperCase() == block.toUpperCase()) {
          out.push(l);
          f = true;
        }
      }
    }
    throw {
      msg: "Cannot find block " + block + " in included file"
    };
  };  


export const prepro = (V, opts={}, fullfile) => {
    if (!opts.includedFiles) opts.includedFiles = {};
    let op, ln, paramstring = null, px, params = null;
    let macros = {};
    //let macroPars = {};
    let macroDefine = null;
    let reptCount = null;
    let out = [];
    let outi = 0;
    for (let i = 0, j = V.length; i < j; i++) {
      op = V[i].line;
      let remark = op.match(/\s*(.)/);
      if (remark && remark[1] === ";") {
        out.push(V[i]);
        continue;
      }

      ln = op.match(/\s*(\.[^\s]+)(.*)/);

      if (!ln) {
        if (macroDefine) {
          macros[macroDefine].push(V[i]);
          //console.log(V[i])
          //out.push({remark:";"+V[i].line});
          continue;
        } else {
          out.push(V[i]);
        }
        continue;
      }
      //console.log(op,ln)
      let opcode = ln[1].toUpperCase();
      let pp = ln[2].match(/^\s*([^;]*)(.*)/);
      if (pp && pp[1].length) {
        paramstring = pp[1];
        px = pp[1].split(/\s*,\s*/);
        params = px.map(q=>q.trim());
      } else {
        params = null;
      }

      if (opcode === ".INCLUDE" && opts.noinclude) continue;
      if (opcode === ".INCLUDE") {
        //block selective include
        let block = "";
        if (!params || !params[0]) throw {
            msg: "No file name given",
            s: V[i]
          };
        if (params[0].indexOf(":") >= 0) {
          let px = params[0].split(":");
          params[0] = px[0];
          block = px[1];
          if (px.length == 3) {
            block = px[2];
          } else {
            //only 2 pars.
            //console.log(ln,px,px[0],block)
            if (opts.includedFiles["*" + px[0].toUpperCase() + ":" + block.toUpperCase()]) {
              //ignore multiple partials
              continue;
            }
          }
          opts.includedFiles["*" + px[0].toUpperCase() + ":" + block.toUpperCase()] =
            "used";
        }


        let ni;
        let fullni
        let nf

        if (params[0].toUpperCase() == "THIS" && block) {
          //console.log(fullfile);
          ni = findBlock(fullfile, block, opts);
          //console.log(tni)
        } else {
          //if (includedFiles[params[0].replace(/\"/g,"")]) throw {"msg":"File "+params[0].replace(/\"/g,"")+" is already included elsewhere - maybe recursion","s":V[i]};
          //console.log("Include "+params[0]);
          nf = opts.fileGet(params[0].replace(/\"/g, ""));
          if (!nf) throw {
            msg: "File " + params[0] + " not found",
            s: V[i]
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
        let preni = prepro(ni, {}, fullni);
        for (let k = 0; k < preni[0].length; k++) {
          preni[0][k].includedFile = params[0].replace(/\"/g, "");
          preni[0][k].includedFileAtLine = V[i].numline;
          out.push(preni[0][k]);
        }
        for (k in preni[1]) {
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
            msg: "ENDM without MACRO at line " + V[i].numline,
            s: V[i]
          };
        }
        if (reptCount) {
          //je to REPT makro, co ted?
          out.push({
            numline: V[i].numline,
            line: ";rept unroll",
            addr: null,
            bytes: 0,
            remark: "REPT unroll",
          });
          for (let ii = 0; ii < reptCount; ii++) {
            for (let jj = 0; jj < macros[macroDefine].length; jj++) {
              let macline = macros[macroDefine][jj].line;
              out.push({
                numline: V[ii].numline,
                line: macline,
                addr: null,
                bytes: 0,
              });
            }
          }
        } else {
          let pars = macros[macroDefine][0] || [];
          out.push({
            numline: V[i].numline,
            line: ";Macro define " + macroDefine,
            addr: null,
            bytes: 0,
            listing: ".macro " + macroDefine + (pars ? "," : "") + pars.join(","),
          });
          let md = macros[macroDefine];
          //console.log(md)
          for (let k = 0; k < md.length; k++) {
            if (!md[k]) continue;
            out.push({
              line: ";",
              listing: md[k].line
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
        let test = op.match(/^(\S+)\s+\.MACRO/i);
        //console.log(params,test)
        if (test) {
          macroName = test[1];
        } else {
          if (params && params[0]) macroName = params.shift();
        }

        if (!macroName)
          throw {
            msg: "Bad macro name at line " + V[i].numline,
            s: V[i]
          };
        if (macroName[macroName.length - 1] === ":")
          macroName = macroName.substr(0, macroName.length - 1);

        macroDefine = macroName.toUpperCase();
        if (macros[macroDefine])
          throw {
            msg: "Macro " + macroDefine + " redefinition at line " + V[i].numline,
            s: V[i],
          };
        macros[macroDefine] = [params];
        //macroPars[macroDefine] = params;
        continue;
      }

      if (opcode === ".REPT") {
        if (!params || !params[0]) throw {
          msg: "No repeat count given",
          s: V[i]
        };
        reptCount = Parser.evaluate(params[0]);
        if (!reptCount || reptCount<1) throw {
          msg: "Bad repeat count given",
          s: V[i]
        };
        macroDefine = "*REPT" + V[i].numline;
        if (macros[macroDefine])
          throw {
            msg: "Macro redefinition at line " + V[i].numline,
            s: V[i]
          };
        macros[macroDefine] = [];
        continue;
      }

      if (macroDefine) {
        macros[macroDefine].push(V[i]);
        continue;
      }
      out.push(V[i]);
    }
    if (macroDefine) {
      throw {
        msg: "MACRO " + macroDefine + " has no appropriate ENDM",
        //s: V[i],
      };
    }
    //console.log(macros)
    return [out, macros];
  };


export const unroll = (V, macros, uniqseed,opts) => {
    if (!uniqseed) uniqseed = "";
    let out = [];
    for (let i = 0; i < V.length; i++) {
      let s = V[i];
      if (!s) console.log("V", V, i);
      if (!s.macro) {
        out.push(s);
        continue;
      }
      let m = macros[s.macro];
      let pars = m[0];

      //console.log(s,pars)
      out.push({
        remark: "*Macro unroll: " + s.line
      });
      //console.log(macros);
      for (let j = 0; j < m.length; j++) {
        if (j === 0) continue;
        let preline = macroParams(
          m[j],
          s.params,
          i + uniqseed,
          pars,
          s.numline
        );
        preline.bytes = 0;
        //console.log("PL",preline)
        let ng = parseLine(preline, macros,{assembler:opts.assembler});

        if (ng.macro) {
          //nested unroll
          //console.log("NG",ng);
          //console.log("nest", ng, i, j);
          let nest = unroll([ng], macros, uniqseed + "_" + i, opts);
          //console.log(nest)
          for (let k = 0; k < nest.length; k++) {
            out.push(nest[k]);
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
