const Discord = require('discord.js')
module.exports = {
    config: {
        name: "ping",
        description: "查看機器人延遲",
        usage: "ping",
        timeout: 6000,
        emoji: "🏓"
    },
    run: async (Xeow, message, args, config) => {
        await message.reply(message.translate("general/ping:pinging")).then(async msg => {
            const embed = new Discord.EmbedBuilder()
                .setTitle(message.translate("general/ping:pong:title"))
                .setColor('Random')
                .addFields([
                    { name: message.translate("general/ping:pong:field_1"), value: `${msg.createdTimestamp - message.createdTimestamp}ms`, inline: true},
                    { name: message.translate("general/ping:pong:field_2"), value: `${Math.round(Xeow.ws.ping)}ms`, inline: true}
                ])
            await msg.edit({ content: '\u200B', embeds: [embed] });
        })
    }
}