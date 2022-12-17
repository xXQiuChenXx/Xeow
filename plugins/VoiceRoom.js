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
            // Create Room Channels
            this._CRC = new collection();
            // Active Rooms
            this._AR = new collection();
            this.logger = api.getLogger("VoiceRoom");
            this.bot = api.bot
        }

        async onLoad() {
            const vc = require("./VoiceRoom/index");
            await vc.db(this.api);
            const root = this

            // create caches
            let guilds = await (this.api.db.get("guild")).findAll();
            let activeR = await (this.api.db.get("active_rooms")).findAll();
            for (const guild of guilds) {
                if (guild?.roomId) root._CRC.set(guild.id, guild.roomId);
            }
            for (const r of activeR) {
                let g = root.bot.guilds.cache.get(r.guild);
                if (!g) continue;
                let ch = await g.channels.fetch(r.channel).catch(e => { });
                if (!ch) continue;
                if (!ch.members.size) {
                    await ch.delete();
                    await this.api.db.get("active_rooms").destroy({ where: { guild: r.guild, channel: r.channel } });
                } else {
                    root._AR.set(r.channel, r.guild);
                }
            }

            this.command = vc.command(this);

            await this.api.commands.register("vc", this.command);
        }

        /**
         * 
         * @param {string} guildId 
         * @param {string} channelId 
         */
        async setRoom(guildId, channelId) {
            let db = this.api.db.get("guild")
            let guild = await db.findOne({ where: { id: guildId } });
            await guild.update({ roomId: channelId }).then(async (x) => {
                await x.save()
            })
            await this._CRC.set(guildId, channelId);
        }


        async onEnable() {
            const Logger = this.logger
            const root = this
            this.event = async function (oldState, newState) {
                if (oldState.member.user.bot) return;
                let rId = root._CRC.get(newState.guild.id)
                let activeR = root.api.db.get("active_rooms");
                if (oldState?.channelId && !newState.channelId) { // user leave channel
                    const voice = await newState.guild.channels.fetch(oldState.channelId, { force: true })
                    if (voice.members.size) return;
                    if (root._AR.get(oldState.channelId)) await voice.delete()


                } else { // user join channel
                    if (!rId || newState?.channelId !== rId) return; // Setting - channel ID
                    const parentId = newState.channel?.parentId
                    const room = await newState.guild.channels.create({
                        name: `『${newState.member?.nickname || newState.member.user.username}』's room`,
                        parent: parentId,
                        type: 2
                    })
                    await newState.setChannel(room)
                    await newState.channel.permissionOverwrites.set([{
                        id: newState.member.id,
                        allow: "ManageChannels"
                    }])
                    await activeR.build({ owner: newState.member.id, channel: room.id, guild: newState.guild.id }).save()
                    root._AR.set(room.id, newState.guild.id);
                }


            }
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