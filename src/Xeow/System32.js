const fs = require("fs");
const yml = require("js-yaml");
const path = require("path");

module.exports = class System32 {
    #modules
    constructor() {
        this.name = "System32";
        this.description = "System32";
        this.version = "1.0.0";
        this.author = "Xeow";
        this.#modules = {};
        const dependencies = require("../../package.json").dependencies;
        for (const dep of Object.keys(dependencies)) {
            this.#modules[`Xeow.Modules.${dep}`] = require(dep);
        }
        const Libraries = fs.readdirSync(path.join(__dirname, "../../libs")).filter(file => file.endsWith(".js")).map(lib => require(`../../libs/${lib}`));
        for (const lib of Libraries) {
            this.#modules[`Xeow.System32.${lib.name}`] = lib.main;
        }
    }

    setVariable(key, variables) {
        if (this[key]) { throw new Error("Key already exists"); }
        this[key] = variables;
    }

    get(module) {
        if (module.startsWith("Xeow.Configs.")) { return this.getConfig(module.replace("Xeow.Configs.", "")); }
        if (!this.#modules[module]) { throw new Error(`Module ${module} not found`); }
        return this.#modules[module];
    }

    getConfig(config) {
        if (config.includes(".")) { config = config.replace(".", "/") }
        if (!fs.existsSync(path.join(__dirname, `../../configs/${config}.yml`))) {
            throw new Error(`Xeow.Configs.${config.replaceAll("/", ".")} not found`);
        }
        let res = null
        try {
            res = yml.load(fs.readFileSync(path.join(__dirname, `../../configs/${config}.yml`), "utf-8"));
        } catch (error) {
            throw new Error(`Xeow.Configs.${config.replaceAll("/", ".")} is not a valid yaml file`);
        }
        return res
    }

    getModule(module) {
        if (!this.#modules[`Xeow.Modules.${module}`]) { throw new Error(`Module ${module} not found`); }
        return this.#modules[`Xeow.Modules.${module}`];
    }

    getLib(lib) {
        if (!this.#modules[`Xeow.System32.${lib}`]) { throw new Error(`Library ${lib} not found`); }
        return this.#modules[`Xeow.System32.${lib}`];
    }


}