const fs = require('fs');
const API = require('./API/BaseAPI');
const path = require("path");
class SimplePluginLoader {
    constructor(Xeow) {
        this.list = [];
        this.Xeow = Xeow;
        this.plugins = new (Xeow.Libraries["Collection"])()
    }

    async loadPlugin(plobj) {
        const Xeow = this.Xeow
        if (typeof pluginName === 'string') plobj = require("../plugins/" + pluginName)

        let main = Xeow.Configuration.get(`plugins/${plobj.name}/main.yml`)
        if (!main) {
            main = {
                ...plobj, Plugin: undefined, configs: undefined, requires: undefined,
                priority: undefined, api: undefined, version: undefined, author: undefined, language: undefined
            }
            Xeow.Configuration.writeSync(`plugins/${plobj.name}/main.yml`, main)
        }
        const pluginConfig = new Object()

        if (plobj.configs?.length) {
            for (const config of plobj.configs) {
                let filePath = `plugins/${plobj.name}/${config.name}.yml`
                if (!Xeow.Configuration.existsSync(filePath)) {
                    Xeow.Configuration.writeSync(filePath, config.content)
                }
                pluginConfig[config.name] = Xeow.Configuration.get(filePath)
            }
        }

        if (plobj?.languages) {
            let filePath = path.join(__dirname, "../../languages", Xeow.defaultLanguage, "plugins", `${plobj.name}.json`)
            let fileDir = path.join(__dirname, "../../languages", Xeow.defaultLanguage, "plugins")
            if (!fs.existsSync(filePath)) {
                if (!fs.existsSync(fileDir)) fs.mkdirSync(fileDir)
                fs.writeFileSync(filePath, JSON.stringify(plobj?.languages, null, 2), "utf-8")
            }
        }

        //Check For Depencies
        if (main.enable === true) {
            if (plobj.requires.length !== 0) {
                const lacked = plobj.requires.filter(function (item) {
                    try {
                        require(item)
                    } catch (e) {
                        return true
                    }
                });
                if (lacked.length !== 0) return console.showErr("console/pluginLoader:PluginLackDep", {
                    name: plobj.name,
                    node_modules: lacked.join(",")
                })
            }

            const api = new API(this.Xeow, plobj.permissions)
            if (!this._isCompatible(plobj, api)) return console.warn("console/pluginLoader:API:notCompatible",
                {
                    pluginName: plobj.name,
                    supported_api_ver: api.compatible.join(", "),
                    required_api_ver: plobj.api.join('/')
                })
            const plugin = new plobj.Plugin(api, pluginConfig);
            try {
                console.log("console/pluginLoader:loadingPlugin",
                    {
                        plugin_name: plobj.name,
                        plugin_version: plobj.version
                    })
                await plugin.onLoad()
                await plugin.onEnable()
            } catch (err) {
                console.showErr("console/pluginLoader:loadingFailed",
                    {
                        plugin_name: plobj.name,
                        plugin_version: plobj.version
                    })
                return console.error(err)
            }
            if (plugin.loaded === true) {
                console.log("console/pluginLoader:loadingSuccess",
                    {
                        plugin_name: plobj.name,
                        plugin_version: plobj.version,
                        author: plobj.author
                    })
                await this.plugins.set(plobj.name, plugin)
                await this.list.push(plobj.name)
            }
        }
    }

    async loadAll() {
        let files = await fs.readdirSync("./plugins/").filter(x => x.endsWith('.js'));
        if (files.length === 0) return console.log("console/pluginLoader:NoPluginFound")
        let plugins = files.map(file => require("../../plugins/" + file))
            .sort(function (a, b) { return a.priority - b.priority });
        for (const plugin of plugins) {
            await this.loadPlugin(plugin).catch(error => {
                console.showErr('===================================================================================')
                console.showErr("- DO NOT REPORT THIS AS A BUG OR A CRASH, THIS IS REALLY A PLUGIN 'S BUG OR CRASH - ")
                console.showErr("===================================================================================")
                console.error(error)
                console.showErr('===================================================================================')
                console.showErr("- DO NOT REPORT THIS AS A BUG OR A CRASH, THIS IS REALLY A PLUGIN 'S BUG OR CRASH - ")
                console.showErr("===================================================================================")
            })
        }
    }

    async unloadPlugin(pluginName) {
        let plugin = this.plugins.get(pluginName)
        if (plugin) {
            console.log(`正在卸載插件${pluginName}...`)
            await plugin.onDisable(pluginName)
            await this.plugins.delete(pluginName)
            console.log("卸載插件 '" + pluginName + "' 成功!")
        }
    }

    async unloadAll() {
        if (this.list.length === 0) return
        let x = this
        for (const pl of this.list) {
            await x.unloadPlugin(pl)
        }
    }

    all() {
        return this.plugins
    }

    async getAll() {
        let self = this
        return this.pls.map(function (plobj) {
            return {
                name: plobj.name,
                description: plobj.description,
                author: plobj.author,
                version: plobj.version,
                enable: plobj.enable,
                loaded: self.plugins.get(plobj.name) === undefined ? false : true
            }
        })
    }

    _isLoaded(plugin) {
        if (this.list.includes(plugin)) return true
        return false
    }

    _isCompatible(pluginInstance, api) {
        if (!(pluginInstance.api.includes(api) || pluginInstance.api.includes('*')) && !pluginInstance.api.some(api_ => api_.includes(api.version)) && !pluginInstance.api.some(v => api.compatible.includes(v))) {
            return false
        }

        return true
    }
}
module.exports = SimplePluginLoader