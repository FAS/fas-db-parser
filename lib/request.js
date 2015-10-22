import rp from 'request-promise'
import cheerio from 'cheerio'
import pkg from './../package.json'

export default function get(uri) {

  const options = {
    uri: uri,
    auth: {
      user: '',
      password: ''
    },
    headers: {
      'User-Agent': 'Kleptomaniac v' + pkg.version
    },
    timeout: 1500,
    transform: body => {
      return cheerio.load(body)
    }
  }

  return rp(options)
    .then($ => {
      return $
    })
    .catch(err => {
      console.log(err)
    })
}
