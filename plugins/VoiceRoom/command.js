const { EmbedBuilder } = require("discord.js");
const cmdLang = require("./cmd-lang");
const fs = require("fs");
const path = require("path");

module.exports = function (PluginInstance) {
    return {
        run: async (Xeow, message, args, config) => {
            const tr = Xeow.native("plugins/VoiceRoom")
            let type = args[0].toLowerCase();
            let guild_db = Xeow.DBManager.get("guild");
            let channel = message.channel
            let everyone = message.guild.roles.everyone;
            if (type === "help") {
                const helpTuT = fs.readFileSync(path.join(__dirname, "help.txt"), "utf-8")
                const helpF = helpTuT.replaceAll("{{mainChannel}}", `<#${PluginInstance._CRC.get(message.guild.id)}>`)
                return await message.reply(helpF);
            } else if (type === "set-main") {
                let ch = message.mentions.channels.first();
                if (!ch) return;
                if (ch.type != 2) return await message.reply(tr("notAVoiceChannel", { channel: `<#${ch.id}>` }));
                await PluginInstance.setRoom(message.guild.id, ch.id);
                return await message.reply(tr("setRoomSuccess", { channel: `<#${ch.id}>` }));
            }

            // Check if room exists and matches
            let room = PluginInstance._AR.get(channel.id)
            if (!room || message.guild.id !== room) return message.reply({ content: tr("onlyInRoomChannel"), ephemeral: true })

            if (type === "info") {
                const embed = new EmbedBuilder()
                    .setTitle(tr("roomInfo"))
                    .setColor("Random")
                    .addFields([{ name: tr("roomName"), value: channel.name, inline: true },
                    {
                        name: tr("roomAdmin"),
                        value: channel.members.map(member => {
                            if (member.permissions.has(["MoveMembers"]) && !member.user.bot) return member.user.tag.toString()
                        }).join(", "),
                        inline: true,
                    }, { name: '\u200b', value: '\u200b', inline: true },
                    {
                        name: tr("publicRoom:title"),
                        value: channel.permissionsFor(everyone).has("ViewChannel") === true ? tr("publicRoom:true") : tr("publicRoom:false"),
                        inline: true
                    }, {
                        name: tr("roomAllowConnect:title"),
                        value: channel.permissionsFor(everyone).has("Connect") === true ? tr("roomAllowConnect:true") : tr("roomAllowConnect:false"),
                        inline: true
                    }, {
                        name: tr("roomAllowSpeak:title"),
                        value: channel.permissionsFor(everyone).has("Speak") === true ? tr("roomAllowSpeak:true") : tr("roomAllowSpeak:false"),
                        inline: true
                    }]);
                await message.reply({ embeds: [embed] });
            } else if (type === "invite") {
                // 檢測私人頻道
                if (!channel.permissionsFor(everyone).has("ViewChannel") && !channel.permissionsFor(message.member).has("ManageChannel")) return
                let invite = await channel.createInvite();
                await message.reply(tr("roomInvite", { inviteLink: invite.toString() }))
            } else if (type === "lock") {
                await channel.permissionOverwrites.set([{
                    id: everyone.id,
                    deny: "Connect"
                }])
                await message.reply(tr("actionSuccess:lock", { channel: `<#${channel.id}>` }))
            } else if (type === "unlock") {
                await channel.permissionOverwrites.set([{
                    id: everyone.id,
                    allow: "Connect"
                }])
                await message.reply(tr("actionSuccess:unlock", { channel: `<#${channel.id}>` }));
            } else if (type === "rename") {
                const name = args.slice(1, args.length).join(" ");
                await message.channel.setName(name)
                await message.reply(tr("actionSuccess:rename", { name: name }));
            } else if (type === "limit") {
                await channel.setUserLimit(parseInt(args[1]))
                await message.reply(tr("actionSuccess:limit", { count: args[1] }))
            } else if (type === "mute") {
                await channel.permissionOverwrites.set([{
                    id: everyone.id,
                    deny: "Speak"
                }])
                await message.reply(tr("actionSuccess:mute"))
            } else if (type === "unmute") {
                await channel.permissionOverwrites.set([{
                    id: everyone.id,
                    allow: "Speak"
                }])
                await message.reply(tr("actionSuccess:unmute"))
            } else if (type === "hide") {
                await channel.permissionOverwrites.set([{
                    id: everyone.id,
                    deny: "ViewChannel"
                }])
                await message.reply(tr("actionSuccess:hide"))
            } else if (type === "visible") {
                await channel.permissionOverwrites.set([{
                    id: everyone.id,
                    allow: "ViewChannel"
                }])
                await message.reply(tr("actionSuccess:visible"));
            } else if (type === "add_admin") {
                let member = message.mentions.member.first();
                if (!member) return await message.reply("NOOO")
                await channel.permissionOverwrites.set([{
                    id: member.id,
                    allow: "ManageChannel"
                }])
                await message.reply(tr("actionSuccess:addAdmin", { member: member.user.toString() }))
            } else if (type === "remove_admin") {
                let member = message.mentions.member.first();
                if (!member) return await message.reply("NOOO")
                await channel.permissionOverwrites.set([{
                    id: member.id,
                    deny: "ManageChannel"
                }])
                await message.reply(tr("actionSuccess:removeAdmin", { member: member.user.toString() }))
            } else if (type === "ban") {
                let member = message.mentions.member.first();
                if (!member) return await message.reply("NOOO")
                await channel.permissionOverwrites.set([{
                    id: member.id,
                    deny: "ViewChannel"
                }])
                await message.reply(tr("actionSuccess:ban", { member: member.user.toString() }))
            } else if (type === "unban") {
                if (!id) return await message.reply("錯誤")
                await channel.permissionOverwrites.set([{
                    id: id,
                    allow: "ViewChannel"
                }])
                await message.reply(tr("actionSuccess:unban", { member: member.user.toString() }))
            }
        },
        getLang: cmdLang,
        usage: "commands/vc:usage"
    }
}