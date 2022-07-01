const Discord = require('discord.js')
module.exports = {
    config: {
        name: "ping",
        description: "查看機器人延遲",
        usage: "ping",
        timeout: 10000
    },
    run: async (Xeow, message, args, config) => {
        message.reply(message.translate("info/ping:pinging")).then(msg => {
            const embed = new Discord.MessageEmbed()
                .setTitle(message.translate("info/ping:pong:title"))
                .addField(message.translate("info/ping:pong:field_1"), `${msg.createdTimestamp - message.createdTimestamp}ms`, true)
                .addField(message.translate("info/ping:pong:field_2"), `${Math.round(Xeow.ws.ping)}ms`, true)
                .setColor('RANDOM')
            msg.edit({ content: '\u200B', embeds: [embed] });
        })
    }
}