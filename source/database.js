import Promise from 'bluebird'
import jsonFile from 'jsonfile'
import sort from 'sort-object'
import logger from './logger'
import Request from './request'
import { strMapToObj } from './utils/map'
import { mark } from './utils/marker'
import { sanitize } from './utils/sanitizer'

const CATALOG_URL = '/paging_artikel/'
const PRODUCT_URL = '/web_artikeldetail'
const PRODUCTS_PER_PAGE = 20
const MAX_CONCURRENT_REQUESTS = 20

export default class Database {
  constructor (id, code, name) {
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

    this.request = new Request()
    this.log = logger.getLogger(`klpt.${this.code}`)
  }

  /**
   * Generate URL for catalog page
   *
   * possible scope values:
   * O - all entries
   * A - main entries (?)
   * B - specific to selected locale
   */
  _generateCatalogPageUrl (offset = 0, filter = '', scope = 'B') {
    return `${CATALOG_URL}${scope}//${filter}@//${offset}//${this.id}`
  }

  _generateProductPageUrl (id) {
    return `${PRODUCT_URL}/${id}/${this.name}`
  }

  /**
   * Parse page body to find total number of products in database
   */
  async _getProductsAmount () {
    // get catalog index page
    const url = this._generateCatalogPageUrl()
    const $ = await this.request.get(url)
    // last table contains div with navigation menu
    const div = $('table').last().find('div').eq(1).text()
    // extract total amount of products
    const total = div.match(/[\n\r].*von\s*([\d]*)/)[1]

    if (total) {
      this.parsed.products.total = total
      this.log.info(`Total products in database: ${this.parsed.products.total}`)
    } else {
      throw new Error('Unable to parse total products amount')
    }
  }

  /**
   * Generate link for each page of catalog
   */
  async _generateCatalogPagesUrl () {
    let offset = 0

    while (offset < this.parsed.products.total) {
      this.parsed.catalog.pages.push(this._generateCatalogPageUrl(offset))
      // skip to the next page since there is only 20 products per page
      offset += PRODUCTS_PER_PAGE

      // uncomment for debugging
      // if (offset === 500) break
    }

    this.log.info(`Generated catalog pages: ${this.parsed.catalog.pages.length}`)
  }

  /**
   * Request catalog pages one by one
   */
  async _getCatalogData () {
    this.log.info('Start fetching catalog data')

    await Promise.map(this.parsed.catalog.pages, (url) => {
      return this.request.get(url)
      .then(($) => {
        this.parsed.catalog.data.push($)
        this.log.debug(`Fetched catalog pages: ${this.parsed.catalog.data.length}/${this.parsed.catalog.pages.length}`)
      })
    }, { concurrency: MAX_CONCURRENT_REQUESTS })
  }

  /**
   * Parse catalog page and extract products data from it
   */
  async _parseCatalogData () {
    this.log.info('Start parsing catalog data')

    this.parsed.catalog.data.forEach(($) => {
      // slice first three and last table since they do not contain data
      const $tables = $('div > table').slice(3, -1)

      $tables.each((index, element) => {
        let product = {}
        product.id = $('td strong.text', element).text()

        this.products.set(product.id, product)

        this.log.verbose('Product: %j', product)
      })
    })

    this.log.info(`Parsed catalog pages: ${Math.floor(this.products.size / PRODUCTS_PER_PAGE)}/${Math.floor(this.parsed.products.total / PRODUCTS_PER_PAGE)}`)
  }

  /**
   * Generate links for each product page
   */
  async _generateProductsPagesUrl () {
    this.products.forEach((value, key) => {
      this.parsed.products.pages.push(this._generateProductPageUrl(key))
    })
    this.log.info(`Generated product pages: ${this.parsed.products.pages.length}/${this.products.size}/${this.parsed.products.total}`)
  }

  /**
   * Request product page one by one
   */
  async _getProductsData () {
    this.log.info('Start fetching products data')

    await Promise.map(this.parsed.products.pages, (url) => {
      return this.request.get(url)
      .then(($) => {
        this.parsed.products.data.push($)
        this.log.debug(`Fetched products pages: ${this.parsed.products.data.length}/${this.parsed.products.pages.length}`)
      })
    }, { concurrency: MAX_CONCURRENT_REQUESTS })
  }

  /**
   * Parse product pages and extract data from it
   */
  async _parseProductData () {
    this.log.info('Start parsing product data')

    this.parsed.products.data.forEach(($) => {
      let product = {}
      const $data = $('#haupt table:nth-child(5)')

      product.id = $data.find('td:nth-child(1) strong').text()
      product.name = $data.find('td:nth-child(2)').text()
      product.weight = $data.find('td:nth-child(3) div').text()
      product.price = $data.find('td:nth-child(4) div').text()
      product.amount = $data.find('td:nth-child(5) div').text()
      product.description = $('table.text td.text').html()

      this.log.verbose('Product: %j', product)
    })

    this.log.info(`Parsed products total: ${this.products.size}/${this.parsed.products.total}`)
  }

  /**
   * Save products list to json file
   */
  async _saveToFile () {
    // convert string Map to Object
    let obj = strMapToObj(this.products)
    obj = sort(obj)
    jsonFile.writeFileSync(`./db/products.${this.code}.json`, obj, {spaces: 2})
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
      await this._generateProductsPagesUrl()
      await this._getProductsData()
      await this._parseProductData()
      await this._saveToFile()
    } catch (err) {
      this.log.error(err)
    }
  }
}
