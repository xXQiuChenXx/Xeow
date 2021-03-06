const { Collection } = require("discord.js")
module.exports = class CLI {
    #cmd
    #event
    constructor(Xeow) {
        this._commands = new Collection()
        this.#event = new Object()
        this.#cmd = new Object()
        this.#event.unhandledRejection = error => {
            console.showErr('============================================================')
            console.showErr('--- DO NOT REPORT THIS AS A BUG OR A CRASH ---')
            console.showErr("============================================================")
            console.error(error)
            console.showErr('============================================================')
            console.showErr('--- DO NOT REPORT THIS AS A BUG OR A CRASH ---')
            console.showErr("============================================================")
        }
        this.#event.uncaughtException =  function(error){
            console.showErr('============================================================')
            console.showErr('--- DO NOT REPORT THIS AS A BUG OR A CRASH ---')
            console.showErr("============================================================")
            console.error(error)
            console.showErr('============================================================')
            console.showErr('--- DO NOT REPORT THIS AS A BUG OR A CRASH ---')
            console.showErr("============================================================")
        }
        this.#event.data = async data => {
            let Data = data.toString().trim()
            let args = Data.split(' ')
            let cmd = Xeow.CLI._commands.get(args[0])
            if (cmd) {
                console.command(Xeow.translate("console/CLI:issuedCommand", {
                    command: Data
                }))
                await cmd.run(args, Xeow)
            } else {
                console.command(Xeow.translate("console/CLI:unknownCommand"))
            }
        }
        process.on('unhandledRejection', this.#event.unhandledRejection);
        process.on('uncaughtException', this.#event.uncaughtException);
        process.stdin.on("data", this.#event.data)

        process.on('exit', function (code) {
            console.log(Xeow.translate("console/CLI:processExit", {
                exitCode: code
            }))
        });

        this.#cmd.stop = {
            name: 'stop',
            usage: Xeow.translate("console/CLI:commands:stop:usage"),
            description: Xeow.translate("console/CLI:commands:stop:description"),
            run: async function stop() {
                console.log("console/CLI:commands:stop:receivedCMD")
                console.log("console/CLI:commands:stop:loggoutDC")
                await Xeow.destroy()
                console.log("console/CLI:commands:stop:disconnectDB")
                await Xeow.DBManager.close()
                await Xeow.PluginManager.unloadAll().catch(function (error) {
                    console.showErr('============================================================')
                    console.showErr('--- THERE WAS A ERROR WHEN UNLOADING THE PLUGIN ---')
                    console.showErr("============================================================")
                    console.error(error)
                    console.showErr('============================================================')
                    console.showErr('--- THERE WAS A ERROR WHEN UNLOADING THE PLUGIN ---')
                    console.showErr("============================================================")
                })
                await Xeow.CLI.exit()
                process.exit()
            }
        }

        this.#cmd.help = {
            name: 'help',
            usage: Xeow.translate("console/CLI:help:usage"),
            description: Xeow.translate("console/CLI:help:description"),
            run: async function help(args, Xeow) {
                if (args[1]) {
                    let cmd = Xeow.CLI._commands.get(args[1])
                    if (!cmd) return console.log("console/CLI:commands:help:commandNotFound", {
                        commandName: args[1]
                    })
                    console.log(`====================== ${Xeow.translate("console/CLI:commandHelp")} ====================`)
                    console.log(Xeow.translate("console/CLI:commandName") + ":" + cmd.name)
                    console.log(`${Xeow.translate("console/CLI:usage")}: ${cmd.usage === undefined ? cmd.name : cmd.usage}`)
                    console.log(`${Xeow.translate("console/CLI:description")}: ${cmd.description === undefined ? Xeow.translate("console/CLI:noDescription") : cmd.description}`)
                    return console.log("=".repeat(59))
                }

                console.log(`======================== ${Xeow.translate("console/CLI:commandHelpList")} ======================`)
                Xeow.CLI._commands.forEach(function (command) {
                    let cmd = command.usage === undefined ? command.name : command.usage
                    let description = command.description === undefined ? Xeow.translate("console/CLI:noDescription") : command.description
                    let fulltext = cmd + '  ==>  ' + description
                    if (fulltext.length > 50) fulltext = fulltext.slice(0, 47) + '...'
                    console.log(fulltext)
                })
                console.log("=").repeat(60)
            }
        }

        this.register('stop', this.#cmd.stop)
        this.register('help', this.#cmd.help)
    }
    register(name, callback){
        if(this._commands.get(name)) throw new Error(Xeow.translate("console/CLI:commandExist", {
            commandName: name
        }))
        this._commands.set(name, callback)
    }
    unregister(name) {
        this._commands.delete(name)
    }

    exit() {
        process.removeListener('unhandledRejection', this.#event.unhandledRejection);
        process.removeListener('uncaughtException', this.#event.uncaughtException);
        process.stdin.removeListener("data", this.#event.data)
    }
}