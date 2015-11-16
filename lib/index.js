import get from './request'

// locale config
const lc = {
  de: {
    id: 1,
    name: 'Deutsch'
  },
  en: {
    id: 2,
    name: 'Englisch'
  },
  fr: {
    id: 3,
    name: 'Franzoesisch'
  },
  ru: {
    id: 4,
    name: 'Russisch'
  }
}

// /paging_artikel/B//@//${offset}//${lc.ru.id}/
const listUrl = '/paging_artikel/B//@'
// /web_artikeldetail/${itemId}/${lc.ru.name}
const itemUrl = '/web_artikeldetail'

/**
 * Generate url based on locale
 * @param  {String}  locale    locale short code e.g. 'de'
 * @param  {Integer} offset    offset
 * @return {String}            localized endpoint url
 */
function genUrl (locale, offset = 0) {
  let lid = lc[locale].id
  let url = `${listUrl}//${offset}//${lid}`
  return url
}

/**
 * Get total number of products per desired locale
 * @param  {String}  locale    locale identifier e.g. 'de'
 * @return {Integer}           amount of products
 */
function getProductsAmount (locale) {
  const url = genUrl(locale)

  return get(url)
    .then($ => {
      // last table contains div with navigation menu
      const div = $('table').last().find('div').eq(1).text()
      // extract total amount of products
      const total = div.match(/[\n\r].*von\s*([\d]*)/)[1]

      if (!total) {
        throw new Error('Unable to parse total products amount')
      } else {
        return total
      }
    })
    .catch(err => {
      throw err
    })
}
/**
 * Generate array of links for each page of catalog
 * @param  {String}  locale    locale identifier e.g. 'de'
 * @param  {Integer} total     number of total products per locale
 * @return {Array}             list of catalog pages
 */
function genProductsPages (locale, total) {
  let pages = []
  let offset = 0

  while (offset < total) {
    pages.push(genUrl(locale, offset))
    offset += 20
    break
  }

  return pages
}

/**
 * [getProductsList description]
 * @param  {[type]} pages [description]
 * @return {[type]}       [description]
 */
function getProductsList (pages) {
  let products = []
  let pagesP = pages.map(page => {
    return get(page)
  })

  return Promise.all(pagesP)

  // get data from page
  // parse data
  // save data to object
  // let url = genUrl(locale, offset)
}

/**
 * Parse products catalog
 * @param  {object}  lc        locale config object
 * @return {object}            catalog object
 */
function parseCatalog (lc) {
  for (const locale in lc) {
    if (lc.hasOwnProperty(locale)) {
      let lname = lc[locale].name

      getProductsAmount(locale)
        .then(productsCount => {
          let pages = genProductsPages(locale, productsCount)
          let pagesCount = pages.length
          console.log(`${lname}: ${productsCount} products on ${pagesCount} pages`)

          //return getProductsList(pages)
        })
        .catch(err => {
          throw err
        })
    }
  }
}

parseCatalog(lc)
