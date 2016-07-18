import cheerio from 'cheerio'
import iconv from 'iconv-lite'
import Queue from 'promise-queue'
import request from 'request-promise'
import manifest from './../package.json'
import config from './../config.json'

const MAXCONCURRENT = 10
const MAXQUEUE = Infinity

let queue = new Queue(MAXCONCURRENT, MAXQUEUE)

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
   * Create Promise Request and add it to the queue
   * @param  {String} uri
   * @return {Promise}
   */
  get (uri) {
    this.options.url = `${config.url}${uri}`

    let pr = () => request(this.options).then(($) => $)

    return queue.add(pr)
      .then(($) => $)
      .catch((err) => console.log(err))
  }
}
