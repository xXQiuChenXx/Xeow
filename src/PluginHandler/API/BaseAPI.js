const Logger = require("../../system/logger")
const CLI = require("./CLI")
const cmd = require("./command")
const config = require("./config")
const db = require("./database")
const event = require("./event")
const extractor = require("./extractor")
module.exports = class API {
    #bot;
    constructor(bot, permissions, plugin) {
        this.#bot = bot
        this.version = '2.2.1'
        this.compatible = ['2.0.0', '2.1.0', '2.2.0', '2.2.1']

        if (permissions && permissions.length !== 0) {
            if (permissions.includes('CLI_ACCESS')) this.CLI = new CLI(bot)
            if (permissions.includes('COMMAND_ACCESS')) this.commands = new cmd(bot)
            if (permissions.includes('EVENT_ACCESS')) this.event = new event(bot)
            if (permissions.includes('DB_ACCESS')) this.db = db
            if (permissions.includes('CONFIG_ACCESS')) this.config = new config(bot, plugin)
            if (permissions.includes('BOT_ACCESS')) this.bot = bot
            if( permissions.includes('EXTRACTOR_ACCESS')) this.extractor = new extractor(bot)
        }
    }

    getLoggerInstance(name) {
        return new Logger(name, 0, [], 0)
    }
}