const fs = require("fs");
module.exports = async (Xeow, bot, lang, config) => {
    let commands = Xeow.Language.readLangSync("commands")
    let changed = false
    fs.readdirSync("./commands/").map(dir => {
        fs.readdirSync(`./commands/${dir}/`).map(file => {
            let cmd = require(`../../commands/${dir}/${file}`)
            if (!commands?.[cmd.name]) {
                commands[cmd.name] = {
                    description: cmd.description || lang.Command.NoDescription,
                    timeout: cmd?.timeout || 0,
                    aliases: cmd.aliases || [],
                    usage: cmd.usage || cmd.name,
                    category: cmd.category || dir,
                    options: cmd.options,
                    permissions: cmd.permissions
                }
                changed = true
            }
            if (cmd?.config) {
                if (!Xeow.Configuration.existsSync(cmd.name, "command")) {
                    Xeow.Configuration.writeConfigSync(cmd.name, cmd.config, "command", "utf8")
                }
            }
            if (cmd?.lang) {
                if (!Xeow.Language.existsSync(cmd.name, "command")) {
                    Xeow.Language.writeLangSync(cmd.name, cmd.lang, "command", "utf8")
                }
            }
            cmd = { ...commands[cmd.name], run: cmd.run, name: cmd.name }
            bot.commands.set(cmd.name, cmd)
            if (cmd.aliases.length) {
                cmd.aliases.forEach(p => {
                    bot.aliases.set(p, { ...cmd, name: p})
                })
                console.log(lang.Command.Loaded.replace(/%command_name%/g, cmd.name) + " "
                    + lang.Command.HaveAliase.replace(/%command_aliases%/g, cmd.aliases.join(", ")))
            } else {
                console.log(lang.Command.Loaded
                    .replace(/%command_name%/g, cmd.name))
            }
        })
    })
    if (changed) Xeow.Language.writeLangSync("commands", commands, null, "utf8", { sortKeys: true })
}