// simple dummy test filesystem

import {promises as fs} from "fs";

export const fileSystem = {
    fileGet: async (name) => {
        //console.log("FILEGET",name, process.cwd(), fs.readFileSync("./test/suite/"+name, "utf-8"))
        return fs.readFile("./test/suite/"+name, "utf-8")
    },
    filePut: async (name, data) => {
        return fs.writeFile("./test/suite/"+name, data)
    },
    fileExists: async (name) => {
        return fs.exists("./test/suite/"+name)
    },
    fileDelete: async (name) => {
        return fs.unlink("./test/suite/"+name)
    },
    fileRename: async (name, newName) => {
        return fs.rename("./test/suite/"+name, newName)
    },
    fileCopy: async (name, newName) => {
        return fs.copyFile("./test/suite/"+name, newName)
    },
    fileStat: async (name) => {
        return fs.stat("./test/suite/"+name)
    },
    fileMkdir: async (name) => {
        return fs.mkdir("./test/suite/"+name)
    },
    fileRmdir: async (name) => {
        return fs.rmdir("./test/suite/"+name)
    },
    fileReaddir: async (name) => {
        return fs.readdir("./test/suite/"+name)
    },
    fileChanged: async (name) => {
        let mtime = await fs.stat("./test/suite/"+name).mtime
        return new Date().getTime(mtime)
    }
}

