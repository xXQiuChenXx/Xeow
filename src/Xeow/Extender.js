const { Message, CommandInteraction, EmbedBuilder } = require("discord.js");

Message.prototype.translate = function (key, args) {
	const language = this.client.translations.get(
		this.client.defaultLanguage
	);
	if (!language) throw "Message: Invalid language set in data.";
	return language(key, args);
};

Message.prototype.invalidUsage = function ({ position, reason }) {
	let pre = this.content.split(this.content.split(" ")[position + 1])[0]
	const arrow = " ".repeat(pre.length) + "^^^"
	const embed = new EmbedBuilder()
		.setColor("Red")
		.setTitle(this.translate("core/main:command:invalidUsage:title"));

	switch (reason) {
		case 1:
			embed.setDescription(this.translate("core/main:command:invalidUsage:description",
				{ reason: this.translate("core/main:command:invalidUsage:rs:empty") }) + "```\n" + this.content + "\n" + arrow + "```");
			break;
		case 2:
			embed.setDescription(this.translate("core/main:command:invalidUsage:description",
				{ reason: this.translate("core/main:command:invalidUsage:rs:number") }) + "```\n" + this.content + "\n" + arrow + "```");
			break;
		case 3:
			embed.setDescription(this.translate("core/main:command:invalidUsage:description",
				{ reason: this.translate("core/main:command:invalidUsage:rs:string") }) + "```\n" + this.content + "\n" + arrow + "```");
			break;
		case 4:
			embed.setDescription(this.translate("core/main:command:invalidUsage:description",
				{ reason: this.translate("core/main:command:invalidUsage:rs:integer") }) + "```\n" + this.content + "\n" + arrow + "```");
			break;
		case 5:
			embed.setDescription(this.translate("core/main:command:invalidUsage:description",
				{ reason: this.translate("core/main:command:invalidUsage:rs:boolean") }) + "```\n" + this.content + "\n" + arrow + "```");
			break;
		case 6:
			embed.setDescription(this.translate("core/main:command:invalidUsage:description",
				{ reason: this.translate("core/main:command:invalidUsage:rs:user") }) + "```\n" + this.content + "\n" + arrow + "```");
			break;
		case 7:
			embed.setDescription(this.translate("core/main:command:invalidUsage:description",
				{ reason: this.translate("core/main:command:invalidUsage:rs:channel") }) + "```\n" + this.content + "\n" + arrow + "```");
			break;
		case 8:
			embed.setDescription(this.translate("core/main:command:invalidUsage:description",
				{ reason: this.translate("core/main:command:invalidUsage:rs:role") }) + "```\n" + this.content + "\n" + arrow + "```");
			break;
		case 9:
			embed.setDescription(this.translate("core/main:command:invalidUsage:description",
				{ reason: this.translate("core/main:command:invalidUsage:rs:mentionable") }) + "```\n" + this.content + "\n" + arrow + "```");
			break;
		default:
			embed.setDescription(this.translate("core/main:command:invalidUsage:description",
				{ reason: reason }));
			break;
	}
	return this.reply({ embeds: [embed] })
}

CommandInteraction.prototype.invalidUsage = function () {
	throw new Error("Interaction options is NOT POSIBLE GETTING INVALID USAGE");
}

CommandInteraction.prototype.translate = function (key, args) {
	const language = this.client.translations.get(
		this.client.defaultLanguage
	);
	if (!language) throw "Message: Invalid language set in data.";
	return language(key, args);
};

// Translate and send the message
Message.prototype.replyT = function (key, args) {
	let string = this.translate(key, args);
	return this.reply(string);

};

CommandInteraction.prototype.replyT = function (key, args) {
	let string = this.translate(key, args);
	return this.reply(string);
};

Message.prototype.editT = function (key, args) {
	let string = this.translate(key, args);
	return this.edit(string);

};

CommandInteraction.prototype.editT = function (key, args) {
	let string = this.translate(key, args);
	return this.edit(string);

};

// // Format a date
// Message.prototype.printDate = function (date, format) {
// 	return this.client.printDate(date, format, this.guild.data.language);
// };

// // Convert time
// Message.prototype.convertTime = function (time, type, noPrefix) {
// 	return this.client.convertTime(time, type, noPrefix, (this.guild && this.guild.data) ? this.guild.data.language : null);
// };
