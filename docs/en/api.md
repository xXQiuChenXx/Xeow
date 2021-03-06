<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [API](#api)
  - [Libraries](#libraries)
    - [Collection](#collection)
    - [FakeMessage](#fakemessage)
    - [InteractionButtonPages](#interactionbuttonpages)
    - [InteractionEmbedPages](#interactionembedpages)
    - [Logger](#logger)
    - [MessageButtonPages](#messagebuttonpages)
    - [MessageEmbedPages](#messageembedpages)
    - [SlashCommand](#slashcommand)
  - [Classes](#classes)
    - [Xeow](#xeow)
      - [Xeow.Modules](#xeowmodules)
      - [Xeow.translate(key, args, locale)](#xeowtranslatekey-args-locale)
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

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# API

## Libraries

These libraries normally will stored in ```/src/libs``` directory. 

### Collection
This is actually Discord#Collection. This easy for temporary data storing only.

### FakeMessage
FakeMessage used to convert Discord#Interaction to Discord#Message

### InteractionButtonPages

### InteractionEmbedPages

### Logger

### MessageButtonPages

### MessageEmbedPages

### SlashCommand



## Classes

### Xeow
#### Xeow.Modules
An object with all the depencies. But, of course you still can use `require()`.

Example:

```js
const Discord = Xeow.Modules["discord.js"]
if(!Discord) {
    // Do something here
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
// return "Hello MyWorld"
 ```

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
please note that the default `__dirname` is set to ./configs

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