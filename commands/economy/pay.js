module.exports = {
    config: {
        name: "pay",
        usage: "pay <成員標註> <金額>",
        description: "付款/轉賬",
        options: [{
            name: 'target',
            type: 'USER',
            description: '成員標註',
            required: true
        }, {
            name: 'amount',
            type: 'INTEGER',
            description: '金額',
            required: true
        }]
    },
    run: async (Xeow, message, args, config) => {
        const { MessageEmbed } = Xeow.Modules["discord.js"]
        if (!args[0] || !message.mentions.members.first()) return await Xeow.invalidUsage({ message: message, arg: 0, type: "empty" })
        if (!args[1]) return await Xeow.invalidUsage({ message: message, arg: 1, type: "empty" })

        if (!parseFloat(args[1]) || parseFloat(args[1]) < 1) {
            return await Xeow.invalidUsage({
                message: message, arg: 1, type: "incorrect",
                reason: message.translate("economy/pay:invalidAmount", {
                    give: args[1]
                })
            })
        }
        const targetMember = message.mentions.members.first()
        if (targetMember.id === message.author.id) return await Xeow.invalidUsage({
            message: message, arg: 0, type: "incorrect",
            reason: message.translate("economy/pay:invalidTarget")
        })
        if (targetMember.user.bot) return message.reply(message.translate("economy/pay:noBot"))
        const embed = new MessageEmbed()
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
            embed.setColor("GREEN")
                .setTitle(message.translate("economy/pay:success:title"))
                .setDescription(message.translate("economy/pay:success:description", {
                    user: args[0],
                    total: args[1]
                }))
                .addField(message.translate("economy/pay:success:fields:self:name"),
                    message.translate("economy/pay:success:fields:self:value", {
                        before: self.coins,
                        after: parseFloat(self.coins) - parseFloat(args[1])
                    }), true)
                .addField(message.translate("economy/pay:success:fields:other:name"),
                    message.translate("economy/pay:success:fields:other:value", {
                        before: other?.coins || 0,
                        after: parseFloat(other?.coins || 0) + parseFloat(args[1])
                    }), true)
            message.reply({ embeds: [embed] })
        } else {
            message.reply(message.translate("economy/pay:insufficientBalance"))
        }
    }
}