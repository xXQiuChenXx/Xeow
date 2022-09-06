const fs = require('fs');
const API = require('./API/BaseAPI');
const path = require("path");
class SimplePluginLoader {
    constructor(Xeow) {
        this.list = [];
        this.Xeow = Xeow;
        this.plugins = new (Xeow.Libraries["Collection"])()
    }

    /**
     * 
     * @param {string || object} plugin Plugin Name or Plugin Instance
     * @returns 
     */
    async loadPlugin(plugin) {
        const Xeow = this.Xeow
        if (typeof plugin === 'string') plugin = require("../../plugins/" + pluginName) // convert plugin name to plugin instance
        if (this.list.includes(plugin.name)) return console.showErr("The Plugin Already Exist") // check whether plugin already loaded
        let main = Xeow.Configuration.get(`plugins/${plugin.name}/main.yml`) // get the main plugin configuration file
        if (!fs.existsSync("./configs/plugins")) fs.mkdir("./configs/plugins")

        if (!main) {
            main = {
                ...plugin, Plugin: undefined, configs: undefined, requires: undefined,
                priority: undefined, api: undefined, version: undefined, author: undefined, language: undefined
            }
            //set main config about a plugin
            Xeow.Configuration.writeSync(`plugins/${plugin.name}/main.yml`, main)
        }

        if (main.enable === true) {

            if (plugin?.config || plugin?.configs) {
                if (Array.isArray(plugin?.configs)) {
                    for (const config of plugin.configs) {
                        if (config.fileName && config.content) {
                            let filePath = `./plugins/${plugin.name}/${config.fileName}.yml`
                            if (!Xeow.Configuration.existsSync(filePath)) {
                                if (typeof config.content === "string" && (config.content?.startsWith("https://") || config.content?.startsWith("http://"))) {
                                    config.content = await this._getContent(config.content)
                                }
                                Xeow.Configuration.writeSync(filePath, config.content)
                            }
                        }
                    }
                } else if (plugin?.config?.fileName && plugin?.config?.content) {
                    let filePath = `./plugins/${plugin.name}/${plugin.config.fileName}.yml`
                    if (!Xeow.Configuration.existsSync(filePath)) {
                        if (typeof plugin.config.content === "string"
                            && (plugin.config.content?.startsWith("https://") || plugin.config.content?.startsWith("http://"))) {
                            plugin.config.content = await this._getContent(plugin.config.content)
                        }
                        Xeow.Configuration.writeSync(filePath, plugin.config.content)
                    }
                }
            }

            if (plugin?.languages || plugin?.language) {
                if (Array.isArray(plugin?.languages)) {
                    for (const lang of plugin.languages) {
                        if (lang.fileName && lang.content) {
                            let fileDir = path.join(__dirname, "../../languages", Xeow.defaultLanguage, "plugins")
                            let filePath = path.join(fileDir, `${lang.fileName}.json`)
                            if (!fs.existsSync(filePath)) {
                                if (!fs.existsSync(fileDir)) fs.mkdirSync(fileDir)
                                if(typeof lang.content !== 'object') throw new Error("Language File Only Accept Object Type")
                                fs.writeFileSync(filePath, JSON.stringify(lang.content, null, 2), "utf-8")
                            }
                        }
                    }
                } else if (plugin?.language?.fileName && plugin?.language?.content) {
                    let fileDir = path.join(__dirname, "../../languages", Xeow.defaultLanguage, "plugins")
                    let filePath = path.join(fileDir, `${plugin.language.fileName}.json`)
                    if (!fs.existsSync(filePath)) {
                        if (!fs.existsSync(fileDir)) fs.mkdirSync(fileDir)
                        if(typeof plugin.language.content !== 'object') throw new Error("Language File Only Accept Object Type")
                        fs.writeFileSync(filePath, JSON.stringify(plugin.language.content, null, 2), "utf-8")
                    }
                }
            }

            //Check For Depencies
            if (plugin.requires && plugin.requires?.length !== 0) {
                const lacked = plugin.requires.filter(function (item) {
                    try {
                        require(item)
                    } catch (e) {
                        return true
                    }
                });
                if (lacked.length !== 0) return console.showErr("console/pluginLoader:PluginLackDep", {
                    name: plugin.name,
                    node_modules: lacked.join(",")
                })
            }

            //Check For API CompatibleAP
            const api = new API(this.Xeow, plugin)
            if (!this._isCompatible(plugin, api)) return console.warn("console/pluginLoader:API:notCompatible",
                {
                    pluginName: plugin.name,
                    supported_api_ver: api.compatible.join(", "),
                    required_api_ver: plugin.api.join('/')
                })

            // Init
            const pluginInstance = new plugin.Plugin(api);
            try {
                console.log("console/pluginLoader:loadingPlugin",
                    {
                        plugin_name: plugin.name,
                        plugin_version: plugin.version
                    })
                await pluginInstance.onLoad()
                await pluginInstance.onEnable()
            } catch (err) {
                console.showErr("console/pluginLoader:loadingFailed",
                    {
                        plugin_name: plugin.name,
                        plugin_version: plugin.version
                    })
                return console.error(err)
            }

            if (plugin.loaded === true) {
                console.log("console/pluginLoader:loadingSuccess",
                    {
                        plugin_name: plugin.name,
                        plugin_version: plugin.version,
                        author: plugin.author
                    })
                await this.plugins.set(plugin.name, pluginInstance)
                await this.list.push(plugin.name)
            }
        }
    }

