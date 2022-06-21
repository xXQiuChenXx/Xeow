const Discord = require('discord.js')
module.exports = {
    name: "ping",
    category: '信息',
    description: "返回延迟和API 延迟",
    usage: "ping",
    timeout: 10000,
    run: async (Xeow, message, args, lang) => {
        message.reply(lang.pinging).then(msg => {
            const embed = new Discord.MessageEmbed()
                .setTitle(lang.pong.title)
                .addField(lang.pong.field_1, `${msg.createdTimestamp - message.createdTimestamp}ms`, true)
                .addField(lang.pong.field_2, `${Math.round(Xeow.bot.ws.ping)}ms`, true)
                .setColor('RANDOM')
            msg.edit({ content: '\u200B', embeds: [embed] });
        })
    }
}