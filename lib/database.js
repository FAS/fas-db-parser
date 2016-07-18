import Logger from './logger'
import Request from './request'
import jsonFile from 'jsonfile'
// import naturalSort from 'natural-sort'

const LISTURL = '/paging_artikel/B//@'
// /web_artikeldetail/${item.id}/${this.name}
// const PRODUCTURL = '/web_artikeldetail'

const PRODUCTSPERPAGE = 20

export default class Database {

  constructor (id, code, name, encoding) {
    this.id = id
    this.code = code
    this.name = name
    this.products = new Map()
    this.parsed = {
      pages: [],
      total: 0
    }

    this.request = new Request(encoding)
    this.log = new Logger('klpt', `${this.name}:`)
  }

  _generateUrl (offset = 0) {
    return `${LISTURL}//${offset}//${this.id}`
  }

  /**
   * Parse page body to find total number of products in database
   */
  async _getProductsAmount () {
    const url = this._generateUrl()
    const $ = await this.request.get(url)
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
  async _generateProductsPages () {
    let offset = 0

    while (offset < 20) {
      this.parsed.pages.push(this._generateUrl(offset))
      // skip to the next page since there is 20 products per page
      offset += PRODUCTSPERPAGE
    }

    this.log.info(`${this.parsed.total} products on ${this.parsed.pages.length} pages`)
  }

  async _parseCatalogPage ($) {
    // slice first two and last table since they do not contain data
    let $tables = $('div > table').slice(2, -1)
    let self = this

    $tables.each(function () {
      let product = {}
      product.id = $('td > a > b > strong.text', this).html().trim()
      // product names for russian locale wrapped in <p> tag
      product.name = $('td', this).eq(1).text() || $('td > p', this).text()
      product.price = $('td > div.text', this).html().trim()
      self.products.set(product.id, product)

      self.log.verbose(JSON.stringify(product))
    })
  }

  /**
   * Request every page of catalog and parse products related information
   */
  async _getProductsList () {
    this.log.info('Start parsing products')

    let promises = this.parsed.pages.map((url) => {
      return this.request.get(url)
      .then(($) => {
        this._parseCatalogPage($)
      })
      .then(() => {
        this.log.debug(`${this.products.size}/${this.parsed.pages.length * PRODUCTSPERPAGE} products parsed`)
      })
    })

    await Promise.all(promises)
  }

  /**
   * Save products list to json file
   */
  async _saveToFile () {
    jsonFile.writeFileSync(`./db/products.${this.code}.json`, this.products, {spaces: 2})
  }

/**
 * Parse database
 */
  async parse () {
    this.log.info('Start parsing database')

    try {
      await this._getProductsAmount()
      await this._generateProductsPages()
      await this._getProductsList()
      await this._saveToFile()
    } catch (err) {
      console.log(err)
    }
  }
}
