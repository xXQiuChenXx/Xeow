const fs = require('fs')
module.exports = class {
    #path;
    #file

    constructor(bot, plugin) {
        this.#path = require('path').resolve(__dirname, '../../../../plugins/' + plugin)
    }

    write(file, content, BufferEncoding) {
        if (!file || !content) return
        if (!fs.existsSync(this.#path)) {
            fs.mkdirSync(this.#path)
        }
        this.#file = require('path').resolve(this.#path, file)
        this.content = content
        fs.writeFileSync(this.#file, content, BufferEncoding)
    }

    read(file, BufferEncoding) {
        if(!file) return
        let PATH = require('path').resolve(this.#path, file)
        if(!fs.existsSync(PATH)) return
        return fs.readFileSync(PATH, BufferEncoding)
    }

    get(BufferEncoding) {
        if(encoding){
            this.content = fs.readFileSync(this.#file, BufferEncoding)
            return this.content
        } else {
            this.content = fs.readFileSync(this.#file, 'utf-8')
            return this.content
        }
    }

    cache() {
        return this.content
    }
}