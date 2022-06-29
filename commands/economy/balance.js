const { MessageEmbed } = require('discord.js')
module.exports = {
    name: "balance",
    aliases: ["bal"],
    usage: "balance [成員標註]",
    description: "查詢自己或他人的餘額",
    lang: {
        "self": {
            "title": "💰 你的餘額",
            "description": "你目前擁有 %coins% 錢幣",
            "timestamp": true
        },
        "other": {
            "title": "💰 他/她的餘額",
            "description": "他/她目前擁有 %coins% 錢幣",
            "timestamp": true
        }
    },
    options: [{
        name: 'target',
        type: 'USER',
        description: '成員標註',
        required: false
    }],
    run: async (Xeow, message, args, lang, config) => {
        await Xeow.DBManager.sync()
        async function getCoins(guild, user) {
            return (await Xeow.DBManager.get("economy")
                .findOne({ where: { guild: guild, user: user } }))?.coins
        }
        if (message.mentions.members.first()) {
            let member = message.mentions.members.first()
            let coins = await getCoins(message.guild.id, member.id)
            const embed = new MessageEmbed()
                .setColor(coins === undefined ? "RED" : "GREEN")
                .setAuthor({
                    name: member.nickname === null ? member.user.tag : member.nickname,
                    iconURL: member.user.displayAvatarURL({ dynamic: true })
                })
                .setTitle(lang.other.title)
                .setDescription(lang.other.description.replace(/%coins%/g, coins === undefined ? "0" : coins))
            if (lang.other.timestamp === true) embed.setTimestamp()

            await message.reply({ embeds: [embed] })
        } else {
            let coins = await getCoins(message.guild.id, message.author.id)
            const embed = new MessageEmbed()
                .setColor(coins === undefined ? "RED" : "GREEN")
                .setAuthor({
                    name: message.member.nickname === null ? message.member.user.tag : message.member.nickname,
                    iconURL: message.member.user.displayAvatarURL({ dynamic: true })
                })
                .setTitle(lang.self.title)
                .setDescription(lang.self.description.replace(/%coins%/g, coins === undefined ? "0" : coins))
            if (lang.self.timestamp === true) embed.setTimestamp()
            await message.reply({ embeds: [embed] })
        }
    }
}