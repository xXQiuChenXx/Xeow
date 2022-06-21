module.exports = class Event {
    constructor(Xeow, lang) {
        this.lang = lang
        this.EventManager = Xeow.EventManager
        this.PluginManager = Xeow.PluginManager
    }
    on() {
        const lang = this.lang
        const PluginManager = this.PluginManager
        this.main = async (bot) => {
            console.log(lang.bot.LoggedIn.replace("%bot%", bot.user.username))
            await PluginManager.loadAll(lang)
            console.log(lang.Plugin.Loaded.replace("%s%", PluginManager.list.length))
            console.log(lang.bot.Loaded)
        }
        this.EventManager.register("ready", this.main)
    }

    remove() {
        this.EventManager.unregister("ready", this.main)
    }
}