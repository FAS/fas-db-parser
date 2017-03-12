import cheerio from 'cheerio'
import request from 'requestretry'
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
      timeout: 10000,
      // request-retry options
      maxAttempts: 10,
      retryDelay: 10000,
      retryStrategy: request.RetryStrategies.HTTPOrNetworkError
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
      .then((response) => {
        return cheerio.load(response.body)
      })
      .catch((err) => {
        throw new Error(err)
      })
  }
}
