const { readdirSync } = require("fs");
module.exports = (bot, lang) => {
    readdirSync("./commands/").map(dir => {
        readdirSync(`./commands/${dir}/`).map(cmd => {
            let pull = require(`../../commands/${dir}/${cmd}`)
            let Aliases = []; let other = "無"
            bot.commands.set(pull.name, pull)
            if (pull.aliases) {
                pull.aliases.forEach(p => {
                    Aliases.push(p)
                    bot.aliases.set(p, pull)
                })
                other = ", 別名為：" + Aliases.join(", ")
            }
            console.log(lang.Command.Loaded
                .replace("%command_name%", pull.name)
                .replace("%command_aliases%", other))
        })
    })
}