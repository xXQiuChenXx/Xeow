module.exports = class {
    #CLI
    constructor(bot) {
        this.#CLI = bot.CLI
    }

    register(name, callback) {
        this.#CLI.set(name, callback)
    }

    unregister(name) {
        this.#CLI.delete(name)
    }
}