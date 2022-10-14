module.exports = class Event {
    constructor(Xeow) {
        this.Xeow = Xeow
    }
    async run(bot) {
        console.logT("console/main:bot:loggedIn",{ username: bot.user.username})
    }
}