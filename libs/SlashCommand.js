module.exports = {
    register: async (bot, name) => { },
    reset: async (bot, lang) => {
        const prefix = lang.prefix
        let cmds = bot.commands.map(x => x.name)
        let all = cmds.map(cmd => {
            console.log(prefix + lang.loadingCommand.replace(/%cmd%/g, cmd));
            let pull = bot.commands.get(cmd)
            let data = {
                name: pull.name.toLowerCase(),
                description: pull.description
            }
            if (pull.options) data["options"] = pull.options
            if (pull.permissions) data["defaultPermission"] = false
            console.log(prefix + lang.loadedCommand.replace(/%cmd%/g, cmd));
            return data
        })
        try {
            await bot.application.commands.set(all)
        } catch (error) {
            console.log(lang.registerFailed)
            return console.error(error)
        }
        console.log(prefix + lang.registerSuccess);
    },
    unregister: async (bot) => { },
    remove: async (bot) => {
        await bot.application?.commands.set([])
    },
    resetPerm: async (bot) => {
        let commands = await bot.application.commands.fetch()
        let perms = commands.filter(function (command) {
            let pull = bot.commands.get(command.name)
            if (pull.permissions) {
                return {
                    id: command.id,
                    permissions: pull.permissions
                }
            }
        })
        let guilds = []
        for (const cmd of perms) {
            cmd.permissions.forEach(element => {
                guilds.push(element.guildID)
            });
        }
        guilds = [...new Set(guilds)];
        for (const guild of guilds) {
            let fullPermissions = perms.map(function (el) {
                el.permissions = el.permissions.filter(element => {
                    if (element.guildID === guild) { delete element.guildID; return true }
                })
                return el
            })
            await bot.guilds.cache.get(guild)?.commands.permissions.set({ fullPermissions });
        }
    }
}