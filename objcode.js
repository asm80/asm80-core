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
    // Single-byte field (e.g. direct page): no endianness, just the byte value
    if (b === undefined) return a
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
    const has2 = s.lens.length > s.wia + 1  // Don't extend array for 1-byte address fields (e.g. ZP)

    if (!has2) {
        // Single-byte field (e.g. direct page): no endianness, always low byte
        s.lens[s.wia] = a
    } else if (endian) {
        // Big endian: store high byte first
        s.lens[s.wia] = b
        s.lens[s.wia+1] = a
    } else {
        // Little endian: store low byte first
        s.lens[s.wia] = a
        s.lens[s.wia+1] = b
    }
}

const SEGMENT_ORDER_PREFIX = ["CSEG", "ZPSEG", "DSEG", "ESEG", "BSSEG", "HEAPSEG"];
const normalizeSegment = (name) => String(name || "CSEG").toUpperCase();
const parseExternDecl = (raw, fallbackLabel) => {
    let token = String(raw || fallbackLabel || "").trim()
    if (!token) return {name: "", segment: null}
    let name = token
    let extSegment = null

    const at = token.lastIndexOf("@")
    if (at > 0 && at < token.length - 1) {
        name = token.substring(0, at).trim()
        extSegment = token.substring(at + 1).trim()
    } else {
        const colon = token.indexOf(":")
        if (colon > 0 && colon < token.length - 1) {
            const left = token.substring(0, colon).trim()
            const right = token.substring(colon + 1).trim()
            if (left && right) {
                extSegment = left
                name = right
            }
        }
    }

    if (extSegment) {
        extSegment = normalizeSegment(extSegment.replace(/^\./, ""))
    }

    return {name, segment: extSegment}
}

