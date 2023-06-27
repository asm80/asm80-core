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


  const toHexN = (n, d) => {
    let s = n.toString(16);
    while (s.length < d) {
      s = "0" + s;
    }
    return s.toUpperCase();
  };

  export const toHex2 = (n) => toHexN(n & 0xff, 2);
  export const toHex4 = (n) => toHexN(n, 4);
  export const toHex6 = (n) => toHexN(n, 6);
  export const toHex8 = (n) => toHexN(n, 8);