// assembler file parser
// gets a text file, returns an array of parsed lines

import { prepro, unroll } from "./preprocessor.js";
import { parseLine } from "./parseLine.js";

export const norm = (xs) => xs.map((lx) => {
    let l = lx.line;
    l = l.replace("&lt;", "<");
    l = l.replace("&gt;", ">");
    while (l[l.length - 1] == " ") {
      l = l.substr(0, l.length - 1);
    }
    lx.line = l;
    if (l[0] != " ") {
      return lx;
    }
    while (l[0] == " ") {
      l = l.substr(1);
    }
    lx.line = " " + l;
    return lx;
  });

  //remove empty lines
export const nonempty = (xs) => xs.filter((lx) => {
    let l = lx.line;
    while (l[0] == " ") {
      l = l.substr(1);
    }
    return l.length ? true : false;
  });


  //convert lines to internal structure

export const toInternal = (xs) => {
    let numLine = 1;
    return xs.map((line) => ({
      line: line, //original line
      numline: numLine++, //line number
      addr: null, //address in code
      bytes: 0, //number of bytes of this instruction
    }));
  };


export const parse = (s, opts) => {
  //let {assembler=null,fileGet=null}=opts
  if (!opts.includedFiles) opts.includedFiles = {};
  if (opts.assembler.endian) opts.endian = opts.assembler.endian;
  /*
  assembler = asm;
  if (asm.endian) endian = asm.endian;
  */
  //includedFiles = {};
  let i = toInternal(s.split(/\n/));
  i = nonempty(i);
  i = norm(i);

  //macro processing and expansion
  
  let prei = prepro(i, opts);
  //console.log(prei)
  i = prei[0].map((line) => parseLine(line, prei[1], opts));
  i = unroll(i, prei[1], null, opts);
  
  //console.log("prei",i)
  return i;
};