const sortedSegments = (names) => {
    const uniq = [...new Set(names.map(normalizeSegment))];
    const pref = SEGMENT_ORDER_PREFIX.filter((s) => uniq.includes(s));
    const rest = uniq.filter((s) => !SEGMENT_ORDER_PREFIX.includes(s)).sort();
    return pref.concat(rest);
};

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
    let externSegs = {} // Optional segment hints for extern symbols
    let used = []       // External symbols actually used
    let exports = {}    // Symbols exported from this module
    let debugFiles = Object.entries(opts.debugFiles || {})
        .map(([id, path]) => ({ id: Number(id), path }))
        .filter((file) => Number.isInteger(file.id))
        .sort((a, b) => a.id - b.id)

    // Build symbol-to-segment mapping for relocation.
    // Only include code/data labels, not EQU/SET/= assignments (those are
    // absolute constants and must not have a segment base added during linking).
    let varsSegs = {}
    for (let ln of V) {
        if (ln.label && ln.opcode !== "EQU" && ln.opcode !== "SET" && ln.opcode !== "=") {
            // Map each label to its segment for relocation calculations
            varsSegs[ln.label.toUpperCase()] = normalizeSegment(ln.segment)
        }
    }

    // Track segment lengths for linker
    let seglen = {}
    const ensureSeglen = (name) => {
        const seg = normalizeSegment(name)
        if (typeof seglen[seg] === "undefined") seglen[seg] = 0
        return seg
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
            segment: normalizeSegment(ln.segment),  // Segment where instruction resides
        }
        ensureSeglen(op.segment)
        if (ln.loc) {
            op.dbg = [{
                off: 0,
                fileId: ln.loc.fileId,
                line: ln.loc.line,
                ...(ln.loc.comment ? { comment: ln.loc.comment } : {}),
            }]
        }



        let opcode = ln.opcode
        
        // Handle external symbol declarations
        if (opcode==".EXTERN") {
            // Declare external symbol that must be resolved by linker
            let raw = ln.params[0];
            if (!raw) raw = ln.label
            const decl = parseExternDecl(raw, ln.label)
            if (decl.name) {
                const upperName = decl.name.toUpperCase()
                externs.push(upperName)
                if (decl.segment) {
                    externSegs[upperName] = decl.segment
                }
            }
        }
        
        // Handle symbol exports
        if (opcode==".EXPORT") {
            // Export symbol for use by other modules
            let name = ln.params[0];
            name = name.toUpperCase()
            exports[name] = {addr:vars[name],seg:varsSegs[name]}
        }

        // Handle BSS segment (uninitialized data - no bytes generated)
        if (op.segment=="BSSEG") {
            seglen.BSSEG += ln.bytes || 0  // Track space reservation only
            continue
        }

        // Skip instructions that don't generate bytes
        if (!ln.lens || !ln.lens.length) continue;

        // Update segment length with generated bytes
        seglen[op.segment] += ln.lens.length

        // Process symbol references for relocation.
        // Skip instructions with register-only operands (PSHS, EXG, etc.) — they have no
        // relocatable address field even if a register name shadows a symbol in some segment.
        if (ln.usage && ln.usage.length && !ln.noReloc) {
            let usage = ln.usage
            for (let u of usage) {
                if (externs.indexOf(u) < 0) {
                    if (!ln.isRelJump) {
                        const seg = varsSegs[u]
                        if (seg !== undefined) {
                            // Internal address in a relocatable segment - needs relocation
                            op.rel = true
                            op.relseg = seg
                        }
                        // EQU/absolute constants (not in varsSegs) need no relocation
                    }
                    // Internal relative jump: displacement already baked in by pass2 lambda
                } else {
                    // External symbol - needs linker resolution
                    op.ext=u
                    used.push(u)
                }
            }
            op.wia = ln.wia ?? 0  // Position of address in instruction (data directives like DW default to 0)
            if (ln.isRelJump) {
                op.isRelJump = true
            } else {
                // Extract current address value for absolute relocation.
                // Use op.wia (with ?? 0 applied) because ln.wia may be undefined
                // for data directives (DW/DB) that don't set wia during pass1/pass2.
                op.add = get16({lens: ln.lens, wia: op.wia}, opts.endian)
            }
        }

        // Optimization: concatenate consecutive pure code instructions
        if (typeof op.rel=="undefined" && typeof op.ext=="undefined" && lastOne && lastOne.segment==op.segment) {
            // Merge with previous instruction if both are pure code in same segment
            let baseOff = lastOne.lens.length
            lastOne.lens = lastOne.lens.concat(op.lens)
            if (op.dbg && op.dbg.length) {
                if (!lastOne.dbg) lastOne.dbg = []
                lastOne.dbg = lastOne.dbg.concat(op.dbg.map((dbg) => ({
                    ...dbg,
                    off: dbg.off + baseOff,
                })))
            }
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
    let result = {
        code:out,                      // Generated object code instructions
        externs:used,                  // External symbols referenced
        externSegs:externSegs,         // Optional segment hints for external symbols
        exports:exports,               // Symbols exported by this module
        cpu:opts.assembler.cpu,        // Target CPU architecture
        endian:opts.assembler.endian,  // Byte order for multi-byte values
        name: moduleName,              // Module identifier
        seglen: seglen,                // Length of each segment
    }
    if (debugFiles.length) {
        result.debug = { files: debugFiles }
    }
    return result
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
    const baseBySegment = st.segBase
    const addrBySegment = st.segAddr
    const moduleBaseBySegment = {}
    for (let seg in mod.seglen) {
        const norm = normalizeSegment(seg)
        if (typeof addrBySegment[norm] === "undefined") {
            throw {msg:"Unknown segment "+norm}
        }
        moduleBaseBySegment[norm] = addrBySegment[norm]
    }
    //resolve vars
    for (let k in mod.exports) {
        let v = {...mod.exports[k]}
        if (typeof st.resolves[k] == "undefined") {
            throw {msg:"Variable "+k+" is not resolved"}
        }
        if (v.seg) {
            const seg = normalizeSegment(v.seg)
            if (typeof moduleBaseBySegment[seg] === "undefined") {
                throw {msg:"Unknown segment "+seg}
            }
            v.seg = seg
            // Exported addresses are module-relative; convert to absolute by
            // adding the module's actual placement start within the segment.
            v.addr += moduleBaseBySegment[seg]
        }
        st.resolves[k] = v
        //remove K from notresolved
        st.notresolved = st.notresolved.filter((item) => item !== k)
    }
    for (let s of mod.code) {
        const seg = normalizeSegment(s.segment)
        if (typeof addrBySegment[seg] === "undefined") {
            throw {msg:"Unknown segment "+seg}
        }
        s.segment = seg
        let addr = addrBySegment[seg]
        s.addr = addr
        //new address in the given segment
        addr += s.lens.length
        addrBySegment[seg] = addr
        //local relocs
        if (s.rel) {
            const relseg = normalizeSegment(s.relseg)
            if (typeof moduleBaseBySegment[relseg] === "undefined") {
                throw {msg:"Unknown relocation segment "+relseg}
            }
            s.relseg = relseg
            // Internal relocations are module-relative and must use the module
            // placement in the referenced segment (not only segment base).
            s.base = moduleBaseBySegment[relseg]
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
    let debugFiles = new Map()
    let resolves = {}
    let notresolved=[]
    for (let v in (data.vars || {})) {
        let val = parseInt(data.vars[v])
        resolves[v.toUpperCase()] = {addr:val,seg:null}
    }
    //console.log("PASS1: Resolves init: ", resolves)

    //resolve references
    const externSegmentHint = (mod, name) => {
        if (!mod.externSegs) return null
        const hint = mod.externSegs[name]
        if (!hint) return null
        return normalizeSegment(hint)
    }
    const validateExternHint = (mod, name) => {
        const hinted = externSegmentHint(mod, name)
        if (!hinted) return
        const resolved = resolves[name]
        if (!resolved || !resolved.seg) return
        if (normalizeSegment(resolved.seg) !== hinted) {
            throw {msg:`External ${name} expected in ${hinted}, but resolved in ${normalizeSegment(resolved.seg)}`}
        }
    }
    const resolveModule = (mod) => {
        //module needs to be resolved
        for (let k of mod.externs) {
            if (resolves[k]) {
                validateExternHint(mod, k)
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
            const exported = {...mod.exports[k]}
            if (exported.seg) exported.seg = normalizeSegment(exported.seg)
            resolves[k] = exported
            notresolved = notresolved.filter((item) => item !== k)
        }
        
    }

    for (let mod of modules) {
        //take each module and check externs/exports
        resolveModule(mod)
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

    for (let mod of modules) {
        for (let k of (mod.externs || [])) {
            validateExternHint(mod, k)
        }
    }

    //all modules are resolved now
    //console.log("PASS1: Resolved: ", resolves, notresolved)
    //console.log("PASS1: Modules: ", modules.map(q=>q.name))

    let seglen = {}
    const ensureSeglen = (name) => {
        const seg = normalizeSegment(name)
        if (typeof seglen[seg] === "undefined") seglen[seg] = 0
        return seg
    }

    //How long are the segments?
    for (let mod of modules) {
        for (let s in mod.seglen) {
            const seg = ensureSeglen(s)
            seglen[seg] += mod.seglen[s]
        }
    }
    const explicitSegments = Object.keys(data.segments || {}).map(normalizeSegment)
    for (let s of explicitSegments) ensureSeglen(s)

    const segOrder = sortedSegments(Object.keys(seglen))
    const rawSegments = data.segments || {}
    const explicitBaseBySegment = {}
    for (let k in rawSegments) {
        const seg = normalizeSegment(k)
        if (typeof explicitBaseBySegment[seg] !== "undefined") {
            throw {msg:"Duplicate segment base for "+seg}
        }
        explicitBaseBySegment[seg] = parseInt(rawSegments[k])
    }
    //console.log("PASS1: Seglen: ", seglen)

    const segBase = {}
    let nextAddr = 0
    for (let seg of segOrder) {
        if (typeof explicitBaseBySegment[seg] !== "undefined") {
            segBase[seg] = explicitBaseBySegment[seg]
            nextAddr = segBase[seg] + seglen[seg]
        } else {
            segBase[seg] = nextAddr
            nextAddr += seglen[seg]
        }
    }
    const segAddr = {...segBase}

    /*
    //drop all, do it again then
    notresolved=[]
    resolves = {}
    for (let v in data.vars) {
        let val = parseInt(data.vars[v])
        resolves[v] = {addr:val,seg:null}
    }
    */
    let state = {segBase, segAddr, resolves, notresolved, library}

    //add all modules we have specified in link recipe
    for (let mod of modules) {
        if (mod.debug && mod.debug.files && mod.debug.files.length) {
            for (let file of mod.debug.files) {
                if (!Number.isInteger(file.id)) continue
                if (!debugFiles.has(file.id)) {
                    debugFiles.set(file.id, file.path)
                }
            }
        }
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
            if (s.isRelJump && s.resolved !== undefined) {
                // Relative jump to external symbol: compute displacement from final addresses
                let disp = s.resolved - (s.addr + s.lens.length)
                if (s.lens.length - s.wia >= 2) {
                    // 16-bit relative offset (e.g. 6809 long branches)
                    if (disp > 32767 || disp < -32768) throw {msg: "Relative jump out of range"}
                    const n = disp < 0 ? 65536 + disp : disp
                    s.lens[s.wia] = n >> 8
                    s.lens[s.wia + 1] = n & 0xFF
                } else {
                    // 8-bit relative offset
                    if (disp > 127 || disp < -128) throw {msg: "Relative jump out of range"}
                    s.lens[s.wia] = disp < 0 ? 256 + disp : disp
                }
                delete s.resolved
            }
        }
        for (let s of out) {
            if (s.resolved !== undefined) {
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
            delete s.isRelJump
            delete s.ext
            delete s.add
            delete s.wia
            delete s.base
            delete s.resolved
        }

        out.sort((a,b) => a.addr-b.addr)

    let lineStarts = []
    for (let s of out) {
        if (!s.dbg || !s.dbg.length) continue
        lineStarts = lineStarts.concat(s.dbg.map((dbg) => ({
            addr: s.addr + dbg.off,
            fileId: dbg.fileId,
            line: dbg.line,
            ...(dbg.comment ? { comment: dbg.comment } : {}),
        })))
    }
    lineStarts.sort((a, b) => a.addr - b.addr)

    let result = {
        //notresolved, 
        CSEG: segBase.CSEG ?? 0,
        DSEG: segBase.DSEG ?? 0,
        ESEG: segBase.ESEG ?? 0,
        BSSEG: segBase.BSSEG ?? 0,
        seglen,
        segments: segBase,
        entry:resolves[entrypoint],
        dump:out, 

    }
    result.debug = {
        files: [...debugFiles.entries()].map(([id, path]) => ({ id, path })).sort((a, b) => a.id - b.id),
        lineStarts,
    }

    return result

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
