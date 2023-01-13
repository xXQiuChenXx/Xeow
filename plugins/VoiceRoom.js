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
            const config = await this.api.getConfig("main");
            Logger.logT("plugins/voiceRoom:initializeDB:load");
            await vc.db(this.api).catch(e => {
                Logger.showErrT("plugins/voiceRoom:initializeDB:failed")
                Logger.error(e)
            }); // Set up the database
            Logger.logT("plugins/voiceRoom:initializeDB:success")
            // ------- caches --------
            let guilds = await (this.api.db.get("guild")).findAll();
            let roomsDB = this.api.db.get("active_rooms")
            const bot = this.bot
            let active_rooms = await roomsDB.findAll();
            for (const guild of guilds) {
                if (guild?.roomId) {
                    this._CRC.set(guild.id, guild.roomId);
                    let g = await bot.guilds.cache.get(guild.id)
                    let ch = await g.channels.cache.get(guild.roomId)
                    if (ch.members.size) {
                        let mems = ch.members.map(x => x)
                        for (const m of mems) {
                            let exist = active_rooms.find(x => x.owner === m.id)
                            let c = g.channels.cache.get(exist?.channel)
                            if (exist && c) {
                                await m.voice.setChannel(c);
                            } else {
                                const roomName = config.defaultRoomName.replaceAll("{{Member}}", m?.nickname || m.user.username)
                                const parentId = ch?.parentId
                                const room = await g.channels.create({
                                    name: roomName,
                                    parent: parentId,
                                    type: 2
                                })
                                await m.voice.setChannel(room)
                                await room.permissionOverwrites.set([{
                                    id: m.id,
                                    allow: "ManageChannels"
                                }])
                                await roomsDB.build({ owner: m.id, channel: room.id, guild: g.id }).save();
                                this._AR.set(room.id, g.id);
                                Logger.infoT("plugins/voiceRoom:newRoomCreated", {
                                    member: m.user.tag,
                                    id: m.id,
                                    roomName: room.name,
                                    roomId: room.id
                                })
                            }
                        }
                    }
                }
            }
            for (const r of active_rooms) {
                let g = this.bot.guilds.cache.get(r.guild); // Check If Guild Exist
                let ch = g.channels.cache.get(r.channel); // Check If Channel Exist
                if (!ch || !g) return await roomsDB.destroy({ where: { guild: r.guild, channel: r.channel } });

                if (!ch.members.size) { // If Channel Don't have any member
                    await ch.delete();
                    await roomsDB.destroy({ where: { guild: r.guild, channel: r.channel } });
                    Logger.infoT(`Deleted voice room (${ch.id}) in guild (${r.guild}) due to inactive / no members inside the room`)
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