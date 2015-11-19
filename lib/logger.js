import 'better-log/install'
import chalk from 'chalk'
import symbols from 'log-symbols'
import buildDebug from 'debug/node'

export default class Logger {
  constructor (tag) {
    this.tag = tag
    this.verboseDebug = buildDebug(`${tag}:verbose`)
    this.generalDebug = buildDebug(tag)
  }

  _buildMessage (message, resource) {
    let parts = `[${this.tag}]`
    if (resource) parts += ` ${resource}`
    if (message) parts += `: ${message}`
    return parts
  }

  info (message, resource) {
    console.info(this._buildMessage(message, resource))
  }

  warn (message, resource) {
    console.warn(this._buildMessage(message, resource))
  }

  error (message, resource, Constructor = Error) {
    throw new Constructor(this._buildMessage(message, resource))
  }

  debug (message, resource) {
    if (this.generalDebug.enabled) this.generalDebug(this._buildMessage(message, resource))
  }

  verbose (message, resource) {
    if (this.verboseDebug.enabled) this.verboseDebug(this._buildMessage(message, resource))
  }
}
