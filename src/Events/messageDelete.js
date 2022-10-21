module.exports = class Event {
    constructor(Xeow) {
        this.Xeow = Xeow
    }
    async run(message) {
        if (message.author.bot) return  // return if msg author is bot
        if (!message.content) return // return if empty message

        const SDM = await this.Xeow.Configuration.get("feature")?.ShowDeletedMessage
        if (SDM && SDM === true) {
            message.channel.createWebhook((message.member.nickname || message.member.user.username)
                + ` [${message.translate("core/common:messageDeleted")}]`, {
                avatar: message.author.avatarURL({ format: "png" }),
            }).then(async webhook => {
                    await webhook.send({ content: message.content })
                    await webhook.delete()
                }).catch((error) => console.error(error));
        }
    }
}