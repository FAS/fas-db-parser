const Client = require('./client')
const cheerio = require('cheerio')
const { mkdir } = require('fs').promises
const { sanitize, isEmptyData } = require('./utils/sanitize')
const saveJSON = require('./utils/saveJSON')
const batchPromises = require('./utils/batchPromises')

// Going above 10 makes it even slower
const CONCURRENT_REQUESTS = 10
const PRODUCT_URL = '/web_artikeldetail'

/**
 * Extract data from product page
 */
const parseProductData = (pageString) => {
  const $page = cheerio.load(pageString)
  const $data = $page('#haupt table:nth-child(5)')

  return {
    id: $data.find('td:nth-child(1) strong').text(),
    name: $data.find('td:nth-child(2)').text(),
    weight: $data.find('td:nth-child(3) div').text(),
    price: $data.find('td:nth-child(4) div').text(),
    amount: $data.find('td:nth-child(5) div').text(),
    description: $page('table.text td.text').html()
  }
}

/**
 * Scans database by checking for existence each entry in specified range and saves
 * each found entry to a standalone file.
 * Any encountered errors will be saved to `${locale}/errors` directory.
 * @param {string} options.locale Locale to scan for
 * @param {number} options.start ID of the entry to start with
 * @param {number} options.end ID of the entry to finish
 * @param {string} options.path Path to save
 * @param {boolean} options.sanitize Should sanitize output
 */
const scanAndSave = async ({ locale, start, end, path, sanitize: shouldSanitize }) => {
  if (!locale) throw new Error('[scan] please, specify `locale` param')
  if (start === undefined || start === null) throw new Error('[scan] please, specify `start` param')
  if (!end) throw new Error('[scan] please, specify `end` param')
  if (!path) throw new Error('[scan] please, specify `path` param')

  const client = new Client()
  const savePath = `${path}/${locale}`
  const errorsPath = `${savePath}/errors/`

  mkdir(errorsPath, { recursive: true })

  const loadDataAndSave = async (locale, id) => {
    try {
      const pageURL = `${PRODUCT_URL}/${id}/${locale}`
      const page = await client.get(pageURL)
      const pageData = parseProductData(page)
      const finalData = shouldSanitize ? sanitize(pageData) : pageData

      if (isEmptyData(id, finalData)) {
        return console.log(`Processed ${id}/${end}, it's empty`)
      }

      await saveJSON(`${savePath}/${id}.json`, finalData)
      console.log(`Processed ${id}/${end}`)
    } catch (error) {
      console.error(`Failed to process ${id} with error:`, error)
      await saveJSON(`${errorsPath}/${id}.json`, error)
    }
  }

  console.log(`Processing...`)

  await batchPromises(start, end, CONCURRENT_REQUESTS, (id) => loadDataAndSave(locale, id))

  console.log('Done.')
}

module.exports = scanAndSave
