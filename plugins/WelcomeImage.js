module.exports = {
    name: "WelcomeImage",
    description: "歡迎成員圖片",
    enable: true,
    author: "QiuChen",
    version: "1.0.0",
    api: ['1.0.0'],
    priority: 1,
    configs: [{
        fileName: "settings",
        content: {
            fonts: ["TaipeiSans"],
            image_size: {
                width: 1100,
                height: 500
            },
            background: "welcome-bg.jpg",
            line_1: {
                font: 'bold 60px TaipeiSans',
                fillStyle: '#FFFFFF',
                textAlign: 'center',
                shadowColor: "#000000",
                shadowBlur: 10,
                lineWidth: 10
            },
            line_2: {
                font: 'bold 40px TaipeiSans',
                fillStyle: '#FFFFFF',
                shadowColor: "#000000",
                shadowBlur: 10,
                lineWidth: 10
            }
        }
    }],
    languages: [{
        fileName: "WelcomeImage",
        content: {
            line_1: "歡迎, {{userTag}}",
            line_2: "第 #{{memberCount}} 位成員加入",
            embed_description: "**歡迎來到 {{guild_name}}!**\n嗨 <@{{member_id}}>!, 🎉🤗請到 {{rule_channel}} 同意一下規章哦!",
            embed_footer: "歡迎"
        }
    }],
    requires: ['discord.js', 'canvas'],
    permissions: ['EVENT_ACCESS'],
    Plugin: class Plugin {
        constructor(api) {
            this.config = api.getConfig('settings')
            this.api = api
        }

        async onLoad() {
            const Canvas = require("canvas");
            const Discord = require("discord.js")
            const fs = require("fs")
            const config = this.config
            const api = this.api
            this.event = async function (member) {
                config.fonts.forEach(function (font) {
                    if (fs.existsSync(`./src/font/${font}.ttf`)) {
                        Canvas.registerFont(`./src/font/${font}.ttf`, { family: font });
                    }
                })
                const canvas = Canvas.createCanvas(config.image_size.width, config.image_size.height);
                //make it "2D"
                const ctx = canvas.getContext('2d');
                //set the Background to the welcome.png
                const background = await Canvas.loadImage(`./src/Images/${config.background}`);
                ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
                // ctx.strokeStyle = '#f2f2f2';
                // ctx.strokeRect(0, 0, canvas.width, canvas.height);
                //set the first text string 
                const userTag = api.translate("plugins/WelcomeImage:line_1", {
                    userTag: member.user.tag
                })
                //if the text is too big then smaller the text
                ctx.font = config["line_1"].font,
                ctx.fillStyle = config["line_1"].fillStyle
                ctx.textAlign = config["line_1"].textAlign
                ctx.shadowColor = config["line_1"].shadowColor
                ctx.shadowBlur = config["line_1"].shadowBlur
                ctx.lineWidth = config["line_1"].lineWidth
                ctx.fillText(userTag, canvas.width / 2, canvas.height / 2 + 155);
                //define the Member count
                const textString = api.translate("plugins/WelcomeImage:line_2", {
                    memberCount: member.guild.memberCount
                })
                ctx.font = config["line_2"].font
                ctx.fillStyle = config["line_2"].fillStyle
                ctx.shadowColor = config["line_2"].shadowColor
                ctx.shadowBlur = config["line_2"].shadowBlur
                ctx.lineWidth = config["line_2"].lineWidth
                ctx.fillText(textString, canvas.width / 2, canvas.height / 2 + 220);

                const dWidth = 260
                const dHeight = 260
                const dx = (canvas.width / 2) - (dWidth / 2)
                const dy = 60;

                const x = canvas.width / 2
                const y = dy + (dHeight / 2)
                const radius = dWidth / 2
                const startAngle = 0
                const endAngle = Math.PI * 2

                ctx.beginPath();
                ctx.arc(x, y, radius + 5, startAngle, endAngle);
                ctx.closePath();
                ctx.clip();

                const avatar_bg = await Canvas.loadImage("./src/Images/white.jpg");

                ctx.drawImage(avatar_bg, dx - 6, dy - 6, dWidth + 20, dHeight + 20);

                ctx.beginPath();
                ctx.arc(x, y, radius, startAngle, endAngle);
                ctx.closePath();
                ctx.clip();
                const avatar = await Canvas.loadImage(member.user.displayAvatarURL({ extension: 'jpg' }));

                ctx.drawImage(avatar, dx, dy, dWidth, dHeight);

                const attachment = new Discord.AttachmentBuilder(canvas.toBuffer(), { name: "welcome.png" });
                const rules = member.guild.channels.cache.find(ch => ch.id === member.guild.rulesChannelId).toString()

                const embed = new Discord.EmbedBuilder()
                    .setColor("Random")
                    .setDescription(api.translate("plugins/WelcomeImage:embed_description", {
                        guild_name: member.guild.name,
                        member_id: member.id,
                        rule_channel: rules
                    }))
                    .setTimestamp()
                    .setFooter({
                        text: api.translate("plugins/WelcomeImage:embed_footer"),
                        iconURL: member.guild.iconURL({ dynamic: true })
                    })
                    .setImage("attachment://welcome.png")

                member.guild.systemChannel.send({
                    embeds: [embed], files: [attachment]
                });
            }
            this.api.EventManager.register("guildMemberAdd", this.event)
        }

        async onEnable() {
            this.loaded = true
        }

        async onDisable() {
            this.api.EventManager.unregister("guildMemberAdd", this.event)
            this.loaded = false
        }
    }
}