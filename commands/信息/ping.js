const Discord = require('discord.js')
module.exports = {
    name: "ping",
    category: '信息',
    description: "返回延迟和API 延迟",
    usage: "ping",
    timeout: 10000,
    run: async (bot, message, args, lang) => {
        message.reply(`🏓 Pinging....`).then(msg => {
            const embed = new Discord.MessageEmbed()
                .setTitle('Pong!')
                .setDescription(`🏓 Pong!\n延遲為 ${Math.floor(msg.createdTimestamp - message.createdTimestamp)}ms\nAPI延遲為 ${Math.round(bot.ws.ping)}ms`)
                .setColor('RANDOM')
            msg.edit({ content: '\u200B', embeds: [embed] });
        })
    }
}