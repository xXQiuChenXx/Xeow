module.exports = (root, logger) => {
    return async function (oldState, newState) {
        let member = newState.member;
        let guild = newState.guild;
        if (member.user.bot) return; // return if member is bot
        let rId = root._CRC.get(guild.id) // Get Guild Main Channel
        let activeR = root.api.db.get("active_rooms");  // Prepare for the active room database
        if (oldState?.channelId && !newState.channelId) { // user leave channel
            if (!root._AR.get(oldState.channelId)) return;  // If it is not a room, then return
            const voice = await guild.channels.cache.get(oldState.channelId)
            if (voice.members.size) return;
            const timeout = setTimeout(async () => {
                await voice.delete().catch(e => {})
                await activeR.destroy({ where: { guild: oldState.guild.id, channel: oldState.channelId } });
                root._AR.delete(voice.id)
            }, 15000)
            await root.timer.set(oldState.channelId, timeout)


        } else { // user join and change channel
            let ar = root._AR.get(newState.channelId)
            if (ar) {
                let timeout = root.timer.get(newState.channelId)
                if (timeout) await clearTimeout(timeout);
            }
            if (!rId || newState?.channelId !== rId) return; // If not joining create room channel
            let cache_user = await activeR.findOne({ where: { owner: member.id }});
            if (cache_user) {
                let room = guild.channels.cache.get(cache_user.channel);
                return await newState.setChannel(room);
            }
            const parentId = newState.channel?.parentId
            const room = await guild.channels.create({
                name: `『${member?.nickname || member.user.username}』's room`,
                parent: parentId,
                type: 2
            })
            await newState.setChannel(room)
            await newState.channel.permissionOverwrites.set([{
                id: newState.member.id,
                allow: "ManageChannels"
            }])
            await activeR.build({ owner: member.id, channel: room.id, guild: guild.id }).save()
            root._AR.set(room.id, guild.id);


        } 

        // else if(newState?.channelId && oldState?.channelId) { // user change channel
        //
        // }
    }
}