// this is a main file, you know...

import {lst, html} from "./listing.js"
import { pass1 } from "./pass1.js";
import {pass2} from "./pass2.js";
import {objCode, linkModules} from "./objcode.js"
import * as Parser from "./parser.js";

export const lst=lst, html=html;


export const compile = (source, fileSystem, opts = {assembler:null}, filename="noname") => {

    opts = {...opts, fileGet: fileSystem.fileGet, endian:false,
        ENT:null,
        BINFROM:null,
        BINTO:null, 
        ENGINE:null,
        PRAGMAS:[],
        includedFiles:{},
        endian:opts.assembler.endian,
        xfre: {},
        xref: {},
    
    }
    try {
    

    // parse source code into internal representation
    let parsedSource = Parser.parse(source, opts);

    // pass 1: prepare instruction codes and try to evaluate expressions
    let metacode = pass1(parsedSource, null, opts)

    // metacode is passed again and again until all expressions are evaluated
    metacode = pass1(metacode[0], metacode[1], opts);
    metacode = pass1(metacode[0], metacode[1], opts);
    metacode = pass1(metacode[0], metacode[1], opts);
    metacode = pass1(metacode[0], metacode[1], opts);

    metacode[1]["__PRAGMAS"] = opts.PRAGMAS;
    
    // pass 2: assign addresses to labels and evaluate expressions
    //        (this pass is not repeated)
    // It should be all resolved aftrer the 2nd pass
    metacode = pass2(metacode, opts);

    return [null,metacode,opts.xref]
    } catch (e) {
        // Some error occured
        let s = e.s || "Internal error";


        // Handle different kinds of errors
        if (e.e) {
          if (typeof e.e == "object") {
            e = e.e;
          } else {
            e = {
              msg: e.e,
              s: e.s
            };
          }
        }
        
        //fix format msg vs message
        if (!e.msg && e.message) {
          e.msg = e.message;
        }

        //no message, so we use the general one
        if (!e.msg) {
          return [
            "Cannot evaluate line " +
            opts.WLINE.numline +
            ", there is some unspecified error (e.g. reserved world as label etc.)",
            null,
          ];
        }
        if (!e.s) e.s = s;
        
        return [e, null];
    }
}

export const asmFromFile = (filename, fileSystem, opts = {assembler:null}) => {
    let source = fileSystem.fileGet(filename);
    return compile(source, fileSystem, opts, filename);
}