const fs = require("fs");
const path = require("path");
module.exports = class EventManager {
    constructor(Xeow) {
        this.Xeow = Xeow
        this.events = new Array()
    }

    register(name, onEvent) {
        this.Xeow.on(name, onEvent)
    }

    unregister(name, onEvent) {
        this.Xeow.removeListener(name, onEvent)
    }
    
    init() {
        fs.readdirSync(path.join(__dirname, "../Events"))
            .filter(file => { return file.endsWith(".js"); })
            .forEach(file => {
                const eventName = file.split(".")[0];
                const event = new (require(`../Events/${file}`))(this.Xeow);
                this.Xeow.on(eventName, (...args) => event.run(...args));
                this.events.set(eventName, (...args) => event.run(...args));
                console.logT("core/main:event:loaded", {event: eventName});
            })
    }

    reload() {
        const Xeow = this.Xeow
        fs.readdirSync(path.join(__dirname, "../Events"))
            .filter(file => { return file.endsWith(".js"); })
            .forEach(file => {
                delete require.cache[require.resolve(`../Events/${file}`)];
            })
        this.events.forEach(function(name, onEvent) {
            Xeow.removeListener(name, onEvent)
        })

        this.init()
    }
}