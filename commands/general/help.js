const { EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder } = require("discord.js");
module.exports = {
    getLang: async function (Xeow) {
        return {
            name: Xeow.translate("app_commands/help:name"),
            description: Xeow.translate("app_commands/help:description"),
            descriptionLocalizations: Xeow.translateAll("app_commands/help:description"),
            options: [
                {
                    name: Xeow.translate("app_commands/help:opts:command:name"),
                    nameLocalizations: Xeow.translateAll("app_commands/help:opts:command:name"),
                    type: 3,
                    description: Xeow.translate("app_commands/help:opts:command:description"),
                    descriptionLocalizations: Xeow.translateAll("app_commands/help:opts:command:description"), 
                    required: false
                }
            ]
        }
    },
    usage: "commands/help:usage",
    emoji: "❓",
    config: {
        categoryReplacement: {
            admin: {
                name: "管理員使用",
                emoji: "👑",
                description: "管管們喜歡的地方"
            },
            general: {
                name: "一般",
                emoji: "🌍",
                description: "查詢一般的指令"
            },
            economy: {
                name: "經濟",
                emoji: "💰",
                description: "你今天簽到了嗎"
            }
        },
    },
    run: async (Xeow, message, args, config) => {
        const prefix = Xeow.prefix.get(message.guild.id)
        let name = args[0]?.toLowerCase();
        const noValue = Xeow.translate("commands/help:noValue")
        if (name && Xeow.commands.get(name)) {
            const embed = new EmbedBuilder()
            const cmd = Xeow.commands.get(name);
            embed.setColor("Green")
                .setAuthor({ iconURL: Xeow.user.avatarURL({ extension: "jpg" }), name: Xeow.user.username })
                .setThumbnail(Xeow.user.avatarURL({ extension: 'jpg' }))
                .addFields([
                    {
                        name: Xeow.translate("commands/help:cmdTitle", {
                            command: cmd.name,
                            emoji: cmd?.emoji
                        }),
                        value: cmd?.description || noValue
                    }, {
                        name: Xeow.translate("commands/help:cmd_usage"),
                        value: cmd?.usage === undefined ? noValue : "```" + `${prefix}${cmd.usage}` + "```"
                    }
                ]);
            if (cmd?.timeout) embed.addFields([{
                name: Xeow.translate("commands/help:cooldown"),
                value: Xeow.msToTime(cmd.timeout)
            }])
            if (cmd?.aliases && cmd?.aliases?.length !== 0) {
                embed.addFields([
                    { name: Xeow.translate("commands/help:aliases"), value: command.aliases.join(", ") }
                ])
            }
            await message.reply({ embeds: [embed] });
        } else {
            const embed = new EmbedBuilder()
                .setAuthor({ iconURL: Xeow.user.avatarURL({ extension: 'jpg' }), name: Xeow.user.username })
                .setColor("Random")
                .setDescription(Xeow.translate("commands/help:main:description", {
                    username: Xeow.user.username
                }))

            const menu = new StringSelectMenuBuilder()
                .setCustomId('help_menu')
                .setPlaceholder(Xeow.translate("commands/help:main:menu:placeholder"))

            const row = new ActionRowBuilder().addComponents(menu);
            for (const category of Xeow.categories) {
                menu.addOptions({
                    label: config.categoryReplacement[category]?.name || category,
                    description: config.categoryReplacement[category]?.description || noValue,
                    value: category,
                    emoji: config.categoryReplacement[category]?.emoji
                })
            }

            await message.reply({ embeds: [embed], components: [row] })
        }
    }
}
