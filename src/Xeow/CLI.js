const { Collection } = require("discord.js")
module.exports = class CLI {
    #cmd
    #event
    constructor(Xeow) {
        const bot = Xeow.bot
        const lang = Xeow.Language.readLangSync("main")
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
                console.command(lang.CLI.issuedCommand.replace(/%command%/g, Data))
                await cmd.run(args, bot)
            } else {
                console.command(lang.CLI.unknownCommand)
            }
        }
        process.on('unhandledRejection', this.#event.unhandledRejection);
        process.on('uncaughtException', this.#event.uncaughtException);
        process.stdin.on("data", this.#event.data)

        process.on('exit', function (code) {
            console.log(lang.CLI.processExit.replace(/%exitCode%/g, code))
        });

        this.#cmd.stop = {
            name: 'stop',
            usage: lang.CLI.commands.stop.usage,
            description: lang.CLI.commands.stop.description,
            run: async function stop() {
                console.log(lang.CLI.commands.stop.receivedCMD)
                console.log(lang.CLI.commands.stop.loggoutDC)
                await bot.destroy()
                console.log(lang.CLI.commands.stop.disconnectDB)
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
            usage: lang.CLI.commands.help.usage,
            description: lang.CLI.commands.help.description,
            run: async function help(args, bot) {
                if (args[1]) {
                    let cmd = Xeow.CLI._commands.get(args[1])
                    if (!cmd) return console.log(lang.CLI.commands.help.commandNotFound.replace(/%command_name%/g, args[1]))
                    console.log(lang.CLI.getCMD.title.replace(/%command_name%/g, args[1]))
                    console.log(`${lang.CLI.usage}: ${cmd.usage === undefined ? cmd.name : cmd.usage}`)
                    console.log(`${lang.CLI.description}: ${cmd.description === undefined ? lang.CLI.noDescription : cmd.description}`)
                    return console.log("=".repeat(lang.CLI.getCMD.footerRepeat))
                }

                console.log(lang.CLI.getAll.title)
                Xeow.CLI._commands.forEach(function (command) {
                    let cmd = command.usage === undefined ? command.name : command.usage
                    let description = command.description === undefined ? lang.CLI.noDescription : command.description
                    let fulltext = cmd + '  ==>  ' + description
                    if (fulltext.length > 50) fulltext = fulltext.slice(0, 47) + '...'
                    console.log(fulltext)
                })
                console.log("=".repeat(lang.CLI.getAll.footerRepeat))
            }
        }

        this.register('stop', this.#cmd.stop)
        this.register('help', this.#cmd.help)
    }
    register(name, callback){
        if(this._commands.get(name)) throw new Error(lang.CLI.commandExist.replace(/%command_name%/g, name))
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