# Utils Directory

This directory contains utility modules for the ASM80 assembler core. These modules provide various helper functions for data processing, output formatting, and encoding operations.

## Files Overview

### base64escaped.js
Provides UTF-8 safe Base64 encoding/decoding functions.

**Exported Functions:**
- `btoax(str)` - Encodes a string to Base64 with UTF-8 support
  - **Parameters:** `str` - String to encode
  - **Returns:** Base64 encoded string
  - **Usage:** Used for encoding strings that may contain non-ASCII characters
  
- `atobx(str)` - Decodes a Base64 string with UTF-8 support
  - **Parameters:** `str` - Base64 string to decode
  - **Returns:** Decoded UTF-8 string
  - **Usage:** Used for decoding Base64 strings back to original UTF-8 text

### fp.js
Floating-point number conversion utilities for ZX Spectrum format.

**Exported Functions:**
- `fptozx(num, simpleint)` - Converts a number to ZX Spectrum floating-point format
  - **Parameters:** 
    - `num` - Number to convert
    - `simpleint` - Optional boolean, defaults to true. If true, integers are stored as simple integers
  - **Returns:** Array of 5 bytes representing the number in ZX format
  - **Usage:** Used for converting floating-point numbers to ZX Spectrum's internal format
  - **Notes:** Supports both integer and floating-point number conversion with overflow protection

### ihex.js
Intel HEX format output generation.

**Exported Functions:**
- `ihex(result, segment)` - Generates Intel HEX format output from compilation results
  - **Parameters:**
    - `result` - Compilation result object containing dump data
    - `segment` - Optional segment name to filter output (e.g., "CSEG", "DSEG")
  - **Returns:** String containing Intel HEX formatted data
  - **Usage:** Used to generate Intel HEX files for programming microcontrollers/EPROMs
  - **Features:**
    - Supports variable line lengths via `.PRAGMA HEXLEN` directive
    - Supports segment filtering via `.PRAGMA SEGMENT` directive
    - Handles memory gaps and phase adjustments
    - Adds proper EOF record

### srec.js
Motorola S-Record format output generation.

**Exported Functions:**
- `isrec(result, segment)` - Generates Motorola S-Record format (S1/S9) for 16-bit addresses
  - **Parameters:**
    - `result` - Compilation result object containing dump data
    - `segment` - Optional segment name to filter output
  - **Returns:** String containing S-Record formatted data
  - **Usage:** Used for 16-bit address space targets
  - **Features:** Includes entry point record (S9) with proper checksum

- `isrec28(result, segment)` - Generates Motorola S-Record format (S2/S8) for 24-bit addresses
  - **Parameters:**
    - `result` - Compilation result object containing dump data  
    - `segment` - Optional segment name to filter output
  - **Returns:** String containing S-Record formatted data with 24-bit addressing
  - **Usage:** Used for larger address space targets requiring 24-bit addressing
  - **Features:** Includes entry point record (S8) with 24-bit address support

### utils.js
General utility functions for data processing and formatting.

**Exported Functions:**
- `norm(xs)` - Normalizes line structures by cleaning up whitespace and HTML entities
  - **Parameters:** `xs` - Array of line objects
  - **Returns:** Array of normalized line objects
  - **Usage:** Used in preprocessing to clean up source code lines

- `nonempty(xs)` - Filters out empty lines from line array
  - **Parameters:** `xs` - Array of line objects
  - **Returns:** Array with empty lines removed
  - **Usage:** Used to remove blank lines during preprocessing

- `toInternal(xs)` - Converts string array to internal line structure
  - **Parameters:** `xs` - Array of strings
  - **Returns:** Array of line objects with metadata (line number, address, bytes)
  - **Usage:** Used to convert raw source lines to internal representation

- `toHex2(n)` - Converts number to 2-digit hexadecimal string
  - **Parameters:** `n` - Number to convert (0-255)
  - **Returns:** 2-character uppercase hex string
  - **Usage:** Used for byte formatting in output files

- `toHex4(n)` - Converts number to 4-digit hexadecimal string
  - **Parameters:** `n` - Number to convert (0-65535)
  - **Returns:** 4-character uppercase hex string
  - **Usage:** Used for 16-bit address formatting

- `toHex6(n)` - Converts number to 6-digit hexadecimal string
  - **Parameters:** `n` - Number to convert (0-16777215)
  - **Returns:** 6-character uppercase hex string
  - **Usage:** Used for 24-bit address formatting in S-Records

- `toHex8(n)` - Converts number to 8-digit hexadecimal string
  - **Parameters:** `n` - Number to convert
  - **Returns:** 8-character uppercase hex string
  - **Usage:** Used for 32-bit value formatting

## Usage Examples

```javascript
// Import specific functions
import { ihex } from './utils/ihex.js';
import { toHex2, toHex4 } from './utils/utils.js';
import { fptozx } from './utils/fp.js';

// Generate Intel HEX output
const hexOutput = ihex(compilationResult, 'CSEG');

// Format numbers as hex
const byteHex = toHex2(255);     // "FF"
const addrHex = toHex4(49152);   // "C000"

// Convert floating point for ZX Spectrum
const zxFloat = fptozx(3.14159); // [129, 73, 15, 218, 162]
```

## Notes

- All output format functions support segment filtering for multi-segment programs
- Hex formatting functions always return uppercase strings
- The floating-point converter includes overflow protection and handles both integers and floats
- Line processing utilities are designed to work with the assembler's internal line structure