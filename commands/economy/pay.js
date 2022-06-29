module.exports = {
    name: "pay",
    usage: "pay <成員標註> <金額>",
    description: "付款/轉賬",
    lang: {
        success: {
            title: ":money_with_wings: 轉賬成功!",
            description: "你已成功將1錢幣轉賬給%user%",
            fields: {
                self: { name: ":arrow_down: 你目前的餘額", value: "%before% -> %after%" },
                other: { name: ":arrow_up: 他/她的餘額", value: "%before% -> %after%" }
            }
        },
        insufficientBalance: "抱歉, 但你的餘額不足",
        noBot: "抱歉, 但你不能給機器人轉賬",
        invalidAmount: "%give% 不是一個有效的數字 / 不能為0或負數",
        invalidTarget: "不能轉賬給自己, 因爲這毫無意義"
    },
    options: [{
        name: 'target',
        type: 'USER',
        description: '成員標註',
        required: true
    }, {
        name: 'amount',
        type: 'INTEGER',
        description: '金額',
        required: true
    }],
    run: async (Xeow, message, args, lang, config) => {
        const { MessageEmbed } = Xeow.Modules["discord.js"]
        if (!args[0] || !message.mentions.members.first()) return await Xeow.invalidUsage({ message: message, arg: 0, type: "empty" })
        if (!args[1]) return await Xeow.invalidUsage({ message: message, arg: 1, type: "empty" })

        if (!parseFloat(args[1]) || parseFloat(args[1]) < 1) {
            return await Xeow.invalidUsage({ message: message, arg: 1, type: "incorrect", reason: lang.invalidAmount.replace(/%give%/g, args[1]) })
        }
        const targetMember = message.mentions.members.first()
        if (targetMember.id === message.author.id) return await Xeow.invalidUsage({ message: message, arg: 0, type: "incorrect", reason: lang.invalidTarget })
        if (targetMember.user.bot) return message.reply(lang.noBot)
        const embed = new MessageEmbed()
        await Xeow.DBManager.sync()
        let self = await Xeow.DBManager.get("economy")
            .findOne({ where: { guild: message.guild.id, user: message.author.id } })
        let other = await Xeow.DBManager.get("economy")
            .findOne({ where: { guild: message.guild.id, user: targetMember.id } })

        if (self?.coins && self.coins >= args[1]) {
            await self.update({ coins: parseFloat(self.coins) - parseFloat(args[1]) })
            await self.save()
            if (other?.coins) {
                await other.update({ coins: parseFloat(other.coins) + parseFloat(args[1]) })
                await other.save()
            } else {
                await Xeow.DBManager.get("economy")
                    .build({
                        user: targetMember.id,
                        guild: message.guild.id,
                        coins: parseFloat(args[1]),
                    })
                    .save()
            }
            embed.setColor("GREEN")
                .setTitle(lang.success.title)
                .setDescription(lang.success.description.replace(/%user%/g, args[0]))
                .addField(lang.success.fields.self.name, lang.success.fields.self.value
                    .replace(/%before%/g, self.coins)
                    .replace(/%after%/g, parseFloat(self.coins) - parseFloat(args[1])), true)
                .addField(lang.success.fields.other.name, lang.success.fields.other.value
                    .replace(/%before%/g, other?.coins || 0)
                    .replace(/%after/g, parseFloat(other?.coins || 0) + parseFloat(args[1])), true)
            message.reply({ embeds: [embed] })
        } else {
            message.reply(lang.insufficientBalance)
        }
    }
}