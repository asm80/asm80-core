/**
 * Extract 16-bit value from instruction bytes at specified position
 * @param {Object} s - Instruction object with lens array and wia position
 * @param {boolean} endian - Byte order: true=big endian, false=little endian
 * @returns {number} 16-bit value extracted from instruction bytes
 */
const get16 = (s, endian=false) => {
    // Get low and high bytes from instruction at wia position
    let a = s.lens[s.wia]
    let b = s.lens[s.wia+1]
    
    if (endian) {
        // Big endian: high byte first
        return (a<<8)|b
    } else {
        // Little endian: low byte first
        return (b<<8)|a
    }
}
/**
 * Store 16-bit value into instruction bytes at specified position
 * @param {Object} s - Instruction object with lens array and wia position
 * @param {number} v - 16-bit value to store
 * @param {boolean} endian - Byte order: true=big endian, false=little endian
 */
const put16 = (s, v, endian=false) => {
    // Split 16-bit value into low and high bytes
    let a = v&0xff        // Low byte
    let b = (v>>8)&0xff   // High byte
    
    if (endian) {
        // Big endian: store high byte first
        s.lens[s.wia] = b
        s.lens[s.wia+1] = a
    } else {
        // Little endian: store low byte first
        s.lens[s.wia] = a
        s.lens[s.wia+1] = b
    }
}

/**
 * Generate relocatable object code from parsed assembly lines
 * Processes assembly instructions and creates relocatable object format
 * with support for external references and multiple segments
 * @param {Array} V - Array of parsed assembly line objects
 * @param {Object} vars - Symbol table with variable definitions
 * @param {Object} opts - Assembly options including CPU and endianness
 * @param {string} moduleName - Name of the module being assembled
 * @returns {Object} Object code with segments, exports, and external references
 */
export const objCode = (V, vars, opts, moduleName="noname") => {
    // Initialize output structures
    let out = []        // Generated object code instructions
    let externs = []    // External symbol declarations
    let used = []       // External symbols actually used
    let exports = {}    // Symbols exported from this module

    // Build symbol-to-segment mapping for relocation
    let varsSegs = {}
    for (let ln of V) {
        if (ln.label) {
            // Map each label to its segment for relocation calculations
            varsSegs[ln.label.toUpperCase()] = ln.segment
        }
    }

    // Track segment lengths for linker
    let seglen = {
        CSEG: 0,   // Code segment
        DSEG: 0,   // Data segment  
        ESEG: 0,   // Extra segment
        BSSEG: 0,  // BSS (uninitialized data) segment
    }

    let lastOne = null  // Track last instruction for concatenation optimization

    // Process each assembly line to generate object code
    for (let ln of V) {
        // Skip lines without opcodes (comments, labels only)
        if (!ln.opcode) {
            continue
        }
        // Skip lines excluded by conditional assembly
        if (ln.ifskip)  {
            continue
        }

        // Create object code entry for this instruction
        let op = {
            lens: ln.lens,        // Generated machine code bytes
            segment: ln.segment,  // Segment where instruction resides
        }



        let opcode = ln.opcode
        
        // Handle external symbol declarations
        if (opcode==".EXTERN") {
            // Declare external symbol that must be resolved by linker
            let name = ln.params[0];
            if (!name) name = ln.label
            externs.push(name.toUpperCase())
        }
        
        // Handle symbol exports
        if (opcode==".EXPORT") {
            // Export symbol for use by other modules
            let name = ln.params[0];
            name = name.toUpperCase()
            exports[name] = {addr:vars[name],seg:varsSegs[name]}
        }

        // Handle BSS segment (uninitialized data - no bytes generated)
        if (ln.segment=="BSSEG") {
            seglen.BSSEG += ln.bytes  // Track space reservation only
            continue
        }

        // Skip instructions that don't generate bytes
        if (!ln.lens || !ln.lens.length) continue;

        // Update segment length with generated bytes
        seglen[ln.segment] += ln.lens.length

        // Process symbol references for relocation
        if (ln.usage && ln.usage.length) {
            let usage = ln.usage
            for (let u of usage) {
                if (externs.indexOf(u) < 0) {
                    // Internal symbol - needs relocation
                    op.rel=true
                    op.relseg = varsSegs[u]  // Target segment for relocation
                } else {
                    // External symbol - needs linker resolution
                    op.ext=u
                    used.push(u)
                }
            }
            // Extract current address value for relocation calculation
            op.add = get16(ln, opts.endian)
            op.wia = ln.wia  // Position of address in instruction
        }

        // Optimization: concatenate consecutive pure code instructions
        if (typeof op.rel=="undefined" && typeof op.ext=="undefined" && lastOne && lastOne.segment==op.segment) {
            // Merge with previous instruction if both are pure code in same segment
            lastOne.lens = lastOne.lens.concat(op.lens)
            continue
        }

        // Add instruction to output
        out.push(op)
        
        // Track for potential concatenation with next instruction
        if (typeof op.rel=="undefined" && typeof op.ext=="undefined") {
            lastOne = op  // Pure code - can be concatenated
        } else {
            lastOne = null  // Has relocations - cannot concatenate
        }
    }

    /**
     * code: array of instructions
     * instruction:
     * {
     *      lens: array of bytes (mandatory)
     *      segment: segment where the instruction is (mandatory)
     *      rel: if the instruction has a relative address (optional)
     *      relseg: segment of the relative address (optional)
     *      ext: if the instruction has an external address (optional)
     *      add: the address to add to the external address (optional)
     *      wia: where is the address in the instruction (optional)
     *      resolved: the resolved address (optional, defined by linker)
     *      base: the base address for the relative address (optional, defined by linker)
     * }
     */

    // Return relocatable object module
    return {
        code:out,                      // Generated object code instructions
        externs:used,                  // External symbols referenced
        exports:exports,               // Symbols exported by this module
        cpu:opts.assembler.cpu,        // Target CPU architecture
        endian:opts.assembler.endian,  // Byte order for multi-byte values
        name: moduleName,              // Module identifier
        seglen: seglen,                // Length of each segment
    }
}

