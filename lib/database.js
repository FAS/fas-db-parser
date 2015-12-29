import Logger from './logger'
import request from './request'

const LISTURL = '/paging_artikel/B//@'
// /web_artikeldetail/${item.id}/${this.name}
const PRODUCTURL = '/web_artikeldetail'

const PRODUCTSPERPAGE = 20

export default class Database {

  constructor (id, code, name) {
    this.id = id
    this.code = code
    this.name = name
    this.products = new Map()
    this.parsed = {
      pages: [],
      total: 0
    }

    this.log = new Logger('klpt', `${this.name}:`)
  }

  _generateUrl (offset = 0) {
    return `${LISTURL}//${offset}//${this.id}`
  }

  /**
   * Parse page body to find total number of products
   */
  async _getProductsAmount () {
    const url = this._generateUrl()
    const $ = await request(url)
    // last table contains div with navigation menu
    const div = $('table').last().find('div').eq(1).text()
    // extract total amount of products
    const total = div.match(/[\n\r].*von\s*([\d]*)/)[1]

    if (!total) {
      throw new Error('Unable to parse total products amount')
    } else {
      this.parsed.total = total
    }
  }

  /**
   * Generate array of links for each page of catalog
   */
  _generateProductsPages () {
    let offset = 0

    while (offset < this.parsed.total) {
      this.parsed.pages.push(this._generateUrl(offset))
      // skip to the next page since there is 20 products per page
      offset += PRODUCTSPERPAGE

      // Todo: Remove later
      if (offset > PRODUCTSPERPAGE) break
    }

    this.log.info(`${this.parsed.total} products on ${this.parsed.pages.length} pages`)
  }

  _parseCatalogPage ($) {
    let $tables = $('div > table').slice(2, 22)
    let self = this

    $tables.each(function () {
      let product = {}
      product.id = $('td > a > b > strong.text', this).html().trim()
      // product names for russian locale wrapped in <p> tag
      product.name = $('td', this).eq(1).text() || $('td > p', this).text()
      product.price = $('td > div.text', this).html().trim()
      self.products.set(product.id, product)
    })
  }

  /**
   * Request every page of catalog and parse products related information
   */
  async _getProductsList () {
    this.log.info(`Start parsing products`)
    let self = this

    let promises = this.parsed.pages.map((url) => {
      return request(url)
      .then(($) => {
        self._parseCatalogPage($)
      })
      .then(() => {
        self.log.debug(`${self.products.size}/${self.parsed.pages.length * PRODUCTSPERPAGE} products parsed`)
      })
    })

    await Promise.all(promises)
  }

/**
 * Parse database
 */
  async parse () {
    this.log.info(`Start parsing database`)

    try {
      await this._getProductsAmount()
      await this._generateProductsPages()
      await this._getProductsList()
    } catch (err) {
      console.log(err)
    }
  }
}
