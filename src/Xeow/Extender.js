const { Message, CommandInteraction } = require("discord.js");

Message.prototype.translate = function (key, args) {
	const language = this.client.translations.get(
		this.client.defaultLanguage
	);
	if (!language) throw "Message: Invalid language set in data.";
	return language(key, args);
};

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

// Format a date
Message.prototype.printDate = function (date, format) {
	return this.client.printDate(date, format, this.guild.data.language);
};

// Convert time
Message.prototype.convertTime = function (time, type, noPrefix) {
	return this.client.convertTime(time, type, noPrefix, (this.guild && this.guild.data) ? this.guild.data.language : null);
};