    async enablePlugin(plugin) {
        if (typeof plugin !== 'function') throw TypeError("Invalid plugin parameter")
        await plugin.onEnable()
    }

    /**
     * 
     * @param {string} pluginName Plugin Name
     */
    getPluginDescription(pluginName) {
        if (!this.list.includes(pluginName)) return console.showErr
        return this.plugins.get(pluginName)?.description
    }

    getPluginFileFilters() {

    }

    /**
     * 
     * @description Load All The Avaible Plugin
     * @returns void
     */
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

    async disablePlugin(pluginName) {
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
        let self = this
        for (const pl of this.list) {
            await self.disablePlugin(pl)
        }
    }

    getAllInstance() {
        return this.plugins
    }

    /**
     * 
     * @returns An Object With All Loaded Plugin Basic Information
     */
    async getAll() {
        let self = this
        return this.plugins.map(function (plugin) {
            return {
                name: plugin.name,
                description: plugin.description,
                author: plugin.author,
                version: plugin.version,
                enable: plugin.enable,
                loaded: self.plugins.get(plugin.name) === undefined ? false : true
            }
        })
    }

    /**
     * 
     * @param {string} plugin Plugin Name
     * @returns Boolean
     */
    _isLoaded(plugin) {
        if (this.list.includes(plugin)) return true
        return false
    }

    /**
     * 
     * @param {object} pluginInstance Plugin Instance
     * @param {Object} api Plugin API
     * @returns 
     */
    _isCompatible(pluginInstance, api) {
        if (!(pluginInstance.api.includes(api) || pluginInstance.api.includes('*'))
            && !pluginInstance.api.some(api_ => api_.includes(api.version))
            && !pluginInstance.api.some(v => api.compatible.includes(v))) {
            return false
        }

        return true
    }

    async _getContent(uri) {
        const fetch = this.Xeow.Modules["node-fetch"]
        let response = await fetch(uri, {
            headers: {
                'Content-Type': 'application/json',
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.81 Safari/537.36 Edg/104.0.1293.54"
            }
        })
        if (response.headers.get("content-type") !== "text/plain; charset=utf-8") throw new Error("Invalid Response Data Type, Accepted text/plain only")
        return response.text()
    }
}

module.exports = SimplePluginLoader