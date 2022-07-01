module.exports = class DatabaseManager {
    #Xeow
    #db
    constructor(Xeow) {
        this.#Xeow = Xeow;
    }

    async init(config) {
        const fs = require("fs")
        const { Sequelize } = this.#Xeow.Modules["sequelize"];
        if (config.Storage.Type.toLowerCase() === "memory") {
            this.#db = new Sequelize('sqlite::memory:', { logging: msg => console.debug(msg) });
        } else if (config.Storage.Type.toLowerCase() === "sqlite") {
            if (!fs.existsSync("./database")) fs.mkdirSync("./database")
            this.#db = new Sequelize({
                dialect: 'sqlite',
                storage: './database/database.sqlite',
                logging: msg => console.debug(msg)
            });
        } else if (config.Storage.Type.toLowerCase() === "mysql") {
            this.#db = new Sequelize(
                config.Storage.MySQL.Database,
                config.Storage.MySQL.Username,
                config.Storage.MySQL.Password,
                {
                    host: config.Storage.MySQL.Host,
                    port: config.Storage.MySQL.Port,
                    dialect: 'mysql', timezone: "+08:00",
                    logging: msg => console.debug(msg),
                }
            );
        } else {
            console.showErr("console/main:database:invalidType", { type: config.Storage.Type});
            await this.#Xeow.bot.destroy();
            process.exit(0)
        }
    }

    async validate() {
        console.log("console/main:database:validate:verifying")
        try {
            await this.#db.authenticate();
            console.log("console/main:database:validate:success");
        } catch (error) {
            console.showErr("console/main:database:validate:failed")
            console.error(error);
            await this.#Xeow.bot.destroy();
            process.exit(0);
        }
    }

    async startup(config) {
        console.log("console/main:database:checking")
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
            user: { type: DataTypes.STRING, allowNull: false },
            coins: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
            checked_in_count: { type: DataTypes.INTEGER, allowNull: true },
            lastCheckIn: { type: DataTypes.STRING, allowNull: true }
        }, { freezeTableName: true });
        await this.#db.sync({ alter: true });
        await this.#Xeow.guilds.cache.forEach(async guild => {
            let prefix = await this.#db.models.prefixes.findOne({ where: { guild: guild.id } });
            if (!prefix) await this.#db.models.prefixes.build({ guild: guild.id, prefix: config.Prefix }).save()
        })
        console.log("console/main:database:checked")
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