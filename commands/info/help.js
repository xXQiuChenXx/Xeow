const { MessageEmbed } = require("discord.js");
module.exports = {
    name: "help",
    description: "幫助選單",
    usage: "help <showall/all/name> [command name]",
    lang: {
        category: "指令類別",
        usage: "使用方法",
        categoryReplacement: {
            "info": "信息",
            "economy": "經濟"
        },
        emoji: {
            "info": ":earth_americas:",
            "economy": "💰"
        },
        main: {
            title: "幫助選單",
            description: "使用 `help <指令名稱>` 來搜索指定的指令",
            timestamp: false
        },
        getCMD: {
            title: "**%command_name% 指令**",
            fields: {
                description: {
                    name: "**描述**",
                    value: "%command_description%"
                },
                usage: {
                    name: "**用法**",
                    value: "%prefix%%command_usage%"
                },
                cooldown: {
                    name: "**冷卻**",
                    value: "%command_cooldown%"
                }
            },
            notFound: "沒有找到指令 %command%",
            footer: "提示: <>是一定要填的參數 []是選填的參數"
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
        if (cmd) {
            await getCMD(bot, message, cmd.toLowerCase(), prefix, lang)
        } else {
            await getAll(Xeow, message, config, prefix, lang);
        }
    }
}

async function getAll(Xeow, message, config, prefix, lang) {
    let bot = Xeow.bot
    const menu = new MessageEmbed()
        .setColor("RANDOM")
        .setTitle(lang.main.title)
        .setDescription(lang.main.description)
    if (lang.main.timestamp === true) menu.setTimestamp()

    for (const category of bot.categories) {
        menu.addField(`${lang.emoji[category]} ${lang.categoryReplacement[category] || category}`, prefix + `help category <${lang.category}>`)
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
            .setTitle(`**${lang.emoji[temp.category]} ${lang.categoryReplacement[temp.category] || temp.category}**`)
        temp['commands'].forEach(function (cmd) {
            embed.addField(`${prefix}${cmd.name} - ${cmd.description}`,
                `${lang.usage}: ` + "`" + prefix + cmd.usage + "`")
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

function getCMD(bot, message, input, prefix, lang) {
    const embed = new MessageEmbed()
    const cmd = bot.commands.get(input);
    if (cmd) {
        embed.setTitle(lang.getCMD.title.replace(/%command_name%/g, cmd.name))
        if (cmd.description) embed.addField(lang.getCMD.fields.description.name,
            lang.getCMD.fields.description.value.replace(/%command_description%/g, cmd.description))
        if (cmd.usage) embed.addField(lang.getCMD.fields.usage.name,
            lang.getCMD.fields.usage.value.replace(/%prefix%/g, prefix).replace(/%command_usage%/g, cmd.usage))
        if (cmd.timeout) embed.addField(lang.getCMD.fields.cooldown.name,
            lang.getCMD.fields.cooldown.value.replace(/%command_cooldown%/g, cmd.timeout.toString()))
        embed.setFooter({ text: lang.getCMD.footer });
    } else {
        embed.setColor("RED").setDescription(lang.getCMD.notFound.replace(/%command_name%/g, input))
        return message.reply({ embeds: [embed] });
    }

    return message.reply({ embeds: [embed] });
}