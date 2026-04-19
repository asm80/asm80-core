# Relocatable Modules and Linking

ASM80 supports a **modular programming model** where individual source files are assembled independently into relocatable object files, which are then combined by a linker into a final binary. This is analogous to separate compilation in C (`.c` → `.o` → executable).

## Overview

```
source1.a80  ──►  assembler  ──►  source1.obj  ─┐
source2.a80  ──►  assembler  ──►  source2.obj  ──┼──►  linker  ──►  final binary
source3.a80  ──►  assembler  ──►  source3.obj  ─┘        ▲
                                                     recipe.lnk
```

A module does **not** use fixed addresses. Instead, symbols and addresses are resolved by the linker, which places modules into memory according to a link recipe.

---

## Writing a Module

To mark a source file as a relocatable module, add `.pragma module` as the first directive:

```asm
.pragma module
```

This enables module mode with the following rules:

- `.ORG` is **forbidden** — addresses are assigned by the linker, not the programmer
- `.extern` and `.export` become available
- The assembler outputs an `.obj` file instead of a flat binary

### Declaring External Symbols

Use `.extern` to declare a symbol that is defined in another module:

```asm
.extern print       ; standard form
keyin: .extern      ; alternative form — label on the same line
.extern last_key@zpseg ; segment-hinted external symbol
```

Both forms are equivalent. The assembler records these as unresolved references; the linker fills in the actual addresses.
With segment hints, `.extern name@segment` (or `segment:name`) also stores symbol segment metadata for addressing decisions.

### Exporting Symbols

Use `.export` to make a symbol visible to other modules:

```asm
.export main
.export my_function
```

Only exported symbols can be referenced via `.extern` in other modules.

### Source Line Debug Directives (`.file` / `.loc`)

ASM80 supports lightweight C-source-to-ASM line mapping for debugger integrations.

#### `.file`

Registers a source file ID inside the current module:

```asm
.file 1 "main.c"
.file 2 "helpers.h"
```

#### `.loc`

Declares source location for subsequent emitted code:

```asm
.loc 1 9 ; i = 1;
```

Semantics:

- `.loc` sets a pending source location
- pending location is applied to the **first following byte-emitting line** only
- non-emitting directives between `.loc` and emitted code do not consume it
- after first emitted line, pending location is cleared
- invalid `.file` / `.loc` directives are silently ignored (no assembler error)

This produces compact **line-start** metadata (not per-instruction metadata for every instruction).

### Segments

Modules can place data and code into named segments. Built-in aliases:

| Segment | Directive | Typical use |
|---------|-----------|-------------|
| `CSEG`  | *(default)* | Code |
| `DSEG`  | `.dseg` | Initialized data |
| `ESEG`  | `.eseg` | Extra segment (e.g. ROM data) |
| `BSSEG` | `.bsseg` | Uninitialized data (BSS) |
| `ZPSEG` | `.zpseg` | Zero-page / direct-page style segment |
| `HEAPSEG` | `.heapseg` | Heap-oriented data region (regular relocatable segment) |

You can also switch to any custom segment name with:

```asm
.segment ZPSEG
```

Switch between segments freely within a source file:

```asm
.pragma module

main: lxi h, hello
      call print
      hlt

.export main

.dseg
hello: .cstr "Hello, World!\n"
```

Notes:

- Segment names are case-insensitive and normalized internally to uppercase.
- `.SEGMENT` requires a segment name.
- `BSSEG` keeps its special behavior: it reserves space but does not emit load bytes.

---

## Complete Example

### `relocable.a80` — main module

```asm
.pragma module

.extern print
keyin: .extern

main: lxi h, hello
      call print
      call keyin
      hlt

.export main

.dseg
hello: .cstr "Hello, World!\n"
```

### `relocable1.a80` — library module (keyin)

```asm
.pragma module

keyin: in 0x7a
       sta buffer_key
       cpi 0xff
       jz keyin
       sta last_key
       ret

.export keyin

.BSSEG
last_key   ds 1
past_key   ds 8
buffer_key ds 1
```

### `relocable2.a80` — library module (print)

```asm
.pragma module

print: mov a, M
       ora a
       jz done
       call print_char
       inx H
       jmp print
done:  ret

.extern bios_print

print_char:
       sta prev_char
       call bios_print
       ret

.export print
.export print_char

.dseg
dummy: .cstr "Any data here"
.export dummy

.BSSEG
prev_char ds 1
```

---

## Link Recipe (`.lnk` file)

The link recipe is a JSON file that tells the linker how to combine object files into a final binary.

```json
{
    "segments": {
        "CSEG": "0",
        "DSEG": "0x100"
    },
    "vars": {
        "BIOS_PRINT": "0x5"
    },
    "modules": ["relocable"],
    "library": ["relocable1", "relocable2"],
    "entrypoint": "main"
}
```

### Fields

#### `segments`

Specifies the base address of each segment. Values are strings and support hexadecimal notation (`"0x100"`).
Any segment name can be used (`CSEG`, `DSEG`, `HEAPSEG`, `FOO`, ...).

```json
"segments": {
    "CSEG": "0",
    "DSEG": "0x100",
    "ESEG": "0x200",
    "BSSEG": "0x300",
    "HEAPSEG": "0x400",
    "FOO": "0x500"
}
```

Segments not listed are placed **automatically** immediately after the previous segment ends.
Placement order is deterministic: known aliases (`CSEG`, `ZPSEG`, `DSEG`, `ESEG`, `BSSEG`, `HEAPSEG`) first, then remaining custom segments in lexicographic order.

#### `vars`

Pre-defined symbol values. Useful for BIOS entry points, hardware addresses, or other constants that exist outside the assembled code:

```json
"vars": {
    "BIOS_PRINT": "0x5",
    "BIOS_EXIT":  "0x0"
}
```

