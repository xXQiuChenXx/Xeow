const Discord = require("discord.js");

module.exports = class {

    constructor(Xeow) {
        this.Xeow = Xeow
    }

    async run(guild) {
        let DB = await this.Xeow.DBManager.get("guild")
        let exists = await DB.findOne({ where: { guild: guild.id } })
        if (!exists?.prefix) {
            await DB.build({ guild: guild.id, prefix: this.Xeow.defaultPrefix }).save()
        }
        this.Xeow.prefix.set(guild.id, this.Xeow.defaultPrefix)
    }
};  