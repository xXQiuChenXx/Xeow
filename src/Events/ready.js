module.exports = class Event {
    constructor(Xeow) {
        this.Xeow = Xeow
    }
    async run(bot) {
        console.logT("core/main:bot:loggedIn",{ username: bot.user.username})
    }
}