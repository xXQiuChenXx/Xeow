module.exports = {
    config: {
        botPerms: ["BanMembers"],
        memberPerms: ["BanMembers"],
        emoji: "⛓️",
    },
    usage: "commands/unban:usage",
    run: async (Xeow, message, args, config) => {
        const id = args[0]
        if (!id) return await message.invalidUsage({ position: 0, reason: 6 })
        let reason;
        if(args.length > 1) reason = args.slice(1, args.length)?.join(" ")
        try {
            await msg.guild.member.unban(id, reason);
        } catch (error) {
            console.error(error)
        }
        await message.replyT("commands/unban:unbanned", {
            id: id
        })
    },
    getLang: async function (Xeow) {
        return {
            name: Xeow.translate("app_commands/unban:name"),
            description: Xeow.translate("app_commands/unban:description"),
            descriptionLocalizations:  Xeow.translateAll("app_commands/unban:description"),
            defaultMemberPermissions: ["BanMembers"],
            options: [{
                name: Xeow.translate("app_commands/unban:opts:memberID:name"),
                type: 10,
                description: Xeow.translate("app_commands/unban:opts:memberID:description"), 
                descriptionLocalizations:  Xeow.translateAll("app_commands/unban:opts:memberID:name"),
                required: true
            }, {
                name: Xeow.translate("app_commands/unban:opts:reason:name"),
                type: 3,
                description:  Xeow.translate("app_commands/unban:opts:reason:description"), 
                descriptionLocalizations:   Xeow.translateAll("app_commands/unban:opts:reason:description"),
                required: false
            }],
        }
    }
}