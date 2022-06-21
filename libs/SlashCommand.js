const fs = require("fs")
module.exports = {
    register: async (bot, name) => { },
    reset: async (bot) => {
        let cmds = bot.commands.map(x => x.name)
        let all = cmds.map(cmd => {
            console.log(`[\x1b[32mSlashCommand\x1b[0m] 加載 ${cmd} 指令中...`);
            let pull = bot.commands.get(cmd)
            let data = {
                name: pull.name.toLowerCase(),
                description: pull.description
            }
            if (pull.options) {
                data["options"] = pull.options
            }
            if (pull.permissions) {
                data["defaultPermission"] = false
            }
            console.log(`[\x1b[32mSlashCommand\x1b[0m] 成功加載 ${cmd} 指令`);
            return data
        })

        await bot.application.commands.set(all)
        console.log(`[\x1b[32mSlashCommand\x1b[0m] 斜綫指令注冊成功!`);
    },
    unregister: async (bot) => { },
    remove: async (bot) => {
        await bot.application?.commands.set([])
    },
    resetPerm: async (bot) => {
        let commands = await bot.application.commands.fetch()
        let perms = commands.filter(async function (command) {
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
        guilds  = [...new Set(guilds)];
        for (const guild of guilds) {
            let fullPermissions = perms.map(function(el) {
                el.permissions = el.permissions.filter(element => {
                    if(element.guildID === guild) { delete element.guildID; return true}
                })
                return el
            })
            await bot.guilds.cache.get(guild)?.commands.permissions.set({ fullPermissions });
        }

        console.log(`[\x1b[32mSlashCommand\x1b[0m] Slash Command 已重置！`);

    }
}