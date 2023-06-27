import { Parser } from "./expression-parser.js";
import { fptozx } from "./utils/fp.js";


export const pass2 = (vx, opts) => {

    const charVar8 = (dta) => {
        if (opts.PRAGMAS.RELAX) {
          if (typeof dta == "string") {
            return dta.charCodeAt(0) & 0xff;
          } else {
            return dta & 0xff;
          }
        } else {
          //strict
          if (typeof dta == "string") {
            if (dta.length != 1) throw "String parameter too long (" + dta + ")";
            return dta.charCodeAt(0) & 0xff;
          } else {
            if (dta > 255) throw "Param out of bound (" + dta + ")";
            if (dta < -128) throw "Param out of bound (" + dta + ")";
            return dta & 0xff;
          }
        }
      };
      const charVar16 = (dta) => {
        if (typeof dta == "string") {
          return dta.charCodeAt(0) & 0xff;
        } else {
          return dta & 0xff;
        }
      };
    
      const nextAnon = (V, i) => {
        console.log("AnonNext", i);
      }
    


    var V = vx[0];
    var vars = vx[1];
    //		console.log(vars);
    var op = null, dta = null, m, bts, l;
    var blocks = [];
    var ifskip = 0;
    var cond;
    var doif = 0;

    for (var i = 0, j = V.length; i < j; i++) {
      try {
        op = V[i];
        op.pass = 2;

        if (op.opcode === "ENDIF") {
          ifskip = 0;
          continue;
        }

        if (op.opcode === "ELSE") {
          ifskip = ifskip ? 0 : 1;
          continue;
        }

        if (ifskip) {
          continue;
        }

        if (op.opcode === ".ERROR") {
          //console.log("ERROR", op)
          throw {
            msg: op.paramstring,
            s: op
          };
          //continue;
        }

        if (op.opcode === "IF") {
          Parser.evaluate(op.params[0], vars);
          try {
            cond = Parser.evaluate(op.params[0], vars);
            //console.log("IF", op.params, cond)
            if (!cond) ifskip = 1;
          } catch (e) {
            //console.log("CATCH",e)
            throw {
              message: "IF condition mismatched"
            };
            ifskip = 1;
          }
          continue;
        }
        if (op.opcode === "IFN") {
          try {
            cond = Parser.evaluate(op.params[0], vars);
            if (cond) ifskip = 1;
          } catch (e) {
            throw {
              message: "IF condition mismatched"
            };
          }
          continue;
        }

        vars._PC = op.addr;
        //console.log(vars._PC,op);
        try {
          var usage = Parser.usage(op.params[0].toUpperCase(), vars);
          for (var u = 0; u < usage.length; u++) {
            if (!xref[usage[u]].usage) xref[usage[u]].usage = [];
            xref[usage[u]].usage.push({
              line: op.numline,
              file: op.includedFile || "*main*",
            });
          }
        } catch (e) { }
        try {
          var usage = Parser.usage(op.params[1].toUpperCase(), vars);
          for (var u = 0; u < usage.length; u++) {
            if (!xref[usage[u]].usage) xref[usage[u]].usage = [];
            xref[usage[u]].usage.push({
              line: op.numline,
              file: op.includedFile || "*main*",
            });
          }
        } catch (e) { }

        if (op.opcode === ".BLOCK") {
          //blocks.push(op.numline);
          if (!op.includedFileAtLine) blocks.push(op.numline);
          else blocks.push(op.numline + "@" + op.includedFileAtLine);
          var redef = vars["__" + blocks.join("/")];
          for (var nn = 0; nn < redef.length; nn++) {
            vars[blocks.join("/") + "/" + redef[nn]] = vars[redef[nn]];
            vars[redef[nn]] = vars[blocks.join("/") + "/" + redef[nn] + "$"];
          }
          continue;
        }
        if (op.opcode === ".ENDBLOCK") {
          var redef = vars["__" + blocks.join("/")];
          for (var nn = 0; nn < redef.length; nn++) {
            vars[redef[nn]] = vars[blocks.join("/") + "/" + redef[nn]];
            if (vars[redef[nn]] === undefined) delete vars[redef[nn]];
            vars[blocks.join("/") + "/" + redef[nn]] = null;
          }
          blocks.pop();
          //console.log(vars);
          continue;
        }

        if (op.opcode === ".ENT") {
          opts.ENT = Parser.evaluate(op.params[0], vars);
          continue;
        }

        if (op.opcode === ".BINFROM") {
          opts.BINFROM = Parser.evaluate(op.params[0], vars);
          continue;
        }

        if (op.opcode === ".BINTO") {
          opts.BINTO = Parser.evaluate(op.params[0], vars);
          continue;
        }

        if (op.opcode === ".SETPHASE") {
          if (!opts.PHASES) opts.PHASES = {};
          opts.PHASES[op.addr] = op.params[0];
          continue;
        }

        if (op.opcode === ".ENGINE") {
          opts.ENGINE = op.params[0];
          continue;
        }
        /*
      if (op.opcode === ".PRAGMA") {
        opts.PRAGMAS=opts.PRAGMAS || [];
        opts.PRAGMAS.push(op.params[0].toUpperCase());
        continue;
      }
      */
        if (op.opcode === "EQU") {
          //console.log(op.label);
          if (!op.label) throw {
            msg: "EQU without label",
            s: op
          };
          vars[op.label] = Parser.evaluate(op.params[0], vars);
          continue;
        }
        if (op.opcode === ".SET" || op.opcode === ":=") {
          //console.log(op.label, op.params[0], vars);
          vars[op.label] = Parser.evaluate(op.params[0], vars);
          continue;
        }
        if (op.opcode === "DB" || op.opcode === "FCB") {
          bts = 0;
          op.lens = [];
          for (l = 0; l < op.params.length; l++) {
            m = Parser.evaluate(op.params[l], vars);
            if (typeof m === "number") {
              op.lens[bts++] = Math.floor(m % 256);
              continue;
            }
            if (typeof m === "string") {
              for (var mm = 0; mm < m.length; mm++) {
                op.lens[bts++] = m.charCodeAt(mm);
              }
              continue;
            }
          }
          continue;
        }
        if (op.opcode === "FCC") {
          bts = 0;
          op.lens = [];
          for (l = 0; l < op.params.length; l++) {
            var mystring = op.params[l].trim();
            var delim = mystring[0];
            var m = mystring.substr(1, mystring.length - 2);
            for (var mm = 0; mm < m.length; mm++) {
              op.lens[bts++] = m.charCodeAt(mm);
            }
          }
          continue;
        }

        if (op.opcode === ".CSTR") {
          bts = 0;
          op.lens = [];
          for (l = 0; l < op.params.length; l++) {
            m = Parser.evaluate(op.params[l], vars);
            if (typeof m === "number") {
              op.lens[bts++] = Math.floor(m % 256);
              continue;
            }
            if (typeof m === "string") {
              for (var mm = 0; mm < m.length; mm++) {
                op.lens[bts++] = m.charCodeAt(mm);
              }
              continue;
            }
          }
          op.lens[bts++] = 0;
          continue;
        }

        if (op.opcode === ".PSTR") {
          bts = 1;
          op.lens = [];
          for (l = 0; l < op.params.length; l++) {
            m = Parser.evaluate(op.params[l], vars);
            if (typeof m === "number") {
              op.lens[bts++] = Math.floor(m % 256);
              continue;
            }
            if (typeof m === "string") {
              for (var mm = 0; mm < m.length; mm++) {
                op.lens[bts++] = m.charCodeAt(mm);
              }
              continue;
            }
          }
          op.lens[0] = bts - 1;
          continue;
        }

        if (op.opcode === ".ISTR") {
          bts = 0;
          op.lens = [];
          for (l = 0; l < op.params.length; l++) {
            m = Parser.evaluate(op.params[l], vars);
            if (typeof m === "number") {
              op.lens[bts++] = Math.floor(m % 128);
              continue;
            }
            if (typeof m === "string") {
              for (var mm = 0; mm < m.length; mm++) {
                op.lens[bts++] = m.charCodeAt(mm) & 0x7f;
              }
              continue;
            }
          }
          op.lens[bts - 1] = op.lens[bts - 1] | 0x80;
          continue;
        }

        if (op.opcode === "DW" || op.opcode === "FDB") {
          bts = 0;
          op.lens = [];
          for (l = 0; l < op.params.length; l++) {
            m = Parser.evaluate(op.params[l], vars);
            if (typeof m === "number") {
              if (opts.endian) {
                op.lens[bts++] = Math.floor(m / 256);
                op.lens[bts++] = Math.floor(m % 256);
              } else {
                op.lens[bts++] = Math.floor(m % 256);
                op.lens[bts++] = Math.floor(m / 256);
              }
              continue;
            }
          }
          continue;
        }

        if (op.opcode === "DD") {
          //console.error("DD")
          bts = 0;
          op.lens = [];
          for (l = 0; l < op.params.length; l++) {
            m = Parser.evaluate(op.params[l], vars);
            if (typeof m === "number") {
              //console.error(m)
              var b = new ArrayBuffer(4);
              var c = new Int32Array(b);
              c[0] = m;
              var a = new Uint8Array(b);
              if (opts.endian) {
                op.lens[bts++] = a[3];
                op.lens[bts++] = a[2];
                op.lens[bts++] = a[1];
                op.lens[bts++] = a[0];
              } else {
                op.lens[bts++] = a[0];
                op.lens[bts++] = a[1];
                op.lens[bts++] = a[2];
                op.lens[bts++] = a[3];
              }
              continue;
            }
          }
          continue;
        }

        if (op.opcode === "DF") {
          //console.error("DD")
          bts = 0;
          op.lens = [];
          for (l = 0; l < op.params.length; l++) {
            m = Parser.evaluate(op.params[l], vars);
            if (typeof m === "number") {
              //console.error(m)
              var b = new ArrayBuffer(4);
              var c = new Float32Array(b);
              c[0] = m;
              var a = new Uint8Array(b);
              if (opts.endian) {
                op.lens[bts++] = a[3];
                op.lens[bts++] = a[2];
                op.lens[bts++] = a[1];
                op.lens[bts++] = a[0];
              } else {
                op.lens[bts++] = a[0];
                op.lens[bts++] = a[1];
                op.lens[bts++] = a[2];
                op.lens[bts++] = a[3];
              }
              continue;
            }
          }
          continue;
        }
        if (op.opcode === "DFF") {
          //console.error("DD")
          bts = 0;
          op.lens = [];
          for (l = 0; l < op.params.length; l++) {
            m = Parser.evaluate(op.params[l], vars);
            if (typeof m === "number") {
              //console.error(m)
              var b = new ArrayBuffer(8);
              var c = new Float64Array(b);
              c[0] = m;
              var a = new Uint8Array(b);
              if (opts.endian) {
                op.lens[bts++] = a[7];
                op.lens[bts++] = a[6];
                op.lens[bts++] = a[5];
                op.lens[bts++] = a[4];
                op.lens[bts++] = a[3];
                op.lens[bts++] = a[2];
                op.lens[bts++] = a[1];
                op.lens[bts++] = a[0];
              } else {
                op.lens[bts++] = a[0];
                op.lens[bts++] = a[1];
                op.lens[bts++] = a[2];
                op.lens[bts++] = a[3];
                op.lens[bts++] = a[4];
                op.lens[bts++] = a[5];
                op.lens[bts++] = a[6];
                op.lens[bts++] = a[7];
              }
              continue;
            }
          }
          continue;
        }

        if (op.opcode === "DFZXS") {
          //console.error("DD")
          bts = 0;
          op.lens = [];
          for (l = 0; l < op.params.length; l++) {
            m = Parser.evaluate(op.params[l], vars);
            if (typeof m === "number") {
              //console.error(m)
              var a = fptozx(m, false);
              //console.log(m,a)
              if (opts.endian) {
                op.lens[bts++] = a[4];
                op.lens[bts++] = a[3];
                op.lens[bts++] = a[2];
                op.lens[bts++] = a[1];
                op.lens[bts++] = a[0];
              } else {
                op.lens[bts++] = a[0];
                op.lens[bts++] = a[1];
                op.lens[bts++] = a[2];
                op.lens[bts++] = a[3];
                op.lens[bts++] = a[4];
              }
              continue;
            }
          }
          continue;
        }

        /*
      if (op.opcode === "DS") {
        console.log(op);
      }
*/
        //Tady se děje magie s instrukcí
        if (op.anonymousLabel) {
          //console.log(op);
          vars["ANON_PREV_2"] = ["ANON_PREV_1"];
          vars["ANON_PREV_1"] = op.addr;
          //console.log(vars);
        }

        if (op.lens && op.lens[1] && typeof op.lens[1] === "function") {
          if (op.lens[2] === "addr24") {
            //3 bytes - 65816 modes
            dta = op.lens[1](vars);
            if (opts.endian) {
              op.lens[3] = Math.floor(dta % 256);
              op.lens[2] = Math.floor((dta >> 8) % 256);
              op.lens[1] = Math.floor((dta >> 16) & 0xff);
            } else {
              op.lens[1] = Math.floor(dta % 256);
              op.lens[2] = Math.floor((dta >> 8) % 256);
              op.lens[3] = Math.floor((dta >> 16) & 0xff);
            }
          } else if (op.lens[2] === "addr32") {
            //3 bytes - 65816 modes
            dta = op.lens[1](vars);
            if (opts.endian) {
              op.lens[4] = Math.floor(dta % 256);
              op.lens[3] = Math.floor((dta >> 8) % 256);
              op.lens[2] = Math.floor((dta >> 16) & 0xff);
              op.lens[1] = Math.floor((dta >> 24) & 0xff);
            } else {
              op.lens[1] = Math.floor(dta % 256);
              op.lens[2] = Math.floor((dta >> 8) % 256);
              op.lens[3] = Math.floor((dta >> 16) & 0xff);
              op.lens[4] = Math.floor((dta >> 24) & 0xff);
            }
          } else if (op.lens[2] === null) {
            //2 bytes
            dta = op.lens[1](vars);
            if (typeof dta == "string") {
              if (opts.endian) {
                op.lens[1] = dta.charCodeAt(0) & 0xff;
                op.lens[2] = dta.charCodeAt(1) & 0xff;
              } else {
                op.lens[2] = dta.charCodeAt(0) & 0xff;
                op.lens[1] = dta.charCodeAt(1) & 0xff;
              }
            } else {
              if (opts.endian) {
                op.lens[2] = Math.floor(dta % 256);
                op.lens[1] = Math.floor(dta / 256);
              } else {
                op.lens[1] = Math.floor(dta % 256);
                op.lens[2] = Math.floor(dta / 256);
              }
            }
          } else {
            dta = op.lens[1](vars);
            op.lens[1] = charVar8(dta);
          }
        }
        if (op.lens && op.lens.length > 2 && typeof op.lens[2] == "function") {
          //				console.log("OPLENS3",op.lens[3], op.lens[2]);
          dta = op.lens[2](vars);
          if (op.lens[3] === null) {
            dta = op.lens[2](vars);
            if (typeof dta == "string") {
              if (opts.endian) {
                op.lens[2] = dta.charCodeAt(0) & 0xff;
                op.lens[3] = dta.charCodeAt(1) & 0xff;
              } else {
                op.lens[3] = dta.charCodeAt(0) & 0xff;
                op.lens[2] = dta.charCodeAt(1) & 0xff;
              }
            } else {
              if (opts.endian) {
                op.lens[3] = dta & 0xff;
                op.lens[2] = dta >> 8;
              } else {
                op.lens[2] = dta & 0xff;
                op.lens[3] = dta >> 8;
              }
            }
          } else {
            op.lens[2] = charVar8(dta);
          }
        }

        if (op.lens && op.lens.length > 3 && typeof op.lens[3] == "function") {
          dta = op.lens[3](vars);
          if (op.lens[4] === null) {
            dta = op.lens[3](vars);
            if (typeof dta == "string") {
              if (opts.endian) {
                op.lens[3] = dta.charCodeAt(0) & 0xff;
                op.lens[4] = dta.charCodeAt(1) & 0xff;
              } else {
                op.lens[4] = dta.charCodeAt(0) & 0xff;
                op.lens[3] = dta.charCodeAt(1) & 0xff;
              }
            } else {
              if (opts.endian) {
                op.lens[4] = dta & 0xff;
                op.lens[3] = dta >> 8;
              } else {
                op.lens[3] = dta & 0xff;
                op.lens[4] = dta >> 8;
              }
            }
          } else {
            op.lens[3] = charVar8(dta);
          }

          //				op.lens[3] = charVar8(op.lens[3](vars)) & 0xff;
        }

        if (op.lens && op.lens.length > 1) {
          if (typeof op.lens[1] == "string") {
            op.lens[1] = op.lens[1].charCodeAt(0);
          }
          if (isNaN(op.lens[1])) {
            //console.log(1201,op)
            throw {
              message: "param out of bounds, NaN"
            };
          }
          if ((op.lens[1] > 255 || op.lens[1] < -128) && op.lens.length == 2) {
            throw {
              message: "param out of bounds - " + op.lens[1]
            };
          }
          if (op.lens[1] < 0) {
            op.lens[1] = 256 + op.lens[1];
          }
        }

        //console.log(op.lens,op)
        //xref usage
      } catch (e) {
        throw {
          msg: e.message,
          s: op,
          e: e
        };
      }
    }

    return [V, vars];
  };