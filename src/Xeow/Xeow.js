const fs = require("fs");
const path = require("path");
const Language = require("./Languages");
const { Client, Collection, GatewayIntentBits } = require("discord.js");
module.exports = class Xeow extends Client {
    constructor() {
        require("./Extender")
        super({
            intents: [ //Many but not all intents
                GatewayIntentBits.DirectMessageReactions,
                GatewayIntentBits.DirectMessageTyping,
                GatewayIntentBits.DirectMessages,
                GatewayIntentBits.GuildBans,
                GatewayIntentBits.GuildEmojisAndStickers,
                GatewayIntentBits.GuildIntegrations,
                GatewayIntentBits.GuildInvites,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildMessageReactions,
                GatewayIntentBits.GuildMessageTyping,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildPresences,
                GatewayIntentBits.GuildScheduledEvents,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.GuildWebhooks,
                GatewayIntentBits.Guilds,
                GatewayIntentBits.MessageContent,
            ],
            autoReconnect: true,
            partials: ["CHANNEL"],
            allowedMentions: {
                parse: ["users"]
            }
        });

        this.prefix = new Collection()
        this.categories = fs.readdirSync("./commands")
        this.commands = new Collection(); // Creates new commands collection
        this.aliases = new Collection(); // Creates new command aliases collection
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
        if (!locale) locale = this.defaultLanguage
        const language = this.translations.get(locale);
        return language(key, args);
    }

    native(path) {
        const that = this
        return function(key, args, locale) {
            return that.translate(`${path}:${key}`, args, locale)
        }
    }

    nativeA(path) {
        const that = this
        return function(key, args, locale) {
            return that.translateAll(`${path}:${key}`, args, locale)
        }
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
        this.settings = config
        const lng = new Language()
        await lng.init(config);
        this.translations = await lng.translation()
        this.translateAll = lng.getTranslationsForKey
        this.defaultLanguage = config.Lang
    }

    async startup(config) {
        this.defaultPrefix = config.Prefix
        console.logT("core/main:database:loading")
        this.DBManager = new (require("./DBManager"))(this)
        await this.DBManager.init(config);
        await this.DBManager.validate();

        this.CLI = new (require("./CLI"))(this);

        console.logT("core/main:event:preparing")
        this.EventManager = new (require("./EventManager"))(this);
        this.EventManager.events = new Collection()
        await this.EventManager.init()
        console.logT("core/main:event:done", {
            count: this.EventManager.events.map(e => e).length
        })

        await require("./CommandHandler")(this);
    }

    async run(config) {
        await this.DBManager.startup(config);
        await this.DBManager.sync(true);
        let prefixes = await this.DBManager.get("prefixes").findAll()
        prefixes.forEach(data => {
            this.prefix.set(data.guild, data.prefix)
        })
        await this.user.setPresence({ activities: config.Activities, status: config.Status });
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

        let arr = [
            `${days} ${this.translate("core/common:days")}`,
            `${hours} ${this.translate("core/common:hours")}`,
            `${minutes} ${this.translate("core/common:minutes")}`,
            `${seconds} ${this.translate("core/common:seconds")}`
        ]
        return arr.filter(x => !x.startsWith("0")).join(" ")
    }

    async hasTimeout(command, timeout, guild, user) {
        await this.DBManager.sync()
        let db = await this.DBManager.get("command")
        let lastRun = (await db.findOne({ where: { guild: guild, command: command, user: user } }))?.lastRun
        if (!lastRun) return false
        if ((parseInt(lastRun) + parseInt(timeout)) - Date.now() < 0) return false
        return true
    }

    async checkTimeout(cmd, msg) {
        await this.DBManager.sync()
        let db = await this.DBManager.get("command")
        let lastRun = (await db.findOne({ where: { guild: msg.guild.id, command: cmd.name, user: msg.author.id } }))?.lastRun
        if (!lastRun) return { status: false, left: null }
        if ((parseInt(lastRun) + parseInt(cmd.timeout)) - Date.now() < 0) return { status: false, left: null }
        return { status: true, left: (parseInt(lastRun) + parseInt(cmd.timeout)) - Date.now() }
    }
}