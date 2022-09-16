const Discord = require("discord.js");
module.exports = {
    config: {
        name: "top",
        description: "金幣排行榜",
        usage: "top",
        emoji: "🏆"
    },
    run: async (Xeow, message, args, config) => {
        await Xeow.DBManager.sync()
        let data = await Xeow.DBManager.get("economy").findAll({
            where: {
                guild: message.guild.id
            },
            order: [
                ['coins', "DESC"]
            ]
        })
        let Embeds = []

        // 1. 0-9   2. 10-19   3. 20-29
        for (let i = 0; i <= parseInt(data.length / 10); i++) {
            let embed = new Discord.EmbedBuilder()
                .setTitle(Xeow.translate("economy/top:money_top", {
                    guild: message.guild.name
                }))
                .setDescription(data.slice(i * 10, i * 10 + 9).map((data, i) => {
                    return `**${i + 1}.** <@${data.user}> - ${data.coins}`
                }).join('\n'))
                .setColor("Random")
            Embeds.push(embed)
        }

        if (message?.interaction) return await Xeow.Libraries.InteractionButtonPages({
            interaction: message.interaction,
            embeds: Embeds,
            time: 60000,
            end: true
        })

        await Xeow.Libraries.MessageButtonPages({
            message: message,
            embeds: Embeds,
            time: 60000,
            end: true
        })
    }
}