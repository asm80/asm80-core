# Expression Parser (`expression-parser.js`)

A recursive-descent arithmetic and expression parser used by the assembler to evaluate symbol expressions, addresses, and immediate values during compilation.

## Public API

### `Parser.evaluate(expr, variables?)`

Static method. Parses and evaluates an expression string in one step.

```javascript
import { Parser } from './expression-parser.js';

Parser.evaluate("2+3*4")          // → 14
Parser.evaluate("$FF & 0x0F")     // → 15
Parser.evaluate("ADDR+1", { ADDR: 0x8000 }) // → 0x8001
```

### `Parser.parse(expr)`

Static method. Parses an expression and returns an `Expression` object for repeated evaluation.

```javascript
const expr = Parser.parse("BASE+OFFSET");
expr.evaluate({ BASE: 0x100, OFFSET: 4 }); // → 0x104
expr.evaluate({ BASE: 0x200, OFFSET: 4 }); // → 0x204
```

### `Parser.usage(expr, variables?)`

Static method. Returns a list of variable names referenced in the expression.

```javascript
Parser.usage("A + B * 2", { A: 1, B: 2 }); // → ["A", "B"]
```

### `new Parser().evaluate(expr, variables?)`

Instance method equivalent to the static version.

### `new Token(type, index, prio, number)`

Exported token constructor. Used internally; also useful for testing and introspection.

---

## Variable Resolution — Important Gotcha

**All variable names are uppercased before lookup** (`item.index_.toUpperCase()`). This means:

- Variables passed in the `values` object **must use UPPERCASE keys**
- `Parser.evaluate("myVar+1", { myVar: 5 })` → **throws** "undefined variable: MYVAR"
- `Parser.evaluate("myVar+1", { MYVAR: 5 })` → **works**, returns 6

This applies even to function values passed via `variables`:

```javascript
// WRONG — key is lowercase
Parser.parse("FAC(5)").evaluate({ fac: n => n });

// CORRECT — key must match uppercased token
const myFac = n => { let r = n; while (n > 1) r *= --n; return r; };
Parser.parse("MYFAC(5)").evaluate({ MYFAC: myFac }); // → 120
```

### Built-in functions (ops1 — single-arg, no case issue)

These are resolved via `this.ops1` before variable lookup, so their names work as-is in expressions:

| Function | Description |
|---|---|
| `lsb(x)` / `low(x)` / `LOW(x)` | Low byte (x % 256) |
| `msb(x)` / `high(x)` / `HIGH(x)` | High byte ((x >> 8) & 0xFF) |
| `sin`, `cos`, `tan`, `asin`, `acos`, `atan` | Trigonometry |
| `sqrt`, `log`, `abs`, `exp` | Math |
| `ceil`, `floor`, `round` | Rounding |
| `isnear(d)` | Returns 1 if d is in range −128..127 |

### Built-in functions (functions map — require UPPERCASE in values)

`fac`, `min`, `max`, `pyt`, `pow`, `random`, `atan2` are only in `this.functions` (lowercase keys). They work when the expression uses them as variables with UPPERCASE lookup. Pass them via `Parser.values` if needed.

---

## Operators

### Arithmetic

| Operator | Description |
|---|---|
| `+` `-` `*` `/` | Basic arithmetic |
| `%` or `#` | Modulo |
| `^` | Power (Math.pow) |

**String operands**: `+` concatenates strings via string codes; `*` repeats a string (`'ab'*3` → `"ababab"`).

### Bitwise

| Operator | Description |
|---|---|
| `&` | Bitwise AND |
| `\|` | Bitwise OR |
| `\|\|` | String concatenation |

### Comparison

Comparison operators use an unusual `?<` / `?>` prefix syntax (standard `<` / `>` characters are reserved for HTML contexts):

| Operator | Meaning | Returns |
|---|---|---|
| `?<` | Less than | 1 or 0 |
| `?>` | Greater than | 1 or 0 |
| `?<=` | Less or equal | 1 or 0 |
| `?>=` | Greater or equal | 1 or 0 |
| `=` | Equal | 1 or 0 |
| `!=` | Not equal | 1 or 0 |

```javascript
Parser.evaluate("1?<2")   // → 1
Parser.evaluate("2?<1")   // → 0
Parser.evaluate("3=3")    // → 1
Parser.evaluate("3!=3")   // → 0
```

### Special variables

- `$` — current program counter (alias for `_PC`)
- `<SYMBOL` — low byte of SYMBOL (equivalent to `lsb`)
- `>SYMBOL` — high byte of SYMBOL (equivalent to `msb`)

---

## Number Literals

| Format | Example | Notes |
|---|---|---|
| Decimal | `42` | Default |
| Hexadecimal | `$FF`, `0xFF`, `0XFF`, `FFh`, `FFH` | |
| Binary | `%1010`, `1010b`, `1010B` | |
| Octal | `17q`, `17Q`, `17o`, `17O` | |
| Float | `3.14` | Truncated to int unless `FLOAT` pragma |

**Gotcha**: A number like `1A` (decimal digit followed by a hex letter without a `0x`/`$` prefix) is **not** valid — the parser detects `shouldbehex=true` with `base=10` and rejects the token, causing a parse error. Always use `$1A` or `0x1A` for hex literals.

---

## Pragmas

The `__PRAGMAS` key in the `values` object controls float behaviour:

```javascript
Parser.parse("1.7").evaluate({ __PRAGMAS: ["ROUNDFLOAT"] }); // → 2
Parser.parse("1.7").evaluate({ __PRAGMAS: ["FLOAT"] });      // → 1.7 (returned as-is)
Parser.parse("1.7").evaluate({ __PRAGMAS: ["NOFLOAT"] });    // → 1 (parseInt)
// default (no pragma): parseInt is applied → 1
```

---

## Function Calls (TFUNCALL)

Multi-argument calls use the `,` operator internally (which builds an array via `append()`), then `f.apply()` is used for the call:

```javascript
// Single arg → f.call(undefined, arg)
Parser.parse("MYFUNC(5)").evaluate({ MYFUNC: x => x * 2 }); // → 10

// Multi arg → f.apply(undefined, [3, 4])
Parser.parse("MYMAX(3,4)").evaluate({ MYMAX: Math.max }); // → 4

// Zero args → f.apply(undefined, [])
Parser.parse("MYFUNC()").evaluate({ MYFUNC: () => 42 }); // → 42
```

---

## Comments in Expressions

C-style block comments are supported: `/* ... */`. An unclosed `/*` silently swallows the rest of the expression:

```javascript
Parser.evaluate("1 /* this is ignored")  // → 1
Parser.evaluate("1 /* ignored */ + 2")   // → 3
```

---

## Error Objects

Errors thrown by the parser have the shape `{ msg: string }`, not standard `Error` instances:

```javascript
try {
  Parser.parse("invalid!");
} catch (e) {
  console.log(e.msg); // "parse error [column N]: ..."
}
```

When using `assert.throws()` in QUnit tests, check `e.msg` explicitly:

```javascript
assert.throws(
  () => Parser.parse("bad expr"),
  (e) => /expected message/.test(e.msg)
);
```

---

## Dead Code / Unreachable Branches

The following branches exist in source but are unreachable in practice (noted for contributors):

- `isConst()` — always returns `false`; the constant map is disabled to avoid false positives on `E`, `PI`
- `isOp2()` returning `true` — `ops2` contains only symbol keys (`+`, `-`, etc.); `isOp2()` only collects alphanumeric characters, so the match can never succeed
- `errormsg` else-branch in the parse loop — `errormsg` is only set inside `error_parsing()`, which always throws before the else can be reached
