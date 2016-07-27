import logger from './logger'
import Request from './request'
import jsonFile from 'jsonfile'

const CATALOGURL = '/paging_artikel/B//@'
const PRODUCTURL = '/web_artikeldetail'
const PRODUCTSPERPAGE = 20

export default class Database {

  constructor (id, code, name, encoding) {
    this.id = id
    this.code = code
    this.name = name
    this.products = new Map()
    this.parsed = {
      catalog: {
        pages: [],
        data: []
      },
      products: {
        pages: [],
        data: [],
        total: 0
      }
    }

    this.request = new Request(encoding)
    this.log = logger.getLogger(`klpt.${this.code}`)
  }

  _generateCatalogPageUrl (offset = 0) {
    return `${CATALOGURL}//${offset}//${this.id}`
  }

  _generateProductPageUrl (id) {
    return `${PRODUCTURL}/${id}/${this.name}`
  }

  /**
   * Parse page body to find total number of products in database
   */
  async _getProductsAmount () {
    const url = this._generateCatalogPageUrl()
    const $ = await this.request.get(url)
    // last table contains div with navigation menu
    const div = $('table').last().find('div').eq(1).text()
    // extract total amount of products
    const total = div.match(/[\n\r].*von\s*([\d]*)/)[1]

    if (total) {
      this.parsed.products.total = total
      this.log.info(`Total products: ${this.parsed.products.total}`)
    } else {
      this.log.error(new Error('Unable to parse total products amount'))
    }
  }

  /**
   * Generate link for each page of catalog and store them in an array
   */
  async _generateCatalogPagesUrl () {
    let offset = 0

    while (offset < this.parsed.products.total) {
      this.parsed.catalog.pages.push(this._generateCatalogPageUrl(offset))
      // skip to the next page since there is only 20 products per page
      offset += PRODUCTSPERPAGE

      // uncomment for debugging
      if (offset === 500) break
    }

    this.log.info(`Total catalog pages: ${this.parsed.catalog.pages.length}`)
  }

  /**
   * Request every page of catalog and parse products related information
   */
  async _getCatalogData () {
    this.log.info('Start fetching catalog data')

    let promises = this.parsed.catalog.pages.map((url) => {
      return this.request.get(url)
      .then(($) => {
        this.parsed.catalog.data.push($)
        this.log.debug(`Fetched catalog pages: ${this.parsed.catalog.data.length}/${this.parsed.catalog.pages.length}`)
      })
    })

    await Promise.all(promises)
  }

  /**
   * Parse catalog page and extract products data from it
   */
  async _parseCatalogData () {
    this.log.info('Start parsing catalog data')

    this.parsed.catalog.data.forEach(($) => {
      // slice first two and last table since they do not contain data
      let $tables = $('div > table').slice(2, -1)

      $tables.each((index, element) => {
        let product = {}
        product.id = $('td > a > b > strong.text', element).html().trim()
        // product names for russian locale wrapped in <p> tag
        product.name = $('td', element).eq(1).text().trim() || $('td > p', element).text().trim()
        product.price = $('td > div.text', element).html().trim()

        this.products.set(product.id, product)

        this.log.verbose('Product: %j', product)
      })
    })

    this.log.info(`Parsed products total: ${this.products.size}/${this.parsed.products.total}`)
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
      await this._generateCatalogPagesUrl()
      await this._getCatalogData()
      await this._parseCatalogData()
      // await this._generateProductPagesUrl()
      // await this._getProductData()
      // await this._parseProductData()
      await this._saveToFile()
    } catch (err) {
      this.log.error(err)
    }
  }
}