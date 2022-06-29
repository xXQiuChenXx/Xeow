const fs = require("fs");
const yml = require("js-yaml");
const path = require("path");

module.exports = class System32 {
    constructor() {
        this.name = "System32";
        this.description = "System32";
        this.version = "1.0.0";
        this.author = "Xeow";
        const dependencies = require("../../package.json").dependencies;
        this.Modules = {};
        Object.keys(dependencies).forEach(key => { this.Modules[key] = require(key); });

        const Libraries = fs.readdirSync(path.join(__dirname, "../../libs")).filter(file => file.endsWith(".js")).map(lib => require(`../../libs/${lib}`));
        this.Libraries = {};
        Libraries.forEach(lib => { this.Libraries[lib.name] = lib.main; });

        this.Placeholder = new (require("./Placeholder"))(this);
        this.Language = new (require("./Language"))();
        this.Configuration = new (require("./Configuration"))();
        this.PluginManager = new (require("../PluginHandler/PluginLoader"))(this);
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

    async loggedIn(config, lang) {
        console.log(lang.Database.Loading)
        this.DBManager = new (require("./DBManager"))(this, lang)
        await this.DBManager.connect(config);
        await this.DBManager.validate();
        await this.DBManager.startup(config);
        await this.DBManager.sync(true);
        this.Prefix = new (require("./PrefixManager"))(this.bot, this.DBManager.get("prefixes"),
            await this.DBManager.get("prefixes").findAll());

        console.log(lang.bot.EventLoading)
        this.EventManager = new (require("./EventManager"))(this.bot);

        let events = fs.readdirSync(path.join(__dirname, "../events"))
            .filter(file => { return file.endsWith(".js"); })
            .filter(file => {
                try {
                    new (require(`../events/${file}`))(this, lang).on();
                    return true
                } catch (error) {
                    console.error(error)
                }
            })
        console.log(lang.bot.EventLoaded.replace("%s%", events.length))

        require("./CommandHandler")(this, this.bot, lang, config);
        this.CLI = new (require("./CLI"))(this);
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
            embed.setTitle(reason|| lang.Command.invalidUsage.incorrect)
                .setDescription("```\n" + message.content + "\n" + arrow + "```")
            message.reply({ embeds: [embed] })
        } else {
            throw new Error("Unsupported type")
        }
    }
}