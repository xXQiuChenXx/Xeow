module.exports = {
    config: {
        botPerms: ["BanMembers"],
        memberPerms: ["BanMembers"],
        emoji: "⛓️",
    },
    run: async (Xeow, message, args, config) => {
        const id = args[0]
        if (!id) return message.replyT("admin/unban:noMentions")
        let reason;
        if(args.length > 1) reason = args.slice(1, args.length)?.join(" ")
        try {
            await msg.guild.member.unban(id, reason);
        } catch (error) {
            console.error(error)
        }
        await message.replyT("admin/unban:unbanned", {
            id: id
        })
    },
    getLang: async function (Xeow) {
        return {
            name: Xeow.translate("commands/unban:name"),
            description: Xeow.translate("commands/unban:description"),
            descriptionLocalizations:  Xeow.translateAll("commands/unban:description"),
            defaultMemberPermissions: ["BanMembers"],
            options: [{
                name: Xeow.translate("commands/unban:opts:memberID:name"),
                type: 10,
                description: Xeow.translate("commands/unban:opts:memberID:description"), 
                descriptionLocalizations:  Xeow.translateAll("commands/unban:opts:memberID:name"),
                required: true
            }, {
                name: Xeow.translate("commands/unban:opts:reason:name"),
                type: 3,
                description:  Xeow.translate("commands/unban:opts:reason:description"), 
                descriptionLocalizations:   Xeow.translateAll("commands/unban:opts:reason:description"),
                required: false
            }],
        }
    }
}