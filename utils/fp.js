/**
 * Convert a number to ZX Spectrum floating-point format (5 bytes)
 * @param {number} num - Number to convert
 * @param {boolean} [simpleint=true] - If true, integers are stored as simple integers when possible
 * @returns {number[]} Array of 5 bytes representing the number in ZX format [exponent, byte0, byte1, byte2, byte3]
 * @throws {Error} When number is too large (overflow)
 */
export const fptozx = (num, simpleint) => {
    simpleint = simpleint === undefined ? true : simpleint;
    let sgn = num < 0;
    let m = sgn ? -num : num;
    
    // Handle integers in range -65535 to 65535 as simple format
    if (simpleint && num == Math.floor(num) && num >= -65535 && num <= 65535) {
      m = sgn ? 65536 + num : num;
      return [0, sgn ? 0xff : 0, m & 0xff, (m >> 8) & 0xff, 0];
    }
    
    // Generate 32-bit mantissa representation
    let bit32 = function (m, sgn) {
      let out = "";
      let a = [];
      for (let i = 0; i < 32; i++) {
        let bit = "0";
        m = m * 2;
        if (m >= 1.0) {
          m -= 1.0;
          bit = "1";
        }
        // Set sign bit at position 0
        if (sgn && i === 0) bit = "1";
        if (!sgn && i === 0) bit = "0";
        out += bit;
        // Convert each 8-bit chunk to byte
        if (i % 8 == 7) {
          a.push(parseInt(out, 2));
          out = "";
        }
      }
      return a;
    };
    
    // Calculate exponent
    let e = Math.floor(Math.log2(m) + 1);
    if (e > 127) throw new Error("Overflow");
    if (e < -127) return [0, 0, 0, 0, 0]; // Underflow to zero
    
    // Normalize mantissa to range [0.5, 1)
    let i;
    if (e < 0) {
      for (i = 0; i < -e; i++) m = m * 2;
    } else {
      for (i = 0; i < e; i++) m = m / 2;
    }
    
    let n = bit32(m, sgn);
    return [e + 128, n[0], n[1], n[2], n[3]]; // Bias exponent by 128
  };