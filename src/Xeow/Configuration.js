const YAML = require("js-yaml");
const fs = require("fs");
const path = require("path");
module.exports = class Configuration {
    constructor() {
        this.cache = new Map()
    }

    get(locate) {
        const filePath = path.join(__dirname, "../../configs", locate)
        let file = this.cache.get(filePath)
        if (!this.existsSync(locate)) return null
        if (!file) {
            let content = this.readSync(locate)
            this.cache.set(filePath, content)
            return content
        } else {
            return file
        }
    }

    existsSync(locate) {
        const filePath = path.join(__dirname, "../../configs", locate)
        if (fs.existsSync(filePath)) return true
        else return false
    }

    reload(locate) {
        if(!locate) this.cache.clear()
        if(locate) this.cache.delete(path.join(__dirname, "../../configs", locate))
    }

    delete(locate) {
        const filePath = path.join(__dirname, "../../configs", locate)
        let file = this.cache.get(filePath)
        if (file) this.cache.delete(filePath)
        fs.unlinkSync(filePath)
    }

    read(locate, encoding, options, callback) {
        const filePath = path.join(__dirname, "../../configs", locate)
        if (!fs.existsSync(filePath)) return callback(new Error("File not found"));
        fs.readFile(filePath, encoding, (err, data) => {
            if (err) return callback(err);
            try {
                let content = YAML.load(data, options)
                callback(null, content);
            } catch (error) {
                return callback(error);
            }
        });
    }

    write(locate, data, encoding, options, callback) {
        const filePath = path.join(__dirname, "../../configs", locate)
        let args = locate.split("/")
        let dir = args.slice(0, args.length - 1).join("/")
        const fileDir = path.join(__dirname, "../../configs", dir)
        if (!fs.existsSync(fileDir)) fs.mkdirSync(fileDir)
        fs.writeFile(filePath, YAML.dump(data, options), encoding, (err) => {
            if (err) return callback(err);
            this.cache.set(filePath, data)
            callback(null);
        });
    }

    readSync(locate, encoding = "utf-8") {
        const filePath = path.join(__dirname, "../../configs", locate)
        if (!fs.existsSync(filePath)) return
        return YAML.load(fs.readFileSync(filePath, encoding));
    }

    writeSync(locate, data, encoding = "utf-8", options) {
        const filePath = path.join(__dirname, "../../configs", locate)
        let args = locate.split("/")
        let dir = args.slice(0, args.length - 1).join("/")
        const fileDir = path.join(__dirname, "../../configs", dir)
        if (!fs.existsSync(fileDir)) fs.mkdirSync(fileDir)
        if(typeof data === "object") fs.writeFileSync(filePath, YAML.dump(data, options), encoding);
            else fs.writeFileSync(filePath, data, encoding);
    }
}