const YAML = require("js-yaml");
const fs = require("fs");
const path = require("path");
module.exports = class Configuration {
    constructor() {

    }
    readConfig(fileName, isPlugin, encoding, options, callback) {
        if(fileName.includes("/")) return callback(new Error("Invalid fileName"));
        let filePath = path.join(__dirname, `../../configs/` + (isPlugin === true ? "plugins/" : "") + fileName + ".yml");
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

    writeConfig(fileName, data, isPlugin, encoding, options, callback) {
        if(fileName.includes("/")) return callback(new Error("Invalid fileName"));
        let filePath = path.join(__dirname, `../../configs/` + (isPlugin === true ? "plugins/" : "") + fileName + ".yml");
        if(!fs.existsSync(filePath)) return callback(new Error("File not found"));
        fs.writeFile(filePath, YAML.dump(data, options), encoding, (err) => {
            if(err) return callback(err);
            callback(null);
        });
    }
    readConfigSync(fileName, isPlugin, encoding) {
        if(fileName.includes("/")) throw new Error("Invalid fileName");
        let filePath = path.join(__dirname, `../../configs/` + (isPlugin === true ? "plugins/" : "") + fileName + ".yml");
        if(!fs.existsSync(filePath)) throw new Error("File not found");
        return YAML.load(fs.readFileSync(filePath, encoding));

    }
    writeConfigSync(fileName, data, isPlugin, encoding) {
        if(fileName.includes("/")) throw new Error("Invalid fileName");
        let filePath = path.join(__dirname, `../../configs/` + (isPlugin === true ? "plugins/" : "") + fileName + ".yml");
        if(!fs.existsSync(filePath)) throw new Error("File not found");
        fs.writeFileSync(filePath, YAML.dump(data, options), encoding);
    }
}