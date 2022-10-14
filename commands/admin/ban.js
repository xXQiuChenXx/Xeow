module.exports = {
    getLang: async function (Xeow) {
        return {
            name: Xeow.translate("commands/ban:name"),
            description: Xeow.translate("commands/ban:description"),
            descriptionLocalizations: Xeow.translateAll("commands/ban:description"),
            defaultMemberPermissions: ["BanMembers"],
            options: [
                {
                    name: Xeow.translate("commands/ban:opts:member:name"),
                    nameLocalizations: Xeow.translateAll("commands/ban:opts:member:name"),
                    type: 6,
                    description: Xeow.translate("commands/ban:opts:member:description"),
                    descriptionLocalizations: Xeow.translateAll("commands/ban:opts:member:description"),
                    required: true
                },
                {
                    name: Xeow.translate("commands/ban:opts:reason:name"),
                    nameLocalizations: Xeow.translateAll("commands/ban:opts:reason:name"),
                    type: 3,
                    description: Xeow.translate("commands/ban:opts:reason:description"),
                    descriptionLocalizations: Xeow.translateAll("commands/ban:opts:reason:description"),
                    required: false
                },
                {
                    name: Xeow.translate("commands/ban:opts:deleteMessage:name"),
                    nameLocalizations: Xeow.translateAll("commands/ban:opts:deleteMessage:name"),
                    type: 10,
                    description: Xeow.translate("commands/ban:opts:deleteMessage:description"),
                    descriptionLocalizations: Xeow.translateAll("commands/ban:opts:deleteMessage:description"),
                    required: false
                }
            ]
        }
    },
    config: {
        botPerms: ["BanMembers"],
        memberPerms: ["BanMembers"],
        emoji: "⛓️",
        usage: "ban <@成員> [原因] [刪信息]",
    },
    run: async (Xeow, message, args, config) => {
        const member = message.mentions.members.first()
        if (!member) return message.replyT("admin/ban:noMentions")
        const reason = args.slice(1, args.length)?.join(" ") || Xeow.translate("admin/ban:defaultReason");
        try {
            await member.ban({ reason: reason });
        } catch (error) {
            console.error(error)
        }
        await message.replyT("admin/ban:banned", {
            member: member.user.tag
        })
    }
}