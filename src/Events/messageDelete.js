module.exports = class Event {
    constructor(Xeow) {
        this.Xeow = Xeow
    }
    async run(message) {
        if (message.author.bot) return
        message.channel.createWebhook((message.member.nickname || message.member.user.username)
            + ` [${message.translate("common:messageDeleted")}]`, {
            avatar: message.author.avatarURL({ format: "png"}),
        })
            .then(async webhook => {
                await webhook.send({ content: message.content})
                await webhook.delete()
            })
            .catch((error) => console.error(error));   
    }
}