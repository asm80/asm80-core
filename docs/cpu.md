# CPU Directory

This directory contains CPU-specific modules for the ASM80 assembler. Each module implements instruction encoding for a specific microprocessor family.

## Supported CPUs

### z80.js
**Zilog Z80 Processor**
- **CPU ID**: "z80"
- **File Extension**: ".z80"
- **Endianness**: Little endian
- **Features**: Full Z80 instruction set including undocumented instructions, indexed addressing with IX/IY, block operations, interrupt modes

### i8080.js  
**Intel 8080/8085 Processor**
- **CPU ID**: "i8080"
- **File Extension**: ".a80"
- **Endianness**: Little endian
- **Features**: 8080 instruction set with 8085 extensions, undocumented 8085 instructions (JNK, JK, DSUB, etc.)

### c6502.js
**MOS 6502/65C02 Processor**
- **CPU ID**: "c6502" 
- **File Extension**: ".a65"
- **Endianness**: Little endian
- **Features**: 6502 instruction set, 65C02 extensions, illegal opcodes, comprehensive addressing modes

### m6800.js
**Motorola 6800 Processor**
- **CPU ID**: "m6800"
- **File Extension**: ".a68"  
- **Endianness**: Big endian
- **Features**: 6800 instruction set, dual accumulator architecture

### i8008.js
**Intel 8008 Processor**
- **CPU ID**: "i8008"
- **File Extension**: ".a08"
- **Endianness**: Little endian
- **Features**: Original Intel 8008 instruction set

### cdp1802.js
**RCA CDP1802 Processor**
- **CPU ID**: "cdp1802"
- **File Extension**: ".a18"
- **Endianness**: Big endian
- **Features**: CDP1802 COSMAC instruction set

### m6809.js
**Motorola 6809 Processor**
- **CPU ID**: "m6809"
- **File Extension**: ".a09"
- **Endianness**: Big endian
- **Features**: Full 6809 instruction set, rich indexed addressing modes (5-bit/8-bit/16-bit offsets, accumulator offsets, auto-increment/decrement, indirect), position-independent code support via PC-relative addressing, PSHS/PULS/PSHU/PULU register stacks, EXG/TFR inter-register operations, long branches (LBRA/LBEQ/…)

### h6309.js
**Hitachi HD6309 Processor**
- **CPU ID**: "h6309"
- **File Extension**: ".h09"
- **Endianness**: Big endian
- **Features**: Fully backward-compatible superset of M6809. Adds registers E, F (8-bit), W=E:F (16-bit), Q=D:W (32-bit), V (16-bit). New instructions include:
  - Register-to-register arithmetic: ADDR, ADCR, SUBR, SBCR, ANDR, ORR, EORR, CMPR
  - Block transfer: TFM (4 modes: X+/Y+, X−/Y−, X+/Y, X/Y+)
  - Immediate+memory: AIM, EIM, OIM, TIM (direct and indexed addressing)
  - Bit manipulation: BAND, BIAND, BOR, BIOR, BEOR, BIEOR, LDBT, STBT
  - W/Q load-store: LDW, STW, LDQ, STQ (LDQ immediate uses 32-bit operand)
  - E/F accumulator ops: LDE, STE, LDF, STF, ADDE, ADDF, SUBE, SUBF, CMPE, CMPF
  - W arithmetic: ADDW, SUBW, CMPW, SBCD, ANDD, BITD, EORD, ADCD, ORD
  - Extended unary ops on D/W/E/F registers (NEGD, COMD, CLRD, CLRW, CLRE, CLRF, …)
  - Divide/multiply: DIVD, DIVQ, MULD
  - Mode register: LDMD, BITMD
  - Extended indexed addressing: W as base register (`,W`, `W++`, `--W`, `n,W`); E, F, W as accumulator offsets

### z180.js
**Zilog Z180 / Hitachi HD64180 Processor**
- **CPU ID**: "z180"
- **File Extension**: ".z180"
- **Endianness**: Little endian
- **Features**: Strict superset of Z80 — all Z80 instructions are valid. Adds 10 new mnemonics (34 ED-prefixed opcodes):
  - `TST r` / `TST (HL)` / `TST n` — AND A with operand, set flags, no store
  - `TSTIO n` — AND (C) with n, set flags
  - `MLT rr` — 8×8 unsigned multiply (BC, DE, HL, SP)
  - `SLP` — sleep until next interrupt (low-power halt)
  - `IN0 r,(n)` / `OUT0 (n),r` — I/O with absolute 8-bit port address
  - `OTIM` / `OTDM` / `OTIMR` / `OTDMR` — block output with increment/decrement
- **Implementation**: Wrapper over `z80.js` — Z80 instructions delegate to `Z80.parseOpcode`; Z180 extensions are handled as special cases before delegation.

### c65816.js
**WDC 65816 Processor**
- **CPU ID**: "c65816"
- **File Extension**: ".a65"
- **Endianness**: Little endian
- **Features**: 65816 16-bit extension of 6502, native/emulation modes, 24-bit address space, extended addressing modes

