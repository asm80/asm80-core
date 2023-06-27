export const DUMMY = {


    parseOpcode: function (s, vars, Parser) {
        s.lens=[]
        if (!s.opcode) return s
        if (s.opcode=="NOP") { return {bytes:1, lens:[0x00]}; }
        //console.log(s.opcode,s.params)
        let p1 = s.params[0]+''; // convert to string
        if (s.opcode=="P1") { 
            s.lens[0] = 1
            s.lens[1] = function(vars){return Parser.evaluate(p1,vars);};
            s.bytes = 2;
    
            return s; }
        if (s.opcode=="P2") { 
            s.lens[0] = 1
            s.lens[1] = function(vars){return Parser.evaluate(p1,vars);};
            s.lens[2] = null
            s.bytes = 3;
            return s; 
        }
        //opcode, offset, addr2
        if (s.opcode=="PA2") { 
            s.lens[0] = 1
            s.lens[1] = 2;
            s.lens[2] = function(vars){return Parser.evaluate(p1,vars);};
            s.lens[3] = null
            s.bytes = 4;
            return s; 
        }
        //opcode, offset, offset, addr2
        if (s.opcode=="PB2") { 
            s.lens[0] = 1
            s.lens[1] = 2;
            s.lens[2] = 3;
            s.lens[3] = function(vars){return Parser.evaluate(p1,vars);};
            s.lens[4] = null
            s.bytes = 5;
            return s; 
        }
        if (s.opcode=="PX2") { 
            s.lens[0] = 1
            s.lens[1] = function(vars){return Parser.evaluate(p1,vars);};
            s.lens[2] = "addr24"
            s.bytes = 4;
            return s; 
        }
        if (s.opcode=="PY2") { 
            s.lens[0] = 1
            s.lens[1] = function(vars){return Parser.evaluate(p1,vars);};
            s.lens[2] = "addr32"
            s.bytes = 4;
            return s; 
        }


    }
}

export const DUMMYE = {...DUMMY, endian:true}