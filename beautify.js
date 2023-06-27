import { parseLine } from "./parseLine.js";
import { toInternal, nonempty, norm } from "./parser.js";
import { prepro } from "./preprocessor.js";

const emptymask = (xs) => xs.map((lx) => {
    var l = lx.line;
    var lx2 = {
      addr: 0,
      line: ";;;EMPTYLINE",
      numline: lx.numline
    };
    while (l[0] == " ") {
      l = l.substr(1);
    }
    return l.length ? lx : lx2;
  });

export const beautify = (s, opts) => {
    var i = toInternal(s.split(/\n/));
    i = emptymask(i);
    i = nonempty(i);
    i = norm(i);
    var prei = prepro(i, {
      noinclude: true,
      ...opts
    });
    i = i.map((line) => {
      //console.log(line);
      line.line = line.line.replace(/\%\%M/gi, "__m");
      return parseLine(line, prei[1], opts);
    });
    var out = "";
    var op, ln;
    for (var q = 0; q < i.length; q++) {
      op = i[q];
      ln = "";
      if (op.remark == "EMPTYLINE") {
        out += "\n";
        continue;
      }

      if (!op.label && !op.opcode && op.remark) {
        out += ";" + op.remark + "\n";
        continue;
      }

      if (op.label) {
        ln += op.label;
        if (op.opcode != "EQU" && op.opcode != "=" && op.opcode != ".SET")
          ln += ":";
        ln += " ";
      }
      while (ln.length < 12) {
        ln += " ";
      }
      if (op.opcode) {
        ln += op.opcode + " ";
      }
      while (ln.length < 20) {
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