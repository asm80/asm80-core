/**
 * Encode string to Base64 with UTF-8 support
 * Uses TextEncoder for proper Unicode character handling
 * @param {string} str - String to encode
 * @returns {string} Base64 encoded string
 */
export const btoax = (str) => {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  return btoa(String.fromCharCode(...bytes));
};

/**
 * Decode Base64 string with UTF-8 support
 * Uses TextDecoder for proper Unicode character handling
 * @param {string} str - Base64 string to decode
 * @returns {string} Decoded UTF-8 string
 */
export const atobx = (str) => {
  const binaryString = atob(str);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const decoder = new TextDecoder();
  return decoder.decode(bytes);
};