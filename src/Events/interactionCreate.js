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

            // if (command.timeout) {
            //     let cd = (await bot.cooldowns.get({ userid_cmd: `${interaction.user.id}_${command.name}` }))?.cooldown
            //     if (cd) {
            //         if (cd - Date.now() < 0) await bot.cooldowns.remove({ userid_cmd: `${interaction.user.id}_${command.name}` })
            //     }
            //     let temp = await bot.cooldowns.has({ userid_cmd: `$interaction.user.id}_${command.name}` })
            //     if (temp) {
            //         return interaction.reply(`指令正在冷卻中, 請等待 ${bot.cores.msToTime(cd - Date.now())}!`)
            //     } else {
            //         console.log(`${interaction.user.username}#${interaction.user.discriminator} ` + "执行了指令: " + `/${interaction.commandName}${interaction.options?._hoistedOptions.map(o => ` ${o.name}: ${o.value}`).join('') || ''}`)
            //         await command.run(bot, msg, args, config);
            //         await bot.cooldowns.set({ userid_cmd: `${interaction.user.id}_${command.name}` }, { cooldown: Date.now() + command.timeout })
            //         setTimeout(async () => {
            //             await bot.cooldowns.remove({ userid_cmd: `${interaction.user.id}_${command.name}` })
            //         }, command.timeout);
            //     }
            // } else {
            const lang = Xeow.Languages.readLangSync(interaction.commandName, "command", "utf8")
            console.log(`${interaction.user.username}#${interaction.user.discriminator} ` + `执行了指令: /${interaction.commandName}${interaction.options?._hoistedOptions.map(o => ` ${o.name}:${o.value}`).join('') || ''}`)
            await command.run(Xeow, msg, lang);

        }
        this.EventManager.register("interactionCreate", this.main)
    }
    remove() {
        this.EventManager.unregister("interactionCreate", this.main)
    }
}