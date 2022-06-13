module.exports = class {
    #bot;

    constructor(bot) {
        this.#bot = bot
    }

    register(extractor) {
        this.#bot.player.extractor.register(extractor)
    }

    unregister(extractor) {
        this.#bot.player.extractor.unregister(extractor)
    }
}