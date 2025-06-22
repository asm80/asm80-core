# ASM80 Core Assembler (asm.js)

This is the main module of the ASM80 assembler that orchestrates the complete compilation process from source code to machine code or relocatable object files.

## Overview

The assembler implements a **two-pass compilation model** with iterative resolution of forward references. It supports multiple CPU architectures, modular programming with linking, and various output formats.

## Exported Functions

### `compile(source, fileSystem, opts, filename)`

Main compilation function that processes assembly source code into machine code.

**Parameters:**
- `source` (string) - Assembly source code to compile
- `fileSystem` (object) - File system interface with `readFile()` method
- `opts` (object) - Compilation options:
  - `assembler` (string|object) - CPU assembler ("z80", "i8080", "c6502", "m6800") or CPU object
  - Additional options passed to compilation passes
- `filename` (string, optional) - Source filename, defaults to "noname"

**Returns:**
Promise resolving to compilation result object:
```javascript
{
  dump: [...],     // Array of compiled instructions
  vars: {...},     // Symbol table with labels and variables
  xref: {...},     // Cross-reference information
  opts: {...},     // Compilation options used
  obj: {...}       // Object file data (only for modules)
}
```

**Example:**
```javascript
import { compile } from './asm.js';

const result = await compile(
  'LD A,0x10\nLD B,A\nHLT',
  fileSystem,
  { assembler: 'z80' },
  'program.z80'
);
```

**Compilation Process:**
1. **Parse** source code into internal representation
2. **Pass 1** (repeated up to 5 times) - Symbol resolution and instruction sizing
3. **Pass 2** - Final address assignment and code generation
4. **Module handling** - Generate object file if MODULE pragma is present

### `compileFromFile(filePath, fileSystem, opts)`

Convenience function that reads source code from file and compiles it.

**Parameters:**
- `filePath` (string) - Path to assembly source file
- `fileSystem` (object) - File system interface
- `opts` (object) - Compilation options (same as `compile()`)

**Returns:**
Same as `compile()` function

**Example:**
```javascript
const result = await compileFromFile(
  './programs/test.z80',
  fileSystem,
  { assembler: 'z80' }
);
```

### `link(linkList, fileSystem, name)`

Links multiple object modules into a single executable.

**Parameters:**
- `linkList` (object) - Link specification:
  ```javascript
  {
    modules: ["module1", "module2"],  // Required modules
    library: ["lib1", "lib2"],       // Library modules
    // ... other link options
  }
  ```
- `fileSystem` (object) - File system interface
- `name` (string, optional) - Output name, defaults to "noname"

**Returns:**
Promise resolving to linked program object

**Features:**
- Validates CPU compatibility across modules
- Handles endianness consistency
- Resolves inter-module references
- Supports library linking

## Exported Objects

### `asm`

Combined export object containing all main functions and utilities:
```javascript
export const asm = {
  lst,              // Listing generator
  html,             // HTML listing generator  
  compile,          // Main compile function
  compileFromFile,  // File-based compile function
  link,             // Module linker
  cpus              // Array of supported CPUs
}
```

### `cpus`

Array of supported CPU objects:
```javascript
const cpus = [I8080, M6800, C6502, Z80];
```

Each CPU object contains:
- `cpu` - CPU identifier string
- `endian` - Endianness flag
- `parseOpcode()` - Instruction parsing function
- Instruction set definitions

## Imported Submodules

### Core Processing Modules

- **`parser.js`** - Source code parsing and preprocessing
  - Converts text to structured instruction objects
  - Handles includes, macros, and conditional assembly
  
- **`pass1.js`** - First compilation pass
  - Symbol table construction
  - Expression evaluation
  - Instruction sizing
  - Segment management
  
- **`pass2.js`** - Second compilation pass
  - Final address resolution
  - Machine code generation
  - Cross-reference tracking

- **`objcode.js`** - Object file generation and linking
  - `objCode()` - Generates relocatable object files
  - `linkModules()` - Links multiple modules

### Output Generation

- **`listing.js`** - Program listing generation
  - `lst()` - Text-based assembly listing
  - `html()` - HTML-formatted listing with syntax highlighting

### CPU Support Modules

- **`cpu/i8080.js`** - Intel 8080/8085 support
- **`cpu/m6800.js`** - Motorola 6800 support  
- **`cpu/c6502.js`** - MOS 6502/65C02 support
- **`cpu/z80.js`** - Zilog Z80 support

## Compilation Options

The `opts` parameter supports various compilation settings:

```javascript
const opts = {
  assembler: "z80",           // CPU selection
  ENT: 0x8000,               // Entry point address
  BINFROM: 0x8000,           // Binary output start
  BINTO: 0x9000,             // Binary output end
  ENGINE: "someengine",       // Target engine
  PRAGMAS: [],               // Assembler directives
  includedFiles: {},         // Track included files
  xfre: {},                  // External references
  xref: {},                  // Cross references
  // ... additional CPU-specific options
};
```

## Error Handling

The assembler provides structured error reporting:

```javascript
try {
  const result = await compile(source, fileSystem, opts);
} catch (error) {
  // Error object structure:
  // {
  //   error: {
  //     msg: "Error description",
  //     s: "Error source/category",
  //     wline: { ... }  // Working line context
  //   }
  // }
  console.error(error.error.msg);
}
```

**Common Error Categories:**
- "Assembler error" - CPU selection or configuration issues
- "Parser error" - Syntax or parsing problems
- "Expression error" - Symbol resolution failures
- "Linker error" - Module compatibility or linking issues

## Usage Patterns

### Basic Assembly
```javascript
import { compile } from './asm.js';

const source = `
  ORG 0x8000
  LD A,10
  LD B,A
  ADD A,B
  HALT
`;

const result = await compile(source, fileSystem, { assembler: 'z80' });
```

### Modular Programming
```javascript
// Compile module
const moduleResult = await compile(
  '.PRAGMA MODULE\nPUBLIC start\nstart: LD A,1\nRET',
  fileSystem,
  { assembler: 'z80' },
  'mymodule'
);

// Link modules
const linked = await link({
  modules: ['mymodule', 'main'],
  library: ['stdlib']
}, fileSystem);
```

### Multi-CPU Support
```javascript
// Auto-detect CPU or specify explicitly
const z80Result = await compile(source, fs, { assembler: 'z80' });
const i8080Result = await compile(source, fs, { assembler: 'i8080' });
const m6800Result = await compile(source, fs, { assembler: 'm6800' });
```

## Performance Notes

- **Pass 1 Iteration**: Runs up to 5 times to resolve forward references
- **Asynchronous**: All operations return Promises for non-blocking execution
- **Memory Efficient**: Streaming approach for large source files
- **Caching**: Symbol table and expression results cached between passes