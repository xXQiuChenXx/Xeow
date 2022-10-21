module.exports = class {
    #commands;
    #aliases;
    #Configuration

    constructor(Xeow) {
        this.#commands = Xeow.commands
        this.#aliases = Xeow.aliases
        this.#Configuration = Xeow.Configuration
    }

    register(name, prop = {}, force) {
        let cmd = this.#commands.get(name)
        if (cmd && force !== true) throw new Error(Xeow.translate("core/pluginLoader:API:commandExist", {
            commandName: name
        }))
        if (!prop.run) throw new Error(Xeow.translate("core/pluginLoader:API:invalidCommand"))

        let base = {
            name: null,
            enabled: true,
            aliases: new Array(),
            nsfw: false,
            ownerOnly: false,
            memberPerms: [],
            cooldown: 0,
            description: null
        }
        let command;
        let conf = Xeow.Configuration.get(`commands/${name}.yml`)
        if (conf) {
            if (conf?.enabled === false) return
            if (!conf?.description || !conf?.category) return
            command = { ...conf, run: prop.run }
        } else {
            command = { ...base, ...command.config, run: command.run }
            this.#Configuration.Configuration.writeSync(`commands/${name}.yml`,
                { ...cmd, run: undefined }, "utf8", { sortKeys: true })
        }

        this.#commands.set(name, command)
        if (command.aliases.length) {
            command.aliases.forEach(p => {
                this.#aliases.set(p, { ...command, name: p })
            })
            console.log("core/main:command:loaded:haveAliase", {
                commandName: command.name,
                commandAliases: command.aliases.join(", ")
            })
        } else {
            console.log("core/main:command:loaded:noAliase", {
                commandName: command.name
            })
        }

        if (cmd && force === true) console.warn(`檢測到指令${name}已被覆蓋`)
    }

    unregister(name) {
        if (this.#commands.get(name)) this.#commands.delete(name)
        if (this.#aliases.get(name)) this.#aliases.delete(name)
    }

    has(name) {
        if (this.#commands.get(name)) return true
        else return false
    }

    all() {
        return this.#commands.map(cmd => cmd.name)
    }
}