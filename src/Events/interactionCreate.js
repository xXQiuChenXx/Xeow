const { Permissions } = require('discord.js');
module.exports = class Event {
    constructor(Xeow) {
        this.Xeow = Xeow
        this.FakeMessage = Xeow.Libraries.FakeMessage
    }
    async run(interaction) {
        const FakeMessage = this.FakeMessage
        const Xeow = this.Xeow
        if (!interaction.isCommand()) return;
        if (!this.Xeow.settings.SlashCommand) return;
        if (interaction.user.bot) return;
        let msg = new FakeMessage(interaction)
        let command = Xeow.commands.get(interaction.commandName);
        if (!command) return interaction.reply({
            content: this.Xeow.translate("events:interactionCreate:cmdNotFound"),
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
            let perms = command.memberPerms.map(perm => Permissions.FLAGS[perm])
            if (!msg.member.permissions.has(perms)) return msg.replyT("common:lackedPermission")
        }

        console.log("events:interactionCreate:cmdExecuted", {
            userTag: `${interaction.user.username}#${interaction.user.discriminator}`,
            content: `/${interaction.commandName}${interaction.options?._hoistedOptions.map(o => ` ${o.name}:${o.value}`).join('') || ''}`
        })

        try { await command.run(Xeow, msg, args, { ...command, run: undefined }); }
        catch (error) {
            if(error.message === "Invalid args") return
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