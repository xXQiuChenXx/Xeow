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
            console.showErrT("core/main:database:invalidType", { type: config.Storage.Type });
            await this.#Xeow.bot.destroy();
            process.exit(0)
        }
    }

    async validate() {
        console.logT("core/main:database:validate:verifying")
        try {
            await this.#db.authenticate();
            console.logT("core/main:database:validate:success");
        } catch (error) {
            console.showErrT("core/main:database:validate:failed")
            console.error(error);
            await this.#Xeow.bot.destroy();
            process.exit(0);
        }
    }

    async startup(config) {
        console.logT("core/main:database:checking")
        const { DataTypes } = this.#Xeow.Modules["sequelize"];
        this.DataTypes = DataTypes;
        this.#db.define('command', {
            lastRun: { type: DataTypes.STRING, allowNull: false },
            user: { type: DataTypes.STRING, allowNull: false },
            guild: { type: DataTypes.STRING, allowNull: false },
            command: { type: DataTypes.STRING, allowNull: false },
        }, { freezeTableName: true, timestamps: false });
        this.#db.define('guild', {
            id: { type: DataTypes.STRING, allowNull: false, primaryKey: true },
            prefix: { type: DataTypes.STRING, allowNull: false },
            // roomId: { type: DataTypes.STRING }
        }, { freezeTableName: true, timestamps: false });
        this.#db.define('economy', {
            guild: { type: DataTypes.STRING, allowNull: false },
            user: { type: DataTypes.STRING, allowNull: false },
            coins: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
            checked_in_count: { type: DataTypes.INTEGER, allowNull: true },
            lastCheckIn: { type: DataTypes.STRING(1000), allowNull: true }
        }, { freezeTableName: true, timestamps: false });

        await this.#db.sync();
        await this.#Xeow.guilds.cache.forEach(async guild => {
            let prefix = await this.#db.models["guild"].findOne({ where: { id: guild.id } });
            if (!prefix) await this.#db.models["guild"].build({ id: guild.id, prefix: config.Prefix }).save()
        })

        console.logT("core/main:database:checked")


    }

    define(table, cols, opts) {
        return this.#db.define(table, cols, opts)
    }

    getQueryInterface() {
        return this.#db.getQueryInterface();
    }

    get(model) {
        return this.#db.models[model]
    }

    async refresh() {
        
    }

    async sync(options) {
        return await this.#db.sync(options);
    }

    async createColumn(table, column, options) {
        const model = this.get(table);
        const attr = await model.describe();
        attr[column] = options;
        this.#db.define(table, attr, { freezeTableName: true, timestamps: false });
        await this.sync({ alter: true })
    }

    async close() {
        await this.#db.close();
    }
}