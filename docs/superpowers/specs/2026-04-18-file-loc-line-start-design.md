# `.file/.loc` Line-Start Debug Mapping — Design Spec

**Date:** 2026-04-18  
**Status:** Draft

## Overview

Cílem je přidat do asm80-core mapování zdrojových C řádků na start instrukce v ASM pomocí direktiv `.file` a `.loc`.
Mapování je line-start (jedna značka na první emitující instrukci po `.loc`), nikoliv per-instrukční.

Primární source-of-truth zůstává interní pole řádkových objektů (`dump`) a z něj se debug metadata destilují do výstupů (`objXX`, `lmap`).

## Goals

1. Udržet metadata v řádkových objektech pipeline (konzistence s existující architekturou).
2. Zachovat 100% kompatibilitu generovaného `.hex`.
3. Minimalizovat velikost debug metadat (line starts only).
4. Umožnit linkeru přepočet na finální adresy.

## Non-Goals

1. Nevytvářet nestandardní Intel HEX records.
2. Neimplementovat DWARF/STABS.
3. Nezavádět mapování každé instrukce na řádek.

## Directive Semantics

### `.file {id} "{path}"`

1. Registruje mapování `fileId -> path` pro aktuální modul.
2. `id` je kladné celé číslo.
3. Pozdější `.file` se stejným `id` přepíše předchozí definici.

### `.loc {fileId} {line} [; comment]`

1. Nastaví `pendingLoc = { fileId, line, comment? }`.
2. `pendingLoc` se NEaplikuje na řádky bez emise bajtů.
3. Aplikuje se až na první následující řádek, který emituje bajty.
4. Po aplikaci se `pendingLoc` vymaže.
5. Pokud přijde další `.loc` před emisí, přepíše `pendingLoc`.
6. Pokud žádná emise nenastane, `.loc` se ignoruje.

## Internal Data Model

### Řádkový objekt v `dump`

Přidá se volitelné pole:

```js
loc: {
  fileId: number,
  line: number,
  comment?: string
}
```

Pravidla:

1. `loc` existuje pouze na řádcích, kde začíná nový source line block.
2. Řádky bez line-start markeru pole `loc` vůbec nemají.

### Modulový kontext

V `opts` (nebo ekvivalentním compile contextu) se drží:

1. `debugFiles: { [fileId: number]: string }`
2. `_pendingLoc: { fileId:number, line:number, comment?:string } | null`

## Pipeline Behavior

### Parse / Pass stages

1. `.file` se zpracuje jako pseudodirektiva bez emise bajtů.
2. `.loc` se zpracuje jako pseudodirektiva bez emise bajtů.
3. Když assembler vytvoří řádek s `lens.length > 0` (a není `ifskip`), zkontroluje `_pendingLoc`.
4. Pokud `_pendingLoc` existuje, zapíše `op.loc = _pendingLoc` a `_pendingLoc = null`.

### HEX / LST generation

1. HEX ignoruje `loc` úplně.
2. LST `loc` zobrazuje (minimálně `fileId:line`, volitelně i `comment`).

### OBJ generation (`objXX`)

`objCode` zachová existující `code[]` a rozšíří formát o debug data:

1. Root sekce:

```js
obj.debug = {
  files: [{ id, path }]
}
```

2. Jednotlivé `code[]` položky mohou mít:

```js
dbg: [{ off, fileId, line, comment? }]
```

kde:

1. `off` je offset v bajtech od začátku `lens` konkrétní položky `code[]`.
2. `dbg` je sparse (jen line-start body).

Poznámka: protože `objCode` slučuje sousední čisté instrukce do jednoho `lens` bloku, `off` je nutný pro přesné umístění markeru uvnitř sloučeného bloku.

### Linking

1. Linker přepočte debug body na finální adresy: `addr = code.addr + off`.
2. V linked result zpřístupní line starts jako interní kolekci pro export.

### LMAP export

Generuje se sidecar textový soubor se sekcemi:

```text
# files
file_id,path
1,".../a.c"
2,".../b.h"

# lines
addr,file_id,line,comment
0x4010,1,9,"i = 1;"
0x4015,1,10,"while (i <= 5) {"
```

Pravidla:

1. `file_id` v `lines` musí existovat ve `files` sekci.
2. `addr` je hex (`0x...`).
3. `lines` jsou seřazené vzestupně dle adresy.
4. CSV escaping standardní (uvozovky a čárky).

## Error Handling

1. Nevalidní `.file` je `silent ignore` (bez assembler error).
2. Nevalidní `.loc` je `silent ignore` (bez assembler error).
3. Nevalidní `.loc` nesmí změnit aktuální `pendingLoc`.

## Backward Compatibility

1. Staré zdroje bez `.file/.loc` fungují beze změny.
2. Staré `.objXX` bez `debug/dbg` jsou stále validní.
3. Konzumenti `.hex` nemusí nic měnit.

## Acceptance Criteria

1. `.loc` se aplikuje přes direktivy bez emise (pending přežije do první emitující instrukce).
2. V jednom sloučeném `code` bloku je možné mít více `dbg` bodů s korektními `off`.
3. Linker vrací správné finální adresy line-start markerů.
4. `lmap` obsahuje deduplikovaný file table (`file_id -> path`) a line tabulku (`addr,file_id,line,comment`).
5. Výstupní bajty `.hex` jsou bitově stejné jako bez debug feature.
6. `LST` obsahuje zobrazení `loc` markerů.
7. Nevalidní `.file/.loc` nevyvolají chybu a jsou ignorovány.

## Test Plan

1. Unit test: parse/assembly semantika `.file/.loc` (`pendingLoc`, overwrite, no-byte gap).
2. Unit test: `objCode` mapování `op.loc` do `dbg.off` při slučování bloků.
3. Unit test: linker přepočet `off -> final addr`.
4. Integration test: C->ASM sample s několika `.loc` a ověření `lmap` řádků.
5. Regression test: build bez `.file/.loc` generuje stejný `.hex` jako před změnou.
6. Unit test: nevalidní `.file/.loc` jsou ignorovány bez chyby.
7. Unit/format test: `lst()` obsahuje `loc` anotace.
