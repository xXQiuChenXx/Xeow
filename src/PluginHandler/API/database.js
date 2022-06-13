module.exports = class {
    #type;
    constructor(bot, type) {
        if(!type || type !== 'MEMORY' || type !== 'JSON') throw new Error('Invalid type')
        this.#type = type
    }

    register(plugin, file) {
        let Store = require("../../databases/index")()
        if (this.#type === 'JSON') {
            Store.use('JSON')
            let Database = Store.getStoringInstance()
            let middles = Store.getBulitInMiddle()
            let opt = {
                path: require('path').resolve(__dirname, '../../../../plugins/' + plugin),
                caching: true
            }
            opt.startMiddle = middles.startJSON
            opt.endMiddle = middles.endJSON
            return new Database(file, opt)
        } else if (this.#type === 'MEMORY') {
            Store.use('MEMORY')
            let Database = Store.getStoringInstance()
            let middles = Store.getBulitInMiddle()
            let opt = {
                path: require('path').resolve(__dirname, '../../../../plugins/' + plugin),
                caching: true
            }
            opt.startMiddle = middles.startJSON
            opt.endMiddle = middles.endJSON
            return new Database(file, opt)
        }
    }
}