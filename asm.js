// this is a main file, you know...

import {lst, html} from "./listing.js"
import { pass1 } from "./pass1.js";
import {pass2} from "./pass2.js";
import {objCode, linkModules} from "./objcode.js"
import * as Parser from "./parser.js";

//import all CPUs
import {I8080} from "./cpu/i8080.js";
import {M6800} from "./cpu/m6800.js";
import { C6502 } from "./cpu/c6502.js";
import { Z80 } from "./cpu/z80.js";
import { I8008 } from "./cpu/i8008.js";
import { CDP1802 } from "./cpu/cdp1802.js";
import { M6809 } from "./cpu/m6809.js";
const cpus = [I8080, M6800, C6502, Z80, I8008, CDP1802, M6809];

/**
 * Compiles assembly source code into machine code
 * @param {string} source - Assembly source code
 * @param {Object} fileSystem - File system interface with readFile method
 * @param {Object} opts - Compilation options
 * @param {string} opts.assembler - Assembler name or object
 * @param {string} filename - Source filename for error reporting
 * @returns {Object} Compilation result with dump, vars, xref, and opts
 * @throws {Object} Error object with compilation details
 */
export const compile = async (source, fileSystem, opts = {assembler:null}, filename="noname") => {

  if (typeof opts.assembler == "string") {
    opts.assembler = cpus.find(x=>x.cpu.toUpperCase()==opts.assembler.toUpperCase());
  }

  if (!opts.assembler || typeof opts.assembler != "object") {
    throw {msg:"No assembler specified", s:"Assembler error"};
  }

    opts = {...opts, readFile: fileSystem.readFile, endian:false,
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
    let parsedSource = await Parser.parse(source, opts);

    // pass 1: prepare instruction codes and try to evaluate expressions
    let metacode = await pass1(parsedSource, null, opts)

    // metacode is passed again and again until all expressions are evaluated
    metacode = await pass1(metacode[0], metacode[1], opts);
    metacode = await pass1(metacode[0], metacode[1], opts);
    metacode = await pass1(metacode[0], metacode[1], opts);
    metacode = await pass1(metacode[0], metacode[1], opts);

    metacode[1]["__PRAGMAS"] = opts.PRAGMAS;
    
    // pass 2: assign addresses to labels and evaluate expressions
    //        (this pass is not repeated)
    // It should be all resolved aftrer the 2nd pass
    metacode = pass2(metacode, opts);

    //new output, broke backward compatibility
    let out = {
      dump: metacode[0],
      vars: metacode[1],
      xref: opts.xref,
      opts: opts,
    }

    
    // is it a module?

    let vars = metacode[1];
    if (vars && typeof vars.__PRAGMAS !== "undefined" && vars.__PRAGMAS.indexOf("MODULE") != -1) {
      let obj = objCode(metacode[0],metacode[1],opts,filename)
      out.obj = obj;
    }

    return out
    } catch (e) {
        // Some error occured
        //console.log(e)
        let s = e.s || "Internal error";



        //no message, so we use the general one
        //FALLBACK - should be removed in future version
        if (!e.msg) {
          throw {
            error:
            {
              msg: `Cannot evaluate line ${opts.WLINE.numline}, there is some unspecified error (e.g. reserved world as label etc.)`,
              wline: opts.WLINE
            }
          }
          
        }
        if (!e.s) e.s = s;
        
        throw {
          error: {
            msg: e.msg,
            s: e.s,
            wline: opts.WLINE
          }
        };
    }
}

/**
 * Extracts filename from full path
 * @param {string} fullpath - Full file path
 * @returns {string} Filename without path
 */
const getfn = (fullpath) => {
  let parts = fullpath.split("/");
  return parts[parts.length-1];
}

/**
 * Compiles assembly code from a file
 * @param {string} filePath - Path to assembly source file
 * @param {Object} fileSystem - File system interface with readFile method
 * @param {Object} opts - Compilation options
 * @returns {Object} Compilation result
 */
export const compileFromFile = async (filePath, fileSystem, opts = {assembler:null}) => {
    let source = await fileSystem.readFile(filePath);
    return compile(source, fileSystem, opts, getfn(filePath));
}

//----------------------------------------

// linker

/**
 * Links multiple object modules into a single executable
 * @param {Object} linkList - Link list configuration
 * @param {Array} linkList.modules - Array of module names to link
 * @param {Array} linkList.library - Array of library names to link
 * @param {Object} fileSystem - File system interface with readFile method
 * @param {string} name - Output name for the linked executable
 * @returns {Object} Linked executable data
 * @throws {Object} Error if modules have incompatible CPU or endian settings
 */
const link = async (linkList, fileSystem, name="noname") => {
  let cpu = null
  let endian = null
  let modules = await Promise.all(linkList.modules.map(async m => {
      let f = JSON.parse(await fileSystem.readFile(m+".obj"))
      //checker
      if (!cpu) cpu = f.cpu;
      if (cpu != f.cpu) throw {msg:"Different CPU in module "+m, s:"Linker error"};
      if (!endian) endian = f.endian;
      if (endian != f.endian) throw {msg:"Different endian in module "+m, s:"Linker error"};
      return f
  }))
  let library = await Promise.all(linkList.library.map(async m => {
      let f = JSON.parse(await fileSystem.readFile(m+".obj"))
      if (cpu != f.cpu) throw {msg:"Different CPU in library file "+m, s:"Linker error"};
      if (endian != f.endian) throw {msg:"Different endian in library file "+m, s:"Linker error"};
      return f
  }))

  linkList.endian = endian

  let out = linkModules(linkList,modules, library)

  return out
  //fs.writeFileSync("./test/suite/"+name+".combined",JSON.stringify(out))    
}


/**
 * Main assembler interface object
 */
export const asm = {
  lst,
  html,
  compile,
  compileFromFile,
  link,
  cpus
}