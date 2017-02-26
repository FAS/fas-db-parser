import cheerio from 'cheerio'
import request from 'request-promise'
import manifest from './../package.json'
import config from './../config.json'

export default class Request {

  constructor () {
    this.options = {
      auth: {
        user: config.user,
        pass: config.pass
      },
      headers: {
        'User-Agent': `${manifest.name} v${manifest.version}`
      },
      transform: (body) => {
        return cheerio.load(body)
      }
    }
  }

  /**
   * Request data from remote url
   * @param  {String} uri
   * @return {Promise}
   */
  get (uri) {
    this.options.url = `${config.url}${uri}`

    return request(this.options)
      .then(($) => $)
      .catch((err) => {
        if (err.statusCode) {
          throw new Error(`Unable to get page content: Error code ${err.statusCode} (page: ${this.options.url})`)
        } else if (err.cause.code === 'ETIMEDOUT') {
          throw new Error(`Target server is currently down or not responding (page: ${this.options.url})`)
        } else {
          console.log(err)
        }
      })
  }
}
