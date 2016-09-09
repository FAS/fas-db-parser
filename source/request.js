import cheerio from 'cheerio'
import iconv from 'iconv-lite'
import request from 'request-promise'
import manifest from './../package.json'
import config from './../config.json'

export default class Request {

  constructor (encoding) {
    this.options = {
      auth: {
        user: config.user,
        pass: config.pass
      },
      headers: {
        'User-Agent': `${manifest.name} v${manifest.version}`
      },
      // disable request encoding to handle it manualy
      encoding: null,
      // decode body and return cheerio object
      transform: (body) => {
        body = iconv.decode(body, encoding)
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
        if (err.cause.code === 'ETIMEDOUT') {
          throw new Error('Target server is currently down or not responding')
        } else {
          console.log(err)
        }
      })
  }
}
