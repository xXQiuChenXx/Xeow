const { EmbedBuilder } = require('discord.js')
module.exports = {
    getLang: async function(Xeow) {
        return {
            name: Xeow.translate("app_commands/daily:name"),
            description: Xeow.translate("app_commands/daily:description"),
            descriptionLocalizations: Xeow.translateAll("app_commands/daily:description")
        }
    },
    usage: "commands/daily:usage",
    config: {
        timeout: 86400000,
        checkInAmount: 100,
        bonusMultiple: 0.02,
        emoji: "📅",
    },
    run: async (Xeow, message, args, config) => {
        let checkInAmount = config.checkInAmount
        await Xeow.DBManager.sync();
        let data = await Xeow.DBManager.get("economy")
            .findOne({ where: { guild: message.guild.id, user: message.author.id } });
        let now = Date.now();
        if (data?.coins && data?.["checked_in_count"] && (parseFloat(data.lastCheckIn) + (config.timeout * 2)) > Date.now()) {
            let bonus = parseInt(data["checked_in_count"]) * config.bonusMultiple
            if (bonus > checkInAmount) bonus = checkInAmount
            let current = parseFloat(data.coins) + checkInAmount + parseFloat(bonus)
            await data.update({ coins: current, lastCheckIn: now.toString(), checked_in_count: data.checked_in_count + 1 })
            await data.save()
            const embed = new EmbedBuilder()
                .setColor("Random")
                .setTitle(message.translate("commands/daily:title"))
                .setDescription(message.translate("commands/daily:description:hasBonus", {
                    days: data["checked_in_count"],
                    bonus: bonus,
                    total: bonus + checkInAmount
                }))
                .setFooter({ text: message.translate("commands/daily:footer") })

            await message.reply({ embeds: [embed] })
        } else {
            let current = (data?.coins === undefined ? 0 : data.coins) + checkInAmount
            if (data?.user === undefined) {
                await Xeow.DBManager.get("economy")
                    .build({
                        user: message.author.id,
                        guild: message.guild.id,
                        checked_in_count: 1,
                        coins: current,
                        lastCheckIn: now.toString()
                    }).save();
            } else {
                await data.update({
                    checked_in_count: 1,
                    coins: current,
                    lastCheckIn: now.toString()
                });
                await data.save();
            }


            const embed = new EmbedBuilder()
                .setColor("Random")
                .setTitle(message.translate("commands/daily:title"))
                .setDescription(message.translate("commands/daily:description:default", {
                    total: checkInAmount
                }))
                .setFooter({ text: message.translate("commands/daily:footer") })

            await message.reply({ embeds: [embed] })
        }
    }
}