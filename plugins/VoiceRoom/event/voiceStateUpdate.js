module.exports = (root, logger) => {
    return async function (oldState, newState) {
        if (oldState.member.user.bot) return;
        let rId = root._CRC.get(newState.guild.id)
        let activeR = root.api.db.get("active_rooms");
        if (oldState?.channelId && !newState.channelId) { // user leave channel
            if (!root._AR.get(oldState.channelId)) return;

            const voice = await newState.guild.channels.cache.get(oldState.channelId)
            if(!voice) console.log("wtf")
            if (voice.members.size) return;
            const timeout = setTimeout(async () => {
                await voice.delete()
                await activeR.destroy({ where: { guild: oldState.guild.id, channel: oldState.channelId } });
                root._AR.delete(voice.id)
            }, 15000)
            await root.timer.set(oldState.channelId, timeout)
        } else { // user join channel
            let cache_channel = root._AR.get(newState.channelId)
            if (cache_channel) {
                let timeout = root.timer.get(newState.channelId)
                if (timeout) await clearTimeout(timeout);
            }
            if (!rId || newState?.channelId !== rId) return; // If not joining create room channel
            let cache_user = await activeR.findOne({ where: { owner: newState.membe.id }});
            if (cache_user) {
                let room = newState.channels.get(newState.channelId)
                return newState.setChannel(room)
            }
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
            console.log(room.id)
            await activeR.build({ owner: newState.member.id, channel: room.id, guild: newState.guild.id }).save()
            root._AR.set(room.id, newState.guild.id);
        }
    }
}