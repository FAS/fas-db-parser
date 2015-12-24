import cheerio from 'cheerio'
import RateLimiter from 'request-rate-limiter'
import manifest from './../package.json'
import config from './../config.json'

const limiter = new RateLimiter(120)

export default function get (uri) {
  // set options
  const options = {
    url: config.url + uri,
    auth: {
      user: config.user,
      pass: config.pass
    },
    headers: {
      'User-Agent': `${manifest.name} v${manifest.version}`
    }
  }

  return limiter.request(options)
    .then(res => {
      // return cheerio object
      return cheerio.load(res.body)
    })
    .catch(err => {
      console.log(err)
    })
}
