module.exports = {
    config: {
        usage: "slashcommand <unregister/register/reset/remove> [指令]",
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
            if (!cmd) return await Xeow.invalidUsage({
                message: message, arg: 1, type: "incorrect",
                reason: Xeow.translate("admin/slashcommand:commandNotFound", {
                    command: cmdName
                })
            })
            let msg = await message.replyT("admin/slashcommand:registeringCommand", {
                command: cmdName
            })
            console.logT("admin/slashcommand:registeringCommand", {
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
                await msg.editT("admin/slashcommand:registerFailed")
                return console.error(error);
            }
            await msg.editT("admin/slashcommand:registerSuccess", { command: cmdName })
            console.logT("admin/slashcommand:registerSuccess", { command: cmdName });
        } else if (type === "unregister" && cmdName) {
            let commands = await Xeow.application.commands.fetch()
            let command = commands.find(cmd => cmd.name === cmdName)
            if (!command) {
                console.showErrT("admin/slashcommand:commandNotFound", {
                    command: cmdName
                })
                return message.editT("admin/slashcommand:commandNotFound", {
                    command: cmdName
                })
            }
            let msg = message.replyT("admin/slashcommand:unregisteringCommand", {
                command: cmdName
            })
            try {
                await Xeow.application?.commands.delete(command)
            } catch (error) {
                await msg.editT("admin/slashcommand:unregisterFailed", {
                    command: cmdName
                })
                return console.error(error)
            };
            await msg.editT("admin/slashcommand:unregisteredCommand", {
                command: cmdName
            })

        } else if (type === "reset") {
            let msg = await message.replyT("admin/slashcommand:resetting")
            console.logT("admin/slashcommand:resetting")
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
                return msg.editT("admin/slashcommand:resetFailed")
            }
            msg.editT("admin/slashcommand:hasBeenReset")
            console.logT("admin/slashcommand:hasBeenReset");

        } else if (type === "remove") {
            try {
                await Xeow.application?.commands.set([])
            } catch (error) {
                await message.replyT("admin/slashcommand:removeFailed")
                return console.error(error)
            }
            await message.replyT("admin/slashcommand:removeSuccess");
        } else {
            await Xeow.invalidUsage({ message: message, arg: 0, type: "empty" })
        }
    },
    getLang: async function (Xeow) {
        return {
            name: Xeow.translate("commands/slashcommand:name"),
            description: Xeow.translate("commands/slashcommand:description"),
            descriptionLocalizations: Xeow.translateAll("commands/slashcommand:description"),
            options: [{
                name: Xeow.translate("commands/slashcommand:opts:type:name"),
                nameLocalizations: Xeow.translateAll("commands/slashcommand:opts:type:name"),
                type: 3,
                description: Xeow.translate("commands/slashcommand:opts:type:description"),
                descriptionLocalizations: Xeow.translateAll("commands/slashcommand:opts:type:description"),
                required: true,
                choices: [{
                    name: Xeow.translate("commands/slashcommand:opts:type:choices:register"),
                    nameLocalizations: Xeow.translateAll("commands/slashcommand:opts:type:choices:register"),
                    value: 'register'
                }, {
                    name: Xeow.translate("commands/slashcommand:opts:type:choices:unregister"),
                    nameLocalizations: Xeow.translateAll("commands/slashcommand:opts:type:choices:unregister"),
                    value: 'unregister'
                }, {
                    name: Xeow.translate("commands/slashcommand:opts:type:choices:reset"),
                    nameLocalizations: Xeow.translateAll("commands/slashcommand:opts:type:choices:reset"),
                    value: 'reset'
                }, {
                    name: Xeow.translate("commands/slashcommand:opts:type:choices:remove"),
                    nameLocalizations: Xeow.translateAll("commands/slashcommand:opts:type:choices:remove"),
                    value: 'remove'
                }],
            }, {
                name: Xeow.translate("commands/slashcommand:opts:command:name"),
                type: 3,
                description: Xeow.translate("commands/slashcommand:opts:command:description"),
                descriptionLocalizations: Xeow.translateAll("commands/slashcommand:opts:command:description"),
                required: false
            }],
        }
    },
}