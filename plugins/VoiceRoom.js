const voiceStateUpdate = require("./VoiceRoom/event/voiceStateUpdate");
const vc = require("./VoiceRoom/index");

module.exports = {
    name: "VoiceRoom",
    description: "Allows member to create voice channel room",
    author: "QiuChen",
    version: "1.0.0",
    priority: 1,
    api: ["1.0.0"],
    permissions: ["FULL_ACCESS"],
    Plugin: class Plugin {
        constructor(api) {
            this.api = api
            const collection = api.Libraries["Collection"];
            // Create Room Channels (CRC)
            // Active Room (AR)
            this._CRC = new collection;
            this._AR = new collection;
            this.timer = new collection();
            this.logger = api.getLogger("VoiceRoom");
            this.bot = api.bot
        }

        async onLoad() {
            const Logger = this.logger;
            await vc.db(this.api); // Set up the database
            // ------- caches --------
            let guilds = await (this.api.db.get("guild")).findAll();
            let roomsDB = this.api.db.get("active_rooms")
            let active_rooms = await roomsDB.findAll();
            for (const guild of guilds) {
                if (guild?.roomId) this._CRC.set(guild.id, guild.roomId);
            }
            for (const r of active_rooms) {
                let g = this.bot.guilds.cache.get(r.guild); // Check If Guild Exist
                console.log(r.channel)
                let ch = g.channels.cache.get(r.channel); // Check If Channel Exist
                if(!g) console.log("WHAT THE FUCK")
                if (!ch || !g) {
                    console.log("whatttt")
                    return await roomsDB.destroy({ where: { guild: r.guild, channel: r.channel } });
                }
                if (!ch.members.size) { // If Channel Don't have any member
                    await ch.delete();
                    await roomsDB.destroy({ where: { guild: r.guild, channel: r.channel } });
                    Logger.info(`Deleted voice room (${ch.id}) due to inactive / no members inside the room`)
                } else {
                    this._AR.set(r.channel, r.guild);
                }
            }
            //  --------  Command ---------
            this.command = vc.command(this); // Prepare For The Commands
            await this.api.commands.register("vc", this.command); // Register Command
        }

        /**
         * 
         * @param {string} guildId 
         * @param {string} channelId 
         */
        async setRoom(guildId, channelId) {
            let db = this.api.db.get("guild");
            let guild = await db.findOne({ where: { id: guildId } });
            await guild.update({ roomId: channelId }).then(async (x) => {
                await x.save()
            })
            await this._CRC.set(guildId, channelId);
        }


        async onEnable() {
            this.event = voiceStateUpdate(this, this.logger)
            await this.api.EventManager.register('voiceStateUpdate', this.event)

            this.loaded = true
        }


        async onDisable() {
            await this.api.commands.unregister("vc", this.command)
            await this.api.EventManager.unregister('voiceStateUpdate', this.event)
            this.loaded = false
        }
    }
}