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