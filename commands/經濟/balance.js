const { MessageEmbed } = require('discord.js')
module.exports = {
    name: "balance",
    aliases: ["bal", "餘額"],
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
                .setTitle("💰 他/她的DC幣")
                .setDescription(`他/她目前擁有 ${coins === undefined ? "0" : coins} DC幣`)

            await message.reply({ embeds: [embed] })
        } else {
            let coins = await getCoins(message.guild.id, message.author.id)
            const embed = new MessageEmbed()
                .setColor(coins === undefined ? "RED" : "GREEN")
                .setAuthor({
                    name: message.member.nickname === null ? message.member.user.tag : message.member.nickname,
                    iconURL: message.member.user.displayAvatarURL({ dynamic: true })
                })
                .setTitle("💰 你的DC幣")
                .setDescription(`你目前擁有 ${coins === undefined ? "0" : coins} DC幣`)

            await message.reply({ embeds: [embed] })
        }
    }
}