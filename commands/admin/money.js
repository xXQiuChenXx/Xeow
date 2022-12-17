const Discord = require("discord.js");

module.exports = {
    run: async (Xeow, message, args) => {
        let type = args[0]
        let member = message.mentions.users.first();
        if (!type) return await message.invalidUsage({ position: 0, reason: 1 })
        if (!member) return await message.invalidUsage({ position: 1, reason: 1 })
        if (!args[2]) return await message.invalidUsage({ position: 2, reason: 1 })

        let amount = parseFloat(args[2])
        if (isNaN(amount)) return await message.invalidUsage({ position: 2, reason: 2 })

        if (amount < 0) return await message.invalidUsage({ position: 2, reason: Xeow.translate("commands/money:cantNegNum") })

        if (member.bot) return await message.invalidUsage({ position: 0, reason: Xeow.translate("commands/money:cantBot") })

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
                .setColor("Green")
                .setTitle(Xeow.translate("commands/money:give:title"))
                .setDescription(Xeow.translate("commands/money:give:description", {
                    amount: amount.toFixed(2),
                    member: member.toString(),
                    balance: balance
                }))
            await message.reply({ embeds: [embed] })
        } else if (type === "take") {
            let money = data?.coins === undefined ? 0 : data.coins
            if (!data?.user || parseFloat(money) - amount < 0) return await message.replyT("commands/money:take:no_enough_money")
            let balance = parseFloat(data.coins) - amount
            await data.update({
                coins: balance
            })
            await data.save()

            const embed = new Discord.EmbedBuilder()
                .setColor("Green")
                .setTitle(Xeow.translate("commands/money:take:title"))
                .setDescription(Xeow.translate("commands/money:take:description", {
                    amount: amount.toFixed(2),
                    member: member.toString(),
                    balance: balance
                }))
            await message.reply({ embeds: [embed] })
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
                .setColor("Green")
                .setTitle(Xeow.translate("commands/money:set:title"))
                .setDescription(Xeow.translate("commands/money:set:description",
                    {
                        member: member.toString(),
                        amount: amount
                    }))
            await message.reply({ embeds: [embed] })
        } else {
            return await message.invalidUsage({ position: 0, reason: Xeow.translate("commands/money:invalidUsage") })
        }
    },

    getLang: async function (Xeow) {
        return {
            name: Xeow.translate("app_commands/money:name"),
            description: Xeow.translate("app_commands/money:description"),
            descriptionLocalizations: Xeow.translateAll("app_commands/money:description"),
            defaultMemberPermissions: ["Administrator"],
            options: [{
                name: Xeow.translate("app_commands/money:opts:set:name"),
                nameLocalizations: Xeow.translateAll("app_commands/money:opts:set:name"),
                type: 1,
                description: Xeow.translate("app_commands/money:opts:set:description"),
                descriptionLocalizations: Xeow.translateAll("app_commands/money:opts:set:description"),
                options: [{
                    name: Xeow.translate("app_commands/money:opts:set:opts:member:name"),
                    nameLocalizations: Xeow.translateAll("app_commands/money:opts:set:opts:member:name"),
                    type: 6,
                    description: Xeow.translate("app_commands/money:opts:set:opts:member:description"),
                    descriptionLocalizations: Xeow.translateAll("app_commands/money:opts:set:opts:member:description"),
                    required: true
                }, {
                    name: Xeow.translate("app_commands/money:opts:set:opts:amount:name"),
                    nameLocalizations: Xeow.translateAll("app_commands/money:opts:set:opts:amount:name"),
                    type: 10,
                    description: Xeow.translate("app_commands/money:opts:set:opts:amount:description"),
                    descriptionLocalizations: Xeow.translateAll("app_commands/money:opts:set:opts:amount:description"),
                    required: true
                }]
            }, {
                name: Xeow.translate("app_commands/money:opts:give:name"),
                nameLocalizations: Xeow.translateAll("app_commands/money:opts:give:name"),
                type: 1,
                description: Xeow.translate("app_commands/money:opts:give:description"),
                descriptionLocalizations: Xeow.translateAll("app_commands/money:opts:give:description"),
                options: [{
                    name: Xeow.translate("app_commands/money:opts:give:opts:member:name"),
                    nameLocalizations: Xeow.translateAll("app_commands/money:opts:give:opts:member:name"),
                    type: 6,
                    description: Xeow.translate("app_commands/money:opts:give:opts:member:description"),
                    descriptionLocalizations: Xeow.translateAll("app_commands/money:opts:give:opts:member:description"),
                    required: true
                }, {
                    name: Xeow.translate("app_commands/money:opts:give:opts:amount:name"),
                    nameLocalizations: Xeow.translateAll("app_commands/money:opts:give:opts:amount:name"),
                    type: 10,
                    description: Xeow.translate("app_commands/money:opts:give:opts:amount:description"),
                    descriptionLocalizations: Xeow.translateAll("app_commands/money:opts:give:opts:amount:description"),
                    required: true
                }]
            }, {
                name: Xeow.translate("app_commands/money:opts:take:name"),
                nameLocalizations: Xeow.translateAll("app_commands/money:opts:take:name"),
                type: 1,
                description: Xeow.translate("app_commands/money:opts:take:description"),
                descriptionLocalizations: Xeow.translateAll("app_commands/money:opts:take:description"),
                options: [{
                    name: Xeow.translate("app_commands/money:opts:take:opts:member:name"),
                    nameLocalizations: Xeow.translateAll("app_commands/money:opts:take:opts:member:name"),
                    type: 6,
                    description: Xeow.translate("app_commands/money:opts:take:opts:member:description"),
                    descriptionLocalizations: Xeow.translateAll("app_commands/money:opts:take:opts:member:description"),
                    required: true
                }, {
                    name: Xeow.translate("app_commands/money:opts:take:opts:amount:name"),
                    nameLocalizations: Xeow.translateAll("app_commands/money:opts:take:opts:amount:name"),
                    type: 10,
                    description: Xeow.translate("app_commands/money:opts:take:opts:amount:description"),
                    descriptionLocalizations: Xeow.translateAll("app_commands/money:opts:take:opts:amount:description"),
                    required: true
                }]
            }],
        }
    },
    usage: "commands/money:usage",
    emoji: "⚙️",
    memberPerms: ["Administrator"]

}