### dummy.js
**Test Processor**
- **CPU ID**: "dummy"
- **Purpose**: Non-existent processor used for testing the assembler framework
- **Features**: Implements basic test instructions (NOP, P1, P2, PA2, PB2, PX2, PY2) with various addressing patterns

## CPU Module Interface

Every CPU module must implement the following interface:

### Required Properties

```javascript
export const CPUName = {
  endian: boolean,      // false = little endian, true = big endian
  cpu: string,          // CPU identifier (e.g., "z80", "i8080")
  ext: string,          // File extension (e.g., "z80", "a80")
  
  // Required method
  parseOpcode: function(s, vars, Parser) { ... }
  
  // Optional instruction definitions (format varies by CPU)
  set: { ... },         // Main instruction definitions
  set2: { ... },        // Extended definitions (Z80 only)
  // ... other CPU-specific properties
};
```

### parseOpcode Function

The `parseOpcode(s, vars, Parser)` function is the core method that converts parsed assembly instructions into machine code.

**Parameters:**
- `s` - Instruction object containing:
  - `s.opcode` - Instruction mnemonic (string)
  - `s.params` - Array of parameters
  - `s.numline` - Source line number
  - Other properties from parser
- `vars` - Object containing variables/labels for evaluation
- `Parser` - Parser object with `evaluate()` function for expression evaluation

**Return Value:**
- `null` - If instruction is not recognized
- Modified `s` object with:
  - `s.bytes` - Number of bytes the instruction occupies
  - `s.lens` - Array of bytes/functions for code generation
  - `s.wia` - Word in address position for relocation (optional)

**Example Implementation:**
```javascript
parseOpcode: function(s, vars, Parser) {
  if (!s.opcode) return null;
  
  // Simple NOP instruction
  if (s.opcode === "NOP") {
    s.bytes = 1;
    s.lens = [0x00];
    return s;
  }
  
  // Instruction with immediate operand
  if (s.opcode === "LDA" && s.params && s.params.length === 1) {
    s.bytes = 2;
    s.lens = [
      0x3A,  // Opcode
      function(vars) { return Parser.evaluate(s.params[0], vars) & 0xFF; }
    ];
    s.wia = 1;  // Address starts at byte 1
    return s;
  }
  
  return null; // Instruction not recognized
}
```

### Code Generation Array (lens)

The `lens` array contains the machine code bytes for the instruction:

```javascript
s.lens = [
  0x3A,                             // Fixed opcode byte
  function(vars) { return value; }, // Function to evaluate parameter
  null,                            // Null indicates high byte of 16-bit value
  "addr16",                        // Special address markers
  ...
];
```

**Types of lens elements:**
- **Number**: Fixed byte value (0-255)
- **Function**: `function(vars) { return value; }` - Evaluated during pass 2
- **null**: Placeholder for high byte of 16-bit values
- **String**: Special markers like "addr16", "addr24", "addr32"

## Instruction Set Definition Patterns

Different CPUs use different approaches for defining instruction sets:

### Array-based (Z80, M6800)
```javascript
set: {
  INSTRUCTION: [type0, type1, type2, ...] // Values for different addressing modes
}
```

### Object-based (8080)
```javascript
set: {
  'INSTRUCTION': {o: opcode, t: "type"} // Opcode and addressing type
}
```

### Matrix-based (6502)
```javascript
set: {
  INSTRUCTION: [imp, ima, imm, abs, abx, aby, zpg, zpx, zpy, ind, izx, izy, rel, izp]
  // Each position represents a specific addressing mode
}
```

## Adding a New CPU

To add a new CPU to the system:

1. **Create CPU module** in `cpu/newcpu.js`
2. **Implement required interface** with `endian`, `cpu`, `ext` properties
3. **Implement parseOpcode function** following the interface specification
4. **Define instruction set** using appropriate pattern for your CPU
5. **Export CPU object** as named export
6. **Add to main module** in `asm.js` imports and CPU array

### Minimal CPU Template

```javascript
export const NewCPU = {
  endian: false,        // or true for big-endian
  cpu: "newcpu",        // Unique identifier
  ext: "ncpu",          // File extension
  
  parseOpcode: function(s, vars, Parser) {
    if (!s.opcode) return null;
    
    // Implement instruction parsing logic here
    // Return null for unrecognized instructions
    // Return modified s object for valid instructions
    
    return null;
  }
};
```

## Error Handling

- Return `null` from parseOpcode for unrecognized instructions
- Use `Parser.evaluate()` to handle expressions and forward references
- Set appropriate `s.bytes` to indicate instruction length
- Handle addressing mode variants in CPU-specific ways

## Testing

The dummy.js processor provides examples of:
- Basic instruction parsing
- Parameter evaluation with functions
- Multi-byte instructions
- Address relocation markers
- Both little-endian (DUMMY) and big-endian (DUMMYE) variants