import { btoax, atobx } from "./utils/base64escaped.js";
import { Parser } from "./expression-parser.js";

const includedLineNumber = (s) => {
    if (!s.includedFile) return s.numline;
    return s.includedFileAtLine + "__" + s.numline;
  }

export const parseLine = (s, macros, /*stopFlag, olds, */opts = {stopFlag:null, olds:null, assembler:null}) => {
    let t = s.line;
    let ll;

    //anonymous labels
    //format: : label
    ll = t.match(/^\s*:\s*(.*)/);
    if (ll) {
      s.anonymousLabel = "anon__" + includedLineNumber(s);
      t = ll[1];
    }

    //console.log(s, ll)
    //labels
    //format: label:
    ll = t.match(/^\s*(\@{0,1}[a-zA-Z0-9-_]+):\s*(.*)/);
    //console.log(t, ll)
    if (ll) {
      s.label = ll[1].toUpperCase();
      t = ll[2];
    }

    //anonymous labels
    //format: : label

    ll = t.match(/^\s*:\s*(.*)/);
    //console.log(s, ll)
    if (ll) {
      s.label = "__@anon" + s.numline;
      t = ll[2];
    }


    s._dp = 0;
    s.params = [];

    //special EQU format as "label = value"
    let oo = t.match(/^\s*(\=)\s*(.*)/);
    if (oo) {
      s.opcode = oo[1].toUpperCase();
      t = oo[2];
    } else {
      oo = t.match(/^\s*([\.a-zA-Z0-9-_]+)\s*(.*)/);
      //console.log("2",oo,t)
      if (oo) {
        s.opcode = oo[1].toUpperCase();
        t = oo[2];
      }
    }
    /*
    oo = t.match(/^\s*(:\=)\s*(.*)/);
    if (oo) {
      s.opcode = "=";
      t = oo[2];
    }
*/
    if (t) {
      //param grouping by {}
      //try {
      //console.log(t)
      while (t.match(/\"(.*?)\"/g)) {
        t = t.replace(/\"(.*?)\"/g, (n) => "00ss" + btoax(n) + "!");
      }

      while (t.match(/\'(.*?)\'/g)) {
        //console.log(t)
        t = t.replace(/\'(.*?)\'/g, (n) => "00ss" + btoax('"' + n.substr(1, n.length - 2) + '"') + "!");
      }

      while (t.match(/\{(.*?)\}/g)) {
        t = t.replace(/\{(.*?)\}/g, (n) => "00bb" + btoax(n.substr(1, n.length - 2)));
      }
      //} catch(e) {
      // console.log(e,t)
      //}
      //semicolon fix
      while (t.match(/"(.*?);(.*?)"/g)) {
        t = t.replace(/"(.*?);(.*?)"/g, '"$1§$2"');
      }
      while (t.match(/'(.*?);(.*?)'/g)) {
        t = t.replace(/'(.*?);(.*?)'/g, '"$1§$2"');
      }

      let pp = t.match(/^\s*([^;]*)(.*)/);
      if (pp && pp[1].length) {
        s.paramstring = pp[1];

        //sane strings
        let ppc = pp[1];
        while (ppc.match(/"(.*?),(.*?)"/g)) {
          ppc = ppc.replace(/"(.*?),(.*?)"/g, '"$1€$2"');
        }
        while (ppc.match(/'(.*?),(.*?)'/g)) {
          ppc = ppc.replace(/'(.*?),(.*?)'/g, '"$1€$2"');
        }

        let n = ppc.match(/([0-9]+)\s*DUP\s*\((.*)\)/i);
        if (n) {
          let dup = parseInt(n[1]);
          let nln = "";
          for (let i = 0; i < dup; i++) {
            nln += n[2] + ",";
          }
          ppc = nln.substring(0, nln.length - 1);
          //console.log(ppc);
        }

        let px = ppc.split(/\s*,\s*/);
        s.params = px.map((ppc) => {
          let p = (ppc.replace(/€/g, ",").replace(/§/g, ";")).trim();
          p = p.replace(/00ss(.*?)\!/g, (n) => atobx(n.substr(4, n.length - 5)));
          return p;
        });

        //console.log(s)
        t = pp[2].replace(/§/g, ";");
      }
    }

    //console.log("SSS",s)
    if (t) {
      let rr = t.match(/^\s*;*(.*)/);
      if (rr) {
        s.remark = rr[1].replace(/00ss(.*?)\!/g, (n) => atobx(n.substr(4, n.length - 5)));
        if (!s.remark) {
          s.remark = " ";
        }
        t = "";
      }
    }
    s.notparsed = t;

    //pokus s opts
    //console.log("ZDECH", s)
    if (s.opcode === "ORG") {
      s.opcode = ".ORG";
    }
    if (s.opcode === ".ERROR") {
      s.paramstring = s.paramstring.replace(/00ss(.*?)\!/g, (n) => atobx(n.substr(4, n.length - 5)));
      return s;
      //console.log(stopFlag,olds,vars)
      //throw { "msg": s.paramstring.replace(/00ss(.*?)\!/g, function (n) { return atobx(n.substr(4, n.length - 5)) }), "s":s};
    }
    if (s.opcode === ".EQU") {
      s.opcode = "EQU";
    }
    if (s.opcode === ".FILL") {
      s.opcode = "FILL";
    }
    if (s.opcode === ".ORG") {
        return s;

        // obsolete - evaluate origin has been suppressed
        /*
      try {
        //				s.addr = Parser.evaluate(s.paramstring);
        return s;
      } catch (e) {
        throw {
          msg: e.message,
          s: s
        };
      }
      */
    }

    if (s.opcode === "DEFB") {
      s.opcode = "DB";
      return s;
    }
    if (s.opcode === ".BYTE") {
      s.opcode = "DB";
      return s;
    }
    if (s.opcode === ".DB") {
      s.opcode = "DB";
      return s;
    }
    if (s.opcode === ".WORD") {
      s.opcode = "DW";
      return s;
    }
    if (s.opcode === ".DW") {
      s.opcode = "DW";
      return s;
    }
    if (s.opcode === "DEFW") {
      s.opcode = "DW";
      return s;
    }
    if (s.opcode === ".DD") {
      s.opcode = "DD";
      return s;
    }
    if (s.opcode === ".DF") {
      s.opcode = "DF";
      return s;
    }
    if (s.opcode === ".DFZXS") {
      s.opcode = "DFZXS";
      return s;
    }
    if (s.opcode === ".DFF") {
      s.opcode = "DFF";
      return s;
    }
    if (s.opcode === "DEFS") {
      s.opcode = "DS";
      return s;
    }
    if (s.opcode === ".RES") {
      s.opcode = "DS";
      return s;
    }
    if (s.opcode === "DEFM") {
      s.opcode = "DS";
      return s;
    }

    if (s.opcode === ".ALIGN") {
      s.opcode = "ALIGN";
      return s;
    }

    if (s.opcode === ".IFN") {
        s.opcode = "IFN";
        return s;
      }
      if (s.opcode === ".IF") {
      s.opcode = "IF";
      return s;
    }
    if (s.opcode === ".ELSE") {
      s.opcode = "ELSE";
      return s;
    }
    if (s.opcode === ".ENDIF") {
      s.opcode = "ENDIF";
      return s;
    }

    if (s.opcode === ".PRAGMA") {
      opts.PRAGMAS = opts.PRAGMAS || [];
      opts.PRAGMAS.push(s.params[0].toUpperCase());
      return s;
    }

    if (s.opcode === "EQU" ||
      s.opcode === "=" ||
      s.opcode === ".SET" ||
      s.opcode === "IF" ||
      s.opcode === "IFN" ||
      s.opcode === "ELSE" ||
      s.opcode === "ENDIF" ||
      s.opcode === ".ERROR" ||
      s.opcode === ".INCLUDE" ||
      s.opcode === ".INCBIN" ||
      s.opcode === ".MACRO" ||
      s.opcode === ".ENDM" ||
      s.opcode === ".BLOCK" ||
      s.opcode === ".ENDBLOCK" ||
      s.opcode === ".REPT" ||
      s.opcode === ".CPU" ||
      s.opcode === ".ENT" ||
      s.opcode === ".BINFROM" ||
      s.opcode === ".BINTO" ||
      s.opcode === ".ENGINE" ||
      s.opcode === ".PRAGMA" ||
      s.opcode === "END" ||
      s.opcode === ".END" ||
      //6809 assembler ops
      s.opcode === "BSZ" ||
      s.opcode === "FCB" ||
      s.opcode === "FCC" ||
      s.opcode === "FDB" ||
      s.opcode === "FILL" ||
      s.opcode === "RMB" ||
      s.opcode === "ZMB" ||
      s.opcode === "SETDP" ||
      //65816
      s.opcode === ".M8" ||
      s.opcode === ".X8" ||
      s.opcode === ".M16" ||
      s.opcode === ".X16" ||
      //phase, dephase
      s.opcode === ".PHASE" ||
      s.opcode === ".DEPHASE" ||
      s.opcode === ".SETPHASE" ||
      s.opcode === "ALIGN" ||
      s.opcode === ".CSTR" ||
      s.opcode === ".ISTR" ||
      s.opcode === ".PSTR" ||
      //segments
      s.opcode === ".CSEG" ||
      s.opcode === ".DSEG" ||
      s.opcode === ".ESEG" ||
      s.opcode === ".BSSEG" ||
      s.opcode === "DB" ||
      s.opcode === "DW" ||
      s.opcode === "DD" ||
      s.opcode === "DF" ||
      s.opcode === "DFF" ||
      s.opcode === "DFZXS" ||
      s.opcode === "DS") {
      return s;
    }

    if (s.opcode === ".DEBUGINFO" ||
      s.opcode === ".MACPACK" ||
      s.opcode === ".FEATURE" ||
      s.opcode === ".ZEROPAGE" ||
      s.opcode === ".SEGMENT" ||
      s.opcode === ".SETCPU") {
      s.opcode = "";
      return s;
    }

    if (!s.opcode && s.label) {
      return s;
    }
    let ax = null
    try {
      ax = opts.assembler.parseOpcode(s, {}, Parser);
    } catch (e) {
      throw {
        msg: e,
        s: s
      };
    }
    //console.log("SS",JSON.stringify(s),ax)
    if (ax !== null) return ax;

    if (macros[s.opcode]) {
      s.macro = s.opcode;
      return s;
    }

    //label bez dvojtecky
    //console.log(s,s2)
    if (!s.label && !opts.stopFlag) {
      //console.log(s)
      //let s2 = {line:s.line,numline:s.numline, addr:null,bytes:0};
      let s2 = JSON.parse(JSON.stringify(s));
      s2.addr = null;
      s2.bytes = 0;

      if (s.remark && !s.opcode) {
        return s;
      }
      if (!s.params || s.params.length === 0)
        throw {
          msg: "Unrecognized instruction " + s.opcode,
          s: s
        };
      if (!s.opcode)
        throw {
          msg: "Unrecognized instruction " + s.opcode,
          s: s
        };
      //hotfix
      //console.log(s)
      if (s.params[0].indexOf(":=") === 0)
        s.params[0] = ".SET" + s.params[0].substr(2);
      s2.line = s.opcode + ": " + s.params.join();
      if (s.remark) s2.line += " ;" + s.remark;
      //console.log("ATTEMPT2",s2.line)
      let sx = parseLine(s2, macros, {stopFlag:true, olds:s, ...opts});
      if (!sx.opcode)
        throw {
          msg: "Unrecognized instruction " + s.opcode,
          s: s
        };
      return sx;
    }
    if (opts.stopFlag)
      throw {
        msg: "Unrecognized instruction " + opts.olds.opcode,
        s: s
      };
    throw {
      msg: "Unrecognized instruction " + s.opcode,
      s: s
    };
  };  