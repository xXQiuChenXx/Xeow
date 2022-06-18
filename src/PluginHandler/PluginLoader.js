const fs = require('fs');

class SimplePluginLoader {
    #API
    constructor(bot) {
        this.#API = require('./API/BaseAPI');
        this.list = 0
    }

    async loadPlugin(plobj) {
        if (typeof pluginName === 'string') plobj = require("../../../plugins/" + pluginName)
        if (plobj.enable === true) {
            if (plobj.requires.length !== 0) {
                let lacked = []
                plobj.requires.forEach(function (item) {
                    try {
                        require(item)
                    } catch (e) {
                        lacked.push(item)
                    }
                });
                if (lacked.length !== 0) return this.logger.showErr(`插件 ${plobj.name} 缺少依賴庫 ${lacked.join(",")}, 因此無法加載此插件`)
            }
            const api = new API(this, plobj.permissions, plobj.name)
            if (!this._isCompatible(plobj, api)) return this.logger.warn(`插件 ${plobj.name} 不兼容該版本, 插件支持的API版本: ${plobj.api.join(", ")} (需求版本: API ${plobj.api.join('/')})`);
            const plugin = new plobj.Plugin(api);
            try {
                this.logger.log("載入插件 '" + plobj.name + "@" + plobj.version + "' 成功! (作者: " + plobj.author + ")")
                await plugin.onLoad()
                await plugin.onEnable()
            } catch (e) {
                throw e
            }
            if (plugin.loaded === true) {
                await this.plugins.set(plobj.name, plugin)
                await this.list.push(plobj.name)
                await this.pls.push(plobj)
            }
        }
    }

    async loadAll(lang) {
        let files = await fs.readdirSync("./plugins/").filter(x => x.endsWith('.js'));
        if(files.length === 0) return console.log(lang.Plugin.NoPlugin)
        let plugins = files.map(file => require("../../../plugins/" + file))
            .sort(function (a, b) { return a.priority - b.priority });
        for (const plugin of plugins) {
            await this.loadPlugin(plugin).catch(error => {
                this.logger.showErr('===================================================================================')
                this.logger.showErr("- DO NOT REPORT THIS AS A BUG OR A CRASH, THIS IS REALLY A PLUGIN 'S BUG OR CRASH - ")
                this.logger.showErr("===================================================================================")
                this.logger.error(error)
                this.logger.showErr('===================================================================================')
                this.logger.showErr("- DO NOT REPORT THIS AS A BUG OR A CRASH, THIS IS REALLY A PLUGIN 'S BUG OR CRASH - ")
                this.logger.showErr("===================================================================================")
            })
        }
    }

    async unloadPlugin(pluginName) {
        let plugin = this.bot.plugins.get(pluginName)
        if (plugin) {
            this.logger.log(`正在卸載插件${pluginName}...`)
            await plugin.onDisable(pluginName)
            await this.bot.plugins.delete(pluginName)
            this.logger.log("卸載插件 '" + pluginName + "' 成功!")
        }
    }

    async unloadAll() {
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