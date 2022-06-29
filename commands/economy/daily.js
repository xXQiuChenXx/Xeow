const { MessageEmbed } = require('discord.js')
module.exports = {
    name: "daily",
    timeout: 86400000,
    description: "每日簽到",
    lang: {
        "title": ":white_check_mark: 簽到成功!",
        "description": {
            "default": "你已成功領取了每日 %total% 錢幣",
            "hasBonus": "你已連續簽到 %days% 天, 因此你獲得了額外獎勵 %bonus%, 本次簽到共獲得了 %total% 錢幣"
        },
        "footer": "使用 balance 指令可查看你目前的餘額"
    },
    config: {
        "checkInAmount": 100,
        "bonusMultiple": 0.02
    },
    run: async (Xeow, message, args, lang, config) => {
        let checkInAmount = config.checkInAmount
        await Xeow.DBManager.sync()
        let data = await Xeow.DBManager.get("economy")
            .findOne({ where: { guild: message.guild.id, user: message.author.id } })

        if (data?.coins && data?.["checked_in_count"]) {
            let bonus = parseInt(data["checked_in_count"]) * config.bonusMultiple
            if (bonus > checkInAmount) bonus = checkInAmount
            let current = parseFloat(data.coins) + checkInAmount + parseFloat(bonus)
            await data.update({ coins: current, lastCheckIn: Date.now().toString(), checked_in_count: data.checked_in_count + 1 })
            await data.save()
            const embed = new MessageEmbed()
                .setColor("RANDOM")
                .setTitle(lang.title)
                .setDescription(lang.description.hasBonus
                    .replace(/%days%/g, data["checked_in_count"])
                    .replace(/%bonus%/g, bonus)
                    .replace(/%total%/g, bonus + checkInAmount))
                .setFooter({ text: lang.footer })

            await message.reply({ embeds: [embed] })
        } else {
            let current = (data?.coins === undefined ? 0 : data.coins) + checkInAmount
            await Xeow.DBManager.get("economy")
                .build({
                    user: message.author.id,
                    guild: message.guild.id,
                    checked_in_count: 1,
                    coins: current,
                    lastCheckIn: Date.now().toString()
                })
                .save()

            const embed = new MessageEmbed()
                .setColor("RANDOM")
                .setTitle(lang.title)
                .setDescription(lang.description.default
                    .replace(/%total%/g, checkInAmount))
                .setFooter({ text: lang.footer })

            await message.reply({ embeds: [embed] })
        }
    }
}