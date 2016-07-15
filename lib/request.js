import cheerio from 'cheerio'
import Queue from 'promise-queue'
import request from 'request-promise'
import manifest from './../package.json'
import config from './../config.json'

const MAXCONCURRENT = 5
const MAXQUEUE = Infinity

let queue = new Queue(MAXCONCURRENT, MAXQUEUE)

export default function get (uri) {
  // set options
  const options = {
    url: `${config.url}${uri}`,
    auth: {
      user: config.user,
      pass: config.pass
    },
    headers: {
      'User-Agent': `${manifest.name} v${manifest.version}`
    },
    // return cheerio object
    transform: (body) => cheerio.load(body)
  }

  function pr () {
    return request(options)
      .then(($) => $)
  }

  return queue.add(pr)
    .then(($) => $)
    .catch((err) => console.log(err))
}
