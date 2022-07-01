module.exports = class Event {
    constructor(Xeow) {
        this.Xeow = Xeow
        // this.PluginManager = Xeow.PluginManager
    }
    async run(bot) {
        // const PluginManager = this.PluginManager
        console.log("console/main:bot:loggedIn",{ username: bot.user.username})
        // await PluginManager.loadAll(lang)
        // console.log(lang.Plugin.Loaded.replace("%s%", PluginManager.list.length))
    }
}