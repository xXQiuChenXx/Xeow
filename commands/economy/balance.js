const { EmbedBuilder } = require('discord.js')
module.exports = {
    getLang: async function(Xeow) {
        return {
            name: Xeow.translate("commands/balance:name"),
            description: Xeow.translate("commands/balance:description"),
            descriptionLocalizations: Xeow.translateAll("commands/balance:description"),
            options: [{
                name: Xeow.translate("commands/balance:opts:member:name"),
                nameLocalizations: Xeow.translateAll("commands/balance:opts:member:name"),
                description: Xeow.translate("commands/balance:opts:member:description"),
                type: 6,
                descriptionLocalizations: Xeow.translateAll("commands/balance:opts:member:description")
            }]
        }
    },
    config: {
        aliases: ["bal"],
        usage: "balance [成員標註]",
        description: "查詢自己或他人的餘額",
        emoji: "💰",
        self: {
            timestamp: true
        },
        other: {
            timestamp: true
        }
    },
    run: async (Xeow, message, args, config) => {
        await Xeow.DBManager.sync()
        async function getCoins(guild, user) {
            return (await Xeow.DBManager.get("economy")
                .findOne({ where: { guild: guild, user: user } }))?.coins
        }
        if (message.mentions.members.first()) {
            let member = message.mentions.members.first()
            let coins = await getCoins(message.guild.id, member.id)
            const embed = new EmbedBuilder()
                .setColor(coins === undefined ? "Red" : "Green")
                .setAuthor({
                    name: member.nickname === null ? member.user.tag : member.nickname,
                    iconURL: member.user.displayAvatarURL({ dynamic: true })
                })
                .setTitle(message.translate("economy/balance:other:title"))
                .setDescription(message.translate("economy/balance:other:description", {
                    coins: coins === undefined ? "0" : coins
                }))
            if (config.other.timestamp === true) embed.setTimestamp()

            await message.reply({ embeds: [embed] })
        } else {
            let coins = await getCoins(message.guild.id, message.author.id)
            const embed = new EmbedBuilder()
                .setColor(coins === undefined ? "Red" : "Green")
                .setAuthor({
                    name: message.member.nickname === null ? message.member.user.tag : message.member.nickname,
                    iconURL: message.member.user.displayAvatarURL({ dynamic: true })
                })
                .setTitle(message.translate("economy/balance:self:title"))
                .setDescription(message.translate("economy/balance:self:description", {
                    coins:  coins === undefined ? "0" : coins
                }))
            if (config.self.timestamp === true) embed.setTimestamp()
            await message.reply({ embeds: [embed] })
        }
    }
}