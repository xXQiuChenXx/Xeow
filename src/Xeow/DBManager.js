module.exports = class DatabaseManager {
    #Xeow
    #lang
    #db
    constructor(Xeow, lang) {
        this.#Xeow = Xeow;
        this.#lang = lang;
    }

    async connect(config) {
        const fs = require("fs")
        if (!this.#Xeow.Modules["sequelize"]) {
            console.showErr(this.#lang.Database.ModuleNotLoaded);
            await this.#Xeow.bot.destroy();
            process.exit(0);
        }
        const { Sequelize } = this.#Xeow.Modules["sequelize"];
        if (config.Storage.Type === "memory") {
            this.#db = new Sequelize('sqlite::memory:', { logging: msg => console.debug(msg) });
        } else if (config.Storage.Type === "sqlite") {
            if (!fs.existsSync("./database")) fs.mkdirSync("./database")
            this.#db = new Sequelize({
                dialect: 'sqlite',
                storage: './database/database.sqlite',
                logging: msg => console.debug(msg)
            });
        } else if (config.Storage.Type === "mysql") {
            this.#db = new Sequelize(
                config.Storage.MySQL.Database,
                config.Storage.MySQL.Username,
                config.Storage.MySQL.Password,
                { host: config.Storage.MySQL.Host, dialect: 'mysql', timezone:"+08:00", logging: msg => console.debug(msg), }
            );
        } else {
            console.showErr(this.#lang.Database.InvalidType);
            await this.#Xeow.bot.destroy();
            process.exit(0)
        }
    }

    async validate() {
        console.log(this.#lang.Database.Validate.Verifying)
        try {
            await this.#db.authenticate();
            console.log(this.#lang.Database.Validate.Success);
        } catch (error) {
            console.showErr(this.#lang.Database.Validate.Failed)
            console.error(error);
            await this.#Xeow.bot.destroy();
            process.exit(0);
        }
    }

    async startup(config) {
        console.log(this.#lang.Database.Checking)
        const { DataTypes } = this.#Xeow.Modules["sequelize"];
        this.#db.define('command', {
            lastRun: { type: DataTypes.STRING, allowNull: false },
            user: { type: DataTypes.STRING, allowNull: false },
            guild: { type: DataTypes.STRING, allowNull: false },
            command: { type: DataTypes.STRING, allowNull: false },
        }, { freezeTableName: true });
        this.#db.define('prefixes', {
            guild: { type: DataTypes.STRING, allowNull: false, primaryKey: true },
            prefix: { type: DataTypes.STRING, allowNull: false }
        }, { freezeTableName: true });
        this.#db.define('economy', {
            guild: { type: DataTypes.STRING, allowNull: false },
            userId: { type: DataTypes.STRING, allowNull: false, primaryKey: true },
            coins: { type: DataTypes.INTEGER, allowNull: false },
            last_update: { type: DataTypes.STRING, allowNull: false },
            checked_in_count: { type: DataTypes.INTEGER, allowNull: false }
        }, { freezeTableName: true });
        await this.#db.sync({ alter: true });
        this.#Xeow.bot.guilds.cache.forEach(async guild => {
            let prefix = await this.#db.models.prefixes.findOne({ where: { guild: guild.id } });
            if(!prefix) await this.#db.models.prefixes.build({ guild: guild.id, prefix: config.Prefix }).save()
        })
    }

    get(model) {
        return this.#db.models[model]
    }

    async sync(alter, force) {
        await this.#db.sync({ alter: alter, force: force });
    }

    async close() {
        await this.#db.close();
    }
}