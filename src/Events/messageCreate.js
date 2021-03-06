const { Permissions } = require('discord.js');
module.exports = class Event {
    constructor(Xeow) {
        this.Xeow = Xeow
    }
    async run(message) {
        const Xeow = this.Xeow
        if (message.author.bot) return;
        const prefix = Xeow.prefix.get(message.guild.id)
        if(!prefix) return
        if (!message.content.toLowerCase().startsWith(prefix)) return;

        if (!message.member) message.member = await message.guild.fetchMember(message);
        if (!message.guild) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/g);
        const cmd = args.shift().toLowerCase();

        if (cmd.length === 0) return;

        let command = Xeow.commands.get(cmd);

        if (!command) command = Xeow.aliases.get(cmd);

        if (command) {
            if(!this.Xeow.settings.PrefixCommand) return;
            if (command.timeout) {
                let cd = await Xeow.checkTimeout(command.name, command.timeout, message.guild.id, message.author.id)
                if (cd.status) {
                    return message.replyT("events:messageCreate:cooldowned", {
                        time: Xeow.msToTime(cd.left)
                    })
                }
            }
            if(!message.channel.nsfw && cmd.nsfw){
				return message.replyT("events:messageCreate:nsfwCommand")
			}

            if(command.memberPerms?.length) {
                let perms = command.memberPerms.map(perm => Permissions.FLAGS[perm])
                if(!message.member.permissions.has(perms)) return message.replyT("common:lackedPermission")
            }

            console.log("events:messageCreate:cmdExecuted",{
                userTag: message.member.user.tag,
                content: message.content
            })
            try { await command.run(Xeow, message, args, { ...command, run: undefined }); }
            catch (error) {
                if(error.message === "Invalid args") return
                return console.error(error);
            }
            let db = await Xeow.DBManager.get("command")
            let source = { command: command.name, guild: message.guild.id, user: message.author.id, lastRun: Date.now().toString() }
            let data = await db.findOne({ where: { command: command.name, guild: message.guild.id, user: message.author.id } })
            if (data?.lastRun) {
                await data.update(source);
                await data.save();
            } else {
                await db.build(source).save()
            }
        }
    }
}