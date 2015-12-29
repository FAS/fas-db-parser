import cheerio from 'cheerio'
import request from 'request-promise'
import manifest from './../package.json'
import config from './../config.json'

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
    },
    transform: (body) => {
      // return cheerio object
      return cheerio.load(body)
    }
  }

  return request(options)
    .then(($) => {
      return $
    })
    .catch((err) => {
      console.log(err)
    })
}
