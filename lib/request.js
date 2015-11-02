import cheerio from 'cheerio'
import RateLimiter from 'request-rate-limiter'
import package from './../package.json'
import config from './../config.json'

var limiter = new RateLimiter(120)

export default function get (uri) {
  // set options
  const options = {
    uri: uri,
    baseUrl: config.url
    auth: {
      user: config.user,
      pass: config.pass
    },
    headers: {
      'User-Agent': 'Kleptomaniac v' + package.version
    },
    transform: body => {
      return cheerio.load(body)
    }
  }

  return limiter.request(options)
    .then($ => {
      return $
    })
    .catch(err => {
      console.log(err)
      // not sure about this one
      throw err
    })
}
