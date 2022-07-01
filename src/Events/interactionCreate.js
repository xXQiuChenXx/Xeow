module.exports = class Event {
    constructor(Xeow) {
        this.Xeow = Xeow
        this.FakeMessage = Xeow.Libraries.FakeMessage
    }
    async run(interaction) {
        const FakeMessage = this.FakeMessage
        const Xeow = this.Xeow
        if (!interaction.isCommand()) return;
        if (interaction.user.bot) return;
        let msg = new FakeMessage(interaction)
        let command = Xeow.commands.get(interaction.commandName);
        if (!command) return interaction.reply({
            content: "❌ ┃ 找不到指令... 請稍待Discord同步指令列表",
            ephemeral: true
        });
        if (command.timeout) {
            let cd = await Xeow.checkTimeout(command.name, command.timeout, msg.guild.id, msg.author.id)
            if (cd.status) {
                await msg.reply(lang.cooldown.replace("%time%", Xeow.msToTime(cd.left)))
            }
        }
        let args = msg.content.split(/ +/)
        args = args.slice(1, args.length)
        const lang = Xeow.Languages.readLangSync(interaction.commandName, "command", "utf8")
        const config = Xeow.Configuration.readConfigSync(command.name, "command", "utf8")
        console.log("console/events:interactionCreate:cmdExecuted", {
            userTag: `${interaction.user.username}#${interaction.user.discriminator} `,
            content: `/${interaction.commandName}${interaction.options?._hoistedOptions.map(o => ` ${o.name}:${o.value}`).join('') || ''}`
        })
        try { await command.run(Xeow, msg, args, { ...command, run: undefined }); }
        catch (error) {
            return console.error(error);
        }
        let db = await Xeow.DBManager.get("command")
        let source = { command: command.name, guild: msg.guild.id, user: msg.author.id, lastRun: Date.now().toString() }
        let data = (await db.findOne({ where: { command: command.name, guild: msg.guild.id, user: msg.author.id } }))
        if (data?.lastRun) {
            await data.update(source);
            await data.save();
        } else {
            await db.build(source).save();
        }
    }
}