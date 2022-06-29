const Discord = require('discord.js')
module.exports = {
    name: "ping",
    lang: {
        "pinging": "🏓 Pinging....",
        "pong": {
            "title": ":ping_pong: 延遲統計信息:",
            "field_1": ":signal_strength: API 延遲",
            "field_2": ":satellite: 機器人延遲"
        }
    },
    description: "查看機器人延遲",
    usage: "ping",
    timeout: 10000,
    run: async (Xeow, message, args, lang, config) => {
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