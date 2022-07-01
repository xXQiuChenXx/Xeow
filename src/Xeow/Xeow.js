const fs = require("fs");
const path = require("path");
const { Client, Collection, Intents } = require("discord.js");
module.exports = class Xeow extends Client {
    constructor() {
        require("./Extender")
        super({
            intents: [
                Intents.FLAGS.GUILDS,
                Intents.FLAGS.GUILD_MESSAGES,
                Intents.FLAGS.GUILD_PRESENCES,
                Intents.FLAGS.GUILD_INTEGRATIONS,
                Intents.FLAGS.DIRECT_MESSAGES,
                Intents.FLAGS.DIRECT_MESSAGE_TYPING,
                Intents.FLAGS.GUILD_VOICE_STATES,
                Intents.FLAGS.GUILD_WEBHOOKS,
                Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
                Intents.FLAGS.GUILD_INVITES,
                Intents.FLAGS.GUILD_MEMBERS,
                Intents.FLAGS.GUILD_BANS,
                Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
                Intents.FLAGS.GUILD_MESSAGE_REACTIONS
            ],
            autoReconnect: true,
            partials: ["CHANNEL"],
            allowedMentions: {
                parse: ["users"]
            }
        });

        this.categories = fs.readdirSync("./commands")
        this.commands = new Collection(); // Creates new commands collection
        this.aliases = new Collection(); // Creates new command aliases collection
        this.plugins = new Collection(); // Creates new plugin collection
        this.wait = function (ms) {
            return new Promise((resolve) => {
                setTimeout(resolve, ms)
            })
        }

        const dependencies = require("../../package.json").dependencies;
        this.Modules = {};
        Object.keys(dependencies).forEach(key => { this.Modules[key] = require(key); });

        const Libraries = fs.readdirSync(path.join(__dirname, "../../libs")).filter(file => file.endsWith(".js")).map(lib => require(`../../libs/${lib}`));
        this.Libraries = {};
        Libraries.forEach(lib => { this.Libraries[lib.name] = lib.main; });
        this.Libraries["Collection"] = require("discord.js").Collection
        this.Configuration = new (require("./Configuration"))();
        this.PluginManager = new (require("../PluginHandler/PluginLoader"))(this);
    }

    translate(key, args, locale) {
        if(!locale) locale = this.defaultLanguage
        const language = this.translations.get(locale);
        return language(key, args);
    }

    setVariable(key, variables) {
        if (this[key]) { throw new Error("Key already exists"); }
        this[key] = variables;
    }

    getFormattedDate() {
        var date = new Date();
        var hour = date.getHours();
        hour = (hour < 10 ? "0" : "") + hour;
        var min = date.getMinutes();
        min = (min < 10 ? "0" : "") + min;
        var sec = date.getSeconds();
        sec = (sec < 10 ? "0" : "") + sec;
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        month = (month < 10 ? "0" : "") + month;
        var day = date.getDate();
        day = (day < 10 ? "0" : "") + day;
        return day + "-" + month + "-" + year + "-" + hour + "-" + min + "-" + sec
    }

    async init(config) {
        this.translations = await require("./Languages")(config)
        this.defaultLanguage = config.Lang
    }

    async startup(config) {
        console.log("console/main:database:loading")
        this.DBManager = new (require("./DBManager"))(this)
        await this.DBManager.init(config);
        await this.DBManager.validate();

        this.CLI = new (require("./CLI"))(this);

        console.log("console/main:event:preparing")
        this.EventManager = new (require("./EventManager"))(this);
        this.EventManager.events = new Collection()
        await this.EventManager.init()
        console.log("console/main:event:done", {
            count: this.EventManager.events.map(e => e).length
        })

        require("./CommandHandler")(this);
    }

    async run(config) {
        await this.DBManager.startup(config);
        await this.DBManager.sync(true);
        this.Prefix = new (require("./PrefixManager"))(this.DBManager.get("prefixes"),
            await this.DBManager.get("prefixes").findAll());
    }

    msToTime(duration) {
        var milliseconds = Math.floor((duration % 1000) / 100),
            seconds = Math.floor((duration / 1000) % 60),
            minutes = Math.floor((duration / (1000 * 60)) % 60),
            hours = Math.floor((duration / (1000 * 60 * 60)) % 24),
            days = Math.floor(duration / (1000 * 60 * 60 * 24))

        days = (days < 10) ? "" + days : days;
        hours = (hours < 10) ? "" + hours : hours;
        minutes = (minutes < 10) ? "" + minutes : minutes;
        seconds = (seconds < 10) ? "" + seconds : seconds;

        return days + "天 " + hours + "小時 " + minutes + "分鐘 " + seconds + "秒 " + milliseconds + "毫秒";
    }

    async hasTimeout(command, timeout, guild, user) {
        await this.DBManager.sync()
        let db = await this.DBManager.get("command")
        let lastRun = (await db.findOne({ where: { guild: guild, command: command, user: user } }))?.lastRun
        if (!lastRun) return false
        if ((parseInt(lastRun) + parseInt(timeout)) - Date.now() < 0) return false
        return true
    }

    async checkTimeout(command, timeout, guild, user) {
        await this.DBManager.sync()
        let db = await this.DBManager.get("command")
        let lastRun = (await db.findOne({ where: { guild: guild, command: command, user: user } }))?.lastRun
        if (!lastRun) return { status: false, left: null }
        if ((parseInt(lastRun) + parseInt(timeout)) - Date.now() < 0) return { status: false, left: null }
        return { status: true, left: (parseInt(lastRun) + parseInt(timeout)) - Date.now() }
    }

    invalidUsage({ message, arg, type, reason }) {
        const lang = this.Language.readLangSync("main")
        const { MessageEmbed } = this.Modules["discord.js"]
        const embed = new MessageEmbed().setColor("RED")
        let pre = message.content.split(message.content.split(" ")[arg + 1])[0]
        const arrow = " ".repeat(pre.length) + "^^^"
        if (type === "empty") {
            embed.setTitle(reason || lang.Command.invalidUsage.empty)
                .setDescription("```\n" + message.content + "\n" + arrow + "```")
            message.reply({ embeds: [embed] })
        } else if (type === "incorrect") {
            embed.setTitle(reason || lang.Command.invalidUsage.incorrect)
                .setDescription("```\n" + message.content + "\n" + arrow + "```")
            message.reply({ embeds: [embed] })
        } else {
            throw new Error("Unsupported type")
        }
    }
}