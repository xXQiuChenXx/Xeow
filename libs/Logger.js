const chalk = require('chalk')
const moment = require('moment-timezone');
const util = require("util");
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
    if (this.debugging) this._process(this.caller, arguments, 'DEBUG', chalk.grey)
  }

  debugT() {
    if (this.debugging) this._processT(this.caller, arguments, 'DEBUG', chalk.grey)
  }

  /**
   * @description 用於提示用戶, 進程正常
   */
  log() {
    this._process(this.caller, arguments, 'LOG', chalk.greenBright)
  }

  logT() {
    this._processT(this.caller, arguments, 'LOG', chalk.greenBright)
  }

  /**
   * @description 用於提示用戶一些信息
   */
  info() {
    this._process(this.caller, arguments, 'INFO', chalk.blueBright)
  }

  infoT() {
    this._processT(this.caller, arguments, 'INFO', chalk.blueBright)
  }

  /**
   * @description 用於提示用戶, 依賴過期, 版本更新
   */
  notice() {
    this._process(this.caller, arguments, 'NOTICE', chalk.blue)
  }

  noticeT() {
    this._processT(this.caller, arguments, 'NOTICE', chalk.blue)
  }

  /**
   * @description 用於警告用戶, 進程錯誤, 但是不影響系統
   */
  warn() {
    this._process(this.caller, arguments, 'WARN', chalk.yellow)
  }

  warnT() {
    this._processT(this.caller, arguments, 'WARN', chalk.yellow)
  }

  /**
   * @description 用於警告用戶, 進程致命錯誤
   */
  fatal() {
    this._process(this.caller, arguments, 'FATAL', chalk.redBright)
  }

  fatalT() {
    this._processT(this.caller, arguments, 'FATAL', chalk.redBright)
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
  trace(message) {
    this._println(this.caller, message, 'TRACE', chalk.red)
    this._writeln(this.caller, message, 'TRACE')
  }

  /**
  * @description 用於警告用户, 只显示错误信息
  */
  showErr(message) {
    this._println(this.caller, message, 'ERROR', chalk.red)
    this._writeln(this.caller, message, 'ERROR')
  }

  showErrT() {
    this._processT(this.caller, arguments, 'ERROR', chalk.red)
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
    this._process(this.caller, arguments, 'COMMAND', chalk.greenBright)
  }

  /**
   * 
   * @param {String} caller 
   * @param { arguments } args
   * @param {String} level 
   * @param {*} color 
   */
  _process(caller, args, level, color) {
    if (level === 'COMMAND') {
      process.stdout.moveCursor(0, -1)
      process.stdout.clearLine(1)
      this._println(caller, Array.from(args), level, color);
    } else {
      let l = new Array()
      let f = new Array()
      for (let i = 0; i < args.length; i++) {
        let x = args[i]
        l.push(util.inspect(x, { colors: true }))
        f.push(util.inspect(x, { colors: false }))
      }
      for (const c of l.join("; ").split("\n")) this._println(caller, c, level, color)
      for (const c of f.join("; ").split("\n")) this._writeln(caller, c, level, color)
    }
  }

  _writeln(caller, content, level) {
    if (!fs.existsSync("./logs")) fs.mkdirSync("./logs");
    fs.appendFileSync('./logs/lastest.log', `[${moment().format(`h:mm:ss`)}] [${caller}/${level}]: ${content}\n`, 'utf-8')
  }

  _println(caller, content, level, color) {
    if (this.ignore.includes(content)) return;
    process.stdout.write(`[${chalk.blue(`${moment().format(this.format)}`)}] [${color(`${caller}/${level}`)}]: ${content}\n`)
  }

  _processT(caller, args, level, color) {
    const content = this.Xeow.translate.apply(this.Xeow, args)
    this._writeln(caller, content, level)
    this._println(caller, content, level, color)
  }
}

module.exports = {
  name: "Logger",
  main: Logger
}