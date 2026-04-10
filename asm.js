// this is a main file, you know...

import {lst, html} from "./listing.js"
import { pass1 } from "./pass1.js";
import {pass2} from "./pass2.js";
import {objCode, linkModules} from "./objcode.js"
import * as Parser from "./parser.js";
import { buildLibrary } from "./libcode.js";
import { resolveLibrary } from "./semver-resolve.js";
import { parseLnk } from "./parseLnk.js";

//import all CPUs
import {I8080} from "./cpu/i8080.js";
import {M6800} from "./cpu/m6800.js";
import { C6502 } from "./cpu/c6502.js";
import { Z80 } from "./cpu/z80.js";
import { I8008 } from "./cpu/i8008.js";
import { CDP1802 } from "./cpu/cdp1802.js";
import { M6809 } from "./cpu/m6809.js";
import { H6309 } from "./cpu/h6309.js";
import { C65816 } from "./cpu/c65816.js";
import { Z180 } from "./cpu/z180.js";
import { M6803 } from "./cpu/m6803.js";
import { S2650 } from "./cpu/s2650.js";
import { SM83 } from "./cpu/sm83.js";
const cpus = [I8080, M6800, M6803, C6502, Z80, Z180, I8008, CDP1802, M6809, H6309, C65816, S2650, SM83];

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

    opts = {...opts, readFile: fileSystem.readFile, childOpts: fileSystem.childOpts, resolvePath: fileSystem.resolvePath,
        ENT:null,
        BINFROM:null,
        BINTO:null,
        ENGINE:null,
        PRAGMAS:[],
        includedFiles:{},
        endian:opts.assembler.endian || false,
        xfre: {},
        xref: {},

    }
    if (opts.relaxed) opts.errors = [];
    try {


    // parse source code into internal representation
    let parsedSource = await Parser.parse(source, opts);
    // preserve any preprocessor errors collected during parse
    const parsePhaseErrors = opts.relaxed ? [...(opts.errors || [])] : [];

    // pass 1: prepare instruction codes and try to evaluate expressions
    if (opts.relaxed) opts.errors = [];
    let metacode = await pass1(parsedSource, null, opts)

    // metacode is passed again and again until all expressions are evaluated
    if (opts.relaxed) opts.errors = [];
    metacode = await pass1(metacode[0], metacode[1], opts);
    if (opts.relaxed) opts.errors = [];
    metacode = await pass1(metacode[0], metacode[1], opts);
    if (opts.relaxed) opts.errors = [];
    metacode = await pass1(metacode[0], metacode[1], opts);
    // DO NOT reset opts.errors here — pass1 errors must survive into pass2

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

    if (opts.relaxed) {
        const allErrors = [...parsePhaseErrors, ...(opts.errors || [])];
        if (allErrors.length > 0) {
            throw { errors: allErrors };
        }
    }
    return out
    } catch (e) {
        if (opts.relaxed) {
            // Re-throw already-wrapped error arrays without double-wrapping
            if (e.errors) throw e;
            const fatalError = {
                msg: e.msg || "Internal error",
                s: e.s || "Fatal error",
                wline: opts.WLINE
            };
            throw { errors: [...parsePhaseErrors, ...(opts.errors || []), fatalError] };
        }
        // Some error occured
        //console.log(e)
        let s = e.s || "Internal error";



        //no message, so we use the general one
        //FALLBACK - should be removed in future version
        if (!e.msg) {
			console.error(e);
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
/**
 * Resolve the filesystem path for a module entry from a .lnk recipe.
 * New-style entries include the file extension (e.g. "main.obj80");
 * legacy entries are bare names (e.g. "main") and get ".obj" appended.
 * @param {string} entry - Module name from the recipe
 * @returns {string} Filename to pass to fileSystem.readFile
 */
const moduleFilename = (entry) => entry.includes(".") ? entry : entry + ".obj";

const link = async (linkList, fileSystem, name="noname") => {
  let cpu = null
  let endian = null

  const checkModule = (f, label) => {
      if (!cpu) cpu = f.cpu;
      if (cpu !== f.cpu) throw {msg:"Different CPU in " + label, s:"Linker error"};
      if (endian === null) endian = f.endian;
      if (endian !== f.endian) throw {msg:"Different endian in " + label, s:"Linker error"};
  };

  const modules = await Promise.all(linkList.modules.map(async m => {
      const f = JSON.parse(await fileSystem.readFile(moduleFilename(m)));
      checkModule(f, "module " + m);
      return f;
  }));

  // Library entries: new-style ".lib80" bundles or legacy bare names (".obj" files).
  const library = (await Promise.all(linkList.library.map(async m => {
      const filename = moduleFilename(m);
      const raw = JSON.parse(await fileSystem.readFile(filename));

      // .lib80 bundle: { modules: [{name, obj}, ...], symbolIndex, ... }
      if (Array.isArray(raw.modules)) {
          return raw.modules.map(entry => {
              checkModule(entry.obj, "library " + m + " / " + entry.name);
              return entry.obj;
          });
      }

      // Legacy single-obj file
      checkModule(raw, "library file " + m);
      return [raw];
  }))).flat();

  linkList.endian = endian;

  return linkModules(linkList, modules, library);
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
  cpus,
  buildLibrary,
  resolveLibrary,
  parseLnk,
}