/**
 * Find module in library that exports a specific symbol
 * Searches through library modules to find one that exports the named symbol
 * @param {string} name - Symbol name to search for
 * @param {Array} library - Array of library modules to search
 * @returns {Object|null} Module that exports the symbol, or null if not found
 */
const findInLibrary = (name, library) => {
    // Search through all library modules
    for (let i=0; i<library.length; i++) {
        let mod = library[i]
        let exports = Object.keys(mod.exports)
        
        // Check if this module exports the requested symbol
        if (exports.indexOf(name) >= 0) {
            return mod
        }
    }
    return null  // Symbol not found in any library module
}

/**
 * Add module to link output and update linker state
 * Processes module code, resolves addresses, and updates segment pointers
 * @param {Object} mod - Module to add (contains code, exports, segment lengths)
 * @param {Object} st - Linker state (addresses, resolves, unresolved symbols)
 * @param {Array} out - Output array to append processed instructions
 * @returns {Object} Updated linker state
 */
const addModule = (mod, st, out) => {
    // Save current segment base addresses for relocation
    let cbase = st.caddr   // Code segment base
    let dbase = st.daddr   // Data segment base  
    let ebase = st.eaddr   // Extra segment base
    let bsbase = st.bsaddr // BSS segment base
    //resolve vars
    for (let k in mod.exports) {
        let v = mod.exports[k]
        if (typeof st.resolves[k] == "undefined") {
            throw {msg:"Variable "+k+" is not resolved"}
        }
        if (v.seg=="CSEG") v.addr += st.caddr
        else if (v.seg=="DSEG") v.addr += st.daddr
        else if (v.seg=="ESEG") v.addr += st.eaddr
        else if (v.seg=="BSSEG") v.addr += st.bsaddr
        st.resolves[k] = v
        //remove K from notresolved
        st.notresolved = st.notresolved.filter((item) => item !== k)
    }
    for (let s of mod.code) {
        let addr = st.caddr
        if (s.segment=="DSEG") addr = st.daddr
        else if (s.segment=="ESEG") addr = st.eaddr
        else if (s.segment=="BSSEG") addr = st.bsaddr
        s.addr = addr
        //new address in the given segment
        addr += s.lens.length
        if (s.segment=="CSEG") st.caddr = addr
        else if (s.segment=="DSEG") st.daddr = addr
        else if (s.segment=="ESEG") st.eaddr = addr
        else if (s.segment=="BSSEG") st.bsaddr = addr
        //local relocs
        if (s.rel) {
            if (s.relseg=="CSEG") s.base = cbase
            else if (s.relseg=="DSEG") s.base = dbase
            else if (s.relseg=="ESEG") s.base = ebase
            else if (s.relseg=="BSSEG") s.base = bsbase
        }
        // no unresolved at this point
        /*
        if (s.ext) {
            if (!st.resolves[s.ext]) {
                //we need to resolve this external
                //console.log("Not resolved yet: "+s.ext)
                st.notresolved.push(s.ext)
            }
        }
        */
        out.push(s)       
    }
    return st
}



/**
 * Link multiple object modules into executable code
 * Resolves external references, performs relocations, and generates final addresses
 * @param {Object} data - Link configuration (segments, variables, entrypoint)
 * @param {Array} modules - Array of object modules to link
 * @param {Array} library - Array of library modules for resolving externals
 * @returns {Object} Linked output with resolved addresses and code
 */
