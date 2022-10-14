const Discord = require("discord.js");

module.exports = {
    run: async (Xeow, message, args) => {
        let type = args[0]
        let member = message.mentions.users.first()
        let amount = parseFloat(args[2])
        if (!type) {
            await Xeow.invalidUsage({ message: message, arg: 0, type: "empty" })
        }

        if (!member) {
            await Xeow.invalidUsage({ message: message, arg: 1, type: "empty" })
        }

        if (isNaN(amount)) {
            await Xeow.invalidUsage({
                message: message,
                arg: 2,
                type: "empty"
            })
        }

        if (amount < 0) return await Xeow.invalidUsage({
            message: message,
            arg: 2,
            type: "incorrect",
            reason: Xeow.translate("admin/money:cannot_negatif_number")
        })

        if (member.bot) return await Xeow.invalidUsage({
            message: message,
            arg: 1,
            type: "incorrect",
            reason: Xeow.translate("admin/money:cannot_negatif_number")
        })

        await Xeow.DBManager.sync()
        let economy = Xeow.DBManager.get("economy")
        let data = await economy.findOne({
            where: {
                guild: message.guild.id,
                user: member.id
            }
        })

        if (type === "give") {
            let balance = data?.coins === undefined ? amount : parseFloat(data.coins) + amount
            if (data?.user) {
                await data.update({
                    coins: balance
                })
                await data.save()
            } else {
                await economy.build({
                    user: message.author.id,
                    guild: message.guild.id,
                    checked_in_count: 0,
                    coins: balance
                }).save();
            }
            const embed = new Discord.EmbedBuilder()
                .setColor(Xeow.translate("admin/money:give:color"))
                .setTitle(Xeow.translate("admin/money:give:title"))
                .setDescription(Xeow.translate("admin/money:give:description", {
                    amount: amount.toFixed(2),
                    member: member.toString(),
                    balance: balance
                }))
            message.reply({ embeds: [embed] })
        } else if (type === "take") {
            let money = data?.coins === undefined ? 0 : data.coins
            if (!data?.user || parseFloat(money) - amount < 0) return message.reply(Xeow.translate("admin/money:take:no_enough_money"))
            let balance = parseFloat(data.coins) - amount
            await data.update({
                coins: balance
            })
            await data.save()

            const embed = new Discord.EmbedBuilder()
                .setColor(Xeow.translate("admin/money:take:color"))
                .setTitle(Xeow.translate("admin/money:take:title"))
                .setDescription(Xeow.translate("admin/money:take:description", {
                    amount: amount.toFixed(2),
                    member: member.toString(),
                    balance: balance
                }))
            message.reply({ embeds: [embed] })
        } else if (type === "set") {
            if (data?.user) {
                await data.update({
                    coins: amount
                })
                await data.save()
            } else {
                await economy.build({
                    user: message.author.id,
                    guild: message.guild.id,
                    checked_in_count: 0,
                    coins: amount
                }).save();
            }
            const embed = new Discord.EmbedBuilder()
                .setColor(Xeow.translate("admin/money:set:color"))
                .setTitle(Xeow.translate("admin/money:set:title"))
                .setDescription(Xeow.translate("admin/money:set:description",
                    {
                        member: member.toString(),
                        amount: amount
                    }))
            message.reply({ embeds: [embed] })
        } else {
            return await Xeow.invalidUsage({
                message: message,
                arg: 0,
                type: "incorrect"
            })
        }
    },

    getLang: async function (Xeow) {
        return {
            name: Xeow.translate("commands/money:name"),
            description: Xeow.translate("commands/money:description"),
            descriptionLocalizations: Xeow.translateAll("commands/money:description"),
            defaultMemberPermissions: ["Administrator"],
            options: [{
                name: Xeow.translate("commands/money:opts:set:name"),
                nameLocalizations: Xeow.translateAll("commands/money:opts:set:name"),
                type: 1,
                description: Xeow.translate("commands/money:opts:set:description"),
                descriptionLocalizations: Xeow.translateAll("commands/money:opts:set:description"),
                options: [{
                    name: Xeow.translate("commands/money:opts:set:opts:member:name"),
                    nameLocalizations: Xeow.translateAll("commands/money:opts:set:opts:member:name"),
                    type: 6,
                    description: Xeow.translate("commands/money:opts:set:opts:member:description"),
                    descriptionLocalizations: Xeow.translateAll("commands/money:opts:set:opts:member:description"),
                    required: true
                }, {
                    name: Xeow.translate("commands/money:opts:set:opts:amount:name"),
                    nameLocalizations: Xeow.translateAll("commands/money:opts:set:opts:amount:name"),
                    type: 10,
                    description: Xeow.translate("commands/money:opts:set:opts:amount:description"),
                    descriptionLocalizations: Xeow.translateAll("commands/money:opts:set:opts:amount:description"),
                    required: true
                }]
            }, {
                name: Xeow.translate("commands/money:opts:give:name"),
                nameLocalizations: Xeow.translateAll("commands/money:opts:give:name"),
                type: 1,
                description: Xeow.translate("commands/money:opts:give:description"),
                descriptionLocalizations: Xeow.translateAll("commands/money:opts:give:description"),
                options: [{
                    name: Xeow.translate("commands/money:opts:give:opts:member:name"),
                    nameLocalizations: Xeow.translateAll("commands/money:opts:give:opts:member:name"),
                    type: 6,
                    description: Xeow.translate("commands/money:opts:give:opts:member:description"),
                    descriptionLocalizations: Xeow.translateAll("commands/money:opts:give:opts:member:description"),
                    required: true
                }, {
                    name: Xeow.translate("commands/money:opts:give:opts:amount:name"),
                    nameLocalizations: Xeow.translateAll("commands/money:opts:give:opts:amount:name"),
                    type: 10,
                    description: Xeow.translate("commands/money:opts:give:opts:amount:description"),
                    descriptionLocalizations: Xeow.translateAll("commands/money:opts:give:opts:amount:description"),
                    required: true
                }]
            }, {
                name: Xeow.translate("commands/money:opts:take:name"),
                nameLocalizations: Xeow.translateAll("commands/money:opts:take:name"),
                type: 1,
                description: Xeow.translate("commands/money:opts:take:description"),
                descriptionLocalizations: Xeow.translateAll("commands/money:opts:take:description"),
                options: [{
                    name: Xeow.translate("commands/money:opts:take:opts:member:name"),
                    nameLocalizations: Xeow.translateAll("commands/money:opts:take:opts:member:name"),
                    type: 6,
                    description: Xeow.translate("commands/money:opts:take:opts:member:description"),
                    descriptionLocalizations: Xeow.translateAll("commands/money:opts:take:opts:member:description"),
                    required: true
                }, {
                    name: Xeow.translate("commands/money:opts:take:opts:amount:name"),
                    nameLocalizations: Xeow.translateAll("commands/money:opts:take:opts:amount:name"),
                    type: 10,
                    description: Xeow.translate("commands/money:opts:take:opts:amount:description"),
                    descriptionLocalizations: Xeow.translateAll("commands/money:opts:take:opts:amount:description"),
                    required: true
                }]
            }],
        }
    },
    config: {
        emoji: "⚙️",
        usage: "money <give/take/set> <成員標註> <數量>",
        memberPerms: ["Administrator"]
    }
}