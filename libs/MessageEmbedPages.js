const Discord = require("discord.js")
async function MessageEmbedPages(options)  {
    const defaultEmojis = {
        first: "🏠",
        previous: "◀️",
        next: "▶️",
        last: "➡️",
        number: "#️⃣",
        end: "❌"
    };
    const { message, embeds, time, fastSkip, pageTravel, end } = options;
    if (embeds.length === 1) {
        return message.reply({ embeds: [embeds[0]] })
    }
    let currentPage = 1;
    let names = ["previous", "next"];
    if (fastSkip)
        names = ["first", ...names, "last"];
    if (pageTravel)
        names.push("number");
    if (end)
        names.push("end");

    const changeFooter = () => {
        const embed = embeds[currentPage - 1];
        const newEmbed = new Discord.MessageEmbed(embed);
        if (embed?.footer?.text) {
            return newEmbed.setFooter({ text: `${embed.footer.text} - 第${currentPage}頁, 共有${embeds.length}頁`, iconURL: embed.footer.iconURL });
        }
        return newEmbed.setFooter({ text: `第${currentPage}頁, 共有${embeds.length}頁` });
    };

    let Msg = await message.reply({
        embeds: [changeFooter()]
    });

    names.forEach(async function(element){
        await Msg.react(defaultEmojis[element])
    });

    const filter = (reaction, user) => Object.values(reaction.emoji.name) && user.id === message.author.id;
    const collector = await Msg.createReactionCollector({ filter, time: time });

    const pageTravelling = new Set();
    const numberTravel = async () => {
        if (pageTravelling.has(message.author.id))
            return message.channel.send("輸入`end`以退出").then((sent) => {
                setTimeout(() => {
                    sent.delete();
                }, 3000);
            });
        const numberTravelMessage = await message.channel.send(`${message.member.toString()}, 你有20秒, 請在聊天欄輸入你想要的頁面! 輸入 \`end\` 以退出.`);
        const collector = message.channel.createMessageCollector({
            filter: (msg) => msg.member.id === message.author.id,
            time: 20000,
            max: 1
        });

        pageTravelling.add(message.author.id);
        collector.on("collect", (message) => {
            if (message.content.toLowerCase() === "end") {
                message.delete().catch((e) => { console.error(e) });
                return collector.stop();
            }
            const int = parseInt(message.content);
            if (isNaN(int) || !(int < embeds.length) || !(int >= 1))
                return message.delete();
            currentPage = int;
            Msg.edit({
                embeds: [changeFooter()]
            });
            message.delete()
        });

        collector.on("end", () => {
            if (numberTravelMessage.deletable)
                numberTravelMessage.delete();
            pageTravelling.delete(message.author.id);
        });
    };

    collector.on("collect", async (i, user) => {
        const id = Object.keys(defaultEmojis).find(x => defaultEmojis[x] === i.emoji.name);
        await i.users.remove(user);
        if (id === "first")
            currentPage = 1;
        if (id === "previous") {
            if(currentPage -1 > 0) currentPage--;
        }
        if (id === "next") {
            if(currentPage +1 < embeds.length + 1) currentPage++;
        }
        if (id === "last")
            currentPage = embeds.length;
        if (id === "number")
            await numberTravel();
        if (id === "end")
            return await collector.stop();
        Msg.edit({
            embeds: [changeFooter()]
        });
    });

    collector.on("end", () => {
        let embed = new Discord.MessageEmbed().setTitle("已失效")
        Msg.edit({
            embeds: [embed]
        });
        Msg.reactions.removeAll()
    });
};

module.exports = {
    name: "MessageEmbedPages",
    main: MessageEmbedPages
}