export const linkModules = (data, modules, library) => {
    // Set entry point symbol (default to _MAIN)
    let entrypoint = data.entrypoint?data.entrypoint.toUpperCase():"_MAIN"

    let out = []
    let resolves = {}
    let notresolved=[]
    for (let v in data.vars) {
        let val = parseInt(data.vars[v])
        resolves[v] = {addr:val,seg:null}
    }
    //console.log("PASS1: Resolves init: ", resolves)

    //resolve references
    const resolveModule = (mod) => {
        //module needs to be resolved
        for (let k of mod.externs) {
            if (resolves[k]) {
                continue
            }
            if (notresolved.indexOf(k) < 0) {
                notresolved.push(k)
            }
        }

        for (let k in mod.exports) {
            if (resolves[k]) {
                throw {msg:"Variable "+k+" is already defined"}
            }
            resolves[k] = mod.exports[k]
            notresolved = notresolved.filter((item) => item !== k)
        }
        
    }

    for (let mod of modules) {
        //take each module and check externs/exports
        for (let k in mod.exports) {
            resolveModule(mod)
        }
    }
    while (notresolved.length) {
        let name = notresolved.pop()
        let mod = findInLibrary(name, library)
        if (mod) {
            resolveModule(mod)
            //add module to the module list
            modules.push(mod)
        } else {
            throw {msg:"PASS1 Unresolved external "+name}
        }
    }

    //all modules are resolved now
    //console.log("PASS1: Resolved: ", resolves, notresolved)
    //console.log("PASS1: Modules: ", modules.map(q=>q.name))

    let seglen = {
        CSEG: 0,
        DSEG: 0,
        ESEG: 0,
        BSSEG: 0,
    }

    //How long are the segments?
    for (let mod of modules) {
        for (let s in mod.seglen) {
            seglen[s] += mod.seglen[s]
        }
    }
    //console.log("PASS1: Seglen: ", seglen)

    let CSEG = data.segments.CSEG?parseInt(data.segments.CSEG):0
    let DSEG = data.segments.DSEG?parseInt(data.segments.DSEG):CSEG+seglen.CSEG
    let ESEG = data.segments.ESEG?parseInt(data.segments.ESEG):DSEG+seglen.DSEG
    let BSSEG = data.segments.BSSEG?parseInt(data.segments.BSSEG):ESEG+seglen.ESEG
    let caddr = CSEG
    let daddr = DSEG
    let eaddr = ESEG
    let bsaddr = BSSEG

    /*
    //drop all, do it again then
    notresolved=[]
    resolves = {}
    for (let v in data.vars) {
        let val = parseInt(data.vars[v])
        resolves[v] = {addr:val,seg:null}
    }
    */
    let state = {caddr,daddr,eaddr,bsaddr, resolves, notresolved, library}

    //add all modules we have specified in link recipe
    for (let mod of modules) {
        state = addModule(mod, state, out)
    }


    //with pre-resolving, we don't need this anymore
    /*
    //still not resolved?!
    console.log("Not resolved: ", state.notresolved)
    while (state.notresolved.length) {
        let name = state.notresolved.pop()
        let mod = findInLibrary(name, library)
        console.log("Resolving "+name, mod)
        if (mod) {
            state = addModule(mod, state, out)
        } else {
            throw {msg:"Unresolved external "+name}
        }
    }
    */


        //resolves
        for (let s of out) {
            if (s.ext) {
                if (resolves[s.ext]) {
                    s.resolved = resolves[s.ext].addr
                } else {
                    throw {msg:"Unresolved external "+s.ext}
                }
            }
        }

        //internal relocs
        for (let s of out) {
            if (s.rel) {
                //let add = get16(s, data.endian)
                //s.add = add
                let base = s.base
                put16(s, s.add+base, data.endian)
            }
        }

        //external relocs
        for (let s of out) {
            if (s.resolved) {
                //let add = get16(s, data.endian)
                //s.add = add
                let base = s.resolved
                put16(s, s.add+base, data.endian)
            }
        }

    //    console.log("PASS2: CSEG", CSEG, "DSEG", DSEG, "ESEG", ESEG, "BSSEG", BSSEG)

        //cleaning
        for (let s of out) {
            delete s.rel
            delete s.relseg
            delete s.ext
            delete s.add
            delete s.wia
            delete s.base
            delete s.resolved
        }

        out.sort((a,b) => a.addr-b.addr)

    return {
        //notresolved, 
        CSEG,
        DSEG,
        ESEG,
        BSSEG,
        seglen,
        entry:resolves[entrypoint],
        dump:out, 

    }

    /*
    return {
        CSEG, DSEG, ESEG, BSSEG: addresses of segments
        seglen: lengths of segments
        entry: entry point
        code: array of instructions/data
    }

    code:
    {
        lens: array of bytes
        addr: address
        segment: segment
    }
    
    */
}