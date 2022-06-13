module.exports = class {
    #bot;

    constructor(bot) {
        this.#bot = bot
    }

    register(name, onEvent) {
        this.#bot.on(name, onEvent)
    }

    unregister(name, onEvent) {
        this.#bot.removeListener(name, onEvent)
    }
}