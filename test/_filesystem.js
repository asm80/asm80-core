// simple dummy test filesystem

import fs from "fs";

export const fileSystem = {
    fileGet: (name) => {
        //console.log("FILEGET",name, process.cwd(), fs.readFileSync("./test/suite/"+name, "utf-8"))
        return fs.readFileSync("./test/suite/"+name, "utf-8")
    },
    filePut: (name, data) => {
        return fs.writeFileSync("./test/suite/"+name, data)
    },
    fileExists: (name) => {
        return fs.existsSync("./test/suite/"+name)
    },
    fileDelete: (name) => {
        return fs.unlinkSync("./test/suite/"+name)
    },
    fileRename: (name, newName) => {
        return fs.renameSync("./test/suite/"+name, newName)
    },
    fileCopy: (name, newName) => {
        return fs.copyFileSync("./test/suite/"+name, newName)
    },
    fileStat: (name) => {
        return fs.statSync("./test/suite/"+name)
    },
    fileMkdir: (name) => {
        return fs.mkdirSync("./test/suite/"+name)
    },
    fileRmdir: (name) => {
        return fs.rmdirSync("./test/suite/"+name)
    },
    fileReaddir: (name) => {
        return fs.readdirSync("./test/suite/"+name)
    },
    fileChanged: (name) => {
        return fs.statSync("./test/suite/"+name).mtime
    }
}

