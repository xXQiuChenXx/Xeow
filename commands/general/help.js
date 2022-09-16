const { EmbedBuilder, SelectMenuBuilder, ActionRowBuilder } = require("discord.js");
module.exports = {
    config: {
        name: "help",
        description: "幫助選單",
        usage: "help [指令]",
        emoji: "❓",
        options: [
            { name: 'name', type: 3, description: '指令名称', required: false }
        ],
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
        const noValue = message.translate("general/help:noValue")
        if (name && Xeow.commands.get(name)) {
            const embed = new EmbedBuilder()
            const cmd = Xeow.commands.get(name);
            embed.setColor("Green")
                .setAuthor({ iconURL: Xeow.user.avatarURL({ extension: "jpg" }), name: Xeow.user.username })
                .setThumbnail(Xeow.user.avatarURL({ extension: 'jpg' }))
                .addFields([
                    {
                        name: message.translate("general/help:getCMD:title", {
                            command: cmd.name,
                            emoji: cmd?.emoji
                        }),
                        value: cmd?.description || noValue
                    }, {
                        name: `${message.translate("general/help:usage")}`,
                        value: cmd?.usage === undefined ? noValue : "```" + `${prefix}${cmd.usage}` + "```"
                    }
                ]);
            if (cmd?.timeout) embed.addFields([{
                name: message.translate("general/help:cooldown"),
                value: Xeow.msToTime(cmd.timeout)
            }])
            if (cmd?.aliases && cmd?.aliases?.length !== 0) {
                embed.addFields([
                    { name: message.translate("general/help:aliases"), value: command.aliases.join(", ") }
                ])
            }
            await message.reply({ embeds: [embed] });
        } else {
            const embed = new EmbedBuilder()
                .setAuthor({ iconURL: Xeow.user.avatarURL({ extension: 'jpg' }), name: Xeow.user.username })
                .setColor("Random")
                .setDescription(message.translate("general/help:main:description", {
                    username: Xeow.user.username
                }))

            const menu = new SelectMenuBuilder()
                .setCustomId('help_menu')
                .setPlaceholder(Xeow.translate("general/help:main:menu:placeholder"))

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
