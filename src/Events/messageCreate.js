module.exports = class Event {
    constructor(Xeow) {
        this.bot = Xeow.bot
    }
    on() {
        this.EventManager.register("messageCreate", this._main)
    }
    remove() {
        this.EventManager.unregister("messageCreate", this._main)
    }

    async _main() {
        if (message.author.bot) return;
        if (!message.content.toLowerCase().startsWith(prefix)) return;
    
        if (!message.member) message.member = await message.guild.fetchMember(message);
        if (!message.guild) return;
    
        const args = message.content.slice(prefix.length).trim().split(/ +/g);
        const cmd = args.shift().toLowerCase();
    
        if (cmd.length === 0) return;
    
        let command = bot.commands.get(cmd);
    
        if (!command) command = bot.aliases.get(cmd);
    
        if (command) {
            if (["伺服器", "機器人", "經濟", "游戲", "Minecraft", "信息"].includes(command.category)) {
                if (message.channel.id !== "853903577780977674" && message.channel.id !== "719889941454258227") {
                    let ch = message.guild.channels.cache.get('853903577780977674').toString();
                    return message.reply({ content: `很抱歉, 爲了避免頻道混亂, 此頻道不能使用機器人指令, 請到${ch}使用機器人指令`, ephemeral: true })
                    .then((msg) => setTimeout(() => {
                        message.delete()
                        msg.delete()
                    }, 5000))
                }
            }
            if (["音樂", "過濾"].includes(command.category)) {
                if (message.channel.id !== "830819813907628083") {
                    let ch = message.guild.channels.cache.get('830819813907628083').toString();
                    return message.reply({ content: `很抱歉, 爲了避免頻道混亂, 此頻道不能使用機器人音樂指令, 請到${ch}使用機器人音樂指令`, ephemeral: true })
                    .then((msg) => setTimeout(() => {
                        message.delete()
                        msg.delete()
                    }, 5000))
                }
            }
            if (command.timeout) {
                let cd = (await bot.cooldowns.get({ userid_cmd: `${message.author.id}_${command.name}` }))?.cooldown
                if (cd) {
                    if (cd - Date.now() < 0) await bot.cooldowns.remove({ userid_cmd: `${message.author.id}_${command.name}` })
                }
                let temp = await bot.cooldowns.has({ userid_cmd: `${message.author.id}_${command.name}` })
                if (temp) {
                    return message.reply(`指令正在冷卻中, 請等待 ${bot.cores.msToTime(cd - Date.now())}!`)
                } else {
                    console.log(`${message.member.user.tag} ` + "執行了指令: " + message.content)
                    command.run(bot, message, args, config);
                    await bot.cooldowns.set({ userid_cmd: `${message.author.id}_${command.name}` }, { cooldown: Date.now() + command.timeout })
                    setTimeout(async () => {
                        await bot.cooldowns.remove({ userid_cmd: `${message.author.id}_${command.name}` })
                    }, command.timeout);
                }
            } else {
                console.log(`${message.member.user.tag} ` + "執行了指令: " + message.content)
                command.run(bot, message, args, config)
            }
        }
    }
}