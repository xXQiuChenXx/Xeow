const Discord = require("discord.js");
module.exports = {
    config: {
        name: "money",
        emoji: "⚙️",
        description: "設置和更改錢幣指令",
        usage: "money <give/take/set> <成員標註> <數量>",
        memberPerms: ["ADMINISTRATOR"],
        options: [
            { name: 'set', type: 1, description: '設置成員的錢幣', options: 
                [
                    { name: 'member', type: 6, description: '成員標註', required: true },
                    { name: 'amount', type: 10, description: '數量', required: true }
                ]
            },
            { name: 'give', type: 1, description: '給予成員錢幣', options: 
                [
                    { name: 'member', type: 6, description: '成員標註', required: true },
                    { name: 'amount', type: 10, description: '數量', required: true }
                ]
            },
            { name: 'take', type: 1, description: '扣除成員的錢幣', options: 
                [
                    { name: 'member', type: 6, description: '成員標註', required: true },
                    { name: 'amount', type: 10, description: '數量', required: true }
                ]
            }
        ],
    },
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
    }
}