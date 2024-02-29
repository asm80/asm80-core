// assembler file parser
// gets a text file, returns an array of parsed lines

import { prepro, unroll } from "./preprocessor.js";
import { parseLine } from "./parseLine.js";

import { toInternal, nonempty, norm } from "./utils/utils.js";

export const parse = async (s, opts) => {
  // split and convert to internal lines
  let i = toInternal(s.split(/\n/));
  //remove empty lines
  i = nonempty(i);
  //normalize lines
  i = norm(i);

  //macro processing and expansion
  
  let prei = await prepro(i, opts);
  //console.log(prei)
  i = prei[0].map((line) => parseLine(line, prei[1], opts));
  i = unroll(i, prei[1], null, opts);
  
  //console.log("prei",i)
  return i;
};
