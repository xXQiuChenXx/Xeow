const chalk = require('chalk')
const moment = require('moment-timezone');
const fs = require('fs')
class Logger {
  constructor({ caller , debug, ignore , locale, format, translations, language }) {
    this.translations = translations
    this.language = language
    this.caller = caller
    this.debugging = debug
    this.ignore = ignore
    this.format = format
    moment.locale(locale);
  }

  /**
  * @description 用於進程调试, 只有在调试模式下才會顯示
  */
  debug() {
    if (!this.debugging) return
    return this._ok(this.caller, arguments, 'DEBUG', chalk.grey)
  }

  /**
   * @description 用於提示用戶, 進程正常
   */
  log() {
    return this._ok(this.caller, arguments, 'LOG', chalk.greenBright)
  }

  /**
   * @description 用於提示用戶一些信息
   */
  info() {
    return this._ok(this.caller, arguments, 'INFO', chalk.blueBright)
  }

  /**
   * @description 用於提示用戶, 依賴過期, 版本更新
   */
  notice() {
    return this._ok(this.caller, arguments, 'NOTICE', chalk.blue)
  }

  /**
   * @description 用於警告用戶, 進程錯誤, 但是不影響系統
   */
  warn() {
    return this._ok(this.caller, arguments, 'WARN', chalk.yellow)
  }

  /**
   * @description 用於警告用戶, 進程致命錯誤
   */
  fatal() {
    return this._ok(this.caller, arguments, 'FATAL', chalk.redBright)
  }

  /**
  * @description 用於警告用戶, 完整进程报错信息
  */
  error(e) {
    for (const line of e.toString().split('\n')) this.showErr(line)
    for (const line of e.stack.replace(e.toString(), '').split('\n')) this.trace(line)
  }

  /**
  * @description 用於追踪 this.eroor() 的錯誤訊息
  */
  trace() {
    return this._ok(this.caller, arguments, 'TRACE', chalk.red)
  }

  /**
  * @description 用於警告用户, 只显示错误信息
  */
  showErr() {
    return this._ok(this.caller, arguments, 'ERROR', chalk.red)
  }

  /**
  * @description 用於设置无视的错误信息
  */
  setIgnore(msg) {
    this.ignore.push(msg)
  }

  /**
  * @description 用於后台指令执行
  */
  command() {
    return this._ok(this.caller, arguments, 'COMMAND', chalk.greenBright)
  }

  _ok(caller, args, level, color) {
    if (this.ignore.includes(args[0])) return
    if (!fs.existsSync("./logs")) fs.mkdirSync("./logs")
    let text;
    let Args = Array.prototype.slice.call(args)
    if (typeof Args[0] === "string" && Args[1] !== false) {
      const language = this.translations.get(this.language);
      text = language(Args[0], Args[1]);
    } else {
      text = Array.from(args) === [] ? "undefined" : Array.from(args)
      if(Args[1] === false) text = text.toString().replace(/,false/g, "")
    }
    fs.appendFileSync('./logs/lastest.log', `[${moment().format(`h:mm:ss`)}] [${caller}/${level}]: ${text}\n`, 'utf-8')
    if (level === 'COMMAND') {
      process.stdout.moveCursor(0, -1)
      process.stdout.clearLine(1)
      process.stdout.write(`[${chalk.blue(`${moment().format(this.format)}`)}] [${color(`${caller}/${level}`)}]: ${text}\n`)
    } else {
      process.stdout.write(`[${chalk.blue(`${moment().format(this.format)}`)}] [${color(`${caller}/${level}`)}]: ${text}\n`)
    }
    return this
  }
}

module.exports = {
  name: "Logger",
  main: Logger
}