module.exports = class Event {
    constructor(Xeow) {
        this.bot = Xeow.bot
        this.Xeow = Xeow
        this.EventManager = Xeow.EventManager
        this.config = Xeow.Configuration.readConfigSync("main");
    }
    on() {
        const bot = this.bot
        const config = this.config
        const Xeow = this.Xeow
        this.main = async (message) => {
            if (message.author.bot) return;
            if (!message.content.toLowerCase().startsWith(config.Prefix)) return;

            if (!message.member) message.member = await message.guild.fetchMember(message);
            if (!message.guild) return;

            const args = message.content.slice(config.Prefix.length).trim().split(/ +/g);
            const cmd = args.shift().toLowerCase();

            if (cmd.length === 0) return;

            let command = bot.commands.get(cmd);

            if (!command) command = bot.aliases.get(cmd);

            if (command) {
                // if (command.timeout) {
                //     let cd = (await bot.cooldowns.get({ userid_cmd: `${message.author.id}_${command.name}` }))?.cooldown
                //     if (cd) {
                //         if (cd - Date.now() < 0) await bot.cooldowns.remove({ userid_cmd: `${message.author.id}_${command.name}` })
                //     }
                //     let temp = await bot.cooldowns.has({ userid_cmd: `${message.author.id}_${command.name}` })
                //     if (temp) {
                //         return message.reply(`指令正在冷卻中, 請等待 ${bot.cores.msToTime(cd - Date.now())}!`)
                //     } else {
                //         console.log(`${message.member.user.tag} ` + "執行了指令: " + message.content)
                //         command.run(bot, message, args, config);
                //         await bot.cooldowns.set({ userid_cmd: `${message.author.id}_${command.name}` }, { cooldown: Date.now() + command.timeout })
                //         setTimeout(async () => {
                //             await bot.cooldowns.remove({ userid_cmd: `${message.author.id}_${command.name}` })
                //         }, command.timeout);
                //     }
                // } 
                const lang = Xeow.Languages.readLangSync(command.name, "command", "utf8")
                console.log(`${message.member.user.tag} ` + "執行了指令: " + message.content)
                command.run(Xeow, message, args, lang)

            }
        }
        this.EventManager.register("messageCreate", this.main)
    }

    remove() {
        this.EventManager.unregister("messageCreate", this.main)
    }
}