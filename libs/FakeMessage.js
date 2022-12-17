const Discord = require('discord.js')
/**
 * MessageMentions
 * @typedef {Object}
 * @property {Discord.Collection<string, Discord.User>} users
 * @property {Discord.Collection<string, Discord.GuildMember>} members
 * @property {Discord.Collection<string, Discord.Role>} roles
 * @property {Discord.Collection<string, Discord.GuildChannel>} channels
 */

class FakeMessage {
    /**
     * @param {Discord.CommandInteraction} interaction
     */
    constructor(interaction) {

        setTimeout(async function () {
            try {
                await interaction.deferReply();
            } catch (error) {

            }
        }, 2400);

        /**
        * @param {Discord.CommandInteraction} interaction
        */
        this.interaction = interaction

        this.client = interaction.client

        /**
         * @param {Discord.User} author
         */
        this.author = interaction.user;

        /**
         * @param {Discord.GuildMember} member
         */
        this.member = interaction.member;

        this.translate = interaction.translate;
        this.replyT = interaction.replyT;
        this.editT = interaction.editT;

        /**
         * @param {Discord.Guild} guild
         */
        this.guild = interaction.guild;

        /**
         * @type {Discord.TextChannel}
         */
        this.channel = Object.assign(Object.create(Object.getPrototypeOf(interaction.channel)), interaction.channel);

        /**
         * @type {Discord.TextChannel}
         */
        this.channelCloned = interaction.channel

        /**
         * @type {Discord.MessageMentions}
         */
        this.mentions = {
            ...Discord.MessageMentions,
            users: new Discord.Collection(),
            members: new Discord.Collection(),
            roles: new Discord.Collection(),
            channels: new Discord.Collection()
        }

        this.createdTimestamp = interaction.createdTimestamp

        /**
         * @type {string}
         */
        this.content = interaction.options?.data ? this._parse(interaction.options.data) : ""

        /**
         * @type {boolean}
         */
        this.deleted = false

        this.channel.client = this.client

        this._patch()
    }

    // createMessageComponentCollector(options = {}) {
    //     return this.channel.createMessageCollector(options)
    // }

    /**
     * @param {Array<Discord.CommandInteractionOption>} data
     */
    _parse(data) {
        let content = []

        content.push(this.interaction.commandName)

        if (data.length > 1) {
            data.forEach(v => content.push(this._parseOption(v)))
        } else if (data.length === 1) {
            content.push(this._parseOption(data[0]))
        }

        return content.join(' ')
    }

    /**
     * @param {Discord.CommandInteractionOption} option
     */
    _parseOption(option) {

        switch (option.type) {
            case 1:
                return option.name + " " + option.options.map(this._parseOption.bind(this)).join(' ')
            case 2:
                return option.name + " " + option.options.map(this._parseOption.bind(this)).join(' ')
            case 3:
                return option.value;
            case 4:
                return option.value;
            case 5:
                return option.value;
            case 6:
                this.mentions.users.set(option.value, option.user)
                this.mentions.members.set(option.value, option.member)
                return `<@${option.value}>`;
            case 7:
                this.mentions.channels.set(option.value, option.channel)
                return `<#${option.value}>`;
            case 8:
                this.mentions.roles.set(option.value, option.role)
                return `<@&${option.value}>`;
            case 9:
                // todo: detect MENTIONABLE is a user, a role or a channel
                return `<@${option.value}>`;
            case 10:
                return option.value;
            case 11:
                ;
        }
    }

    _patch() {
        this.reply = async (options) => {
            if (typeof options === 'string') {
                if (this.interaction.replied || this.interaction.deferred) return await this.interaction.editReply({ content: options })
                await this.interaction.reply({ fetchReply: true, content: options })
                return await this.interaction.fetchReply().then(url => { return url })
            }
            if (!options.content) options.content = null
            if (!options.embeds) options.embeds = []
            if (!options.files) options.files = []
            if (!options.tts) options.tts = false
            //if (!options.nonce) options.nonce = ""
            if (!options.components) options.components = []
            if (!options.allowedMentions) options.allowedMentions = { users: [], roles: [], repliedUser: false }
            if (!this.interaction) return this.channelCloned.send(options)
            if (this.interaction.replied || this.interaction.deferred) {
                try {
                    return await this.interaction.editReply({ ...options })
                } catch (e) {
                    return await this.channelCloned.send(options)
                }
            }
            try {
                await this.interaction.reply({ fetchReply: true, ...options });
            } catch (e) {
                await this.interaction.editReply({ ...options })
            }
            return this.interaction
            return await this.interaction.fetchReply().then(url => { return url })
        }

        this.delete = async () => {
            if (this.interaction.replied) return await this.interaction.deleteReply()
            await this.interaction.deferReply()
            await this.interaction.deleteReply()
        }

        this.edit = async (options) => {
            if (typeof options === 'string') {
                if (!this.interaction.replied) return await this.interaction.reply({ fetchReply: true, content: options })
                try {
                    return await this.interaction.editReply({ content: options })
                } catch (e) {
                    return await this.channelCloned.send(options)
                }
            }
            if (!options.content) options.content = null
            if (!options.embeds) options.embeds = []
            if (!options.files) options.files = []
            if (!options.tts) options.tts = false
            if (!options.components) options.components = []
            if (!options.allowedMentions) options.allowedMentions = { users: [], roles: [], repliedUser: false }
            if (!this.interaction) return this.channel.messages.edit(this, options);
            if (!this.interaction.replied) {
                try {
                    return await this.interaction.reply({ fetchReply: true, ...options })
                } catch (e) {
                    return await this.channelCloned.send(options)
                }
            }
            try {
                return await this.interaction.editReply({ ...options })
            } catch (e) {
                return await this.channelCloned.send(options)
            }
        }
    }
}

module.exports = {
    name: "FakeMessage",
    main: FakeMessage
}