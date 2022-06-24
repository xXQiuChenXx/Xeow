const { MessageEmbed } = require('discord.js')
module.exports = {
    name: "daily",
    config: {
        "timeout": 86400000
    },
    run: async (Xeow, message, args, lang, config) => {
        let cd = await Xeow.checkTimeout("daily", config.timeout, message.guild.id, message.author.id)
        if (cd.status) {
            await message.reply(`指令正在冷卻中, 請等待 ${Xeow.msToTime(cd.left)}!`)
            throw new Error("Cooldown")
        }
        await Xeow.DBManager.sync()
        let data = await Xeow.DBManager.get("economy")
            .findOne({ where: { guild: message.guild.id, user: message.author.id } })

        if (data?.coins && data?.["checked_in_count"]) {
            let bonus = parseInt(data["checked_in_count"]) * 0.02
            if(bonus > 100) bonus = 100
            let current = parseFloat(data.coins) + 100 + parseFloat(bonus)
            await data.update({ coins: current, lastCheckIn: Date.now().toString(), checked_in_count: data.checked_in_count + 1 })
            await data.save()
            const embed = new MessageEmbed()
                .setColor("RANDOM")
                .setTitle(":white_check_mark: 簽到成功!")
                .setDescription(`你已連續簽到${data["checked_in_count"]}天, 因此你獲得了額外獎勵 ${bonus}, 本次簽到共獲得了 ${bonus + 100} DC幣`)
                .setFooter({ text: '使用 balance 指令可查看你目前擁有的DC幣' })

            await message.reply({ embeds: [embed] })
        } else {
            let current = (data?.coins === undefined ? 0 : data.coins) + 100
            await Xeow.DBManager.get("economy")
                .build({
                    user: message.author.id,
                    guild: message.guild.id,
                    checked_in_count: 1,
                    coins: current,
                    lastCheckIn: Date.now().toString()
                })
                .save()

            const embed = new MessageEmbed()
                .setColor("RANDOM")
                .setTitle(":white_check_mark: 簽到成功!")
                .setDescription(`本次簽到共獲得了 100 DC幣`)
                .setFooter({ text: '使用 balance 指令可查看你目前擁有的DC幣' })

            await message.reply({ embeds: [embed] })
        }
    }
}