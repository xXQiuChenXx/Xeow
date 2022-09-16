const { EmbedBuilder, SelectMenuBuilder, ActionRowBuilder } = require("discord.js");
module.exports = class Event {
    constructor(Xeow) {
        this.Xeow = Xeow
        this.FakeMessage = Xeow.Libraries.FakeMessage
    }
    async run(interaction) {
        const Xeow = this.Xeow
        if (interaction.isSelectMenu()) {
            const hp_config = Xeow.Configuration.get("commands/help.yml")
            const noValue = Xeow.translate("general/help:noValue");
            switch (interaction.customId) {
                case 'help_menu':
                    let cat = interaction.values[0]
                    let cat_repl = hp_config.categoryReplacement[cat]

                    const menu = new SelectMenuBuilder()
                        .setCustomId('help_command')
                        .setPlaceholder(Xeow.translate("general/help:chooseCommand"))

                    const row = new ActionRowBuilder().addComponents(menu);
                    const commands = Xeow.commands.filter(cmd => cmd.category === cat)

                    commands.forEach((command) => {
                        menu.addOptions({
                            label: command.name,
                            description: command?.description || noValue,
                            value: command.name,
                            emoji: command?.emoji || undefined
                        })
                    })
                    menu.addOptions({
                        label: Xeow.translate("general/help:backToMain"),
                        description: Xeow.translate("general/help:backToMainDescription"),
                        value: "go_back_home",
                        emoji: "🏠"
                    })
                    await interaction.update({ content: `${cat_repl.emoji} **${cat_repl?.name || cat}**`, components: [row], embeds: [] })
                    break;
                case 'help_command':
                    if (interaction.values[0] === "go_back_home") {
                        const embed = new EmbedBuilder()
                            .setAuthor({ iconURL: Xeow.user.avatarURL({ extension: 'jpg' }), name: Xeow.user.username })
                            .setColor("Random")
                            .setDescription(Xeow.translate("general/help:main:description", {
                                username: Xeow.user.username
                            }))

                        const menu = new SelectMenuBuilder()
                            .setCustomId('help_menu')
                            .setPlaceholder(Xeow.translate("general/help:commandTutorial"))

                        const row = new ActionRowBuilder().addComponents(menu);
                        for (const category of Xeow.categories) {
                            menu.addOptions({
                                label: hp_config.categoryReplacement[category]?.name || category,
                                description: hp_config.categoryReplacement[category]?.description || noValue,
                                value: category,
                                emoji: hp_config.categoryReplacement[category]?.emoji
                            })
                        }

                        await interaction.update({ content: '', embeds: [embed], components: [row] })
                    } else {
                        let command = Xeow.commands.get(interaction.values[0]);
                        let prefix = Xeow.prefix.get(interaction.guildId)
                        const embed = new EmbedBuilder()
                            .setAuthor({ iconURL: Xeow.user.avatarURL({ extension: 'jpg' }), name: Xeow.user.username })
                            .addFields([
                                {
                                    name: Xeow.translate("general/help:getCMD:title", {
                                        emoji: command?.emoji,
                                        command: command?.name
                                    }),
                                    value: command?.description || noValue
                                },
                                { name: Xeow.translate("general/help:usage"), value: command?.usage === undefined ? noValue : "```" + `${prefix}${command.usage}` + "```" },
                                { name: Xeow.translate("general/help:format:name"), value: Xeow.translate("general/help:format:value") }
                            ])
                            .setThumbnail(Xeow.user.avatarURL({ extension: 'jpg' }));
                        if (command?.timeout) embed.addFields([{
                            name: Xeow.translate("general/help:cooldown"),
                            value: Xeow.msToTime(command.timeout)
                        }])
                        if (command?.aliases && command?.aliases?.length !== 0) embed.addFields([{ name: Xeow.translate("general/help:aliases"), value: command.aliases.join(", ") }])
                        return await interaction.update({ embeds: [embed], content: '', components: [] })
                    }
                    break;
            }
        }

        if (interaction.isCommand()) {
            const FakeMessage = this.FakeMessage
            if (!this.Xeow.settings.SlashCommand) return;
            if (interaction.user.bot) return;
            let msg = new FakeMessage(interaction)
            let command = Xeow.commands.get(interaction.commandName);
            if (!command) return interaction.reply({
                content: Xeow.translate("events:interactionCreate:cmdNotFound"),
                ephemeral: true
            });
            if (command.timeout) {
                let cd = await Xeow.checkTimeout(command.name, command.timeout, msg.guild.id, msg.author.id)
                if (cd.status) {
                    return msg.replyT("events:interactionCreate:cooldowned", {
                        time: Xeow.msToTime(cd.left)
                    })
                }
            }

            let args = msg.content.split(/ +/)
            args = args.slice(1, args.length)

            if (!msg.channel.nsfw && command.nsfw) {
                return msg.replyT("events:interactionCreate:nsfwCommand")
            }

            if (command.memberPerms?.length) {
                if (!msg.member.permissions.has(command.memberPerms)) return msg.replyT("common:lackedPermission")
            }

            console.log("events:interactionCreate:cmdExecuted", {
                userTag: `${interaction.user.username}#${interaction.user.discriminator}`,
                content: `/${interaction.commandName}${interaction.options?._hoistedOptions.map(o => ` ${o.name}:${o.value}`).join('') || ''}`
            })

            try { await command.run(Xeow, msg, args, { ...command, run: undefined }); }
            catch (error) {
                if (error.message === "Invalid args") return
                return console.error(error);
            }
            let db = await Xeow.DBManager.get("command")
            let source = { command: command.name, guild: msg.guild.id, user: msg.author.id, lastRun: Date.now().toString() }
            let data = (await db.findOne({ where: { command: command.name, guild: msg.guild.id, user: msg.author.id } }))
            if (data?.lastRun) {
                await data.update(source);
                await data.save();
            } else {
                await db.build(source).save();
            }
        }
    }
}