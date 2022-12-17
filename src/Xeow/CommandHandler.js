const fs = require("fs");
module.exports = async (Xeow) => {
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
    if (!fs.existsSync("./configs/commands")) fs.mkdirSync("./configs/commands");

    const dirs = fs.readdirSync("./commands")
    for (const dir of dirs) {
        const files = fs.readdirSync(`./commands/${dir}/`)
        for (const file of files) {
            const command_file = require(`../../commands/${dir}/${file}`)
            let command = await command_file.getLang(Xeow);
            for(const key of Object.keys(base)) {
                if(key === "category") {
                    base[key] = dir
                    continue;
                }
                base[key] = command_file?.[key] || base[key]
            }

            let cmd = { 
                ...base, 
                ...command_file, 
                ...command,
                usage: Xeow.translate(command_file.usage)
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
                    console.logT("core/main:command:loaded:haveAliase", {
                        commandName: cmd.name,
                        commandAliases: cmd.aliases.join(", ")
                    })
                } else {
                    console.logT("core/main:command:loaded:noAliase", {
                        commandName: cmd.name
                    })
                }
            }
        }
    }
}