module.exports = {
    getLang: async function (Xeow) {
        return {
            name: Xeow.translate("app_commands/pay:name"),
            description: Xeow.translate("app_commands/pay:description"),
            descriptionLocalizations: Xeow.translateAll("app_commands/pay:description"),
            options: [{
                name: Xeow.translate("app_commands/pay:opts:target:name"),
                nameLocalizations: Xeow.translateAll("app_commands/pay:opts:target:name"),
                description: Xeow.translate("app_commands/pay:opts:target:description"),
                descriptionLocalizations: Xeow.translateAll("app_commands/pay:opts:target:description"),
                type: 6,
                required: true
            }, {
                name: Xeow.translate("app_commands/pay:opts:amount:name"),
                nameLocalizations: Xeow.translateAll("app_commands/pay:opts:amount:name"),
                description: Xeow.translate("app_commands/pay:opts:amount:description"),
                descriptionLocalizations: Xeow.translateAll("app_commands/pay:opts:amount:description"),
                type: 4,
                required: true
            }]
        }
    },
    usage: "commands/pay:usage",
    emoji: "💸",
    run: async (Xeow, message, args) => {
        const { EmbedBuilder } = Xeow.Modules["discord.js"]
        if (!message.mentions.members.first()) return await message.invalidUsage({ position: 0, reason: 6 })
        if (!args[1]) return await message.invalidUsage({ position: 1, reason: 1 })

        if (!parseFloat(args[1]) || parseFloat(args[1]) < 1) {
            return await message.invalidUsage({
                position: 1, reason: Xeow.translate("commands/pay:invalidAmount",
                    { give: args[1] }
                )
            })
        }
        const targetMember = message.mentions.members.first()
        if (targetMember.id === message.author.id) return await message.replyT("commands/pay:invalidTarget")
        if (targetMember.user.bot) return await message.replyT("commands/pay:cantBot")

        const embed = new EmbedBuilder()
        await Xeow.DBManager.sync()
        let self = await Xeow.DBManager.get("economy")
            .findOne({ where: { guild: message.guild.id, user: message.author.id } })
        let other = await Xeow.DBManager.get("economy")
            .findOne({ where: { guild: message.guild.id, user: targetMember.id } })

        if (self?.coins && self.coins >= args[1]) {
            await self.update({ coins: parseFloat(self.coins) - parseFloat(args[1]) })
            await self.save()
            if (other?.coins) {
                await other.update({ coins: parseFloat(other.coins) + parseFloat(args[1]) })
                await other.save()
            } else {
                await Xeow.DBManager.get("economy")
                    .build({
                        user: targetMember.id,
                        guild: message.guild.id,
                        coins: parseFloat(args[1]),
                    })
                    .save()
            }
            embed.setColor("Green")
                .setTitle(Xeow.translate("commands/pay:success:title"))
                .setDescription(Xeow.translate("commands/pay:success:description", {
                    user: args[0],
                    total: args[1].toString()
                }))
                .addFields([
                    {
                        name: Xeow.translate("commands/pay:success:fields:self:name"),
                        value: Xeow.translate("commands/pay:success:fields:self:value", {
                            before: self.coins,
                            after: parseFloat(self.coins) - parseFloat(args[1])
                        }),
                        inline: true
                    }, {
                        name: Xeow.translate("commands/pay:success:fields:other:name"),
                        value: Xeow.translate("commands/pay:success:fields:other:value", {
                            before: other?.coins || 0,
                            after: parseFloat(other?.coins || 0) + parseFloat(args[1])
                        }),
                        inline: true
                    }
                ])
            await message.reply({ embeds: [embed] })
        } else {
            await message.replyT("commands/pay:insufficientBalance")
        }
    }
}