module.exports = class Event {
    constructor(Xeow) {
        this.Xeow = Xeow
        this.EventManager = Xeow.EventManager
        this.FakeMessage = Xeow.Libraries.FakeMessage
    }
    on() {
        const FakeMessage = this.FakeMessage
        const Xeow = this.Xeow
        const bot = Xeow.bot
        this.main = async (interaction) => {
            if (!interaction.isCommand()) return;
            if (interaction.user.bot) return;
            let msg = new FakeMessage(interaction)
            let command = bot.commands.get(interaction.commandName);
            if (!command) return interaction.reply({
                content: "❌ ┃ 找不到指令... 請稍待Discord同步指令列表",
                ephemeral: true
            });
            let args = msg.content.split(/ +/)
            args = args.slice(1, args.length)
            const lang = Xeow.Languages.readLangSync(interaction.commandName, "command", "utf8")
            const config = Xeow.Configuration.readConfigSync(command.name, "command", "utf8")
            console.log(`${interaction.user.username}#${interaction.user.discriminator} ` + `执行了指令: /${interaction.commandName}${interaction.options?._hoistedOptions.map(o => ` ${o.name}:${o.value}`).join('') || ''}`)
            try { await command.run(Xeow, msg, args, lang, config); }
            catch (error) { 
                if(error.message === "Cooldown") return
                return console.error(error);
            }
            let db = await Xeow.DBManager.get("command")
            let source = { command: command.name, guild: message.guild.id, user: message.author.id, lastRun: Date.now().toString() }
            let data = (await db.findOne({ where: { command: command.name, guild: message.guild.id, user: message.author.id } }))
            if (data?.lastRun) {
                await data.update(source);
                await data.save();
            } else {
                await db.build(source).save();
            }
        }
        this.EventManager.register("interactionCreate", this.main)
    }
    remove() {
        this.EventManager.unregister("interactionCreate", this.main)
    }
}