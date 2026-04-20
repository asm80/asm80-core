# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Language Requirements
**IMPORTANT**: All documentation, error messages, function names, literals, and code comments in this project must be in English. This overrides any global language preferences.

## Common Commands

### Testing
```bash
npm test                    # Run tests with code coverage
```

Tests are in `test/` directory using QUnit framework. Coverage reports are generated to `coverage/` folder.

### Development and debugging
```bash
node                       # REPL for testing ES6 modules
```

## Project Architecture

### Overview
ASM80-core is a **two-pass multi-CPU assembler** written as ES6 module. Supports Z80, 8080, 8008, 6502, 65816, 6800, 6809, HD6309, CDP1802 processors with relocatable object code and module linking.

### Main compilation flow
`Parser` → `Pass1` (repeated) → `Pass2` → `Object Code Generation`

1. **Parser** (`parser.js`): Text → structured objects
2. **Pass1** (`pass1.js`): Symbol evaluation, instruction sizes, segment management
3. **Pass2** (`pass2.js`): Final code generation, cross-references  
4. **Object Code** (`objcode.js`): Relocatable files and linking

### Key files
- `asm.js` - main entry point with `compile()` function
- `cpu/*.js` - CPU-specific instruction encoders (Z80, 8080, 8008, 6502, 65816, 6800, 6809, HD6309, CDP1802)
- `expression-parser.js` - arithmetic expression evaluation
- `utils/*.js` - output formats (Intel HEX, Motorola S-Record)
- `.frame` / `.frame_indirect` — MODULE-only directives; `pass1.js` collects frame metadata into `opts.frames`; `objcode.js` attaches it to export records

### Data structures

Instruction object:
```javascript
{
  opcode: "LD",           // mnemonic  
  params: ["A", "B"],     // parameters
  label: "LOOP",          // label
  addr: 0x1000,           // address
  bytes: 1,               // size
  lens: [0x78],           // machine code
  segment: "CSEG"         // segment
}
```

Variables object contains symbols → addresses, special variables (`_PC`, `__PRAGMAS`).

### Architecture patterns
- **Stateful compilation**: Pass1 repeats for forward references
- **CPU abstraction**: Each CPU has `parseOpcode()` function
- **Segment management**: CSEG/DSEG/ESEG/BSSEG support
- **Modular support**: Import/export functionality for linking

### Error handling
Errors are objects with `msg` and `s` properties. Async functions use try/catch pattern.

**Normal mode:** first error stops compilation, throws `{ error: { msg, s, wline } }`.

**Relaxed mode** (`opts.relaxed = true`): all errors are collected and thrown as `{ errors: [ { msg, s, wline } ] }` after the full pipeline completes. Intended for IDE integrations. Errors from included files carry `wline.includedFile` and `wline.includedFileAtLine`. Pass1 runs 4 times — only errors from the final iteration are kept (earlier iterations may contain phantom errors from unresolved forward references). Preprocessor errors are preserved separately before pass1 resets and merged into the final array.

### Extensibility
- New CPU: add module to `cpu/` with required interface
- Output formats: extend `utils/` modules
- Directives: modify parser and pass processing

## Development Notes
- Project is in alpha stage with evolving API
- Code is migrating from 2010s legacy to modern ES6
- Uses QUnit for testing, c8 for coverage
- NPM package: `@asm80/core`

## Feature Completion Checklist

After the user approves a completed feature, always perform these steps in order:

1. **Update documentation** — update `CLAUDE.md` (supported CPUs list, architecture notes) and any relevant `docs/` files
2. **Implementation report** — write a brief summary of what was implemented, key design decisions, and any gotchas discovered
3. **Commit** — stage all relevant files (source, tests, docs, coverage) and create a descriptive commit message following the `feat: ...` convention
4. **Version bump** — run `npm version patch`
5. **Tag** — `npm version patch` creates the git tag automatically

Do not skip or reorder these steps. Ask for user approval before pushing to remote.