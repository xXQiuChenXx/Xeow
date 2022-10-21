module.exports = {
    getLang: async function (Xeow) {
        return {
            name: Xeow.translate("app_commands/ban:name"),
            description: Xeow.translate("app_commands/ban:description"),
            descriptionLocalizations: Xeow.translateAll("app_commands/ban:description"),
            defaultMemberPermissions: ["BanMembers"],
            options: [
                {
                    name: Xeow.translate("app_commands/ban:opts:member:name"),
                    nameLocalizations: Xeow.translateAll("app_commands/ban:opts:member:name"),
                    type: 6,
                    description: Xeow.translate("app_commands/ban:opts:member:description"),
                    descriptionLocalizations: Xeow.translateAll("app_commands/ban:opts:member:description"),
                    required: true
                },
                {
                    name: Xeow.translate("app_commands/ban:opts:reason:name"),
                    nameLocalizations: Xeow.translateAll("app_commands/ban:opts:reason:name"),
                    type: 3,
                    description: Xeow.translate("app_commands/ban:opts:reason:description"),
                    descriptionLocalizations: Xeow.translateAll("app_commands/ban:opts:reason:description"),
                    required: false
                },
                {
                    name: Xeow.translate("app_commands/ban:opts:deleteMessage:name"),
                    nameLocalizations: Xeow.translateAll("app_commands/ban:opts:deleteMessage:name"),
                    type: 10,
                    description: Xeow.translate("app_commands/ban:opts:deleteMessage:description"),
                    descriptionLocalizations: Xeow.translateAll("app_commands/ban:opts:deleteMessage:description"),
                    required: false
                }
            ]
        }
    },
    usage: "commands/ban:usage",
    config: {
        botPerms: ["BanMembers"],
        memberPerms: ["BanMembers"],
        emoji: "⛓️",
    },
    run: async (Xeow, message, args, config) => {
        const member = message.mentions.members.first()
        if(!member) return await message.invalidUsage({ position: 0, reason: 6 })
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