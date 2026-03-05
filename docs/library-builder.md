# Library Builder

> Builds versioned `.libXX` archive files from relocatable `.objXX` modules.
> Part of the ASM80 relocatable-modules workflow; see also `relocable-modules.md`.

---

## Overview

A **library** is a collection of relocatable object modules bundled into a
single versioned file. The linker pulls in only the modules needed to satisfy
unresolved external symbol references (selective linking). This lets you
distribute pre-compiled code without shipping source files.

Workflow:

```
source.a80 ──compile──► source.obj80 ─┐
                                       ├─ buildLibrary ──► mylib-1.0.0.lib80
other.a80  ──compile──► other.obj80  ─┘

mylib-1.0.0.lib80 ──referenced in .lnk──► linker pulls in needed modules
```

---

## Library recipe file (`.lbr`)

A YAML text file that describes which modules to bundle and the library's
version metadata. The IDE opens `.lbr` files as plain YAML (Monaco editor).

### Schema

```yaml
# Required fields
name:    mylib          # Base name — must match [a-z0-9_-]+
version: 1.0.0          # Strict semver: MAJOR.MINOR.PATCH

# Optional metadata
description: "Math routines for Z80"
author: "Your Name"

# Required: list of modules to include
# Each entry is a basename or a relative path from the .lbr directory.
# The builder searches for the corresponding .objXX file automatically.
modules:
  - math               # → looks for math.obj80 (or .objz80 etc.) in .lbr dir
  - utils/string       # → relative path
  - io/serial.obj80    # → explicit extension (exact path)
```

### Field rules

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | string | yes | `[a-z0-9_-]+` — no spaces, no version suffix |
| `version` | string | yes | `N.N.N` integers, no pre-release labels |
| `description` | string | no | — |
| `author` | string | no | — |
| `modules` | string[] | yes | At least one entry |

---

## Output file format (`.libXX`)

JSON file. The extension mirrors the CPU: `.lib80` for 8080, `.libz80` for Z80, etc.

```json
{
  "_libVersion":     "1.0.0",
  "_libName":        "mylib",
  "_libCpuId":       "i8080",
  "_libDescription": "Math routines",
  "_libAuthor":      "Your Name",
  "modules": [
    { "name": "math",   "obj": { /* full relocatable obj */ } },
    { "name": "string", "obj": { /* full relocatable obj */ } }
  ],
  "symbolIndex": {
    "SIN":    "math",
    "COS":    "math",
    "STRLEN": "string"
  }
}
```

`symbolIndex` maps every exported symbol to the module name that owns it.
It is built at library-build time so the linker does not need to re-scan
module exports during linking.

### Filename convention

```
<name>-<version>.<libExt>
```

Examples: `mylib-1.0.0.lib80`, `graphics-2.3.1.libz80`

---

## CPU extension mapping

| CPU | Obj extension | Lib extension |
|-----|--------------|--------------|
| Intel 8080 / i8085 | `.obj80`  | `.lib80`  |
| Zilog Z80           | `.objz80` | `.libz80` |
| MOS 6502            | `.obj65`  | `.lib65`  |
| WDC 65816           | `.obj816` | `.lib816` |
| Motorola 6800       | `.obj68`  | `.lib68`  |
| Motorola 6809       | `.obj09`  | `.lib09`  |
| Intel 8008          | `.obj08`  | `.lib08`  |
| RCA CDP 1802        | `.obj18`  | `.lib18`  |

All modules in a library must target the same CPU. Mixing CPUs causes a
build error.

---

## API

### `buildLibrary(recipe, files, dir)`

Builds a library from a pre-parsed recipe object.

**Note:** This function does not parse YAML. The caller (IDE worker or CLI)
is responsible for parsing the `.lbr` file with a YAML library before calling
`buildLibrary`.

