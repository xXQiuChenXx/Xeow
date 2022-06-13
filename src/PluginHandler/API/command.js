module.exports = class {
    #commands;
    #aliases;

    constructor(bot) {
        this.#commands = bot.commands
        this.#aliases = bot.aliases
    }

    register(name, prop = {}, force) {
        let cmd = this.#commands.get(name)
        let cmds = this.#commands
        if (cmd && force !== true) throw new Error(`The command with name ${name} already exist`)
        if (!prop.run) throw new Error('Invalid Usage')
        this.#commands.set(name, prop)
        if (Array.isArray(prop?.aliases)) {
            pull.aliases.forEach(p => {
                if(!cmds.get(p)) {
                    this.#aliases.set(p, prop)
                }
            })
        }
        if (cmd && force === true) console.warn(`檢測到指令${name}已被覆蓋`)
    }

    unregister(name) {
        if(this.#commands.get(name)) this.#commands.delete(name)
        if(this.#aliases.get(name)) this.#aliases.delete(name)
    }

    has(name) {
        if(this.#commands.get(name)) return true
            else return false
    }

    all() {
        return this.#commands.map(cmd => cmd.name)
    }
}