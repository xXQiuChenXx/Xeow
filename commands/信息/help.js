const { MessageEmbed } = require("discord.js");
module.exports = {
    name: "help",
    lang: {
        description: "幫助列表",
        usage: "help <showall/all/name> [指令]"
    },
    config: {
        emoji: {
            "信息": ":earth_americas:"
        }
    },
    options: [{
        name: 'name',
        type: 'STRING',
        description: '指令名字',
        required: false
    }],
    run: async (Xeow, message, args, lang, config) => {
        const bot = Xeow.bot
        const prefix = Xeow.Prefix.get(message.guild.id)
        let cmd = args[0]
        if (!cmd) {
            await getAll(Xeow, message, config, prefix);
        } else {
            if (!cmd) return message.reply("使用方法錯誤")
            await getCMD(bot, message, cmd.toLowerCase(), prefix)
        }
    }
}

async function getAll(Xeow, message, config, prefix) {
    let bot = Xeow.bot
    const menu = new MessageEmbed()
        .setColor("RANDOM")
        .setTitle("幫助選單")
        .setDescription("使用 `help <指令名稱>` 來搜索指定的指令")

    for (const category of bot.categories) {
        menu.addField(`${config.emoji[category]} ${category}`, prefix + 'help category <指令類別>')
    }
    let Pages = []

    bot.categories.forEach(function (cat) {
        let cmds = bot.commands.filter(cmd => cmd.category === cat)
        Pages.push({ category: cat, commands: cmds })
    });

    let Embeds = [menu]
    for (const temp of Pages) {
        const embed = new MessageEmbed()
            .setColor('RANDOM')
            .setTitle(`**${config.emoji[temp.category]} ${temp.category}**`)
        temp['commands'].forEach(function (cmd) {
            embed.addField(prefix + cmd.name + " - " + cmd.description, "用法: `" + prefix + cmd.usage + "`")
        });
        Embeds.push(embed)
    }

    if (message?.interaction) return await Xeow.Libraries.InteractionButtonPages({
        interaction: message.interaction,
        embeds: Embeds,
        time: 60000,
        fastSkip: true,
        end: true
    })

    await Xeow.Libraries.MessageButtonPages({
        message: message,
        embeds: Embeds,
        time: 60000,
        fastSkip: true,
        end: true
    })
}

function getCMD(bot, message, input, prefix) {
    const embed = new MessageEmbed()
    const cmd = bot.commands.get(input);
    if (cmd) {
        embed.setTitle(`**${cmd.name} 指令**`)
        if (cmd.description) embed.addField('**描述**', cmd.description)
        if (cmd.usage) embed.addField('**用法**', prefix + cmd.usage)
        if (cmd.timeout) embed.addField('**冷卻**', cmd.timeout.toString())
        embed.setFooter({ text: `提示: <> = 必须, [] = 可选` });
    } else {
        embed.setColor("RED").setDescription(`沒有找到指令 **${input}**`)
        return message.reply({ embeds: [embed] });
    }

    return message.reply({ embeds: [embed] });
}