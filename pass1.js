import { Parser } from "./expression-parser.js";

const notInModule = (opts, directive) => {
  if (opts.PRAGMAS && opts.PRAGMAS.indexOf("MODULE") > -1){
    throw {msg:`${directive} is not allowed in modules`}
  }
}

const FRAME_ALLOWED_KEYS = new Set(["size", "reentrant", "calls"])
const FRAME_SIG_REGEX = /^__sig_[a-z][a-z0-9]*(_[a-z][a-z0-9]*)+$/i


export const pass1 = async (V, vxs, opts) => {
    if (!opts.xref) opts.xref = {};
    if (!opts.debugFiles) opts.debugFiles = {};
    opts.frames = {}
    opts.frameIndirectQueue = []
    opts._pendingLoc = null;
    let segment = "CSEG";
    const normalizeSegmentName = (name) => String(name || "").trim().toUpperCase();
    const segmentAlias = {
      ".CSEG": "CSEG",
      ".DSEG": "DSEG",
      ".ESEG": "ESEG",
      ".BSSEG": "BSSEG",
      ".ZPSEG": "ZPSEG",
      ".HEAPSEG": "HEAPSEG",
    };
    const parseExternDecl = (raw, fallbackLabel) => {
      let token = String(raw || fallbackLabel || "").trim();
      if (!token) return { name: "", segment: null };
      let name = token;
      let extSegment = null;

      const at = token.lastIndexOf("@");
      if (at > 0 && at < token.length - 1) {
        name = token.substring(0, at).trim();
        extSegment = token.substring(at + 1).trim();
      } else {
        const colon = token.indexOf(":");
        if (colon > 0 && colon < token.length - 1) {
          const left = token.substring(0, colon).trim();
          const right = token.substring(colon + 1).trim();
          if (left && right) {
            extSegment = left;
            name = right;
          }
        }
      }

      if (extSegment) {
        extSegment = normalizeSegmentName(extSegment.replace(/^\./, ""));
      }

      return { name, segment: extSegment };
    };
    let segallow = () => {
      if (segment === "BSSEG") throw {msg:op.opcode + " is not allowed in BSSEG"};
    };
    let attachPendingLoc = (op) => {
      if (opts._pendingLoc &&
        !op.ifskip &&
        ((typeof op.bytes === "number" && op.bytes > 0) || (op.lens && op.lens.length > 0))) {
        op.loc = {...opts._pendingLoc};
        opts._pendingLoc = null;
      }
    };
    let parseDebugParams = (op) => {
      if (op.params.length > 1) return op.params;
      if (!op.params.length || typeof op.params[0] !== "string") return [];
      let raw = op.params[0].trim();
      if (!raw) return [];
      let match = raw.match(/^(\S+)\s+(.+)$/);
      if (!match) return [raw];
      return [match[1], match[2].trim()];
    };
    let segmentPC = {};
    segmentPC[segment] = 0;
    let PC = 0;
    let vars = {};
    if (vxs) vars = vxs;
    vars.__PRAGMAS = opts.PRAGMAS;
    let op = null;
    let m, l;
    let ifskip = 0;
    let cond;
    let doif = 0;
    let ifstack = [];
    let blocks = [];
    let phase = 0;
    let DP = 0;
    //let anon = []

    const switchSegment = (target, op) => {
      const normalized = normalizeSegmentName(target);
      if (!normalized) {
        throw {msg: ".SEGMENT needs a segment name"};
      }
      segmentPC[segment] = PC;
      segment = normalized;
      PC = segmentPC[segment] || 0;
      op.segment = segment;
      op.addr = PC;
    };

    //main loop - for each line
    //for (let i = 0, j = V.length; i < j; i++) {
    for (let op of V) {
      try {

      const origin = {...op.origin, numline: op.numline, includedFile: op.includedFile, includedFileAtLine: op.includedFileAtLine}; //original line clone

      opts.WLINE = origin;
      op.pass = 1;
      op.segment = segment;
      op.addr = PC;
      op._dp = DP;
      vars._PC = PC;
      if (phase !== 0) {
        op.phase = phase;
      }

      if (op.opcode === "ENDIF") {
        if (!doif) throw {
          msg: "ENDIF without IF",
          s: op
        };
        ifskip = ifstack.pop();
        if (ifstack.length) {
          doif = 1;
        } else {
          doif = 0;
          ifskip = 0;
        }
        continue;
      }

      if (op.opcode === "ELSE") {
        if (!doif) throw {
          msg: "ELSE without IF",
          s: op
        };
        ifskip = ifstack.pop();
        ifskip = ifskip ? 0 : 1;
        //console.log("ELS",ifstack,ifskip,ifstack.filter(function(q){return q==1}))
        if (ifstack.filter((q) => q == 1).length) {
          ifskip = 1;
        }
        ifstack.push(ifskip);
        continue;
      }
      //console.log(doif,ifskip,op,ifstack)
      if (op.opcode === "IF") {
        if (doif) {
          //throw {msg: "Nested IFs are not supported",s:op};
          //if (ifskip) continue;
        }

        //throw {msg: "Nested IFs are not supported",s:op};
        try {
          cond = Parser.evaluate(op.params[0], vars);

          //console.log("IF C",cond,ifskip,op.params[0], vars)
        } catch (e) {
          /*throw {msg: "IF condition can not be determined",s:op}*/
        }
        if (!cond) ifskip = 1;
        doif = 1;
        ifstack.push(ifskip);
        //console.error("LIF",ifstack,ifskip,doif,op.params[0])
        continue;
      }

      if (op.opcode === "IFN") {
        //if (doif) throw {msg: "Nested IFs are not supported",s:op};
        try {
          cond = Parser.evaluate(op.params[0], vars);
        } catch (e) {
          /*throw {msg: "IF condition can not be determined",s:op}*/
        }
        if (cond) ifskip = 1;
        //console.log("IFN C",cond,ifskip,op.params[0], vars)
        doif = 1;
        ifstack.push(ifskip);
        continue;
      }

      if (op.opcode === "IFDEF") {
        const isDefined = Object.prototype.hasOwnProperty.call(vars, op.params[0].toUpperCase());
        if (!isDefined) ifskip = 1;
        doif = 1;
        ifstack.push(ifskip);
        continue;
      }

      if (op.opcode === "IFNDEF") {
        const isDefined = Object.prototype.hasOwnProperty.call(vars, op.params[0].toUpperCase());
        if (isDefined) ifskip = 1;
        doif = 1;
        ifstack.push(ifskip);
        continue;
      }

      if (ifskip) {
        op.ifskip = true;
        continue;
      }

      if (op.opcode === ".BLOCK") {
        if (!op.includedFileAtLine) blocks.push(op.numline);
        else blocks.push(op.numline + "@" + op.includedFileAtLine);
        //console.log("bl!", blocks);
        let prefix = blocks.join("/");
        //vars['__blocks'] = JSON.stringify(blocks);
        vars["__" + prefix] = [];

        continue;
      }
      if (op.opcode === ".ENDBLOCK") {
        let redef = vars["__" + blocks.join("/")];
        //console.log(redef, vars);
        for (let nn = 0; nn < redef.length; nn++) {
          vars[redef[nn]] = vars[blocks.join("/") + "/" + redef[nn]];
          //console.log("REDEF",redef[nn], vars[redef[nn]])
          //vars[blocks.join("/")+"/"+redef[nn]] = null;
          delete vars[blocks.join("/") + "/" + redef[nn]];
        }
        blocks.pop();
        vars["__blocks"] = JSON.stringify(blocks);

        continue;
      }
      /*
            if (op.anonymousLabel) {
              console.log(op);
              anon.push(op)
            }
      */
      if (op.label) {
        //console.log("LABEL", op.label, op.opcode)
        let varname = op.label;
        let beGlobal = false;
        if (varname[0] === "@") {
          beGlobal = true;
          varname = varname.substr(1);
          op.label = varname;
          op.beGlobal = true;
        }

        if (op.beGlobal) beGlobal = true;

        if (blocks.length > 0) {
          varname = blocks.join("/") + "/" + varname;
          vars["__" + blocks.join("/")].push(op.label);
        }

        //console.log(varname, blocks)
        //console.log(op.label,beGlobal,vars[op.label]!==undefined, vars, vxs);
        if (!vxs) {
          if (typeof vars[varname + "$"] !=="undefined" ||
            (beGlobal && vars[op.label] !== undefined)) {
            if (op.opcode !== ".SET" && op.opcode !== ":=") {
              throw {
                msg: "Redefine label " + op.label + " at line " + op.numline,
                s: op,
              };
            }
          }
        }
        if (vars[op.label]) {
          vars[varname] = vars[op.label];
        } else {
          if (beGlobal) {
            vars[varname] = PC;
          }
        }
        //console.log("XVARS", vars)
        //console.log(op);
        opts.xref[op.label] = {
          defined: {
            line: op.numline,
            file: op.includedFile || "*main*",
          },
          value: PC,
        };
        vars[varname + "$"] = PC;
        //console.log(op.label,vars[op.label],PC, vars)
        vars[op.label] = PC;
        // Store segment info so CPUs can check whether a label is in a
        // relocatable non-ZP segment (e.g. CSEG) and avoid incorrect ZP mode.
        // EQU/SET/= are absolute constants — don't tag them with a segment.
        if (op.opcode !== "EQU" && op.opcode !== "SET" && op.opcode !== "=") {
          vars[op.label + "$$seg"] = segment;
        }
        //if (isNaN(PC)) throw {msg:"PC NaN",s:op}
        if (beGlobal) vars[varname] = PC;
      }

      //console.log(PC,op)
      try {
        if (op.opcode === ".ORG") {
          if (opts.PRAGMAS && opts.PRAGMAS. indexOf("MODULE") > -1){
            throw {msg:"ORG is not allowed in modules"}
          }
          PC = Parser.evaluate(op.params[0], vars);
          op.addr = PC;
          segmentPC[segment] = PC;
          continue;
        }

        if (op.opcode === ".EXPORT") {
          //does not care now
          if (opts.PRAGMAS && opts.PRAGMAS. indexOf("MODULE") < 0){
            throw {msg:".EXPORT is not allowed out of modules"}
          }
          continue;
        }

        if (op.opcode === ".EXTERN") {
          if (opts.PRAGMAS && opts.PRAGMAS. indexOf("MODULE") < 0){
            throw {msg:".EXTERN is not allowed out of modules"}
          }
          let raw = op.params[0];
          if (!raw) raw = op.label;
          const decl = parseExternDecl(raw, op.label);
          if (!decl.name) {
            throw {msg: ".EXTERN needs a symbol name"};
          }
          const upperName = decl.name.toUpperCase();
          vars[upperName] = null;
          if (decl.segment) {
            vars[upperName + "$$seg"] = decl.segment;
          }
          if (!op.params) op.params = [];
          op.params[0] = decl.name;
          continue;
        }

        if (op.opcode === ".FRAME") {
          if (opts.PRAGMAS && opts.PRAGMAS.indexOf("MODULE") < 0) {
            throw { msg: ".FRAME is not allowed out of modules" }
          }
          const symbol = (op.params[0] || "").toUpperCase()
          if (!symbol) throw { msg: ".FRAME needs a symbol name" }
          const kvPairs = op.params.slice(1)
          let size, reentrant, calls = []
          for (const pair of kvPairs) {
            if (!pair.includes("=")) throw { msg: `.FRAME invalid param (missing =): ${pair}` }
            const eqIdx = pair.indexOf("=")
            const key = pair.substring(0, eqIdx).trim().toLowerCase()
            const val = pair.substring(eqIdx + 1).trim()
            if (!FRAME_ALLOWED_KEYS.has(key)) throw { msg: `.FRAME unknown key: ${key}` }
            if (key === "size") size = val
            if (key === "reentrant") reentrant = val
            if (key === "calls") {
              calls = [...new Set(
                val.split("|").map(s => s.trim()).filter(Boolean).map(s => s.toUpperCase())
              )]
            }
          }
          const sizeNum = parseInt(size, 10)
          if (size === undefined || isNaN(sizeNum) || sizeNum < 0) {
            throw { msg: ".FRAME size must be a non-negative integer" }
          }
          const reentrantNum = parseInt(reentrant, 10)
          if (reentrant === undefined || (reentrantNum !== 0 && reentrantNum !== 1)) {
            throw { msg: ".FRAME reentrant must be 0 or 1" }
          }
          // opts.frames is reset at the start of each pass1 run, so this only catches duplicates within the same pass
          if (opts.frames[symbol]) throw { msg: `.FRAME duplicate: ${symbol}` }
          opts.frames[symbol] = { size: sizeNum, reentrant: reentrantNum === 1, calls, indirect: [] }
          continue
        }

        if (op.opcode === ".FRAME_INDIRECT") {
          if (opts.PRAGMAS && opts.PRAGMAS.indexOf("MODULE") < 0) {
            throw { msg: ".FRAME_INDIRECT is not allowed out of modules" }
          }
          const symbol = (op.params[0] || "").toUpperCase()
          if (!symbol) throw { msg: ".FRAME_INDIRECT needs a symbol name" }
          const kvPairs = op.params.slice(1)
          let sig
          for (const pair of kvPairs) {
            if (!pair.includes("=")) throw { msg: `.FRAME_INDIRECT invalid param (missing =): ${pair}` }
            const eqIdx = pair.indexOf("=")
            if (pair.substring(0, eqIdx).trim().toLowerCase() === "sig") {
              sig = pair.substring(eqIdx + 1).trim()
            }
          }
          if (!sig || !FRAME_SIG_REGEX.test(sig)) {
            throw { msg: `.FRAME_INDIRECT invalid sig= value: ${sig}` }
          }
          opts.frameIndirectQueue.push({ symbol, sig })
          continue
        }

        if (op.opcode === ".FILE") {
          try {
            let [fileIdExpr, filePathExpr] = parseDebugParams(op);
            let fileId = Parser.evaluate(fileIdExpr, vars);
            // Strip surrounding quotes without expression evaluation so that
            // Windows paths with backslashes are not treated as escape sequences.
            let filePath = typeof filePathExpr === "string"
              ? filePathExpr.trim().replace(/^["']|["']$/g, "")
              : null;
            if (Number.isInteger(fileId) && fileId > 0 && typeof filePath === "string" && filePath.length > 0) {
              opts.debugFiles[fileId] = filePath;
            }
          } catch (e) {
            // Silent ignore for invalid .FILE metadata.
          }
          continue;
        }

        if (op.opcode === ".LOC") {
          try {
            let [fileIdExpr, lineExpr] = parseDebugParams(op);
            let fileId = Parser.evaluate(fileIdExpr, vars);
            let line = Parser.evaluate(lineExpr, vars);
            if (Number.isInteger(fileId) &&
              fileId > 0 &&
              Number.isInteger(line) &&
              line > 0 &&
              opts.debugFiles[fileId]) {
              let comment = op.remark && op.remark.trim() ? op.remark.trim() : undefined;
              opts._pendingLoc = comment ? {fileId, line, comment} : {fileId, line};
            }
          } catch (e) {
            // Silent ignore for invalid .LOC metadata.
          }
          continue;
        }


        if (segmentAlias[op.opcode]) {
          switchSegment(segmentAlias[op.opcode], op);
        }
        if (op.opcode === ".SEGMENT") {
          let target = "";
          if (op.params && op.params.length > 0) {
            target = op.params[0];
          } else if (typeof op.paramstring === "string" && op.paramstring.trim()) {
            target = op.paramstring.trim();
          }
          switchSegment(target, op);
        }

        if (op.opcode === ".PHASE") {
          notInModule(opts, ".PHASE");
          if (phase) throw {
            msg: "PHASE cannot be nested"
          };
          let newphase = Parser.evaluate(op.params[0], vars);
          op.addr = PC;
          phase = newphase - PC;
          PC = newphase;
          continue;
        }
        if (op.opcode === ".DEPHASE") {
          notInModule(opts, ".DEPHASE");
          op.addr = PC;
          PC = PC - phase;
          phase = 0;
          continue;
        }
        if (op.opcode === "EQU") {
          //TADY JESTE NEMUSI BYT OK!!!
          try {
            vars[op.label] = Parser.evaluate(op.params[0], vars);
          } catch (e) {
            vars[op.label] = null;
            //console.log('Unsatisfied '+op.label);
          }
          opts.xref[op.label] = {
            defined: {
              line: op.numline,
              file: op.includedFile || "*main*",
            },
            value: vars[op.label],
          };
          continue;
        }
        if (op.opcode === "=" || op.opcode === ":=" || op.opcode === ".SET") {
          //console.log(op)
          //changeble assign
          vars[op.label] = Parser.evaluate(op.params[0], vars);
          opts.xref[op.label] = {
            defined: {
              line: op.numline,
              file: op.includedFile || "*main*",
            },
            value: vars[op.label],
          };
          continue;
        }
      } catch (e) {
        throw {
          msg: e.msg,
          s: op
        };
      }

      if (op.opcode === "DB" || op.opcode === "FCB") {
        segallow();
        op.bytes = 0;
        for (l = 0; l < op.params.length; l++) {
          try {
            m = Parser.evaluate(op.params[l], vars);
            if (typeof m === "number") {
              op.bytes++;
              continue;
            }
            if (typeof m === "string") {
              op.bytes += m.length;
              continue;
            }
          } catch (e) {
            op.bytes++;
          }
        }
      }

      if (op.opcode === "FCC") {
        segallow();
        op.bytes = 0;
        //console.log(op)
        for (l = 0; l < op.params.length; l++) {
          let mystring = op.params[l].trim();
          let delim = mystring[0];
          if (mystring[mystring.length - 1] !== delim)
            throw {
              msg: "Delimiters does not match",
              s: op
            };
          op.bytes += mystring.length - 2;
        }
      }

      if (op.opcode === ".CSTR" ||
        op.opcode === ".PSTR" ||
        op.opcode === ".ISTR") {
        segallow();
        op.bytes = 0;
        for (l = 0; l < op.params.length; l++) {
          try {
            m = Parser.evaluate(op.params[l], vars);
            if (typeof m === "number") {
              op.bytes++;
              continue;
            }
            if (typeof m === "string") {
              op.bytes += m.length;
              continue;
            }
          } catch (e) {
            op.bytes++;
          }
        }
        if (op.opcode === ".CSTR" || op.opcode === ".PSTR") op.bytes++; //+1 for leading count / trailing zero
      }

      if (op.opcode === "DS" || op.opcode === "RMB") {
        //op.bytes = Parser.evaluate(op.params[0]);
        let bytes = Parser.evaluate(op.params[0], vars);
        op.bytes = bytes;
        //console.log(bytes, typeof bytes)
        if (typeof bytes !== "number")
          throw {
            msg: "DS / RMB needs a numerical parameter",
            s: op
          };
        if (op.params.length == 2) {
          //DB alias
          let m = Parser.evaluate(op.params[1], vars);
          if (typeof m === "string") m = m.charCodeAt(0);
          op.bytes = bytes;
          op.lens = [];
          for (let iq = 0; iq < bytes; iq++) {
            op.lens[iq] = m;
          }
          //console.log(op.lens);
        }

        attachPendingLoc(op);
        PC = PC + bytes;

        continue;
      }
      if (op.opcode === "ALIGN") {
        notInModule(opts, "ALIGN");
        //op.bytes = Parser.evaluate(op.params[0]);
        let align = Parser.evaluate(op.params[0], vars);

        PC = PC + (PC % align > 0 ? align - (PC % align) : 0);

        continue;
      }
      if (op.opcode === "SETDP") {
        //op.bytes = Parser.evaluate(op.params[0]);
        DP = Parser.evaluate(op.params[0], vars);

        continue;
      }
      if (op.opcode === "FILL") {
        segallow();
        //op.bytes = Parser.evaluate(op.params[0]);
        let bytes = Parser.evaluate(op.params[1], vars);
        if (typeof bytes === "string") bytes = bytes.charCodeAt(0);
        //console.log("FILLB",bytes,op.params)
        //DB alias
        let m = Parser.evaluate(op.params[0], vars);
        if (typeof m === "string") m = m.charCodeAt(0);
        op.bytes = bytes;
        op.lens = [];
        for (let iq = 0; iq < bytes; iq++) {
          op.lens[iq] = m;
        }
        //console.log(op.lens);
        attachPendingLoc(op);
        PC = PC + bytes;

        continue;
      }
      if (op.opcode === "BSZ" || op.opcode === "ZMB") {
        segallow();
        //op.bytes = Parser.evaluate(op.params[0]);
        let bytes = Parser.evaluate(op.params[0], vars);
        op.bytes = bytes;
        op.lens = [];
        for (let iq = 0; iq < bytes; iq++) {
          op.lens[iq] = 0;
        }
        attachPendingLoc(op);
        PC = PC + bytes;

        continue;
      }
      if (op.opcode === "DW" || op.opcode === "FDB") {
        segallow();
        op.bytes = 0;
        for (l = 0; l < op.params.length; l++) {
          try {
            m = Parser.evaluate(op.params[l], vars);
            if (typeof m === "number") {
              op.bytes += 2;
              continue;
            }
          } catch (e) {
            op.bytes += 2;
          }
        }
      }

      if (op.opcode === "DD" || op.opcode === "DF") {
        segallow();
        op.bytes = 0;
        for (l = 0; l < op.params.length; l++) {
          try {
            m = Parser.evaluate(op.params[l], vars);
            if (typeof m === "number") {
              op.bytes += 4;
              continue;
            }
          } catch (e) {
            op.bytes += 4;
          }
        }
      }
      if (op.opcode === "DFF") {
        segallow();
        op.bytes = 0;
        for (l = 0; l < op.params.length; l++) {
          try {
            m = Parser.evaluate(op.params[l], vars);
            if (typeof m === "number") {
              op.bytes += 8;
              continue;
            }
          } catch (e) {
            op.bytes += 8;
          }
        }
      }
      if (op.opcode === "DFZXS") {
        segallow();
        op.bytes = 0;
        for (l = 0; l < op.params.length; l++) {
          try {
            m = Parser.evaluate(op.params[l], vars);
            if (typeof m === "number") {
              op.bytes += 5;
              continue;
            }
          } catch (e) {
            op.bytes += 5;
          }
        }
      }

      if (op.opcode === ".INCBIN") {
        segallow();
        if (!op.params[0])
          throw {
            msg: "No file name given at line " + op.numline,
            s: op
          };
        //console.log("Include "+params[0]);
        let nf = await opts.readFile(op.params[0], true);
        if (!nf)
          throw {
            msg: "Cannot find file " + op.params[0] + " for incbin",
            s: op,
          };

        op.bytes = 0;
        op.lens = [];
        for (let iq = 0; iq < nf.length; iq++) {
          let cd = nf.charCodeAt(iq);
          if (cd > 255) {
            op.lens[op.bytes++] = cd >> 8;
          }
          op.lens[op.bytes++] = cd % 256;
        }
        //console.log(op.lens);
        attachPendingLoc(op);
        PC = PC + op.bytes;

        continue;
      }

      //65816
      if (op.opcode === ".M16") {
        vars.__AX = 16;
        continue;
      }
      if (op.opcode === ".M8") {
        vars.__AX = 8;
        continue;
      }
      if (op.opcode === ".X16") {
        vars.__MX = 16;
        continue;
      }
      if (op.opcode === ".X8") {
        vars.__MX = 8;
        continue;
      }

      //je to instrukce? Jde optimalizovat?
      let opa = opts.assembler.parseOpcode(origin, vars, Parser, opts);
      if (opa) {
        segallow();
        //console.log(op,opa);
        Object.assign(op, opa);
      }

      if (op.bytes === undefined) op.bytes = 0;
      //console.log(op.bytes,op)
      attachPendingLoc(op);
      PC += op.bytes;
      if (op.params && op.params.length && !op.opcode) {
        throw {
          msg: "No opcode, possible missing",
          s: op
        };
      }

      } catch (e) {
        if (opts.relaxed && opts.errors) {
          opts.errors.push({
            msg: e.msg || String(e),
            s: e.s || "Pass1 error",
            wline: opts.WLINE || op
          });
          continue;
        }
        throw e;
      }
    }

    return [V, vars];
  };
