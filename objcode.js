const get16 = (s, endian=false) => {
    let a = s.lens[s.wia]
    let b = s.lens[s.wia+1]
    if (endian) {
        return (a<<8)|b
    } else {
        return (b<<8)|a
    }
}
const put16 = (s, v, endian=false) => {
    let a = v&0xff
    let b = (v>>8)&0xff
    if (endian) {
        s.lens[1] = b
        s.lens[2] = a
    } else {
        s.lens[1] = a
        s.lens[2] = b
    }
}
export const objCode = (V, vars, opts) => {
    let out = []
    let externs = []
    let used = []
    let exports = {}

    let varsSegs = {}
    for (let ln of V) {
        if (ln.label) {
            varsSegs[ln.label.toUpperCase()] = ln.segment
        }
    }

    for (let ln of V) {
        if (!ln.opcode) {
            continue
        }

        let op = {
            lens: ln.lens,
            segment: ln.segment,
        }

        let opcode = ln.opcode
        if (opcode==".EXTERN") {
            //must resolve the address
            let name = ln.params[0];
            if (!name) name = ln.label
            externs.push(name.toUpperCase())
        }
        if (opcode==".EXPORT") {
            //must export this var
            let name = ln.params[0];
            if (!name) name = ln.label
            name = name.toUpperCase()
            exports[name] = {addr:vars[name],seg:varsSegs[name]}
        }

        if (!ln.lens || !ln.lens.length) continue;

        //is there some variables used?
        if (ln.usage && ln.usage.length) {
            //op.dirty = true;
            let usage = ln.usage
            for (let u of usage) {
                if (externs.indexOf(u) < 0) {
                    //internal variable
                    op.rel=true
                    op.relseg = varsSegs[u]
                } else {
                    op.ext=u
                    used.push(u)
                }
            }
            op.add = get16(ln, opts.endian)

        }

        out.push(op)
    }

    return {code:out,externs:used, exports:exports}
}

const findInLibrary = (name, library) => {
    for (let i=0; i<library.length; i++) {
        let mod = library[i]
        let exports = Object.keys(mod.exports)
        if (exports.indexOf(name) >= 0) {
            return i
        }
    }
    return null
}

const addModule = (mod, st, out) => {
    //module processor
    let cbase = st.caddr
    let dbase = st.daddr
    let ebase = st.eaddr
    let bsbase = st.bsaddr
    //resolve vars
    for (let k in mod.exports) {
        let v = mod.exports[k]
        if (typeof st.resolves[k] != "undefined") {
            throw new Error("Variable "+k+" is already defined")
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
        if (s.ext) {
            if (!st.resolves[s.ext]) {
                //we need to resolve this external
                console.log("Not resolved yet: "+s.ext)
                st.notresolved.push(s.ext)
            }
        }
        out.push(s)       
    }
    return st
}



export const linkModules = (data, modules, library) => {
    let CSEG = data.segments.CSEG?parseInt(data.segments.CSEG):0
    let DSEG = data.segments.DSEG?parseInt(data.segments.DSEG):0
    let ESEG = data.segments.ESEG?parseInt(data.segments.ESEG):0
    let BSSEG = data.segments.BSSEG?parseInt(data.segments.BSSEG):0
    let caddr = CSEG
    let daddr = DSEG
    let eaddr = ESEG
    let bsaddr = BSSEG

    let entrypoint = data.entrypoint?data.entrypoint.toUpperCase():"_MAIN"

    let out = []
    let resolves = {}
    let notresolved=[]
    for (let v in data.vars) {
        let val = parseInt(data.vars[v])
        resolves[v] = {addr:val,seg:null}
    }
    let state = {caddr,daddr,eaddr,bsaddr, resolves, notresolved, library}

    for (let mod of modules) {
        state = addModule(mod, state, out)
/*        
        //module processor
        let cbase = caddr
        let dbase = daddr
        let ebase = eaddr
        let bsbase = bsaddr

        //resolve vars
        for (let k in mod.exports) {
            let v = mod.exports[k]
            if (typeof resolves[k] != "undefined") {
                throw new Error("Variable "+k+" is already defined")
            }
            if (v.seg=="CSEG") v.addr += caddr
            else if (v.seg=="DSEG") v.addr += daddr
            else if (v.seg=="ESEG") v.addr += eaddr
            else if (v.seg=="BSSEG") v.addr += bsaddr
            resolves[k] = v
        }
        for (let s of mod.code) {
            let addr = caddr
            if (s.segment=="DSEG") addr = daddr
            else if (s.segment=="ESEG") addr = eaddr
            else if (s.segment=="BSSEG") addr = bsaddr
            s.addr = addr

            //new address in the given segment
            addr += s.lens.length
            if (s.segment=="CSEG") caddr = addr
            else if (s.segment=="DSEG") daddr = addr
            else if (s.segment=="ESEG") eaddr = addr
            else if (s.segment=="BSSEG") bsaddr = addr

            //local relocs
            if (s.rel) {
                if (s.relseg=="CSEG") s.base = cbase
                else if (s.relseg=="DSEG") s.base = dbase
                else if (s.relseg=="ESEG") s.base = ebase
                else if (s.relseg=="BSSEG") s.base = bsbase
            }

            if (s.ext) {
                if (!resolves[s.ext]) {
                    //we need to resolve this external
                    console.log("Not resolved yet: "+s.ext)
                }
            }

            out.push(s)       

        }
*/
    }
    console.log("Not resolved: ", state.notresolved)
    while (state.notresolved.length) {
        let name = state.notresolved.pop()
        let mod = findInLibrary(name, library)
        console.log("Resolving "+name, mod)
        if (mod) {
            state = addModule(library[mod], state, out)
        } else {
            throw new Error("Unresolved external "+name)
        }
    }


        //resolves
        for (let s of out) {
            if (s.ext) {
                if (resolves[s.ext]) {
                    s.resolved = resolves[s.ext].addr
                } else {
                    throw new Error("Unresolved external "+s.ext)
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



    return {code:out, notresolved, entry:resolves[entrypoint]}
}