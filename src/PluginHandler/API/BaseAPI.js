const cmd = require("./command")
// const extractor = require("./extractor")
module.exports = class API {
    constructor(Xeow, plugin) {
        let permissions = plugin.permissions
        this.version = '1.0.0'
        this.compatible = ['1.0.0']
        this.translate = Xeow.translate
        this.translations = Xeow.translations
        this.defaultLanguage = Xeow.defaultLanguage

        if (permissions && permissions.length !== 0) {
            permissions = permissions.map(perm => perm.toUpperCase())
            if (permissions.includes('CLI_ACCESS')) this.CLI = Xeow.CLI
            if (permissions.includes('COMMAND_ACCESS')) this.commands = new cmd(Xeow)
            if (permissions.includes('EVENT_ACCESS')) this.EventManager = Xeow.EventManager
            if (permissions.includes('DB_ACCESS')) this.db = Xeow.DBManager;
            if (permissions.includes('CONFIG_ACCESS')) this.Configuration = Xeow.Configuration
            if (permissions.includes("LIBRARY_ACCESS")) this.Libraries = Xeow.Libraries
            if (permissions.includes('FULL_ACCESS')) this.Xeow = Xeow;
            //if( permissions.includes('EXTRACTOR_ACCESS')) this.extractor = new extractor(bot);
        }
        this.getConfig = function(name) {
            return Xeow.Configuration.readSync(`plugins/${plugin.name}/${name}.yml`)
        }
        this.getLogger = Xeow.getLogger
    }
}