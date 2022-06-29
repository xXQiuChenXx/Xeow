// ================== 檢查NodeJS版本是否兼容 ==================
if (process.version.slice(1).split('.')[0] < 16) {
    console.log("\u001b[31mXeow Discord Bot requires NodeJS version 16 or higher. Please go to https://nodejs.org/ to update and install your NodeJS.\033[0m");
    process.exit();
}
// ================== 檢查NodeJS版本是否兼容 ==================


// ===================== 更換主要進程路徑 =====================
process.chdir(__dirname);
// ===================== 更換主要進程路徑 =====================


// ======================== 檢查依賴庫 ========================
const CheckForModules = async () => {
    return new Promise(async (resolve) => {
        const missingModules = Object.keys(require('./package.json').dependencies).filter(module => {
            try {
                require(module);
                return;
            } catch (err) {
                return true
            }
        });

        if (missingModules.length == 0) {
            console.log('No modules are missing... Xeow Discord Bot is starting up');
            resolve();
        } else {
            console.log('Missing modules:');
            console.log(missingModules.join(", "));

            if (process.argv.slice(2).map(a => a.toLowerCase()).includes("--no-install") || missingModules.includes("child_process")) {
                console.log('Please install missing modules then start the bot again');
                process.exit();
            }

            const showInfo = process.argv.slice(2).map(a => a.toLowerCase()).includes("--show-install-output");

            const { spawn } = require('child_process');

            const npmCmd = process.platform == "win32" ? 'npm.cmd' : 'npm';

            console.log(missingModules.length, `module${missingModules.length == 1 ? ' is' : 's are'} not installed... Installing...`);

            if (missingModules.length == 21) {
                await new Promise(resolve => {
                    const install = spawn(npmCmd, ['i']);

                    install.stdout.on('data', (data) => {
                        if (showInfo) console.log(data.toString().trim());
                    });

                    install.stderr.on('data', (data) => {
                        if (showInfo) console.log("\u001b[31m" + data.toString().trim());
                    });

                    install.on('exit', () => {
                        resolve();
                    });
                });
            } else {
                for (let i = 0; i < missingModules.length; i++) {
                    const module = missingModules[i];

                    console.log(`Installing module ${i + 1}/${missingModules.length} (${module})`);

                    await new Promise(resolve => {
                        const install = spawn(npmCmd, ['i', module]);

                        install.stdout.on('data', (data) => {
                            if (showInfo) console.log(data.toString().trim());
                        });

                        install.stderr.on('data', (data) => {
                            if (showInfo) console.log(data.toString().trim());
                        });

                        install.on('exit', () => {
                            console.log(`Finished installing module ${i + 1}/${missingModules.length} (${((i + 1) / missingModules.length * 100).toFixed(2)}% done)`);
                            resolve();
                        });
                    });
                }
            }

            console.log('All missing modules have been installed! Please restart the bot');
            process.exit();
        }
    })
}
// ======================== 檢查依賴庫 ========================


// ===================== 檢查重要文件正確性 =====================
const CheckForBasic = async () => {
    return new Promise(async (resolve) => {
        const yml = require("js-yaml")
        const fs = require("fs");
        const path = require("path")
        const importantFiles = [
            "./src/Xeow/System32.js", "./libs/Logger.js", "./src/Xeow/LangParser.js",
            "./configs/main.yml", "./language/en/main.yml"]

        function parseJS(file) {
            const syntax = require("syntax-error");
            let source
            try {
                source = fs.readFileSync(file, "utf8");
            } catch (error) {
                return true
            }
            let error = syntax(source);
            if (error) {
                return true
            }
        }

        function parseYaml(file) {
            const yaml = require("js-yaml");
            try {
                yaml.load(fs.readFileSync(file, "utf-8"));
            } catch (err) {
                return true
            }
        }

        const errorFiles = importantFiles.filter(file => {
            if (file.endsWith(".yml")) { parseYaml(path.join(__dirname, file)) }
            if (file.endsWith(".js")) { parseJS(path.join(__dirname, file)) }
            return false
        })

        if (errorFiles.length !== 0) {
            console.log("\u001b[31mXeow Discord Bot requires some basic files to be present or it's getting syntax error. Please go to the repository to download and replace them.\033[0m");
            console.log("\u001b[31mFail Checked files:\n", errorFiles.join("\n"), "\u001b[0m");
            process.exit();
        }
        let conf = yml.load(fs.readFileSync("./configs/main.yml", "utf-8"))
        if(!fs.existsSync(`./language/${conf.Lang}`)) {
            console.log(`\u001b[31mUnsupported Language: ${conf.Lang}\u001b[0m`)
            process.exit()
        }
        resolve();
    })
}
// ===================== 檢查重要文件正確性 =====================


