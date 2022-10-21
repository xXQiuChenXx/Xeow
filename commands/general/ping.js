const Discord = require('discord.js')
module.exports = {
    getLang: async function (Xeow) {
        return {
            name: Xeow.translate("app_commands/ping:name"),
            description: Xeow.translate("app_commands/ping:description"),
            descriptionLocalizations: Xeow.translateAll("app_commands/ping:description")
        }
    },
    usage: "commands/ping:usage",
    config: {
        timeout: 6000,
        emoji: "🏓",
    },
    run: async (Xeow, message, args, config) => {
        await message.reply(message.translate("commands/ping:pinging")).then(async msg => {
            const embed = new Discord.EmbedBuilder()
                .setTitle(message.translate("commands/ping:pong:title"))
                .setColor('Random')
                .addFields([
                    { name: message.translate("commands/ping:pong:field_1"), value: `${msg.createdTimestamp - message.createdTimestamp}ms`, inline: true },
                    { name: message.translate("commands/ping:pong:field_2"), value: `${Math.round(Xeow.ws.ping)}ms`, inline: true }
                ])
            await msg.edit({ content: '', embeds: [embed] });
        })
    }
}