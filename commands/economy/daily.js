const { MessageEmbed } = require('discord.js')
module.exports = {
    config: {
        name: "daily",
        timeout: 86400000,
        description: "每日簽到",
        checkInAmount: 100,
        bonusMultiple: 0.02
    },
    run: async (Xeow, message, args, config) => {
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
                .setTitle(message.translate("economy/daily:title"))
                .setDescription(message.translate("economy/daily:description:hasBonus", {
                    days: data["checked_in_count"],
                    bonus: bonus,
                    total: bonus + checkInAmount
                }))
                .setFooter({ text: message.translate("economy/daily:footer") })

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
                .setTitle(message.translate("economy/daily:title"))
                .setDescription(message.translate("economy/daily:description:default", {
                    total: checkInAmount
                }))
                .setFooter({ text: message.translate("economy/daily:footer") })

            await message.reply({ embeds: [embed] })
        }
    }
}