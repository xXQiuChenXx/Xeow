module.exports = {
    usage: "commands/slashcommand:usage",
    config: {
        timeout: 60000,
        emoji: "🤖",
        memberPerms: ["Administrator"],
        ownerOnly: true
    },
    run: async (Xeow, message, args, config) => {
        const type = args[0]?.toLowerCase()
        const cmdName = args[1]?.toLowerCase()
        if (type === "register" && cmdName) {
            let cmd = Xeow.commands.get(cmdName)
            if (!cmd) return await message.invalidUsage({ position: 1, reason: 1 })
            let msg = await message.replyT("commands/slashcommand:registeringCommand", {
                command: cmdName
            })
            console.logT("commands/slashcommand:registeringCommand", {
                command: cmdName
            })
            try {
                await Xeow.application?.commands.create({
                    name: cmd.name.toLowerCase(),
                    description: cmd.description,
                    descriptionLocalizations: cmd?.descriptionLocalizations,
                    dmPermission: cmd?.dmPermission || false,
                    options: cmd?.options,
                    defaultMemberPermissions: cmd?.defaultMemberPermissions || ["UseApplicationCommands"]
                })
            } catch (error) {
                await msg.editT("commands/slashcommand:registerFailed")
                return console.error(error);
            }
            await msg.editT("commands/slashcommand:registerSuccess", { command: cmdName })
            console.logT("commands/slashcommand:registerSuccess", { command: cmdName });
        } else if (type === "unregister" && cmdName) {
            let commands = await Xeow.application.commands.fetch()
            let command = commands.find(cmd => cmd.name === cmdName)
            if (!command) {
                console.showErrT("commands/slashcommand:commandNotFound", {
                    command: cmdName
                })
                return message.editT("commands/slashcommand:commandNotFound", {
                    command: cmdName
                })
            }
            let msg = message.replyT("commands/slashcommand:unregisteringCommand", {
                command: cmdName
            })
            try {
                await Xeow.application?.commands.delete(command)
            } catch (error) {
                await msg.editT("commands/slashcommand:unregisterFailed", {
                    command: cmdName
                })
                return console.error(error)
            };
            await msg.editT("commands/slashcommand:unregisteredCommand", {
                command: cmdName
            })

        } else if (type === "reset") {
            let msg = await message.replyT("commands/slashcommand:resetting")
            console.logT("commands/slashcommand:resetting")
            await Xeow.application?.commands.set([])
            try {
                let commands = Xeow.commands.map(cmd => {
                    return {
                        name: cmd.name.toLowerCase(),
                        description: cmd.description,
                        descriptionLocalizations: cmd?.descriptionLocalizations,
                        dmPermission: cmd?.dmPermission || false,
                        options: cmd?.options,
                        defaultMemberPermissions: cmd?.defaultMemberPermissions || ["UseApplicationCommands"]
                    }
                })
                await Xeow.application?.commands.set(commands)
            } catch (error) {
                console.error(error)
                return msg.editT("commands/slashcommand:resetFailed")
            }
            msg.editT("commands/slashcommand:hasBeenReset")
            console.logT("commands/slashcommand:hasBeenReset");

        } else if (type === "remove") {
            try {
                await Xeow.application?.commands.set([])
            } catch (error) {
                await message.replyT("commands/slashcommand:removeFailed")
                return console.error(error)
            }
            await message.replyT("commands/slashcommand:removeSuccess");
        } else {
            await message.invalidUsage({ position: 0, reason: 1 })
        }
    },
    getLang: async function (Xeow) {
        return {
            name: Xeow.translate("app_commands/slashcommand:name"),
            description: Xeow.translate("app_commands/slashcommand:description"),
            descriptionLocalizations: Xeow.translateAll("app_commands/slashcommand:description"),
            options: [{
                name: Xeow.translate("app_commands/slashcommand:opts:type:name"),
                nameLocalizations: Xeow.translateAll("app_commands/slashcommand:opts:type:name"),
                type: 3,
                description: Xeow.translate("app_commands/slashcommand:opts:type:description"),
                descriptionLocalizations: Xeow.translateAll("app_commands/slashcommand:opts:type:description"),
                required: true,
                choices: [{
                    name: Xeow.translate("app_commands/slashcommand:opts:type:choices:register"),
                    nameLocalizations: Xeow.translateAll("app_commands/slashcommand:opts:type:choices:register"),
                    value: 'register'
                }, {
                    name: Xeow.translate("app_commands/slashcommand:opts:type:choices:unregister"),
                    nameLocalizations: Xeow.translateAll("app_commands/slashcommand:opts:type:choices:unregister"),
                    value: 'unregister'
                }, {
                    name: Xeow.translate("app_commands/slashcommand:opts:type:choices:reset"),
                    nameLocalizations: Xeow.translateAll("app_commands/slashcommand:opts:type:choices:reset"),
                    value: 'reset'
                }, {
                    name: Xeow.translate("app_commands/slashcommand:opts:type:choices:remove"),
                    nameLocalizations: Xeow.translateAll("app_commands/slashcommand:opts:type:choices:remove"),
                    value: 'remove'
                }],
            }, {
                name: Xeow.translate("app_commands/slashcommand:opts:command:name"),
                type: 3,
                description: Xeow.translate("app_commands/slashcommand:opts:command:description"),
                descriptionLocalizations: Xeow.translateAll("app_commands/slashcommand:opts:command:description"),
                required: false
            }],
        }
    },
}