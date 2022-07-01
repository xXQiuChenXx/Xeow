const fs = require("fs");
module.exports = (Xeow) => {
    let base = {
        name: null,
        dirname: false,
        enabled: true,
        guildOnly: false,
        aliases: new Array(),
        botPermissions: new Array(),
        memberPermissions: new Array(),
        nsfw: false,
        ownerOnly: false,
        cooldown: 0,
        description: null
    }
    if(!fs.existsSync("./configs/commands")) fs.mkdirSync("./configs/commands")
    fs.readdirSync("./commands/").map(dir => {
        fs.readdirSync(`./commands/${dir}/`).map(file => {
            let command = require(`../../commands/${dir}/${file}`)
            let cmd = { ...base, ...command.config, run: command.run, category: dir }
            if (cmd.name && cmd.description && cmd.enabled) {
                let conf = Xeow.Configuration.readConfigSync(cmd.name, "command")
                if (!conf) {
                    Xeow.Configuration.writeConfigSync(cmd.name, 
                        {...cmd, run: undefined}, "command", "utf8", { sortKeys: true })
                }
                if (conf) cmd = { ...cmd, ...conf }
                Xeow.commands.set(cmd.name, cmd)
                if (cmd.aliases.length) {
                    cmd.aliases.forEach(p => {
                        Xeow.aliases.set(p, { ...cmd, name: p })
                    })
                    console.log("console/main:command:loaded:haveAliase", {
                        commandName: cmd.name,
                        commandAliases: cmd.aliases.join(", ")
                    })
                } else {
                    console.log("console/main:command:loaded:noAliase", {
                        commandName: cmd.name
                    })
                }
            }
        })
    })
}