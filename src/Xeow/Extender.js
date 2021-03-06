const { Guild, Message, Interaction } = require("discord.js");

// Guild.prototype.translate = function(key, args) {
// 	const language = this.client.translations.get(this.data.language);
// 	if (!language) throw "Message: Invalid language set in data.";
// 	return language(key, args);
// };

Message.prototype.translate = function (key, args) {
	const language = this.client.translations.get(
		this.client.defaultLanguage
	);
	if (!language) throw "Message: Invalid language set in data.";
	return language(key, args);
};

Interaction.prototype.translate = function (key, args) {
	const language = this.client.translations.get(
		this.client.defaultLanguage
	);
	if (!language) throw "Message: Invalid language set in data.";
	return language(key, args);
};

// Wrapper for sendT with error emoji
// Message.prototype.error = function(key, args, options = {}) {
// 	options.prefixEmoji = "error";
// 	return this.sendT(key, args, options);
// };

// // Wrapper for sendT with success emoji
// Message.prototype.success = function(key, args, options = {}) {
// 	options.prefixEmoji = "success";
// 	return this.sendT(key, args, options);
// };

// Translate and send the message
Message.prototype.replyT = function (key, args) {
	let string = this.translate(key, args);
	return this.reply(string);

};

Interaction.prototype.replyT = function (key, args) {
	let string = this.translate(key, args);
	return this.reply(string);
};

Message.prototype.editT = function (key, args) {
	let string = this.translate(key, args);
	return this.edit(string);

};

Interaction.prototype.editT = function (key, args) {
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
