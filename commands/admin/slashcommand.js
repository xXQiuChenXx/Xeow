module.exports = {
    config: {
        name: "slashcommand",
        description: "編輯斜綫指令, reset 和 remove 是包含全部指令",
        usage: "slashcommand <unregister/register/reset/remove> [指令]",
        timeout: 60000,
        memberPerms: ["ADMINISTRATOR"],
        permissions: [],
        options: [{
            name: 'type',
            type: 'STRING',
            description: '編輯斜綫指令',
            required: true,
            choices: [
                { name: 'register', value: 'register' },
                { name: 'unregister', value: 'unregister' },
                { name: 'reset', value: 'reset' },
                { name: 'remove', value: 'remove' },
            ],
        }, {
            name: "command",
            type: "STRING",
            description: "指令名称",
            required: false
        }],
    },
    run: async (Xeow, message, args, config) => {
        const Slashcommand = new (Xeow.Libraries["SlashCommand"])(Xeow)
        const type = args[0]?.toLowerCase()
        const cmdName = args[1]?.toLowerCase()
        if (type === "register") {
            if (!cmdName) return await Xeow.invalidUsage({ message: message, arg: 1, type: "empty" })
            let cmd = Xeow.commands.get(cmdName)
            if (!cmd) return await Xeow.invalidUsage({
                message: message, arg: 1, type: "incorrect",
                reason: Xeow.translate("admin/slashcommand:commandNotFound", {
                    command: cmdName
                })
            })
            let msg = await message.replyT("admin/slashcommand:registeringCommand")
            console.log("admin/slashcommand:registeringCommand")
            try {
                await Slashcommand.register(cmd)
            } catch (error) {
                await msg.editT("admin/slashcommand:registerFailed")
                console.showErr("admin/slashcommand:registerFailed")
                console.error(error);
                return
            }
            await msg.editT("admin/slashcommand:registerSuccess")
            console.log("admin/slashcommand:registerSuccess");
            return;
        } else if (type === "unregister") {
            if (!cmdName) {
                await Xeow.invalidUsage({ message: message, arg: 1, type: "empty" });
                return;
            }
            try {
                await Slashcommand.unregister(cmdName)
            } catch (error) {
                await message.reply(error.message);
                return;
            };
            await message.replyT("admin/slashcommand:unregisteredCommand", {
                command: cmdName
            })
            return;
        } if (type === "reset") {
            let msg = await message.replyT("admin/slashcommand:resetting")
            console.log("admin/slashcommand:resetting")
            try {
                await Slashcommand.reset(Xeow)
            } catch (error) {
                console.showErr("admin/slashcommand:registerFailed")
                console.error(error)
                return msg.editT("admin/slashcommand:resetFailed")
            }
            await msg.editT("admin/slashcommand:settingPermission")
            console.log(Xeow.translate("admin/slashcommand:settingPermission"))
            try {
                await Slashcommand.resetPerm(Xeow)
            } catch (error) {
                console.showErr("admin/slashcommand:setPermissionFailed")
                console.error(error)
                return msg.editT("admin/slashcommand:resetFailed")
            }
            msg.editT("admin/slashcommand:setPermsSuccess")
            console.log("admin/slashcommand:setPermsSuccess")
            message.channel.send(Xeow.translate("admin/slashcommand:hasBeenReset"))
            console.log("admin/slashcommand:hasBeenReset");
            return;
        } else if (type === "remove") {
            try {
                await Slashcommand.remove(Xeow)
            } catch (error) {
                await message.replyT("admin/slashcommand:removeFailed")
                console.showErr("admin/slashcommand:removeFailed")
                return console.error(error)
            }
            await message.replyT("admin/slashcommand:removeSuccess");
            return;
        }
        await Xeow.invalidUsage({ message: message, arg: 0, type: "empty" })
        
    }
}