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

### Xeow.DBManager
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