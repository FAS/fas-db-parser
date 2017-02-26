import he from 'he'
import strip from 'striptags'
import Promise from 'bluebird'
import jsonFile from 'jsonfile'
import sort from 'sort-object'
import logger from './logger'
import Request from './request'
import {strMapToObj} from './utils/map'

const CATALOGURL = '/paging_artikel/B//@'
const PRODUCTURL = '/web_artikeldetail'
const PRODUCTSPERPAGE = 20
const MAXCONCURRENTREQUESTS = 10

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
      this.log.info(`Total products in database: ${this.parsed.products.total}`)
    } else {
      this.log.error(new Error('Unable to parse total products amount'))
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
      offset += PRODUCTSPERPAGE

      // uncomment for debugging
      // if (offset === 500) break
    }

    this.log.info(`Generated catalog pages: ${this.parsed.catalog.pages.length}`)
  }

  /**
   * Request every page of catalog
   */
  async _getCatalogData () {
    this.log.info('Start fetching catalog data')

    await Promise.map(this.parsed.catalog.pages, (url) => {
      return this.request.get(url)
      .then(($) => {
        this.parsed.catalog.data.push($)
        this.log.debug(`Fetched catalog pages: ${this.parsed.catalog.data.length}/${this.parsed.catalog.pages.length}`)
      })
    }, { concurrency: MAXCONCURRENTREQUESTS })
  }

  /**
   * Parse catalog page and extract products data from it
   */
  async _parseCatalogData () {
    this.log.info('Start parsing catalog data')

    this.parsed.catalog.data.forEach(($) => {
      // slice first two and last table since they do not contain data
      const $tables = $('div > table').slice(2, -1)

      $tables.each((index, element) => {
        let product = {}
        product.id = $('td > a > b > strong.text', element).text().trim()

        this.products.set(product.id, product)

        this.log.verbose('Product: %j', product)
      })
    })

    this.log.info(`Parsed catalog pages: ${Math.floor(this.products.size / PRODUCTSPERPAGE)}/${Math.floor(this.parsed.products.total / PRODUCTSPERPAGE)}`)
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
   * Request every product page
   */
  async _getProductsData () {
    this.log.info('Start fetching products data')

    await Promise.map(this.parsed.products.pages, (url) => {
      return this.request.get(url)
      .then(($) => {
        this.parsed.products.data.push($)
        this.log.debug(`Fetched products pages: ${this.parsed.products.data.length}/${this.parsed.products.pages.length}`)
      })
    }, { concurrency: MAXCONCURRENTREQUESTS })
  }

  async _parseProductData () {
    this.log.info('Start parsing product data')

    this.parsed.products.data.forEach(($) => {
      let product = {}
      const $data = $('div > table:nth-child(3)')

      product.id = $data.find('td:nth-child(1) > b > strong').text().trim()
      product.name = strip(he.decode($data.find('td:nth-child(2)').text())).trim()
      product.price = $data.find('td:nth-child(3) > div').text().trim()
      product.amount = $data.find('td:nth-child(4) > div').text().trim()
      product.description = he.decode($('table.text > tr > td > p').html())

      // normalize product.id and check for collisions
      const fixedId = Math.abs(product.id)
      if (product.id !== fixedId) {
        this.products.delete(product.id)
        product.id = fixedId
      }
      if (this.products.get(product.id)) {
        this.log.warn(`Detected collision for product.id: ${product.id}`)
        product.id = `${fixedId}!`
      }

      this.products.set(product.id, product)

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
