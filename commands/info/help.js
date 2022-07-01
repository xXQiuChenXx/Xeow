const { MessageEmbed } = require("discord.js");
module.exports = {
    config: {
        name: "help",
        description: "幫助選單",
        usage: "help <showall/all/name> [command name]",
        options: [{
            name: 'name',
            type: 'STRING',
            description: '指令名字',
            required: false
        }],
        menu: {
            timestamp: true
        },
        "categoryReplacement": {
            "info": "信息",
            "economy": "經濟"
        },
        "emoji": {
            "info": ":earth_americas:",
            "economy": "💰"
        },
    },
    run: async (Xeow, message, args, config) => {
        const prefix = Xeow.Prefix.get(message.guild.id)
        let cmd = args[0]
        if (cmd) {
            await getCMD(Xeow, message, cmd.toLowerCase(), prefix)
        } else {
            await getAll(Xeow, message, config, prefix);
        }
    }
}

async function getAll(Xeow, message, config, prefix) {
    const menu = new MessageEmbed()
        .setColor("RANDOM")
        .setTitle(message.translate("info/help:main:title"))
        .setDescription(message.translate("info/help:main:description"))
    if (config.menu.timestamp === true) menu.setTimestamp()

    for (const category of Xeow.categories) {
        menu.addField(`${config.emoji[category]} ${config.categoryReplacement[category] || category}`, prefix + `help module <${message.translate("info/help:module")}}>`)
    }
    let Pages = []

    Xeow.categories.forEach(function (cat) {
        let cmds = Xeow.commands.filter(cmd => cmd.category === cat)
        Pages.push({ category: cat, commands: cmds })
    });

    let Embeds = [menu]
    for (const temp of Pages) {
        const embed = new MessageEmbed()
            .setColor('RANDOM')
            .setTitle(`**${config.emoji[temp.category]} ${config.categoryReplacement[temp.category] || temp.category}**`)
        temp['commands'].forEach(function (cmd) {
            embed.addField(`${prefix}${cmd.name} - ${cmd.description}`,
                `${message.translate("info/help:usage")}: ` + "`" + prefix + cmd.usage + "`")
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

function getCMD(Xeow, message, input, prefix) {
    const embed = new MessageEmbed()
    const cmd = Xeow.commands.get(input);
    if (cmd) {
        embed.setTitle(message.translate("info/help:getCMD:title",{
            commandName: cmd.name
        }))
        if (cmd.description) embed.addField(message.translate("info/help:getCMD:fields.description.name"),
            message.translate("info/help:getCMD:fields.description.value", {
                commandDesc: cmd.description
            }))
        if (cmd.usage) embed.addField(message.translate("info/help:getCMD:fields.usage.name"),
            message.translate("info/help:getCMD:fields.usage.value", {
                prefix: prefix,
                commandUsage: cmd.usage
            }))
        if (cmd.timeout) embed.addField(message.translate("info/help:getCMD:fields.cooldown.name"),
            message.translate("info/help:getCMD:fields.cooldown.value", {
                commandCD: cmd.timeout.toString()
            }))
        embed.setFooter({ text: message.translate("info/help:getCMD:footer") });
    } else {
        embed.setColor("RED")
            .setDescription(message.translate("info/help:getCMD:notFound"), {
                commandName: input
            })
        return message.reply({ embeds: [embed] });
    }

    return message.reply({ embeds: [embed] });
}