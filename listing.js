import {toHex2, toHex4} from './utils/utils.js';
export const lst = (result, raw, compact=false) => {
  let V = result.dump;
  let  vars = result.vars;
  let opts = result.opts;
    let ln;
    let op;
    let out = "";
    for (let i = 0, j = V.length; i < j; i++) {
      op = V[i];
      //console.log(op)
      ln = "";
      //if (op.ifskip) {continue}
      if (op.macro && !raw) {
        /*out += '        **MACRO UNROLL - '+op.macro+'\n';*/
      }
      if (op.addr !== undefined && !op.ifskip) {
        ln += toHex4(op.addr);
        if (op.phase) {
          ln += " @" + toHex4(op.addr - op.phase);
        }
        ln += compact ? " " : "   ";
      }
      if (op.lens && !op.ifskip) {
        for (let n = 0; n < op.lens.length; n++) {
          ln += toHex2(op.lens[n]) + " ";
        }
      }

      if (!compact)
        while (ln.length < 20) {
          ln += " ";
        }
      if (compact)
        while (ln.length < 15) {
          ln += " ";
        }
      if (op.listing) {
        out += ln + op.listing + "\n";
        continue;
      }
      if (op.label) {
        ln += op.label + ":   ";
      }
      if (!compact)
        while (ln.length < 30) {
          ln += " ";
        }
      if (compact)
        while (ln.length < 22) {
          ln += " ";
        }
      if (op.opcode) {
        ln += op.opcode + (compact ? " " : "   ");
      }
      if (op.bandPar) {
        ln += op.bandPar + ",";
      }
      if (op.aimPar) {
        ln += op.aimPar + ",";
      }
      if (op.params) {
        ln += op.params + (compact ? " " : "   ");
      }
      if (op.remark) {
        ln += ";" + op.remark;
      }
      out += ln + "\n";
    }
    if (raw) return out;
    /*
    out+="\n\n";
    for (let k in vars) {
      if (vars[k]===null) continue;
      if (k[0]=='_' && k[1]=='_') continue;
      if (k[k.length-1]==='$') continue;
      ln = '';
      ln += k;
      while (ln.length<12) {ln+= ' ';}
      ln += toHex4(vars[k]);
      out += ln+"\n";
    }
*/
    //xref
    out += "\n\n";
    let xref = opts.xref
    for (let k in xref) {
      if (xref[k] === null) continue;
      if (k[0] == "_" && k[1] == "_") continue;
      if (k[k.length - 1] === "$") continue;
      ln = "";
      ln += k + ": ";
      while (ln.length < 20) {
        ln += " ";
      }
      ln += toHex4(xref[k].value);
      ln += " DEFINED AT LINE " + xref[k].defined.line;
      if (xref[k].defined.file != "*main*") ln += " IN " + xref[k].defined.file;
      out += ln + "\n";
      if (xref[k].usage) {
        for (let j = 0; j < xref[k].usage.length; j++) {
          out += "                    > USED AT LINE " + xref[k].usage[j].line;
          if (xref[k].usage[j].file != "*main*")
            out += " IN " + xref[k].usage[j].file;
          out += "\n";
        }
      }
    }
    return out;
  };

export const html = (V, vars, raw, compact=false) => {
    let parfix = (par) => {
      par += "";
      for (let k in vars) {
        if (vars[k] === null) continue;
        if (k[0] == "_" && k[1] == "_") continue;
        if (k[k.length - 1] === "$") continue;
        let re = new RegExp("^" + k + "$", "i");
        if (par.match(re)) {
          return '<a href="#LBL' + k + '">' + par + "</a>";
        }
      }
      return par;
    };
    let ln;
    let op;
    let out = "<html><head><meta charset=utf-8><body><table>";
    for (let i = 0, j = V.length; i < j; i++) {
      op = V[i];
      ln = '<tr id="ln' + op.numline + '">';
      if (op.macro && !raw) {
        /*ln += '        **MACRO UNROLL - '+op.macro+'\n';*/
      }
      if (op.addr !== undefined) {
        ln +=
          '<td><a name="ADDR' +
          toHex4(op.addr) +
          '">' +
          toHex4(op.addr) +
          "</a>";
        if (op.phase) {
          ln += "</td><td>" + toHex4(op.addr - op.phase);
        } else ln += "</td><td>";
        ln += "</td>";
      } else ln += "<td></td><td></td>";
      if (op.lens) {
        ln += "<td>";
        for (let n = 0; n < op.lens.length; n++) {
          ln += toHex2(op.lens[n]) + " ";
        }
        ln += "</td>";
      } else ln += "<td></td>";

      if (op.label) {
        ln += '<td><a name="LBL' + op.label + '">' + op.label + "</a></td>";
      } else ln += "<td></td>";
      if (op.opcode) {
        ln += "<td>" + op.opcode + "</td>";
      } else ln += "<td></td>";
      if (op.params) {
        ln += "<td>" + op.params.map(parfix) + "</td>";
      } else ln += "<td></td>";
      if (op.remark) {
        ln += "<td>" + ";" + op.remark + "</td>";
      } else ln += "<td></td>";
      out += ln + "</tr>\n";
    }
    out += "</table>";
    return out;
  };