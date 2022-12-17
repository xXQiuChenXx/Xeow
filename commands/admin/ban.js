module.exports = {
    getLang: async function (Xeow) {
        const tr = Xeow.native("app_commands/ban")
        const trA = Xeow.nativeA("app_commands/ban")
        return {
            name: tr("name"),
            description: tr("description"),
            descriptionLocalizations: trA("description"),
            defaultMemberPermissions: ["BanMembers"],
            options: [
                {
                    name: tr("opts:member:name"),
                    nameLocalizations: trA("opts:member:name"),
                    type: 6,
                    description: tr("opts:member:description"),
                    descriptionLocalizations: trA("opts:member:description"),
                    required: true
                },
                {
                    name: tr("opts:reason:name"),
                    nameLocalizations: trA("opts:reason:name"),
                    type: 3,
                    description: tr("opts:reason:description"),
                    descriptionLocalizations: trA("opts:reason:description"),
                    required: false
                },
                {
                    name: tr("opts:deleteMessage:name"),
                    nameLocalizations: trA("opts:deleteMessage:name"),
                    type: 10,
                    description: tr("opts:deleteMessage:description"),
                    descriptionLocalizations: trA("opts:deleteMessage:description"),
                    required: false
                }
            ]
        }
    },
    usage: "commands/ban:usage",
    emoji: "⛓️",
    botPerms: ["BanMembers"],
    memberPerms: ["BanMembers"],
    run: async (Xeow, message, args) => {
        const member = message.mentions.members.first()
        if (!member) return await message.invalidUsage({ position: 0, reason: 6 })
        const reason = args.slice(1, args.length)?.join(" ") || Xeow.translate("commands/ban:defaultReason");
        try {
            await member.ban({ reason: reason });
        } catch (error) {
            console.error(error)
        }
        await message.replyT("commands/ban:banned", {
            member: member.user.tag
        })
    }
}