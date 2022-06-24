const YAML = require("js-yaml");
const fs = require("fs");
const path = require("path");
module.exports = class Configuration {
    constructor() {

    }

    readConfig(fileName, type, encoding, options, callback) {
        if(fileName.includes("/")) return callback(new Error("Invalid fileName"));
        let filePath = path.join(__dirname, `../../configs/` + fileName + ".yml");
        if(type === "plugin") filePath = path.join(__dirname, `../../configs/plugins/` + fileName + ".yml");
        if(type === "command") filePath = path.join(__dirname, `../../configs/commands/` + fileName + ".yml");
        if(!fs.existsSync(filePath)) return callback(new Error("File not found"));
        fs.readFile(filePath, encoding, (err, data) => {
            if(err) return callback(err);
            try {
                callback(null, YAML.load(data, options));
            } catch (error) {
                return callback(error);
            }
        });
    }

    writeConfig(fileName, data, type, encoding, options, callback) {
        if(fileName.includes("/")) return callback(new Error("Invalid fileName"));
        let filePath = path.join(__dirname, `../../configs/` + fileName + ".yml");
        if(type === "plugin") filePath = path.join(__dirname, `../../configs/plugins/` + fileName + ".yml");
        if(type === "command") filePath = path.join(__dirname, `../../configs/commands/` + fileName + ".yml");
        if(!fs.existsSync(filePath)) return callback(new Error("File not found"));
        fs.writeFile(filePath, YAML.dump(data, options), encoding, (err) => {
            if(err) return callback(err);
            callback(null);
        });
    }
    readConfigSync(fileName, type, encoding) {
        if(fileName.includes("/")) throw new Error("Invalid fileName");
        let filePath = path.join(__dirname, `../../configs/` + fileName + ".yml");
        if(type === "plugin") filePath = path.join(__dirname, `../../configs/plugins/` + fileName + ".yml");
        if(type === "command") filePath = path.join(__dirname, `../../configs/commands/` + fileName + ".yml");
        if(!fs.existsSync(filePath)) return
        return YAML.load(fs.readFileSync(filePath, encoding));

    }
    writeConfigSync(fileName, data, type, encoding) {
        if(fileName.includes("/")) throw new Error("Invalid fileName");
        let filePath = path.join(__dirname, `../../configs/` + fileName + ".yml");
        if(type === "plugin") filePath = path.join(__dirname, `../../configs/plugins/` + fileName + ".yml");
        if(type === "command") filePath = path.join(__dirname, `../../configs/commands/` + fileName + ".yml");
        if(!fs.existsSync(filePath)) return
        fs.writeFileSync(filePath, YAML.dump(data, options), encoding);
    }
}