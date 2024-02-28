/*
 Based on ndef.parser, by Raphael Graf(r@undefined.ch)
 http://www.undefined.ch/mparser/index.html

 Ported to JavaScript and modified by Matthew Crumley (email@matthewcrumley.com, http://silentmatt.com/)

 You are free to use and modify this code in anyway you find useful. Please leave this comment in the code
 to acknowledge its original source. If you feel like it, I enjoy hearing about projects that use my code,
 but don't feel like you have to let me know or ask permission.
*/

//  Added by stlsmiths 6/13/2011
//  re-define Array.indexOf, because IE doesn't know it ...
//
//  from http://stellapower.net/content/javascript-support-and-arrayindexof-ie


//obsolete polyfill
/*
if (!Array.indexOf) {
  Array.prototype.indexOf = function (obj, start) {
    for (let i = start || 0; i < this.length; i++) {
      if (this[i] === obj) {
        return i;
      }
    }
    return -1;
  };
}
*/

  
  function object(o) {
    function F() {}
    F.prototype = o;
    return new F();
  }

  const TNUMBER = 0;
  const TOP1 = 1;
  const TOP2 = 2;
  const TVAR = 3;
  const TFUNCALL = 4;

export function Token(type_, index_, prio_, number_) {
    this.type_ = type_;
    this.index_ = index_ || 0;
    this.prio_ = prio_ || 0;
    this.number_ = number_ !== undefined && number_ !== null ? number_ : 0;
    this.toString = function () {
      switch (this.type_) {
        case TNUMBER:
          return this.number_;
        case TOP1:
        case TOP2:
        case TVAR:
          return this.index_;
        case TFUNCALL:
          return "CALL";
        default:
          return "Invalid Token";
      }
    };
  }

  function Expression(tokens, ops1, ops2, functions) {
    this.tokens = tokens;
    this.ops1 = ops1;
    this.ops2 = ops2;
    this.functions = functions;
  }

  // Based on http://www.json.org/json2.js
  let cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
    escapable = /[\\\'\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
    meta = {
      // table of character substitutions
      "\b": "\\b",
      "\t": "\\t",
      "\n": "\\n",
      "\f": "\\f",
      "\r": "\\r",
      "'": "\\'",
      "\\": "\\\\",
    };

    /*
  function escapeValue(v) {
    if (typeof v === "string") {
      escapable.lastIndex = 0;
      return escapable.test(v)
        ? "'" +
            v.replace(escapable, function (a) {
              let c = meta[a];
              return typeof c === "string"
                ? c
                : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
            }) +
            "'"
        : "'" + v + "'";
    }
    return v;
  }
  */

  Expression.prototype = {
    /*
    simplify: function (values) {
      values = values || {};
      let nstack = [];
      let newexpression = [];
      let n1;
      let n2;
      let f;
      let L = this.tokens.length;
      let item;
      let i = 0;
      for (i = 0; i < L; i++) {
        item = this.tokens[i];
        let type_ = item.type_;
        if (type_ === TNUMBER) {
          nstack.push(item);
        } else if (type_ === Tlet && item.index_ in values) {
          item = new Token(TNUMBER, 0, 0, values[item.index_]);
          nstack.push(item);
        } else if (type_ === TOP2 && nstack.length > 1) {
          n2 = nstack.pop();
          n1 = nstack.pop();
          f = this.ops2[item.index_];
          item = new Token(TNUMBER, 0, 0, f(n1.number_, n2.number_));
          nstack.push(item);
        } else if (type_ === TOP1 && nstack.length > 0) {
          n1 = nstack.pop();
          f = this.ops1[item.index_];
          item = new Token(TNUMBER, 0, 0, f(n1.number_));
          nstack.push(item);
        } else {
          while (nstack.length > 0) {
            newexpression.push(nstack.shift());
          }
          newexpression.push(item);
        }
      }
      while (nstack.length > 0) {
        newexpression.push(nstack.shift());
      }

      return new Expression(
        newexpression,
        object(this.ops1),
        object(this.ops2),
        object(this.functions)
      );
    },

    substitute: function (variable, expr) {
      if (!(expr instanceof Expression)) {
        expr = new Parser().parse(String(expr));
      }
      let newexpression = [];
      let L = this.tokens.length;
      let item;
      let i = 0;
      for (i = 0; i < L; i++) {
        item = this.tokens[i];
        let type_ = item.type_;
        if (type_ === Tlet && item.index_ === variable) {
          for (let j = 0; j < expr.tokens.length; j++) {
            let expritem = expr.tokens[j];
            let replitem = new Token(
              expritem.type_,
              expritem.index_,
              expritem.prio_,
              expritem.number_
            );
            newexpression.push(replitem);
          }
        } else {
          newexpression.push(item);
        }
      }

      let ret = new Expression(
        newexpression,
        object(this.ops1),
        object(this.ops2),
        object(this.functions)
      );
      return ret;
    },
    */

    evaluate: function (values) {
      values = values || {};
      let nstack = [];
      let n1;
      let n2;
      let f;
      let L = this.tokens.length;
      let item;
      let i = 0;
      //console.log("EVAL2", this.tokens);
      for (i = 0; i < L; i++) {
        item = this.tokens[i];
        let type_ = item.type_;
        if (type_ === TNUMBER) {
          nstack.push(item.number_);
        } else if (type_ === TOP2) {
          n2 = nstack.pop();
          n1 = nstack.pop();
          f = this.ops2[item.index_];
          nstack.push(f(n1, n2));
        } else if (type_ === TVAR) {
          item.index_ = item.index_.toUpperCase();
          if (item.index_[0] === "<") {
            if (item.index_.substr(1) in values) {
              nstack.push(values[item.index_.substr(1)] % 256);
            }
          } else if (item.index_[0] === ">") {
            if (item.index_.substr(1) in values) {
              nstack.push(Math.floor(values[item.index_.substr(1)] / 256));
            }
          } else if (item.index_ in values) {
            nstack.push(values[item.index_]);
          } else if (item.index_ in this.functions) {
            nstack.push(this.functions[item.index_]);
          } else {
            throw {msg: "undefined variable: " + item.index_};
          }
        } else if (type_ === TOP1) {
          n1 = nstack.pop();
          f = this.ops1[item.index_];
          nstack.push(f(n1));
        } else if (type_ === TFUNCALL) {
          n1 = nstack.pop();
          f = nstack.pop();
          if (f.apply && f.call) {
            if (Object.prototype.toString.call(n1) == "[object Array]") {
              nstack.push(f.apply(undefined, n1));
            } else {
              nstack.push(f.call(undefined, n1));
            }
          } else {
            throw {msg: f + " is not a function"};
          }
        } else {
          throw {msg: "invalid Expression"};
        }
      }
      if (nstack.length > 1) {
        throw {msg: "invalid Expression (parity)"};
      }
      let ev = nstack[0];
      let pragmas = values.__PRAGMAS;
      //console.log(pragmas)
      if (pragmas && typeof ev == "number") {
        if (pragmas.indexOf("ROUNDFLOAT") >= 0) ev = Math.round(ev);
        if (pragmas.indexOf("FLOAT") >= 0) return ev;
        if (pragmas.indexOf("NOFLOAT") >= 0) return parseInt(ev);
      }
      if (typeof ev == "number") ev = parseInt(ev);
      //console.log(nstack, this.tokens, this, values);
      return ev;
    },

    usage: function (values) {
      values = values || {};
      let xref = [];
      let nstack = [];
      let n1;
      let n2;
      let f;
      let L = this.tokens.length;
      let item;
      let i = 0;
      for (i = 0; i < L; i++) {
        item = this.tokens[i];
        let type_ = item.type_;
        if (type_ === TNUMBER) {
          nstack.push(item.number_);
        } else if (type_ === TOP2) {
          n2 = nstack.pop();
          n1 = nstack.pop();
          f = this.ops2[item.index_];
          nstack.push(f(n1, n2));
        } else if (type_ === TVAR) {
          item.index_ = item.index_.toUpperCase();
          if (item.index_[0] === "<") {
            if (item.index_.substr(1) in values) {
              nstack.push(values[item.index_.substr(1)] % 256);
              xref.push(item.index_.substr(1));
            }
          } else if (item.index_[0] === ">") {
            if (item.index_.substr(1) in values) {
              nstack.push(Math.floor(values[item.index_.substr(1)] / 256));
              xref.push(item.index_.substr(1));
            }
          } else if (item.index_ in values) {
            nstack.push(values[item.index_]);
            xref.push(item.index_);
          } else if (item.index_ in this.functions) {
            nstack.push(this.functions[item.index_]);
            xref.push(item.index_);
          } else {
            throw {msg: "undefined variable: " + item.index_};
          }
        } else if (type_ === TOP1) {
          n1 = nstack.pop();
          f = this.ops1[item.index_];
          nstack.push(f(n1));
        } else if (type_ === TFUNCALL) {
          n1 = nstack.pop();
          f = nstack.pop();
          if (f.apply && f.call) {
            if (Object.prototype.toString.call(n1) == "[object Array]") {
              nstack.push(f.apply(undefined, n1));
            } else {
              nstack.push(f.call(undefined, n1));
            }
          } else {
            throw {msg: f + " is not a function"};
          }
        } else {
          throw {msg: "invalid Expression"};
        }
      }
      if (nstack.length > 1) {
        throw {msg: "invalid Expression (parity)"};
      }
      return xref;
    },
    /*
    toString: function (toJS) {
      let nstack = [];
      let n1;
      let n2;
      let f;
      let L = this.tokens.length;
      let item;
      let i = 0;
      for (i = 0; i < L; i++) {
        item = this.tokens[i];
        let type_ = item.type_;
        if (type_ === TNUMBER) {
          nstack.push(escapeValue(item.number_));
        } else if (type_ === TOP2) {
          n2 = nstack.pop();
          n1 = nstack.pop();
          f = item.index_;
          if (toJS && f == "^") {
            nstack.push("Math.pow(" + n1 + "," + n2 + ")");
          } else {
            nstack.push("(" + n1 + f + n2 + ")");
          }
        } else if (type_ === TVAR) {
          nstack.push(item.index_);
        } else if (type_ === TOP1) {
          n1 = nstack.pop();
          f = item.index_;
          if (f === "-") {
            nstack.push("(" + f + n1 + ")");
          } else {
            nstack.push(f + "(" + n1 + ")");
          }
        } else if (type_ === TFUNCALL) {
          n1 = nstack.pop();
          f = nstack.pop();
          nstack.push(f + "(" + n1 + ")");
        } else {
          throw {msg: "invalid Expression"};
        }
      }
      if (nstack.length > 1) {
        throw {msg: "invalid Expression (parity)"};
      }
      return nstack[0];
    },
    */

    /*
    variables: function () {
      let L = this.tokens.length;
      let vars = [];
      for (let i = 0; i < L; i++) {
        let item = this.tokens[i];
        if (item.type_ === Tlet && vars.indexOf(item.index_) == -1) {
          vars.push(item.index_);
        }
      }

      return vars;
    },
    */

    /*
    toJSFunction: function (param, variables) {
      let f = new Function(
        param,
        "with(Parser.values) { return " +
          this.simplify(variables).toString(true) +
          "; }"
      );
      return f;
    },
    */
  };

  function stringCode(s) {
    let o = 0;
    for (let i = 0; i < s.length; i++) {
      o *= 256;
      o += s.charCodeAt(i);
    }
    return o;
  }

  function add(a, b) {
    if (typeof a == "string") {
      a = stringCode(a);
    }
    if (typeof b == "string") {
      b = stringCode(b);
    }
    return Number(a) + Number(b);
  }

  function fand(a, b) {
    return Number(a) & Number(b);
  }

  function fnebo(a, b) {
    return Number(a) | Number(b);
  }

  function fbequ(a, b) {
    return Number(a) == Number(b) ? 1 : 0;
  }

  function fbnequ(a, b) {
    return Number(a) == Number(b) ? 0 : 1;
  }

  function fblt(a, b) {
    return Number(a) < Number(b) ? 1 : 0;
  }

  function fbgt(a, b) {
    return Number(a) > Number(b) ? 1 : 0;
  }

  function fble(a, b) {
    return Number(a) <= Number(b) ? 1 : 0;
  }

  function fbge(a, b) {
    return Number(a) >= Number(b) ? 1 : 0;
  }

  function sub(a, b) {
    if (typeof a == "string") {
      a = stringCode(a);
    }
    if (typeof b == "string") {
      b = stringCode(b);
    }
    return Number(a) - Number(b);
  }

  function mul(a, b) {
    if (typeof a == "string") {
      let out = "";
      for (let l = 0; l < b; l++) out += a;
      return out;
    }
    return a * b;
  }

  function div(a, b) {
    return a / b;
  }

  function mod(a, b) {
    return a % b;
  }

  function concat(a, b) {
    return "" + a + b;
  }

  function neg(a) {
    return -a;
  }

  function random(a) {
    return Math.random() * (a || 1);
  }

  function fac(a) {
    //a!
    a = Math.floor(a);
    let b = a;
    while (a > 1) {
      b = b * --a;
    }
    return b;
  }

  // TODO: use hypot that doesn't overflow
  function pyt(a, b) {
    return Math.sqrt(a * a + b * b);
  }

  function near(d) {
    //let d = x[0]-x[1];
    if (d > 127) return 0;
    if (d < -128) return 0;
    return 1;
  }

  function append(a, b) {
    if (Object.prototype.toString.call(a) != "[object Array]") {
      return [a, b];
    }
    a = a.slice();
    a.push(b);
    return a;
  }

  function lsb(a) {
    return a % 256;
  }

  function msb(a) {
    return (a >> 8) & 0xff;
  }

  export function Parser() {
    this.success = false;
    this.errormsg = "";
    this.expression = "";

    this.pos = 0;

    this.tokennumber = 0;
    this.tokenprio = 0;
    this.tokenindex = 0;
    this.tmpprio = 0;

    this.ops1 = {
      //"lsb": function(x){Math.floor(x%256);},
      lsb: lsb,
      msb: msb,
      sin: Math.sin,
      cos: Math.cos,
      tan: Math.tan,
      asin: Math.asin,
      acos: Math.acos,
      atan: Math.atan,
      sqrt: Math.sqrt,
      log: Math.log,
      abs: Math.abs,
      ceil: Math.ceil,
      floor: Math.floor,
      round: Math.round,
      isnear: near,
      "-": neg,
      exp: Math.exp,
    };

    this.ops2 = {
      "+": add,
      "-": sub,
      "*": mul,
      "/": div,
      "%": mod,
      "#": mod,
      "^": Math.pow,
      ",": append,
      "=": fbequ,
      "!=": fbnequ,
      "<": fblt,
      ">": fbgt,
      "<=": fble,
      ">=": fbge,
      "&": fand,
      "|": fnebo,
      "||": concat,
    };

    this.functions = {
      random: random,
      fac: fac,

      min: Math.min,
      max: Math.max,
      pyt: pyt,
      isnear: near,
      pow: Math.pow,
      atan2: Math.atan2,
    };

    this.consts = {
      //"E": Math.E,
      //"PI": Math.PI
    };
  }

  Parser.parse = function (expr) {
    return new Parser().parse(expr);
  };

  Parser.usage = function (expr, variables) {
    return Parser.parse(expr).usage(variables);
  };

  Parser.evaluate = function (expr, variables) {
    //console.log(Parser.parse(expr));
    return Parser.parse(expr).evaluate(variables);
  };

  Parser.Expression = Expression;

  Parser.values = {
    lsb: function (x) {
      Math.floor(x % 256);
    },
    msb: function (x) {
      Math.floor(x / 256);
    },
    sin: Math.sin,
    cos: Math.cos,
    tan: Math.tan,
    asin: Math.asin,
    acos: Math.acos,
    atan: Math.atan,
    sqrt: Math.sqrt,
    log: Math.log,
    abs: Math.abs,
    ceil: Math.ceil,
    floor: Math.floor,
    round: Math.round,
    random: random,
    fac: fac,
    exp: Math.exp,
    min: Math.min,
    max: Math.max,
    pyt: pyt,
    isnear: near,
    pow: Math.pow,
    atan2: Math.atan2,
    E: Math.E,
    PI: Math.PI,
  };

  let PRIMARY = 1 << 0;
  let OPERATOR = 1 << 1;
  let FUNCTION = 1 << 2;
  let LPAREN = 1 << 3;
  let RPAREN = 1 << 4;
  let COMMA = 1 << 5;
  let SIGN = 1 << 6;
  let CALL = 1 << 7;
  let NULLARY_CALL = 1 << 8;

  Parser.prototype = {
    parse: function (expr) {
      this.errormsg = "";
      this.success = true;
      let operstack = [];
      let tokenstack = [];
      this.tmpprio = 0;
      let expected = PRIMARY | LPAREN | FUNCTION | SIGN;
      let noperators = 0;
      this.expression = expr;
      this.pos = 0;

      if (!this.expression)
        throw {msg: "Empty expression, probably missing argument"};

      while (this.pos < this.expression.length) {
        if (this.isNumber()) {
          if ((expected & PRIMARY) === 0) {
            this.error_parsing(this.pos, "unexpected number");
          }
          let token = new Token(TNUMBER, 0, 0, this.tokennumber);
          tokenstack.push(token);

          expected = OPERATOR | RPAREN | COMMA;
        } else if (this.isOperator()) {
          if (this.isSign() && expected & SIGN) {
            if (this.isNegativeSign()) {
              this.tokenprio = 2;
              this.tokenindex = "-";
              noperators++;
              this.addfunc(tokenstack, operstack, TOP1);
            }
            expected = PRIMARY | LPAREN | FUNCTION | SIGN;
          } else if (this.isComment()) {
          } else {
            if ((expected & OPERATOR) === 0) {
              this.error_parsing(this.pos, "unexpected operator");
            }
            noperators += 2;
            this.addfunc(tokenstack, operstack, TOP2);
            expected = PRIMARY | LPAREN | FUNCTION | SIGN;
          }
        } else if (this.isString()) {
          if ((expected & PRIMARY) === 0) {
            this.error_parsing(this.pos, "unexpected string");
          }
          let token = new Token(TNUMBER, 0, 0, this.tokennumber);
          tokenstack.push(token);

          expected = OPERATOR | RPAREN | COMMA;
        } else if (this.isLeftParenth()) {
          if ((expected & LPAREN) === 0) {
            this.error_parsing(this.pos, 'unexpected "("');
          }

          if (expected & CALL) {
            noperators += 2;
            this.tokenprio = -2;
            this.tokenindex = -1;
            this.addfunc(tokenstack, operstack, TFUNCALL);
          }

          expected = PRIMARY | LPAREN | FUNCTION | SIGN | NULLARY_CALL;
        } else if (this.isRightParenth()) {
          if (expected & NULLARY_CALL) {
            let token = new Token(TNUMBER, 0, 0, []);
            tokenstack.push(token);
          } else if ((expected & RPAREN) === 0) {
            this.error_parsing(this.pos, 'unexpected ")"');
          }

          expected = OPERATOR | RPAREN | COMMA | LPAREN | CALL;
        } else if (this.isComma()) {
          if ((expected & COMMA) === 0) {
            this.error_parsing(this.pos, 'unexpected ","');
          }
          this.addfunc(tokenstack, operstack, TOP2);
          noperators += 2;
          expected = PRIMARY | LPAREN | FUNCTION | SIGN;
        } else if (this.isConst()) {
          if ((expected & PRIMARY) === 0) {
            this.error_parsing(this.pos, "unexpected constant");
          }
          let consttoken = new Token(TNUMBER, 0, 0, this.tokennumber);
          tokenstack.push(consttoken);
          expected = OPERATOR | RPAREN | COMMA;
        } else if (this.isOp2()) {
          if ((expected & FUNCTION) === 0) {
            this.error_parsing(this.pos, "unexpected function");
          }
          this.addfunc(tokenstack, operstack, TOP2);
          noperators += 2;
          expected = LPAREN;
        } else if (this.isOp1()) {
          if ((expected & FUNCTION) === 0) {
            this.error_parsing(this.pos, "unexpected function");
          }
          this.addfunc(tokenstack, operstack, TOP1);
          noperators++;
          expected = LPAREN;
        } else if (this.isVar()) {
          if ((expected & PRIMARY) === 0) {
            this.error_parsing(this.pos, "unexpected variable");
          }
          let vartoken = new Token(TVAR, this.tokenindex, 0, 0);
          tokenstack.push(vartoken);

          expected = OPERATOR | RPAREN | COMMA | LPAREN | CALL;
        } else if (this.isWhite()) {
        } else {
          if (this.errormsg === "") {
            this.error_parsing(
              this.pos,
              "unknown character in " + this.expression
            );
          } else {
            this.error_parsing(this.pos, this.errormsg);
          }
        }
      }
      if (this.tmpprio < 0 || this.tmpprio >= 10) {
        this.error_parsing(this.pos, 'unmatched "()"');
      }
      while (operstack.length > 0) {
        let tmp = operstack.pop();
        tokenstack.push(tmp);
      }
      if (noperators + 1 !== tokenstack.length) {
        //print(noperators + 1);
        //print(tokenstack);
        this.error_parsing(this.pos, "parity");
      }

      return new Expression(
        tokenstack,
        object(this.ops1),
        object(this.ops2),
        object(this.functions)
      );
    },

    evaluate: function (expr, variables) {
      //console.log(this.parse(expr));
      let value = this.parse(expr).evaluate(variables);
      return value;
    },

    error_parsing: function (column, msg) {
      this.success = false;
      this.errormsg = "parse error [column " + column + "]: " + msg;
      throw {msg: this.errormsg};
    },

    //\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\

    addfunc: function (tokenstack, operstack, type_) {
      let operator = new Token(
        type_,
        this.tokenindex,
        this.tokenprio + this.tmpprio,
        0
      );
      while (operstack.length > 0) {
        if (operator.prio_ <= operstack[operstack.length - 1].prio_) {
          tokenstack.push(operstack.pop());
        } else {
          break;
        }
      }
      operstack.push(operator);
    },

    isNumber: function () {
      let r = false;
      let str = "";
      let firstok = 0;
      let firstcode = 0;
      let base = 10;
      let shouldbehex = false;
      let bakpos = this.pos;
      let strx;
      while (this.pos < this.expression.length) {
        let code = this.expression.charCodeAt(this.pos);
        //console.log(this.pos, code, firstok);
        if (firstok === 0) firstcode = code;
        if (
          (code >= 48 && code <= 57) ||
          code === 46 ||
          (firstok === 0 && code === 36) || //$1123
          (firstok === 0 && code === 37) || //%11010
          (firstok === 1 && code === 88 && firstcode === 48) || //0X
          (firstok === 1 && code === 120 && firstcode === 48) ||
          (firstok > 0 && code === 72) || //...H
          (firstok > 0 && code === 104) || //...h
          (firstok > 0 && code === 66) || //...B
          (firstok > 0 && code === 98) || //...b
          (firstok > 0 && code === 81) || //...Q
          (firstok > 0 && code === 113) || //...q
          (firstok > 0 && code === 79) || //...O
          (firstok > 0 && code === 111) || //...o
          (firstok > 0 && code >= 65 && code <= 70) ||
          (firstok > 0 && code >= 97 && code <= 102)
        ) {
          if (
            ((firstok > 0 && code >= 65 && code <= 70) ||
              (firstok > 0 && code >= 97 && code <= 102)) &&
            !(base === 16)
          ) {
            shouldbehex = true;
          }

          firstok++;
          str += this.expression.charAt(this.pos);
          this.pos++;

          //num syntax fixes
          strx = str;
          if (str[0] === "$") {
            strx = "0x" + str.substr(1);
            base = 16;
          }
          if (str[1] === "x" || str[1] === "X") {
            base = 16;
          }
          if (str[str.length - 1] === "h" || str[str.length - 1] === "H") {
            if (base == 10 || base == 2) {
              strx = "0x" + str.substr(0, str.length - 1);
              base = 16;
            }
          }
          if (str[str.length - 1] === "b" || str[str.length - 1] === "B") {
            if (base == 10) {
              strx = str.substr(0, str.length - 1);
              base = 2;
            }
          }
          if (
            str[str.length - 1] === "q" ||
            str[str.length - 1] === "Q" ||
            str[str.length - 1] === "o" ||
            str[str.length - 1] === "O"
          ) {
            if (base == 10) {
              strx = str.substr(0, str.length - 1);
              base = 8;
            }
          }
          /*
                    if (str[0] === "%") {
                      console.log("OOO", str, strx)
                      if (str.length < 2) {
                        this.pos = bakpos;
                        return false;
                      }
                      strx = str.substr(1);
                      base = 2;
                    }
          */
          if (base != 10) this.tokennumber = parseInt(strx, base);
          else this.tokennumber = parseFloat(strx);
          r = true;
        } else {
          break;
        }
      }

      if (str[0] === "%") {
        //console.log("OOO", str, strx)
        if (str.length < 2) {
          this.pos = bakpos;
          return false;
        }
        strx = str.substr(1);
        this.tokennumber = parseInt(strx, 2);
      }

      //console.log(shouldbehex, base);
      if (shouldbehex && base === 2) {
        shouldbehex = false;
      }
      if (shouldbehex && base !== 16) {
        this.pos = bakpos;
        return false;
      }
      if (strx === "0x") {
        this.pos = bakpos;
        return false;
      }
      return r;
    },

    // Ported from the yajjl JSON parser at http://code.google.com/p/yajjl/
    unescape: function (v, pos) {
      let buffer = [];
      let escaping = false;

      for (let i = 0; i < v.length; i++) {
        let c = v.charAt(i);

        if (escaping) {
          switch (c) {
            case "'":
              buffer.push("'");
              break;
            case "\\":
              buffer.push("\\");
              break;
            case "/":
              buffer.push("/");
              break;
            case "b":
              buffer.push("\b");
              break;
            case "f":
              buffer.push("\f");
              break;
            case "n":
              buffer.push("\n");
              break;
            case "r":
              buffer.push("\r");
              break;
            case "t":
              buffer.push("\t");
              break;
            case "u":
              // interpret the following 4 characters as the hex of the unicode code point
              let codePoint = parseInt(v.substring(i + 1, i + 5), 16);
              buffer.push(String.fromCharCode(codePoint));
              i += 4;
              break;
            default:
              throw this.error_parsing(
                pos + i,
                "Illegal escape sequence: '\\" + c + "'"
              );
          }
          escaping = false;
        } else {
          if (c == "\\") {
            escaping = true;
          } else {
            buffer.push(c);
          }
        }
      }

      return buffer.join("");
    },

    isString: function () {
      let r = false;
      let str = "";
      let startpos = this.pos;
      if (
        (this.pos < this.expression.length &&
          this.expression.charAt(this.pos) == "'") ||
        this.expression.charAt(this.pos) == '"'
      ) {
        let delim = this.expression.charAt(this.pos);
        this.pos++;
        while (this.pos < this.expression.length) {
          let code = this.expression.charAt(this.pos);
          if (code != delim || str.slice(-1) == "\\") {
            str += this.expression.charAt(this.pos);
            this.pos++;
          } else {
            this.pos++;
            this.tokennumber = this.unescape(str, startpos);
            r = true;
            break;
          }
        }
      }
      return r;
    },

    isConst: function () {
      return false; //false positive on E, PI
      /*
      let str;
      for (let i in this.consts) {
        if (true) {
          let L = i.length;
          str = this.expression.substr(this.pos, L);
          if (i === str) {
            this.tokennumber = this.consts[i];
            this.pos += L;
            return true;
          }
        }
      }
      return false;
      */
    },

    isOperator: function () {
      let code = this.expression.charCodeAt(this.pos);
      if (code === 43) {
        // +
        this.tokenprio = 0;
        this.tokenindex = "+";
      } else if (code === 45) {
        // -
        this.tokenprio = 0;
        this.tokenindex = "-";
      } else if (code === 124) {
        // |
        if (this.expression.charCodeAt(this.pos + 1) === 124) {
          this.pos++;
          this.tokenprio = 0;
          this.tokenindex = "||";
        } else {
          //return false;
          this.tokenprio = 5;
          this.tokenindex = "|";
        }
      } else if (code === 42) {
        // *
        this.tokenprio = 1;
        this.tokenindex = "*";
      } else if (code === 47) {
        // /
        this.tokenprio = 2;
        this.tokenindex = "/";
      } else if (code === 37) {
        // %
        this.tokenprio = 2;
        this.tokenindex = "%";
      } else if (code === 35) {
        // #
        this.tokenprio = 2;
        this.tokenindex = "#";
      } else if (code === 94) {
        // ^
        this.tokenprio = 3;
        this.tokenindex = "^";
      } else if (code === 38) {
        // &
        this.tokenprio = 4;
        this.tokenindex = "&";
      } else if (code === 61) {
        // =
        this.tokenprio = -1;
        this.tokenindex = "=";
      } else if (code === 33) {
        // !
        if (this.expression.charCodeAt(this.pos + 1) === 61) {
          this.pos++;
          this.tokenprio = -1;
          this.tokenindex = "!=";
        } else {
          //return false;
          this.tokenprio = 5;
          this.tokenindex = "!";
        }
      } else if (code === 63) {
        // ?
        if (this.expression.charCodeAt(this.pos + 1) === 60) {
          // <
          this.pos++;
          if (this.expression.charCodeAt(this.pos + 1) === 61) {
            this.pos++;
            this.tokenprio = -1;
            this.tokenindex = "<=";
          } else {
            this.tokenprio = -1;
            this.tokenindex = "<";
          }
        }
        if (this.expression.charCodeAt(this.pos + 1) === 62) {
          // >
          this.pos++;
          if (this.expression.charCodeAt(this.pos + 1) === 61) {
            this.pos++;
            this.tokenprio = -1;
            this.tokenindex = ">=";
          } else {
            this.tokenprio = -1;
            this.tokenindex = ">";
          }
        }
      } else {
        /*
      else if (code === 60) { // <
        if (this.expression.charCodeAt(this.pos + 1) === 61) {
          this.pos++;
          this.tokenprio = -1;
          this.tokenindex = "<=";
        }
        else {
          this.tokenprio = -1;
          this.tokenindex = "<";
        }
      }
      */
        return false;
      }
      this.pos++;
      return true;
    },

    isSign: function () {
      let code = this.expression.charCodeAt(this.pos - 1);
      if (code === 45 || code === 43) {
        // -
        return true;
      }
      return false;
    },

    /*
    isPositiveSign: function () {
      let code = this.expression.charCodeAt(this.pos - 1);
      if (code === 43) {
        // -
        return true;
      }
      return false;
    },
    */

    isNegativeSign: function () {
      let code = this.expression.charCodeAt(this.pos - 1);
      if (code === 45) {
        // -
        return true;
      }
      return false;
    },

    isLeftParenth: function () {
      let code = this.expression.charCodeAt(this.pos);
      if (code === 40) {
        // (
        this.pos++;
        this.tmpprio += 10;
        return true;
      }
      return false;
    },

    isRightParenth: function () {
      let code = this.expression.charCodeAt(this.pos);
      if (code === 41) {
        // )
        this.pos++;
        this.tmpprio -= 10;
        return true;
      }
      return false;
    },

    isComma: function () {
      let code = this.expression.charCodeAt(this.pos);
      if (code === 44) {
        // ,
        this.pos++;
        this.tokenprio = -1;
        this.tokenindex = ",";
        return true;
      }
      return false;
    },

    isWhite: function () {
      let code = this.expression.charCodeAt(this.pos);
      if (code === 32 || code === 9 || code === 10 || code === 13) {
        this.pos++;
        return true;
      }
      return false;
    },

    isOp1: function () {
      let str = "";
      for (let i = this.pos; i < this.expression.length; i++) {
        let c = this.expression.charAt(i);
        if (c.toUpperCase() === c.toLowerCase()) {
          if (i === this.pos || (c != "_" && (c < "0" || c > "9"))) {
            break;
          }
        }
        str += c;
      }
      if (str.length > 0 && str in this.ops1) {
        this.tokenindex = str;
        this.tokenprio = 5;
        this.pos += str.length;
        return true;
      }
      return false;
    },

    isOp2: function () {
      let str = "";
      for (let i = this.pos; i < this.expression.length; i++) {
        let c = this.expression.charAt(i);
        if (c.toUpperCase() === c.toLowerCase()) {
          if (i === this.pos || (c != "_" && (c < "0" || c > "9"))) {
            break;
          }
        }
        str += c;
      }
      if (str.length > 0 && str in this.ops2) {
        this.tokenindex = str;
        this.tokenprio = 5;
        this.pos += str.length;
        return true;
      }
      return false;
    },

    isVar: function () {
      let str = "";
      for (let i = this.pos; i < this.expression.length; i++) {
        let c = this.expression.charAt(i);
        if (c === "$") {
          str = "_PC";
          break;
        }
        if (c.toUpperCase() === c.toLowerCase() && c !== "<" && c !== ">") {
          if (i === this.pos || (c != "_" && (c < "0" || c > "9"))) {
            break;
          }
        }
        str += c;
      }
      if (str.length > 0) {
        this.tokenindex = str;
        this.tokenprio = 4;
        if (str !== "_PC") {
          this.pos += str.length;
        } else {
          this.pos++;
        }
        return true;
      }
      return false;
    },

    isComment: function () {
      let code = this.expression.charCodeAt(this.pos - 1);
      if (code === 47 && this.expression.charCodeAt(this.pos) === 42) {
        this.pos = this.expression.indexOf("*/", this.pos) + 2;
        if (this.pos === 1) {
          this.pos = this.expression.length;
        }
        return true;
      }
      return false;
    },
  };

