const optType = {
    "SUB_COMMAND": 1,
    "SUB_COMMAND_GROUP": 2,
    "STRING": 3,
    "INTEGER": 4,
    "BOOLEAN": 5,
    "USER": 6,
    "CHANNEL": 7,
    "ROLE": 8,
    "MENTIONABLE": 9,
    "NUMBER": 10,
    "ATTACHMENT": 11
}

class SlashCommand {
    constructor(Xeow) {
        this.Xeow = Xeow
    }
    async register(cmd) {
        let command = {
            name: cmd.name.toLowerCase(),
            description: cmd.description
        }
        if (cmd.options) command["options"] = cmd.options
        if (cmd?.permissions?.length) command["defaultPermission"] = false
        await this.Xeow.application?.commands.create(command)
        if (cmd?.permissions?.length) {
            let guilds = []
            cmd.permissions.forEach(element => {
                guilds.push(element.guildID)
            });
            guilds = [...new Set(guilds)];
            for (const guild of guilds) {
                let fullPermissions = cmd.permissions
                    .filter(perm => perm.guildID === guild)
                    .map(e => e.guildID = null)
                let g = await this.Xeow.guilds.cache.get(guild)
                if (!g) throw new Error(this.Xeow.translate("admin/slashcommand:guildNotFound", {
                    id: guild
                }))
                await g.commands.permissions.set({ fullPermissions });
            }
        }

    }
    async reset() {
        let cmds = this.Xeow.commands.map(x => x.name)
        let all = cmds.map(cmd => {
            console.log("admin/slashcommand:loadingCommand", {
                command: cmd
            });
            let command = this.Xeow.commands.get(cmd)
            let data = {
                name: command.name.toLowerCase(),
                description: command.description
            }
            if (command.options) data["options"] = command.options
            if (command?.permissions?.length) data["defaultPermission"] = false
            console.log("admin/slashcommand:loadedCommand", {
                command: cmd
            })
            return data
        })
        console.log("admin/slashcommand:registeringCommand")
        await this.Xeow.application?.commands.set(all)
        console.log("admin/slashcommand:registerSuccess");
    }
    async unregister(cmdName) {
        let commands = await this.Xeow.application.commands.fetch()
        let command = commands.find(cmd => cmd.name === cmdName)
        if (!command) throw new Error(this.Xeow.translate("admin/slashcommand:commandNotFound", {
            command: cmdName
        }))
        await this.Xeow.application?.commands.delete(command)
    }
    async remove() {
        await this.Xeow.application?.commands.set([])
    }

    async resetPerm() {
        const Xeow = this.Xeow
        let commands = await Xeow.application.commands.fetch()
        let cmds = commands.map(function (command) {
            let pull = Xeow.commands.get(command.name)
            if (pull.permissions) {
                return {
                    id: command.id,
                    permissions: pull.permissions
                }
            }
            return null
        }).filter(x => x !== null)
        let guilds = []
        for (const cmd of cmds) {
            cmd.permissions.forEach(p => guilds.push(p.guildID))
        }
        guilds = [...new Set(guilds)];
        for (const guild of guilds) {
            let fullPermissions = cmds.map(function (cmd) {
                cmd.permissions = cmd.permissions.filter(el => el.guildID === guild)
                    .map(e => { delete e.guildID; return e })
                return cmd
            })
            if (fullPermissions.permissions?.length) {
                let g = await this.Xeow.guilds.cache.get(guild)
                if (!g) throw new Error(this.Xeow.translate("admin/slashcommand:guildNotFound", {
                    id: guild
                }))
                await g.commands.permissions.set({ fullPermissions });
            }
        }
    }
}

module.exports = {
    name: "SlashCommand",
    main: SlashCommand
}