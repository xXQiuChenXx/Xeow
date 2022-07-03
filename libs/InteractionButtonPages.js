const Discord = require("discord.js")
async function InteractionButtonPages(options) {
    const defaultEmojis = {
        first: "🏠",
        previous: "◀️",
        next: "▶️",
        last: "➡️",
        number: "#️⃣",
        end: "❌"
    };
    const defaultStyles = {
        first: "SUCCESS",
        previous: "PRIMARY",
        next: "PRIMARY",
        last: "PRIMARY",
        number: "SECONDARY",
        end: "DANGER"
    };
    const { interaction, embeds, time, customFilter, fastSkip, pageTravel, end } = options;
    let currentPage = 1;
    const generateButtons = (state) => {
        const checkState = (name) => {
            if (["first", "previous"].includes(name) &&
                currentPage === 1)
                return true;
            if (["next", "last"].includes(name) &&
                currentPage === embeds.length)
                return true;
            return false;
        };
        let names = ["previous", "next"];
        if (fastSkip)
            names = ["first", ...names, "last"];
        if (pageTravel)
            names.push("number");
        if (end)
            names.push("end");
        if (names.length > 5)
            console.log("信息按鈕過多, 最大5個/1條信息")
        return names.reduce((accumulator, name) => {
            accumulator.push(new Discord.MessageButton()
                .setEmoji(defaultEmojis[name])
                .setCustomId(name)
                .setDisabled(state || checkState(name))
                .setStyle(defaultStyles[name]));
            return accumulator;
        }, []);
    };
    const components = (state) => [
        new Discord.MessageActionRow().addComponents(generateButtons(state)),
    ];
    const changeFooter = () => {
        const embed = embeds[currentPage - 1];
        const newEmbed = new Discord.MessageEmbed(embed);
        if (embed?.footer?.text) {
            return newEmbed.setFooter({
                text: `${embed.footer.text} - 第${currentPage}頁, 共有${embeds.length}頁`,
                iconURL: embed.footer.iconURL
            });
        }
        return newEmbed.setFooter({ text: `第${currentPage}頁, 共有${embeds.length}頁` });
    };
    await interaction.reply({
        embeds: [changeFooter()],
        components: components(),
    });
    const defaultFilter = async (i) => {
        if (!i.deferred)
            await i.deferUpdate();
        return i.user.id === interaction.user.id;
    };
    const filter = customFilter || defaultFilter;
    const collectorOptions = () => {
        const opt = {
            filter,
            componentType: "BUTTON",
        };
        if (time)
            opt["time"] = time;
        return opt;
    };
    let Msg = await interaction.fetchReply();
    const collector = Msg.createMessageComponentCollector(await collectorOptions());
    const pageTravelling = new Set();
    const numberTravel = async () => {
        if (pageTravelling.has(interaction.user.id))
            return interaction.channel.send("輸入`end`以退出").then((sent) => {
                setTimeout(() => {
                    sent.delete();
                }, 3000);
            });
        const collector = interaction.channel.createMessageCollector({
            filter: (msg) => msg.member.id === interaction.user.id,
            time: 20000,
        });
        const numberTravelMessage = await interaction.channel.send(`${interaction.user.toString()}, 你有20秒, 請在聊天欄輸入你想要的頁面! 輸入 \`end\` 以退出.`);
        pageTravelling.add(interaction.user.id);
        collector.on("collect", (message) => {
            if (message.content.toLowerCase() === "end") {
                message.delete().catch((e) => { console.error(e) });
                return collector.stop();
            }
            const int = parseInt(message.content);
            if (isNaN(int) || !(int < embeds.length) || !(int >= 1))
                return message.delete();
            currentPage = int;
            interaction.editReply({
                embeds: [changeFooter()],
                components: components(),
            });
            if (message.guild.me.permissions.has("MANAGE_MESSAGES"))
                collector.stop()
            message.delete()
        });
        collector.on("end", () => {
            if (numberTravelMessage.deletable)
                numberTravelMessage.delete();
            pageTravelling.delete(interaction.user.id);
        });
    };
    collector.on("collect", async (i) => {
        const id = i.customId;
        if (id === "first")
            currentPage = 1;
        if (id === "previous")
            currentPage--;
        if (id === "next")
            currentPage++;
        if (id === "last")
            currentPage = embeds.length;
        if (id === "number")
            await numberTravel();
        if (id === "end")
            return await collector.stop();
        interaction.editReply({
            embeds: [changeFooter()],
            components: components(),
        });
    });
    collector.on("end", () => {
        let embed = new Discord.MessageEmbed().setTitle("已失效")
        interaction.editReply({
            embeds: [embed],
            components: components(true),
        });
    });
};

module.exports = {
    name: "InteractionButtonPages",
    main: InteractionButtonPages
}