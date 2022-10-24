<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [API](#api)
  - [Libraries](#libraries)
    - [Collection](#collection)
    - [FakeMessage](#fakemessage)
    - [InteractionButtonPages({ interaction, embeds, time, customFilter, fastSkip, pageTravel, end })](#interactionbuttonpages-interaction-embeds-time-customfilter-fastskip-pagetravel-end-)
    - [InteractionEmbedPages({ interaction, embeds, time, fastSkip, pageTravel, end })](#interactionembedpages-interaction-embeds-time-fastskip-pagetravel-end-)
    - [Logger](#logger)
      - [Logger.log(message)](#loggerlogmessage)
      - [Logger.showErr(error)](#loggershowerrerror)
      - [Logger.debug(message)](#loggerdebugmessage)
      - [Logger.info(message)](#loggerinfomessage)
      - [Logger.notice(message)](#loggernoticemessage)
      - [Logger.warn(message)](#loggerwarnmessage)
      - [Logger.addIgnore(message)](#loggeraddignoremessage)
      - [Logger.command(message)](#loggercommandmessage)
      - [Logger.logT(message, args)](#loggerlogtmessage-args)
      - [Logger.showErrT(message, args)](#loggershowerrtmessage-args)
      - [Logger.debugT(message, args)](#loggerdebugtmessage-args)
      - [Logger.infoT(message, args)](#loggerinfotmessage-args)
      - [Logger.noticeT(message, args)](#loggernoticetmessage-args)
      - [Logger.warnT(message, args)](#loggerwarntmessage-args)
    - [MessageButtonPages({ message, embeds, time, customFilter, fastSkip, pageTravel, end, newMsg })](#messagebuttonpages-message-embeds-time-customfilter-fastskip-pagetravel-end-newmsg-)
    - [MessageEmbedPages({ message, embeds, time, fastSkip, pageTravel, end })](#messageembedpages-message-embeds-time-fastskip-pagetravel-end-)
  - [Classes](#classes)
    - [Xeow](#xeow)
      - [Xeow.Modules](#xeowmodules)
      - [Xeow.translate(key, args, locale)](#xeowtranslatekey-args-locale)
      - [Xeow.translateAll(key, args)](#xeowtranslateallkey-args)
      - [Xeow.native(path)](#xeownativepath)
      - [Xeow.nativeA(path)](#xeownativeapath)
    - [Xeow.CLI](#xeowcli)
      - [CLI.register(name, callback)](#cliregistername-callback)
      - [CLI.unregister(name)](#cliunregistername)
    - [Xeow.Configuration](#xeowconfiguration)
      - [Configuration.delete(locate)](#configurationdeletelocate)
      - [Configuration.existsSync(locate)](#configurationexistssynclocate)
      - [Configuration.get(locate)](#configurationgetlocate)
      - [Configuration.reload()](#configurationreload)
      - [Configuration.read(locate, encoding, options, callback)](#configurationreadlocate-encoding-options-callback)
      - [Configuration.write(locate, data, encoding, options, callback)](#configurationwritelocate-data-encoding-options-callback)
      - [Configuration.readSync(locate, encoding = "utf-8")](#configurationreadsynclocate-encoding--utf-8)
      - [Configuration.writeSync(locate, data, encoding, options)](#configurationwritesynclocate-data-encoding-options)
    - [Xeow.DBManager](#xeowdbmanager)
      - [DBManager.get(model)](#dbmanagergetmodel)
      - [DBManager.sync(alter, force)](#dbmanagersyncalter-force)
      - [DBManager.close()](#dbmanagerclose)
    - [Message](#message)
      - [Message.translate(key, args, locale)](#messagetranslatekey-args-locale)
      - [Message.replyT(key, args, locale)](#messagereplytkey-args-locale)
      - [Message.invalidUsage({ position, reason })](#messageinvalidusage-position-reason-)
    - [CommandInteraction](#commandinteraction)
      - [CommandInteraction.replyT()](#commandinteractionreplyt)
      - [CommandInteraction.editT()](#commandinteractioneditt)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# API

## Libraries

These libraries normally will stored in ```/src/libs``` directory. 

### Collection
This is actually Discord#Collection. This easy for temporary data storing only.

### FakeMessage
FakeMessage used to convert Discord#Interaction to Discord#Message

### InteractionButtonPages({ interaction, embeds, time, customFilter, fastSkip, pageTravel, end })


### InteractionEmbedPages({ interaction, embeds, time, fastSkip, pageTravel, end })

### Logger
#### Logger.log(message)
* `message` - The message that will show in the console

#### Logger.showErr(error)
* `error` - only show the error message  

#### Logger.debug(message)
* `message` - debug message, this will only be shown if you turn on debug in config file

#### Logger.info(message)
This function is to give some information to the user through console
* `message` - The message that will show in the console

#### Logger.notice(message)
This function is to tell the user if new release available
* `message` - The message that will show in the console

#### Logger.warn(message)
This function is to warn the user but it is not an error
* `message` - The message that will show in the console

#### Logger.addIgnore(message)
* `message` - Add a message into ignored error message list

#### Logger.command(message)
This function is use for CLI commands, normally you don't need it
* `message` - The message that will show in the console

#### Logger.logT(message, args)
* `message` - The message that will show in the console

#### Logger.showErrT(message, args)
* `message` - only show the error message  

#### Logger.debugT(message, args)
* `message` - debug message, this will only be shown if you turn on debug in config file

#### Logger.infoT(message, args)
This function is to give some information to the user through console
* `message` - The message that will show in the console

#### Logger.noticeT(message, args)
This function is to tell the user if new release available
* `message` - The message that will show in the console

#### Logger.warnT(message, args)
This function is to warn the user but it is not an error
* `message` - The message that will show in the console


### MessageButtonPages({ message, embeds, time, customFilter, fastSkip, pageTravel, end, newMsg })


### MessageEmbedPages({ message, embeds, time, fastSkip, pageTravel, end })


## Classes

### Xeow
#### Xeow.Modules
An object with all the depencies. But, of course you still can use `require()`.

Example:

```js
const Discord = Xeow.Modules["discord.js"]
if(!Discord) {
    // If module not found or not installed
}
```

#### Xeow.translate(key, args, locale)
Get translation text from file, Translation are getting from `languages` directory.
 * `key` - with format (directory)/(FileName):key
 * `args` - Placeholder Replacement, with format `{{something-here}}`
 * `locale` - language, default is depends on the main configuration file

 Example: 
 ```js
 //JSON (Directory=etc-dir, FileName=main):
{
    "hello": "Hellow {{world}}"
}

// script
 Xeow.translate("etc-dir/main:hello", {
    world: MyWorld
 })
// "Hello MyWorld"
 ```

#### Xeow.translateAll(key, args)
returns all the translated language

Example:
```js
{
    "en-US": "Hello",
    "zh-CN": "你好"
}
```

#### Xeow.native(path)
Native to some translation path

#### Xeow.nativeA(path)
same as Xeow.native(), but this is for translateAll


### Xeow.CLI
#### CLI.register(name, callback)
register/add CLI command when the bot is running

* `name` - command name
* `callback` - callback function

Parameter:
* `args` - command arguments
* `Xeow` - Xeow instance

#### CLI.unregister(name)
unregister/remove CLI command when the bot is running

* `name` - command name


### Xeow.Configuration
please note that the default `__dirname` is set to `./configs`

#### Configuration.delete(locate)
delete the config file permananly.
* `locate` - the file location.

#### Configuration.existsSync(locate)
Check if wheter file exist
* `locate` - the file location

#### Configuration.get(locate)
Get the config file in object form. This can convert yml file to object.
* `locate` - the file location

#### Configuration.reload()
Clear the config files cache.

#### Configuration.read(locate, encoding, options, callback)
read the configuration file, returns an object
* `locate` - the file location
* `encoding` - file encoding
* `options` - [js-yaml](https://www.npmjs.com/package/js-yaml) options
* `callback` - callback function, return parameters: `error`, `data`

#### Configuration.write(locate, data, encoding, options, callback)
write the configuration file
* `locate` - the file location
* `data` - the file content
* `encoding` - file encoding
* `options` - [js-yaml](https://www.npmjs.com/package/js-yaml) options
* `callback` - callback function, return parameters: `error`, `data`

#### Configuration.readSync(locate, encoding = "utf-8")
* `locate` - the file location

#### Configuration.writeSync(locate, data, encoding, options)
* `locate` - the file location
* `data` - the file content
* `encoding` - file encoding
* `options` - [js-yaml](https://www.npmjs.com/package/js-yaml) options


### Xeow.DBManager
Xeow Database Manager use [sequelize](https://www.npmjs.com/package/sequelize) pakage. If you need more documentation, you can found it there.
#### DBManager.get(model)
* `model` - Database table name

#### DBManager.sync(alter, force)
> INFO: asynchronous function
* `DBManager.sync()` - This creates the table if it doesn't exist (and does nothing if it already exists)
* `DBManager.sync(null, true)` - This creates the table, dropping it first if it already existed
* `DBManager.sync(true)` - This checks what is the current state of the table in the database (which columns it

#### DBManager.close()
> INFO: asynchronous function

> INFO: Only call close() when stoping the bot

close the connection

### Message
Extends [Message](https://discord.js.org/#/docs/discord.js/main/class/Message)

#### Message.translate(key, args, locale)
Get translation text from file, Translation are getting from `languages` directory.
 * `key` - with format (directory)/(FileName):key
 * `args` - Placeholder Replacement, with format `{{something-here}}`
 * `locale` - language, default is depends on the main configuration file

 #### Message.replyT(key, args, locale)
Get translation text from file, then send reply.
 * `key` - with format (directory)/(FileName):key
 * `args` - Placeholder Replacement, with format `{{something-here}}`
 * `locale` - language, default is depends on the main configuration file

 #### Message.invalidUsage({ position, reason })
 Send message if invalid Args.
 * `position` - arg position
 * `reason` - invalid reason

choices available for reason:
1: Empty args
2: Must be number
3: Must be string
4: Must be integer
5: Must be boolean
6: Must be user

### CommandInteraction
Extends [CommandInteraction](https://discord.js.org/#/docs/discord.js/main/class/CommandInteraction)

#### CommandInteraction.replyT()
same as Message.replyT(), but it is command interaction

#### CommandInteraction.editT()
much same as CommandInteraction.replyT(), but it is edit the message.

