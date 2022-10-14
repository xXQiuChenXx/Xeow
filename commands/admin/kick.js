module.exports = {
    getLang: async function (Xeow) {
        return {
            name: Xeow.translate("commands/kick:name"),
            description: Xeow.translate("commands/kick:description"),
            descriptionLocalizations: Xeow.translateAll("commands/kick:description"),
            defaultMemberPermissions: ["KickMembers"],
            options: [
                {
                    name: Xeow.translate("commands/kick:opts:member:name"),
                    nameLocalizations: Xeow.translateAll("commands/kick:opts:member:name"),
                    type: 6,
                    description: Xeow.translate("commands/kick:opts:member:description"),
                    descriptionLocalizations: Xeow.translateAll("commands/kick:opts:member:description"),
                    required: true
                },
                {
                    name: Xeow.translate("commands/kick:opts:reason:name"),
                    nameLocalizations: Xeow.translateAll("commands/kick:opts:reason:name"),
                    type: 3,
                    description: Xeow.translate("commands/kick:opts:reason:description"),
                    descriptionLocalizations: Xeow.translateAll("commands/kick:opts:reason:description"),
                    required: false
                },
            ]
        }
    },
    config: {
        usage: "kick <@成員>",
        emoji: "🦵",
        memberPerms: ["KickMembers"],
        botPerms: ["KickMembers"]
    },
    run: async (Xeow, message, args, config) => {
        const member = message.mentions.members.first();
        if(!member) return message.replyT("admin/kick:noMentions");
        const reason = args.slice(1, args.length).join(" ") || Xeow.translate("admin/kick:defaultReason");
        try {
            await member.kick(reason);
        } catch(error) {
            console.error(error)
            return message.replyT("admin/kick:errorOccured")
        }
        await message.replyT("admin/kick:kicked", {
            member: member.user.tag
        })
    }
}