```js
import { buildLibrary } from "@asm80/core/libcode.js";
// or via the main export:
import { asm } from "@asm80/core/asm.js";
asm.buildLibrary(recipe, files, dir);
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `recipe` | `object` | Pre-parsed `.lbr` content |
| `files` | `Record<string,string>` | FS snapshot — same format as in `assembler-worker.js` |
| `dir` | `string` | Absolute-style path to the directory containing the `.lbr` file |

#### Return value

```js
{
  libPath:    string,  // e.g. "/project/mylib-1.0.0.lib80"
  libContent: string,  // JSON string — write this to the filesystem
}
```

#### Errors

All errors are thrown as `{ message: string }`.

| Condition | Message |
|-----------|---------|
| `name` missing or invalid | `Library recipe missing/invalid field: name` |
| `version` not `N.N.N` | `Invalid semver '<v>' in library recipe` |
| `modules` empty or missing | `Library recipe must contain at least one entry in 'modules'` |
| Module `.objXX` not in FS | `Library module '<entry>' not found in <dir>` |
| Module `.objXX` malformed JSON | `Library module '<entry>' has malformed obj file at <path>` |
| CPU mismatch between modules | `CPU mismatch: module '<name>' is <cpu>, expected <cpu>` |
| Duplicate exported symbol | `Symbol '<sym>' exported by both '<mod1>' and '<mod2>'` |

---

### `resolveLibrary(name, cpuExt, files, dir)`

Resolves a library name (with optional semver range) to a concrete file path
in a `files` snapshot.

```js
import { resolveLibrary } from "@asm80/core/semver-resolve.js";
// or via the main export:
import { asm } from "@asm80/core/asm.js";
asm.resolveLibrary(name, cpuExt, files, dir);
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | `string` | Library name with optional version range (see below) |
| `cpuExt` | `string` | Expected lib extension, e.g. `"lib80"` |
| `files` | `Record<string,string>` | FS snapshot |
| `dir` | `string` | Directory to search in |

#### Return value

`string | null` — resolved path, or `null` if no match found.

#### Semver range syntax

| `name` argument | Meaning |
|-----------------|---------|
| `"mylib"` | Highest available version |
| `"mylib-1.2.3"` | Exact version only |
| `"mylib-^1.2.3"` | `>=1.2.3 <2.0.0` (caret — compatible changes) |
| `"mylib-~1.2.3"` | `>=1.2.3 <1.3.0` (tilde — patch changes only) |

Pre-release labels (`1.0.0-alpha`) are not supported.

#### Example

```js
// files contains: "/proj/mylib-1.0.0.lib80", "/proj/mylib-1.2.0.lib80"

resolveLibrary("mylib",        "lib80", files, "/proj")
// → "/proj/mylib-1.2.0.lib80"   (highest)

resolveLibrary("mylib-^1.0.0", "lib80", files, "/proj")
// → "/proj/mylib-1.2.0.lib80"   (highest satisfying ^1.0.0)

resolveLibrary("mylib-1.0.0",  "lib80", files, "/proj")
// → "/proj/mylib-1.0.0.lib80"   (exact)

resolveLibrary("mylib-^2.0.0", "lib80", files, "/proj")
// → null                         (no match)
```

---

## Selective linking and shadowing (UI layer)

> **Note:** The selective-linking algorithm and shadowing are implemented in
> the IDE's `assembler-worker.js`, not in `asm80-core`. This section explains
> the intended behaviour for the UI implementation.

When a `.lnk` recipe's `library[]` field references a `.libXX` file, the
linker applies the following rules:

### Selective pull-in

Only the modules needed to satisfy unresolved external references are pulled
from the library. The algorithm is a simple fixpoint:

1. Start with the set of externals unresolved after processing all explicit
   `modules[]` entries.
2. For each unresolved symbol: look it up in the library's `symbolIndex`.
3. If a matching module is found and not yet included → add it to the link
   set; add its own externals to the unresolved set.
4. Repeat until no new modules are added.

Circular dependencies within a library (A externs B, B externs A) are handled
naturally — both get pulled in during the first iteration.

### Shadowing

Shadowing is **module-level and atomic**. If a module with the same `name` as
a library module appears in the explicit `modules[]` list (or has been pulled
from a higher-priority source), the entire library module is skipped —
including all its exports.

This means you cannot replace a single routine from a library module while
keeping the rest. Modules are the smallest unit of substitution.

Example:

```yaml
# main.lnk
modules:
  - math.obj80      # provides SIN, COS — shadows library's "math" entirely
library:
  - mylib-1.0.0.lib80  # contains math (SIN, COS) and string (STRLEN)
```

Result: `math` module from the filesystem is used. The library's `math` is
skipped. `string` is pulled in from the library only if `STRLEN` is referenced.
