const { readdirSync, existsSync, writeFileSync, readFileSync } = require("fs");
const yml = require("js-yaml");
module.exports = async (Xeow, bot, lang, config) => {
    readdirSync("./commands/").map(dir => {
        readdirSync(`./commands/${dir}/`).map(file => {
            let cmd = require(`../../commands/${dir}/${file}`)
            let Aliases = []; let other = lang.Command.NoAliase
            if(cmd.config) {
                if(!existsSync(`./configs/commands/${cmd.name}.yml`)) {
                    writeFileSync(`./configs/commands/${cmd.name}.yml`, yml.dump(cmd.config), "utf8")
                }
                if(cmd.config?.timeout) {
                    let conf = Xeow.Configuration.readConfigSync(cmd.name, "command")
                    cmd.timeout = conf.timeout
                }
            }
            if(cmd.lang) {
                if(!existsSync(`./language/${config.Lang}/commands/${cmd.name}.yml`)) {
                    writeFileSync(`./language/${config.Lang}/commands/${cmd.name}.yml`, yml.dump(cmd.lang), "utf8")
                }
                let lang = Xeow.Language.readLangSync(cmd.name, "command")
                if(cmd.lang?.usage) cmd.usage = lang?.usage
                if(cmd.lang?.description) cmd.description = lang?.description
                cmd.category = dir
            }
            bot.commands.set(cmd.name, cmd)
            if (cmd.aliases) {
                cmd.aliases.forEach(p => {
                    Aliases.push(p)
                    bot.aliases.set(p, cmd)
                })
                other = Aliases.join(", ")
            }
            console.log(lang.Command.Loaded
                .replace("%command_name%", cmd.name)
                .replace("%command_aliases%", other))
        })
    })
}