const Discord = require("discord.js");
// const { ButtonStyle } = require('discord.js') //fk
async function MessageButtonPages(options) {
    const defaultEmojis = {
        first: "🏠",
        previous: "◀️",
        next: "▶️",
        last: "➡️",
        number: "#️⃣",
        end: "❌"
    };
    const defaultStyles = {
        first: "Success",
        previous: "Primary",
        next: "Primary",
        last: "Primary",
        number: "Secondary",
        end: "Danger"
    };
    const { message, embeds, time, customFilter, fastSkip, pageTravel, end, newMsg } = options;
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
            accumulator.push(new Discord.ButtonBuilder()
                .setEmoji(defaultEmojis[name])
                .setCustomId(name)
                .setDisabled(state || checkState(name))
                .setStyle(defaultStyles[name]));
            return accumulator;
        }, []);
    };
    const components = (state) => [
        new Discord.ActionRowBuilder().addComponents(generateButtons(state)),
    ];
    const changeFooter = () => {
        const embed = embeds[currentPage - 1];
        // const newEmbed = embed//new Discord.EmbedBuilder(embed);
        if (embed?.footer?.text) {
            return embed.setFooter({ text: `${embed.footer.text} - 第${currentPage}頁, 共有${embeds.length}頁`, iconURL: embed.footer.iconURL });
        }
        return embed.setFooter({ text: `第${currentPage}頁, 共有${embeds.length}頁` });
    };
    let initialMessage;
    if (newMsg === false) {
        try {
            initialMessage = await message.reply({
                embeds: [changeFooter()],
                components: components(),
            });
        } catch (e) {
            initialMessage = await message.edit({
                embeds: [changeFooter()],
                components: components(),
            });
        }
    } else {
        initialMessage = await message.reply({
            embeds: [changeFooter()],
            components: components(),
        });
    }
    const defaultFilter = (interaction) => {
        if (!interaction.deferred)
            interaction.deferUpdate();
        return interaction.user.id === message.author.id;
    };
    const filter = customFilter || defaultFilter;

    const collector = await initialMessage.createMessageComponentCollector({
        filter,
        componentType: 2,
        time: time
    });
    const pageTravelling = new Set();
    const numberTravel = async () => {
        if (pageTravelling.has(message.author.id))
            return message.channel.send("輸入`end`以退出");
        const collector = message.channel.createMessageCollector({
            filter: (msg) => msg.author.id === message.author.id,
            time: 30000,
        });
        const numberTravelMessage = await message.channel.send(`${message.author.tag}, 你有30秒, 請在聊天欄輸入你想要的頁面! 輸入 \`end\` 以退出.`);
        pageTravelling.add(message.author.id);
        collector.on("collect", (message) => {
            if (message.content.toLowerCase() === "end") {
                message.delete().catch(() => { });
                return collector.stop();
            }
            const int = parseInt(message.content);
            if (isNaN(int) || !(int < embeds.length) || !(int >= 1))
                return message.delete();
            currentPage = int;
            initialMessage.edit({
                embeds: [changeFooter()],
                components: components(),
            });
            if (message.guild.me.permissions.has("MANAGE_MESSAGES"))
                message.delete();
        });
        collector.on("end", () => {
            if (numberTravelMessage.deletable)
                numberTravelMessage.delete();
            pageTravelling.delete(message.author.id);
        });
    };
    collector.on("collect", async (interaction) => {
        const id = interaction.customId;
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
        initialMessage.edit({
            embeds: [changeFooter()],
            components: components(),
        });
    });
    collector.on("end", () => {
        let embed = new Discord.EmbedBuilder().setTitle("已失效")
        initialMessage.edit({
            embeds: [embed],
            components: components(true),
        });
    });
};

module.exports = {
    name: "MessageButtonPages",
    main: MessageButtonPages
}