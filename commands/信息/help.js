const { MessageEmbed } = require("discord.js");
module.exports = {
    name: "help",
    lang: {
        description: "幫助列表",
        usage: "help <showall/all/name> [指令]"
    },
    options: [{
        name: 'type',
        type: 'STRING',
        description: '顯示種類',
        required: true,
        choices: [
            {
                name: 'all',
                value: 'all',
                description: '顯示所有指令'
            },
            {
                name: "search",
                value: 'search',
                description: '尋找指定指令'
            }
        ]
    },
    {
        name: 'name',
        type: 'STRING',
        description: '指令名字',
        required: false
    }],
    run: async (Xeow, message, args, lang, config) => {
        const bot = Xeow.bot
        let cmd = args[0]
        if (cmd === "all") {
            return getAll(bot, message);
        } else {
            if (!cmd) return message.reply("使用方法錯誤")
            getCMD(bot, message, cmd.toLowerCase())
        }
    }
}

async function ShowAll(bot, message) {
    let Pages = []
    bot.categories.forEach(function (cat) {
        let cmd = bot.commands.filter(cmd => cmd.category === cat)
        Pages.push({ categories: cat, commands: cmd })
    });
    let Embeds = []
    for (const temp of Pages) {
        const embed = new MessageEmbed()
            .setColor('RANDOM')
            .setTitle(`**${temp.categories}**`)
        temp['commands'].forEach(function (cmd) {
            embed.addField(cmd.name, cmd.description)
        });
        Embeds.push(embed)
    }
    if (message?.interaction) return await cores.InteractionButtonPages({
        interaction: message.interaction,
        embeds: Embeds,
        time: 60000,
        fastSkip: true,
        end: true
    })

    await cores.MessageButtonPages({
        message: message,
        embeds: Embeds,
        time: 60000,
        fastSkip: true,
        end: true
    })
}

function getAll(bot, message) {
    const commands = (category) => {
        return bot.commands
            .filter(cmd => cmd.category === category)
            .map(cmd => `- \`${cmd.name}\``)
            .join(" ");
    }

    const info = bot.categories
        .map(cat => stripIndents`**${cat[0].toUpperCase() + cat.slice(1)}** \n${commands(cat)}`)
        .reduce((string, category) => string + "\n" + category);

    const embed = new MessageEmbed()
        .setColor("RANDOM")
        .setDescription(info)

    return message.reply({ embeds: [embed] });
}

function getCMD(bot, message, input) {
    const embed = new MessageEmbed()
    const cmd = bot.commands.get(input);
    if (cmd) {
        embed.setTitle(`**${cmd.name} 指令**`)
        if(cmd.description) embed.addField('**描述**', cmd.description)
        if(cmd.usage) embed.addField('**用法**', cmd.usage)
        if(cmd.timeout) embed.addField('**冷卻**', cmd.timeout.toString())
        embed.setFooter({ text: `提示: <> = 必须, [] = 可选` });
    } else {
        embed.setColor("RED").setDescription(`沒有找到指令 **${input}**`)
        return message.reply({ embeds: [embed] });
    }

    return message.reply({ embeds: [embed] });
}