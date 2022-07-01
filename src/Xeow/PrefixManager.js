module.exports = class PrefixManagaer {
    #cache
    #db
    constructor(db, cache) {
        this.#cache = cache
        this.#db = db
    }

    get(guild) {
        return this.#cache.find(p => p.guild === guild).prefix
    }

    async fetch(guild) {
        return (await this.#db.findOne({ where: { guild: guild } })).prefix
    }

    async update(guild, prefix) {
        this.#cache = this.#cache.map(object => {
            if (object.guild === guild) {
                return { ...object, prefix: prefix };
            }
            return object;
        });
        await this.#db.findOne({ where: { guild: guild } }).update({ guild: guild, prefix: prefix });
    }
}