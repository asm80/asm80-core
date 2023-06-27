export const fptozx = (num, simpleint) => {
    simpleint = simpleint === undefined ? true : simpleint;
    var sgn = num < 0;
    var m = sgn ? -num : num;
    if (simpleint && num == Math.floor(num) && num >= -65535 && num <= 65535) {
      m = sgn ? 65536 + num : num;
      return [0, sgn ? 0xff : 0, m & 0xff, (m >> 8) & 0xff, 0];
    }
    var bit32 = function (m, sgn) {
      var out = "";
      var a = [];
      for (var i = 0; i < 32; i++) {
        var bit = "0";
        m = m * 2;
        if (m >= 1.0) {
          m -= 1.0;
          bit = "1";
        }
        if (sgn && i === 0) bit = "1";
        if (!sgn && i === 0) bit = "0";
        out += bit;
        if (i % 8 == 7) {
          //console.log(parseInt(out,2))
          a.push(parseInt(out, 2));
          out = "";
        }
      }
      return a;
    };
    var e = Math.floor(Math.log2(m) + 1);
    if (e > 127) throw new Error("Overflow");
    if (e < -127) return [0, 0, 0, 0, 0];
    var i;
    if (e < 0) {
      for (i = 0; i < -e; i++) m = m * 2;
    } else {
      for (i = 0; i < e; i++) m = m / 2;
    }
    var n = bit32(m, sgn);
    return [e + 128, n[0], n[1], n[2], n[3]];
  };