const request = require('requestretry')
const manifest = require('../package.json')
const config = require('../config.json')

class Request {
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
      .then(({ body }) => body)
  }
}

module.exports = Request
