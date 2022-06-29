const yml = require("js-yaml");
const fs = require("fs")
const config = yml.load(fs.readFileSync("./configs/main.yml", "utf-8"))
const { Client, Intents, Collection } = require("discord.js")
const bot = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_INTEGRATIONS,
        Intents.FLAGS.GUILD_MEMBERS
    ],
});
const slashCommand = require("./libs/SlashCommand");
const commands = yml.load(fs.readFileSync(`./language/${config.Lang}/commands.yml`, "utf-8"))
const lang = yml.load(fs.readFileSync(`./language/${config.Lang}/slashcommand.yml`, "utf-8"))
const prefix = lang.prefix
bot.on("ready",  async function(bot) {
    console.log(prefix + lang.loggedIn.replace(/%username%/g, bot.user.username))
    bot.commands = new Collection()
    fs.readdirSync("./commands/").map(dir => {
        fs.readdirSync(`./commands/${dir}/`).map(file => {
            let cmd = require(`./commands/${dir}/${file}`)
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
            }
            cmd = { ...commands[cmd.name], name: cmd.name }
            bot.commands.set(cmd.name, cmd)
            if (cmd.aliases.length) {
                cmd.aliases.forEach(p => {
                    if(!bot.commands.get(p)) {
                        bot.commands.set(p, { ...cmd, name: p})
                    }
                })
            }
        })
    })
    await slashCommand.reset(bot, lang)
    await slashCommand.resetPerm(bot, lang)
    bot.destroy()
})
bot.login(process.env.token || config.Token)