const cmd = require("./command")
// const extractor = require("./extractor")
module.exports = class API {
    #Logger;
    constructor(Xeow, permissions, plugin) {
        const bot = Xeow.bot
        this.version = '1.0.0'
        this.#Logger = Xeow.Libraries.Logger
        this.compatible = ['2.0.0', '2.1.0', '2.2.0', '2.2.1']

        if (permissions && permissions.length !== 0) {
            if (permissions.includes('CLI_ACCESS')) this.CLI = Xeow.CLI
            if (permissions.includes('COMMAND_ACCESS')) this.commands = new cmd(bot)
            if (permissions.includes('EVENT_ACCESS')) this.event = Xeow.EventManager
            if (permissions.includes('DB_ACCESS')) this.db = Xeow.DBManager;
            if (permissions.includes('CONFIG_ACCESS')) this.config = Xeow.Configuration
            if (permissions.includes('BOT_ACCESS')) this.bot = Xeow.bot;
            //if( permissions.includes('EXTRACTOR_ACCESS')) this.extractor = new extractor(bot);
        }
    }

    getLoggerInstance(name) {
        return new this.#Logger(name, 0, [], 0)
    }
}