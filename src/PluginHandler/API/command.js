module.exports = class {
    #commands;
    #aliases;
    #Configuration;
    #Xeow;

    constructor(Xeow) {
        this.#Xeow = Xeow
        this.#commands = Xeow.commands
        this.#aliases = Xeow.aliases
        this.#Configuration = Xeow.Configuration
    }

    async register(name, prop = {}, force) {
        const Xeow = this.#Xeow
        let CMD = this.#commands.get(name)
        if (CMD && force !== true) throw new Error(Xeow.translate("core/pluginLoader:API:command:exist", {
            name: name
        }))
        if (!prop.run) throw new Error(Xeow.translate("core/pluginLoader:API:command:invalid"))

        let base = {
            enabled: true,
            aliases: [],
            nsfw: false,
            ownerOnly: false,
            memberPerms: [],
            botPermission: [],
            cooldown: 0,
            config: undefined,
            category: undefined
        }

        let command = await prop.getLang(Xeow);
        for(const key of Object.keys(base)) {
            if(key === "category") {
                base[key] = prop?.category || "plugin"
                continue;
            }
            base[key] = prop?.[key] || base[key]
        }

        let cmd = { 
            ...base, 
            ...prop, 
            ...command,
            usage: Xeow.translate(prop.usage)
        }

        const conf = Xeow.Configuration.get(`commands/${cmd.name}.yml`)
        if (!conf) {
            Xeow.Configuration.writeSync(`commands/${cmd.name}.yml`, base, "utf8", { sortKeys: true })
        } else {
            cmd = { ...cmd, ...conf }
        }

        if (cmd.enabled) {
            Xeow.commands.set(cmd.name, cmd)
            if (cmd.aliases.length) {
                cmd.aliases.forEach(p => {
                    Xeow.aliases.set(p, { ...cmd, name: p })
                })
                console.logT("core/pluginLoader:API:command:loadedWithAliase", {
                    name: cmd.name,
                    aliase: cmd.aliases.join(", ")
                })
            } else {
                console.logT("core/pluginLoader:API:command:loaded", {
                    name: cmd.name
                })
            }
        }

        if (cmd && force === true) console.warnT("core/pluginLoader:API:command:overwrite", {
            name: cmd.name
        })
    }

    async unregister(name) {
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