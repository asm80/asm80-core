// simple dummy test filesystem

import {promises as fs} from "fs";

export const fileSystem = {
    readFile: async (name) => {
        //console.log("readFile",name, process.cwd(), fs.readFileSync("./test/suite/"+name, "utf-8"))
        return fs.readFile("./test/suite/"+name, "utf-8")
    },
    writeFile: async (name, data) => {
        return fs.writeFile("./test/suite/"+name, data)
    },
    exists: async (name) => {
        return fs.exists("./test/suite/"+name)
    },
    unlink: async (name) => {
        return fs.unlink("./test/suite/"+name)
    },
    rename: async (name, newName) => {
        return fs.rename("./test/suite/"+name, newName)
    },
    copyFile: async (name, newName) => {
        return fs.copyFile("./test/suite/"+name, newName)
    },
    stat: async (name) => {
        return fs.stat("./test/suite/"+name)
    },
    mkdir: async (name) => {
        return fs.mkdir("./test/suite/"+name)
    },
    rmdir: async (name) => {
        return fs.rmdir("./test/suite/"+name)
    },
    readdir: async (name) => {
        return fs.readdir("./test/suite/"+name)
    },
    mtime: async (name) => {
        let mtime = await fs.stat("./test/suite/"+name).mtime
        return new Date().getTime(mtime)
    }
}

