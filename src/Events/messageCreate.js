module.exports = class Event {
    constructor(Xeow) {
        this.bot = Xeow.bot
        this.Xeow = Xeow
        this.EventManager = Xeow.EventManager
    }
    on() {
        const bot = this.bot
        const Xeow = this.Xeow
        this.main = async (message) => {
            if (message.author.bot) return;
            const prefix = Xeow.Prefix.get(message.guild.id)
            if (!message.content.toLowerCase().startsWith(prefix)) return;

            if (!message.member) message.member = await message.guild.fetchMember(message);
            if (!message.guild) return;

            const args = message.content.slice(prefix.length).trim().split(/ +/g);
            const cmd = args.shift().toLowerCase();

            if (cmd.length === 0) return;

            let command = bot.commands.get(cmd);

            if (!command) command = bot.aliases.get(cmd);

            if (command) {
                if (command.timeout) {
                    let cd = await Xeow.checkTimeout(command.name, command.timeout, message.guild.id, message.author.id)
                    if (cd.status) {
                        await message.reply(lang.cooldown.replace("%time%", Xeow.msToTime(cd.left)))
                    }
                }
                const lang = Xeow.Language.readLangSync(command.name, "command", "utf8")
                const config = Xeow.Configuration.readConfigSync(command.name, "command", "utf8")
                console.log(`${message.member.user.tag} ` + "執行了指令: " + message.content)
                try { await command.run(Xeow, message, args, lang, config); }
                catch (error) {
                    return console.error(error);
                }
                let db = await Xeow.DBManager.get("command")
                let source = { command: command.name, guild: message.guild.id, user: message.author.id, lastRun: Date.now().toString() }
                let data = await db.findOne({ where: { command: command.name, guild: message.guild.id, user: message.author.id } })
                if (data?.lastRun) {
                    await data.update(source);
                    await data.save();
                } else {
                    await db.build(source).save()
                }
            }
        }
        this.EventManager.register("messageCreate", this.main)
    }

    remove() {
        this.EventManager.unregister("messageCreate", this.main)
    }
}