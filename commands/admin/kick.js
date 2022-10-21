module.exports = {
    getLang: async function (Xeow) {
        return {
            name: Xeow.translate("app_commands/kick:name"),
            description: Xeow.translate("app_commands/kick:description"),
            descriptionLocalizations: Xeow.translateAll("app_commands/kick:description"),
            defaultMemberPermissions: ["KickMembers"],
            options: [
                {
                    name: Xeow.translate("app_commands/kick:opts:member:name"),
                    nameLocalizations: Xeow.translateAll("app_commands/kick:opts:member:name"),
                    type: 6,
                    description: Xeow.translate("app_commands/kick:opts:member:description"),
                    descriptionLocalizations: Xeow.translateAll("app_commands/kick:opts:member:description"),
                    required: true
                },
                {
                    name: Xeow.translate("app_commands/kick:opts:reason:name"),
                    nameLocalizations: Xeow.translateAll("app_commands/kick:opts:reason:name"),
                    type: 3,
                    description: Xeow.translate("app_commands/kick:opts:reason:description"),
                    descriptionLocalizations: Xeow.translateAll("app_commands/kick:opts:reason:description"),
                    required: false
                },
            ]
        }
    },
    usage: "commands/kick:usage",
    config: {
        emoji: "🦵",
        memberPerms: ["KickMembers"],
        botPerms: ["KickMembers"]
    },
    run: async (Xeow, message, args, config) => {
        const member = message.mentions.members.first();
        if(!member) return await message.invalidUsage({ position: 0, reason: 6 })
        const reason = args.slice(1, args.length).join(" ") || Xeow.translate("commands/kick:defaultReason");
        try {
            await member.kick(reason);
        } catch(error) {
            console.error(error)
            return message.replyT("commands/kick:errorOccured")
        }
        await message.replyT("commands/kick:kicked", {
            member: member.user.tag
        })
    }
}