The linker treats these as if they were exported by some module — any `.extern` reference to these names is resolved to the given address.

#### `modules`

An ordered list of object modules that are **always** included in the output:

```json
"modules": ["main", "utils"]
```

Modules are placed in the order listed. At least one module should export the `entrypoint` symbol.

#### `library`

A list of object modules that are included **on demand** — only if they export a symbol required by another module. This enables automatic dependency resolution:

```json
"library": ["libc", "libmath", "libio"]
```

Library modules can depend on each other; the linker resolves dependencies transitively.

#### `entrypoint`

The name of the program entry point symbol. Defaults to `_MAIN` if not specified:

```json
"entrypoint": "main"
```

The resolved address of this symbol is returned in the linker output as `entry: { addr, seg }`.

---

## Linker API

### `objCode(dump, vars, opts, filename)`

Produces a relocatable object from an assembled module.

Called automatically by `compile()` when `MODULE` pragma is active. The result is available as `result.obj`.

**Returns:**
```js
{
    code:    [...],          // instructions with relocation metadata
exports: { NAME: ... },  // exported symbols with segment info
externs: [...],          // required external symbol names
externSegs: { [name]: segmentName }, // optional segment hints for extern symbols
    cpu:     "8080",         // target CPU
    endian:  false,
    name:    "filename",
    seglen:  { [segmentName]: number },    // byte lengths of each used segment
    debug: {                                // optional
      files: [{ id, path }]                 // source file table from .file
    }
}
```

`code[]` items may also include optional debug markers:

```js
{
  lens: [...],
  segment: "CSEG",
  dbg: [                                   // optional line-start markers
    { off: 0, fileId: 1, line: 9, comment: "i = 1;" }
  ]
}
```

`off` is byte offset inside `lens` (important when multiple instructions are merged into one `code` item).

### `linkModules(data, modules, library)`

Links object modules according to a recipe.

**Parameters:**
- `data` — link recipe object (parsed from `.lnk` JSON); set `data.endian` to the assembler's endian value before calling
- `modules` — array of object module data (output of `objCode`)
- `library` — array of library module data

**Returns:**
```js
{
    CSEG, DSEG, ESEG, BSSEG,   // legacy convenience fields (0 if missing)
    segments,                   // { [segmentName]: baseAddress }
    seglen,                     // { [segmentName]: totalLength }
    entry: { addr, seg },       // resolved entrypoint
    dump: [                     // final code, sorted by address
        { lens, addr, segment }, ...
    ],
    debug: {
      files: [{ id, path }],    // deduplicated linked file table
      lineStarts: [             // absolute line-start addresses
        { addr, fileId, line, comment? }, ...
      ]
    }
}
```

**Example:**
```js
import { linkModules } from './objcode.js';
import { I8080 } from './cpu/i8080.js';

const recipe = JSON.parse(fs.readFileSync('project.lnk', 'utf-8'));
recipe.endian = I8080.endian;

const modules = recipe.modules.map(name =>
    JSON.parse(fs.readFileSync(`${name}.obj`, 'utf-8'))
);
const library = recipe.library.map(name =>
    JSON.parse(fs.readFileSync(`${name}.obj`, 'utf-8'))
);

const result = linkModules(recipe, modules, library);
console.log('Entry point:', result.entry);
```

---

## Linker Behaviour

The linker performs the following steps:

1. **Symbol collection** — Walk all `modules`, collect exported symbols into a resolution table. Record unresolved `.extern` references.
2. **Library pull-in** — For each unresolved external, search `library` for a module that exports it. Pull in matching modules and repeat until no more unresolved externals remain (or all library modules are exhausted).
3. **Segment sizing** — Sum `seglen` from all included modules to get total segment sizes. Compute absolute base addresses from `segments` in the recipe.
4. **Address assignment** — Walk each module's code and assign an absolute `addr` to each instruction, advancing per-segment pointers.
5. **Relocation patching**:
   - `.rel` entries — internal references within the module; patched using the module's segment base
   - `.ext` entries — external references; patched using the resolved symbol address
6. **Output** — Sort all instructions by `addr` and return the combined `dump`.

---

## Output Formats

The linker output (`dump`) can be passed to the standard output utilities. When doing so, prepend the required pragmas to the dump array:

```js
// Enable segment-aware output and set HEX record length
result.dump.unshift({ opcode: '.PRAGMA', params: ['SEGMENT'] });
result.dump.unshift({ opcode: '.PRAGMA', params: ['HEXLEN', '32'] });

// Generate Intel HEX for code segment
const hex = ihex(result);

// Generate Intel HEX for data segment only
const dseg = ihex(result, 'DSEG');

// Generate Motorola SREC
const srec = isrec(result);
```

Available output functions: `ihex` (Intel HEX), `isrec` / `isrec28` (Motorola S-Record).

### LMAP Sidecar Export

Intel HEX/SREC outputs do not carry source line metadata. Export line mapping as a sidecar:

```js
import { asm } from './asm.js';

const linked = linkModules(recipe, modules, library);
const lmapText = asm.lmap(linked);
```

LMAP text format:

```text
# files
file_id,path
1,main.c

# lines
addr,file_id,line,comment
0x4010,1,9,i = 1;
```

---

## Constraints and Notes

- `.ORG` cannot be used in module mode — the linker controls all address assignment.
- A symbol must be explicitly `.export`-ed to be usable as `.extern` in another module.
- Symbols in `vars` (link recipe) act as external symbols available to all modules; they do not need to appear in any `.obj` file.
- Module names in the recipe are bare names (without `.obj` extension); the host application is responsible for loading the actual files.
- `endian` is not stored in the `.lnk` file; it must be set on the recipe object at runtime, matching the target CPU.
