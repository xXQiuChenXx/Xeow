module.exports = (Xeow) => {
    const bot = Xeow.bot
    process.on('unhandledRejection', error => {
        console.showErr('============================================================')
        console.showErr('--- DO NOT REPORT THIS AS A BUG OR A CRASH ---')
        console.showErr("============================================================")
        console.error(error)
        console.showErr('============================================================')
        console.showErr('--- DO NOT REPORT THIS AS A BUG OR A CRASH ---')
        console.showErr("============================================================")
    });
    
    process.on('uncaughtException', function (err) {
        console.showErr('============================================================')
        console.showErr('--- DO NOT REPORT THIS AS A BUG OR A CRASH ---')
        console.showErr("============================================================")
        console.error(err)
        console.showErr('============================================================')
        console.showErr('--- DO NOT REPORT THIS AS A BUG OR A CRASH ---')
        console.showErr("============================================================")
    });

    process.on('exit', function (code) {
        console.log("完畢! 機器人已關閉, 退出代碼: " + code)
    });

    const stop = {
        name: 'stop',
        usage: 'stop',
        description: '關閉機器人',
        run: async function stop() {
            console.log("接收到關閉指令, 關閉機器人中...")
            console.log("退出登入DC中...")
            await bot.destroy()
            console.log("與Sqlite斷開鏈接中...")
            // await bot.cooldowns.close()
            // await bot.pluginmanager.unloadAll().catch(function(error) {
            //     console.showErr('============================================================')
            //     console.showErr('--- THERE WAS A ERROR WHEN UNLOADING THE PLUGIN ---')
            //     console.showErr("============================================================")
            //     console.error(error)
            //     console.showErr('============================================================')
            //     console.showErr('--- THERE WAS A ERROR WHEN UNLOADING THE PLUGIN ---')
            //     console.showErr("============================================================")
            // })
            process.exit()
        }
    }

    const help = {
        name: 'help',
        usage: 'help [指令]',
        description: '幫助指令',
        run: async function help(args, bot) {
            if (args[1]) {
                let cmd = Xeow.CLI.get(args[1])
                if(!cmd) return console.log('無法找到指令: ' + args[1])
                console.log(`===================== ${args[1]} 指令幫助列表 ===================`)
                console.log(`使用方法: ${cmd.usage === undefined ? cmd.name : cmd.usage}` )
                console.log(`描述: ${cmd.description === undefined ? '無': cmd.description}`)
                return console.log("===========================================================")
            }

            console.log("======================== 指令幫助列表 ======================")
            Xeow.CLI.forEach(function (command) {
                let cmd = command.usage === undefined ? command.name : command.usage
                let description = command.description === undefined ? '無添加任何指令描述' : command.description
                let fulltext = cmd + '  ==>  ' + description
                if (fulltext.length > 50) fulltext = fulltext.slice(0, 47) + '...'
                console.log(fulltext)
            })
            console.log("===========================================================")
        }
    }

    Xeow.CLI.set('stop', stop)
    Xeow.CLI.set('help', help)

    process.stdin.on("data",
        async function Console(data) {
            let Data = data.toString().trim()
            let args = Data.split(' ')
            let cmd = Xeow.CLI.get(args[0])
            if (cmd) {
                console.command('終端執行了指令: ' + Data)
                await cmd.run(args, bot)
            } else {
                console.command("未知指令，請重試")
            }
        })
}