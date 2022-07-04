const YAML = require("js-yaml");
const fs = require("fs");
const path = require("path");
module.exports = class Configuration extends Map {
    constructor() {
        super()
        this._init()
    }
    
    _init() {
        fs.readdirSync("./configs")
            .filter(element => !fs.lstatSync(`./configs/${element}`).isDirectory() && element.endsWith(".yml"))
            .forEach((file) => {
                this.set(file.replace(".yml", ""), YAML.load(fs.readFileSync(`./configs/${file}`, "utf-8")))
            })
        fs.readdirSync("./configs/commands")
            .filter(element => !fs.lstatSync(`./configs/commands/${element}`).isDirectory() && element.endsWith(".yml"))
            .forEach((file) => {
                this.set(`cmd_${file.replace(".yml", "")}`, YAML.load(fs.readFileSync(`./configs/commands/${file}`, "utf-8")))
            })
        fs.readdirSync("./configs/plugins")
            .filter(element => !fs.lstatSync(`./configs/plugins/${element}`).isDirectory() && element.endsWith(".yml"))
            .forEach((file) => {
                this.set(`plugin_${file.replace(".yml", "")}`, YAML.load(fs.readFileSync(`./configs/plugins/${file}`, "utf-8")))
            })
    }

    deleteP(name, type) {
        if(type === "plugin") {
            let file = this.get(`plugin_${name}`)
            if(!file) return;
            this.delete(`plugin_${name}`)
            fs.unlinkSync(`./configs/plugins/${name}.yml`)
        }
        if(type === "command") {
            let file = this.get(`cmd_${name}`)
            if(!file) return;
            this.delete(`cmd_${name}`)
            fs.unlinkSync(`./configs/commands/${name}.yml`)
        }
    }

    read(fileName, type, encoding, options, callback) {
        if (fileName.includes("/")) return callback(new Error("Invalid fileName"));
        let filePath = path.join(__dirname, `../../configs/` + fileName + ".yml");
        if (type === "plugin") filePath = path.join(__dirname, `../../configs/plugins/` + fileName + ".yml");
        if (type === "command") filePath = path.join(__dirname, `../../configs/commands/` + fileName + ".yml");
        if (!fs.existsSync(filePath)) return callback(new Error("File not found"));
        fs.readFile(filePath, encoding, (err, data) => {
            if (err) return callback(err);
            try {
                callback(null, YAML.load(data, options));
            } catch (error) {
                return callback(error);
            }
        });
    }

    write(fileName, data, type, encoding, options, callback) {
        if (fileName.includes("/")) return callback(new Error("Invalid fileName"));
        let filePath = path.join(__dirname, `../../configs/` + fileName + ".yml");
        if (type === "plugin") filePath = path.join(__dirname, `../../configs/plugins/` + fileName + ".yml");
        if (type === "command") filePath = path.join(__dirname, `../../configs/commands/` + fileName + ".yml");
        fs.writeFile(filePath, YAML.dump(data, options), encoding, (err) => {
            if (err) return callback(err);
            callback(null);
        });
    }
    readSync(fileName, type, encoding) {
        if (fileName.includes("/")) throw new Error("Invalid fileName");
        let filePath = path.join(__dirname, `../../configs/` + fileName + ".yml");
        if (type === "plugin") filePath = path.join(__dirname, `../../configs/plugins/` + fileName + ".yml");
        if (type === "command") filePath = path.join(__dirname, `../../configs/commands/` + fileName + ".yml");
        if (!fs.existsSync(filePath)) return
        return YAML.load(fs.readFileSync(filePath, encoding));

    }
    writeSync(fileName, data, type, encoding, options) {
        if (fileName.includes("/")) throw new Error("Invalid fileName");
        let filePath = path.join(__dirname, `../../configs/` + fileName + ".yml");
        if (type === "plugin") filePath = path.join(__dirname, `../../configs/plugins/` + fileName + ".yml");
        if (type === "command") filePath = path.join(__dirname, `../../configs/commands/` + fileName + ".yml");
        fs.writeFileSync(filePath, YAML.dump(data, options), encoding);
    }

    existsSync(fileName, type) {
        if (fileName.includes("/")) throw new Error("Invalid fileName");
        let filePath = path.join(__dirname, `../../configs/` + fileName + ".yml");
        if (type === "plugin") filePath = path.join(__dirname, `../../configs/plugins/` + fileName + ".yml");
        if (type === "command") filePath = path.join(__dirname, `../../configs/commands/` + fileName + ".yml");
        if (!fs.existsSync(filePath)) return false
        return true
    }
}