// ========================== 檢查更新 =========================
async function CheckForUpdate() {

}
// ========================== 檢查更新 =========================



// ======================== 壓縮記錄文件 =======================
async function archiveLog(Xeow, Lang) {
    const fs = require("fs")
    const archiver = require('archiver');
    if (fs.existsSync("./logs/lastest.log")) {
        console.debug(Lang.archive.archiving)
        try {
            const output = fs.createWriteStream("./logs/" + `${Xeow.getFormattedDate()}.zip`);
            const archive = archiver('zip', {
                zlib: { level: 9 }
            });
            await archive.pipe(output);
            await archive.file("./logs/lastest.log", { name: 'lastest.log' });
            await archive.finalize();
            await fs.unlinkSync("./logs/lastest.log")
        } catch (error) {
            console.showErr(Lang.bot.archive.failed)
            console.error(error)
        }
        console.debug(Lang.archive.success)
    }
}
// ======================== 壓縮記錄文件 =======================


// ======================= 啓動Xeow機器人 ======================
async function Startup() {
    await CheckForModules();
    await CheckForBasic();
    console.clear()
    const ms = performance.now()
    const fs = require("fs")
    console.log("\x1b[36m\x1b[1m" + fs.readFileSync("./src/logo.txt", "utf-8") + "\x1b[0m")
    const Xeow = new (require("./src/Xeow/System32"))();
    const config = Xeow.Configuration.readConfigSync("main");
    const Logger = Xeow.Libraries["Logger"]
    const Language = Xeow.Language.readLangSync("main")
    global.console = new Logger("CONSOLE", config.Logger.debug, config.Logger.ignore, config.Logger.lang)
    console.log(Language.bot.NodeJS.replace(/%version%/g, process.version))
    await archiveLog(Xeow, Language);
    await CheckForUpdate();
    const { Client, Intents, Collection } = Xeow.Modules["discord.js"]
    const bot = new Client({
        intents: [
            Intents.FLAGS.GUILDS,
            Intents.FLAGS.GUILD_MESSAGES,
            Intents.FLAGS.GUILD_PRESENCES,
            Intents.FLAGS.GUILD_INTEGRATIONS,
            Intents.FLAGS.DIRECT_MESSAGES,
            Intents.FLAGS.DIRECT_MESSAGE_TYPING,
            Intents.FLAGS.GUILD_VOICE_STATES,
            Intents.FLAGS.GUILD_WEBHOOKS,
            Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
            Intents.FLAGS.GUILD_INVITES,
            Intents.FLAGS.GUILD_MEMBERS,
            Intents.FLAGS.GUILD_BANS,
            Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
            Intents.FLAGS.GUILD_MESSAGE_REACTIONS
        ],
        autoReconnect: true,
        partials: ["CHANNEL"],
    });
    bot.commands = new Collection();
    bot.aliases = new Collection();
    bot.categories = fs.readdirSync("./commands/");
    bot.plugins = new Collection();
    await bot.login(config.Token).catch(error => {
        if (error.message.includes("An invalid token was provided")) {
            console.showErr(Language.bot.InvalidToken);
        } else {
            console.showErr(Language.bot.LoginError);
            console.error(error);
        }
        process.exit();
    });
    Xeow.setVariable("bot", bot);
    if (Xeow.bot) {
        await Xeow.run(config, Language, ms)
    }
}

Startup()
// ======================= 啓動Xeow機器人 ======================