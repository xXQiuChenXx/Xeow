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
        if (!fs.existsSync("./configs/main.yml")) {
            return console.log("\u001b[31mError: Configuration File Not Found, Make Sure You Have A look At Our Wiki\u001b[0m")
        }

        const importantFiles = [
            "./src/Xeow/System32.js", "./libs/Logger.js", "./src/Xeow/LangParser.js",
            "./configs/main.yml"]

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
            yaml.load(fs.readFileSync(file, "utf-8"));
        }

        const errorFiles = importantFiles.filter(file => {
            if (file.endsWith(".yml")) {
                try { parseYaml(path.join(__dirname, file)) } catch (error) { return true }
            }
            if (file.endsWith(".js")) {
                try { parseJS(path.join(__dirname, file)) } catch (error) { return true }
            }
            return false
        })

        if (errorFiles.length !== 0) {
            console.log("\u001b[31mXeow Discord Bot requires some basic files to be present or it's getting syntax error. Please go to the repository to download and replace them.\033[0m");
            console.log("\u001b[31mFail Checked files:\n", errorFiles.join("\n"), "\u001b[0m");
            process.exit();
        }

        let conf = yml.load(fs.readFileSync("./configs/main.yml", "utf-8"))
        if (!fs.existsSync(`./languages/${conf.Lang}`)) {
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
async function archiveLog(Xeow) {
    const fs = require("fs")
    const archiver = require('archiver');
    if (fs.existsSync("./logs/lastest.log")) {
        console.debug("core/main:archive:archiving")
        try {
            const output = fs.createWriteStream("./logs/" + `${Xeow.getFormattedDate()}.zip`);
            const archive = archiver('zip', {
                zlib: { level: 9 }
            });
            output.on('close', function () {
                console.debug("core/main:archive:success", { total: archive.pointer() });
            });
            output.on('warning', function (err) {
                console.debug(err.message)
            });
            await archive.pipe(output);
            await archive.file("./logs/lastest.log", { name: 'lastest.log' });
            await archive.finalize();
            await fs.unlinkSync("./logs/lastest.log")
        } catch (error) {
            console.showErr("core/main:archive:failed")
            console.error(error)
        }
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
    const Xeow = new (require("./src/Xeow/Xeow"))();
    const config = Xeow.Configuration.get("main.yml");
    console.log("\x1b[36m\x1b[1m" + fs.readFileSync("./src/logo.txt", "utf-8").split("\n").join("\n\x1b[36m\x1b[1m") + "\x1b[0m")
    await Xeow.init(config)
    const Logger = Xeow.Libraries["Logger"]
    global.console = new Logger({
        caller: "CONSOLE",
        debug: config.Logger.debug,
        ignore: config.Logger.ignore,
        locale: config.Logger.locale,
        format: config.Logger.momentFormat,
        Xeow: Xeow
    })
    Xeow.getLogger = function (name, debug = false, ignore = []) {
        return new Logger({
            caller: name,
            debug: debug,
            ignore: ignore,
            locale: config.Logger.locale,
            format: config.Logger.momentFormat,
            Xeow: Xeow
        })
    }
    console.logT("core/main:bot:nodeJSVersion", { version: process.version })
    await archiveLog(Xeow);
    await CheckForUpdate();
    await Xeow.startup(config)
    Xeow.on("ready", async () => {
        await Xeow.run(config)
        await Xeow.PluginManager.loadAll()
        setTimeout(() => {
            console.infoT("core/main:bot:leaveStar")
        }, 15000)
        console.logT("core/main:bot:loaded", { second: ((performance.now() - ms) / 1000).toFixed(2) })
    })
    Xeow.on("debug", console.debug)
    await Xeow.login(config.Token).catch(error => {
        if (error.message.includes("An invalid token was provided")) {
            console.showErrT("core/main:bot:invalidToken");
        } else {
            console.showErrT("core/main:bot:loginError");
            console.error(error);
        }
        process.exit();
    });
}
Startup()
// ======================= 啓動Xeow機器人 ======================