import Logger from './logger'
import Request from './request'
import jsonFile from 'jsonfile'

const LISTURL = '/paging_artikel/B//@'
const PRODUCTURL = '/web_artikeldetail'
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

  _generateProductUrl (id) {
    return `${PRODUCTURL}/${id}/${this.name}`
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

    if (total) {
      this.parsed.total = total
    } else {
      throw new Error('Unable to parse total products amount')
    }
  }

  /**
   * Generate link for each page of catalog and store them in an array
   */
  async _generateCatalogPages () {
    let offset = 0

    while (offset < 20) {
      this.parsed.pages.push(this._generateUrl(offset))
      // skip to the next page since there is only 20 products per page
      offset += PRODUCTSPERPAGE
    }

    this.log.info(`${this.parsed.total} products on ${this.parsed.pages.length} pages`)
  }

  /**
   * Request every page of catalog and parse products related information
   */
  async _getCatalogPages () {
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
   * Parse catalog page and extract products data from it
   * @param  {Cheerio} $
   */
  async _parseCatalogPage ($) {
    // slice first two and last table since they do not contain data
    let $tables = $('div > table').slice(2, -1)

    $tables.each((index, element) => {
      let product = {}
      product.id = $('td > a > b > strong.text', element).html().trim()
      // product names for russian locale wrapped in <p> tag
      product.name = $('td', element).eq(1).text() || $('td > p', element).text()
      product.price = $('td > div.text', element).html().trim()

      this.products.set(product.id, product)
    })
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
      await this._generateCatalogPages()
      await this._getCatalogPages()
      await this._saveToFile()
    } catch (err) {
      console.log(err)
    }
  }
}
