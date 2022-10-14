const chalk = require('chalk')
const moment = require('moment-timezone');
const fs = require('fs')
class Logger {
  constructor({ caller, debug, ignore, locale, format, Xeow }) {
    this.caller = caller
    this.debugging = debug
    this.ignore = ignore
    this.format = format
    this.Xeow = Xeow
    moment.locale(locale);
  }

  /**
  * @description 用於進程调试, 只有在调试模式下才會顯示
  */
  debug() {
    if (!this.debugging) return
    return this._ok(this.caller, arguments, 'DEBUG', chalk.grey)
  }

  debugT() {
    if (!this.debugging) return
    return this._okT(this.caller, arguments, 'DEBUG', chalk.grey)
  }

  /**
   * @description 用於提示用戶, 進程正常
   */
  log() {
    return this._ok(this.caller, arguments, 'LOG', chalk.greenBright)
  }

  logT() {
    return this._okT(this.caller, arguments, 'LOG', chalk.greenBright)
  }

  /**
   * @description 用於提示用戶一些信息
   */
  info() {
    return this._ok(this.caller, arguments, 'INFO', chalk.blueBright)
  }

  infoT() {
    return this._okT(this.caller, arguments, 'INFO', chalk.blueBright)
  }

  /**
   * @description 用於提示用戶, 依賴過期, 版本更新
   */
  notice() {
    return this._ok(this.caller, arguments, 'NOTICE', chalk.blue)
  }

  noticeT() {
    return this._okT(this.caller, arguments, 'NOTICE', chalk.blue)
  }

  /**
   * @description 用於警告用戶, 進程錯誤, 但是不影響系統
   */
  warn() {
    return this._ok(this.caller, arguments, 'WARN', chalk.yellow)
  }

  warnT() {
    return this._okT(this.caller, arguments, 'WARN', chalk.yellow)
  }

  /**
   * @description 用於警告用戶, 進程致命錯誤
   */
  fatal() {
    return this._ok(this.caller, arguments, 'FATAL', chalk.redBright)
  }

  fatalT() {
    return this._okT(this.caller, arguments, 'FATAL', chalk.redBright)
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

  showErrT() {
    return this._okT(this.caller, arguments, 'ERROR', chalk.red)
  }

  /**
  * @description 用於设置无视的错误信息
  */
  addIgnore(msg) {
    this.ignore.push(msg)
  }

  /**
  * @description 用於后台指令执行
  */
  command() {
    return this._ok(this.caller, arguments, 'COMMAND', chalk.greenBright)
  }

  _okT(caller, args, level, color) {
    const content = this.Xeow.translate.apply(this.Xeow, args)
    if (this.ignore.includes(content)) return
    if (!fs.existsSync("./logs")) fs.mkdirSync("./logs")
    fs.appendFileSync('./logs/lastest.log', `[${moment().format(`h:mm:ss`)}] [${caller}/${level}]: ${content}\n`, 'utf-8')
    process.stdout.write(`[${chalk.blue(`${moment().format(this.format)}`)}] [${color(`${caller}/${level}`)}]: ${content}\n`)
  }

  _ok(caller, args, level, color) {
    if (this.ignore.includes(args[0])) return
    if (!fs.existsSync("./logs")) fs.mkdirSync("./logs")
    fs.appendFileSync('./logs/lastest.log', `[${moment().format(`h:mm:ss`)}] [${caller}/${level}]: ${Array.from(args)}\n`, 'utf-8')
    if (level === 'COMMAND') {
      process.stdout.moveCursor(0, -1)
      process.stdout.clearLine(1)
      process.stdout.write(`[${chalk.blue(`${moment().format(this.format)}`)}] [${color(`${caller}/${level}`)}]: ${Array.from(args)}\n`)
    } else {
      process.stdout.write(`[${chalk.blue(`${moment().format(this.format)}`)}] [${color(`${caller}/${level}`)}]: ${Array.from(args)}\n`)
    }
    return this
  }
}

module.exports = {
  name: "Logger",
  main: Logger
}