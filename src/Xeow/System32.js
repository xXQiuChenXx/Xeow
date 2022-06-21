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

        this.placeholder = new (require("./Placeholder"))();
        this.Languages = new (require("./LangParser"))();
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
        await this.DBManager.startup();

        console.log(lang.bot.EventLoading)
        this.EventManager = new (require("./EventHandler"))(this.bot);

        let events = fs.readdirSync(path.join(__dirname, "../events"))
        .filter(file => { return file.endsWith(".js"); })
        .filter(file => { 
            try{
                new (require(`../events/${file}`))(this, lang).on();
                return true
            } catch(error) {
                console.error(error)
            }
        })
        console.log(lang.bot.EventLoaded.replace("%s%", events.length))
        
        require("./CommandHandler")(this.bot, lang);
        require("./ConsoleHandler")(this);
    }
}