const fs = require("fs");
module.exports = async (Xeow) => {
    let base = {
        enabled: true,
        aliases: [],
        nsfw: false,
        ownerOnly: false,
        memberPerms: [],
        botPermission: [],
        cooldown: 0
    }
    if (!fs.existsSync("./configs/commands")) fs.mkdirSync("./configs/commands");

    const dirs = fs.readdirSync("./commands")
    for (const dir of dirs) {
        const files = fs.readdirSync(`./commands/${dir}/`)
        for (const file of files) {
            const command_file = require(`../../commands/${dir}/${file}`)
            let command = await command_file.getLang(Xeow);
            let cmd = { ...base, ...command_file, ...command, category: dir, ...command_file.config }
            const conf = Xeow.Configuration.get(`commands/${cmd.name}.yml`)
            if (!conf) {
                Xeow.Configuration.writeSync(`commands/${cmd.name}.yml`,
                    { ...base, ...command_file.config, category: dir}, "utf8", { sortKeys: true })
            } else {
                cmd = { ...cmd, ...conf }
            }
            if (cmd.enabled) {
                Xeow.commands.set(cmd.name, cmd)
                if (cmd.aliases.length) {
                    cmd.aliases.forEach(p => {
                        Xeow.aliases.set(p, { ...cmd, name: p })
                    })
                    console.logT("console/main:command:loaded:haveAliase", {
                        commandName: cmd.name,
                        commandAliases: cmd.aliases.join(", ")
                    })
                } else {
                    console.logT("console/main:command:loaded:noAliase", {
                        commandName: cmd.name
                    })
                }
            }
        }
    }
}