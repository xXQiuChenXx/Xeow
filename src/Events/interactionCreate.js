module.exports = class Event {
    constructor(Xeow) {
        this.bot = Xeow.bot
        this.EventManager = Xeow.EventManager
    }
    on() {
        this.EventManager.register("interactionCreate", this._main)
    }
    remove() {
        this.EventManager.unregister("interactionCreate", this._main)
    }

    _main() {

    }
}