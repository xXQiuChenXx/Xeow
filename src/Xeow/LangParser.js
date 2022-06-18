const YAML = require("js-yaml");
const fs = require("fs");
const path = require("path");
module.exports = class LangParser {
    constructor() {
        this.lang = YAML.load(fs.readFileSync(path.join(__dirname, "../../configs/main.yml"), "utf8")).Lang
        if(!fs.existsSync(path.join(__dirname, `../../language/${this.lang}`))) {
            console.log(`Language "${this.lang}" not found, falling back to en...`);
            this.lang = "en";
        }
    }
    
    readLang(fileName, isPlugin, encoding, options, callback) {
        if(fileName.includes("/")) return callback(new Error("Invalid fileName"));
        let filePath = path.join(__dirname, `../../language/${this.lang}/` + (isPlugin === true ? "plugins/" : "") + fileName + ".yml");
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

    writeLang(fileName, data, isPlugin, encoding, options, callback) {
        if(fileName.includes("/")) return callback(new Error("Invalid fileName"));
        let filePath = path.join(__dirname, `../../language/${this.lang}/` + (isPlugin === true ? "plugins/" : "") + fileName + ".yml");
        if(!fs.existsSync(filePath)) return callback(new Error("File not found"));
        fs.writeFile(filePath, YAML.dump(data, options), encoding, (err) => {
            if(err) return callback(err);
            callback(null);
        });
    }
    readLangSync(fileName, isPlugin, encoding) {
        if(fileName.includes("/")) throw new Error("Invalid fileName");
        let filePath = path.join(__dirname, `../../language/${this.lang}/` + (isPlugin === true ? "plugins/" : "") + fileName + ".yml");
        if(!fs.existsSync(filePath)) throw new Error("File not found");
        return YAML.load(fs.readFileSync(filePath, encoding));
    }

    writeLangSync(fileName, data, isPlugin, encoding) {
        if(fileName.includes("/")) throw new Error("Invalid fileName");
        let filePath = path.join(__dirname, `../../language/${this.lang}` + (isPlugin === true ? "plugins/" : "") + fileName + ".yml");
        if(!fs.existsSync(filePath)) throw new Error("File not found");
        fs.writeFileSync(filePath, YAML.dump(data, options), encoding);
    }
}