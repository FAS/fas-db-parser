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

// http://217.13.171.155/4DACTION/paging_artikel/B//@//${offset}//${lc.ru.id}/
const listUrl = 'http://217.13.171.155/4DACTION/paging_artikel/B//@'
// http://217.13.171.155/4DACTION/web_artikeldetail/${itemId}/${lc.ru.name}
const itemUrl = 'http://217.13.171.155/4DACTION/web_artikeldetail'

let offset = 0
let catalog = lc

/**
 * Generate url based on locale
 * @param  {string} locale locale short code e.g. 'de'
 * @param  {int}    offset offset
 * @return {string}        localized endpoint url
 */
function genUrl (locale, offset = 0) {
  let lid = lc[locale].id
  let url = `${listUrl}//${offset}//${lid}`
  return url
}

/**
 * Get total number of products per desired locale
 * @param  {string} locale locale identifier e.g. 'de'
 * @return {int}           amount of products
 */
function getProductsAmount (locale) {
  let url = genUrl(locale)

   return get(url)
    .then($ => {
      // last table contains div with navigation menu
      let tmp = $('table').last().find('div').eq(1).text()
      // extract total amount of products
      let total = tmp.match(/[\n\r].*von\s*([\d]*)/)[1]

      if (!total) {
        throw 'Unable to parse total products amount'
      } else {
        return total
      }
    })
    .catch(err => {
      console.log(err)
    })
}

/**
 * Parse FAS products catalog
 * @param  {object} lc     locale config object
 * @return {object}        catalog object
 */
function parseCatalog (lc) {
  for (let locale in lc) {
    if (lc.hasOwnProperty(locale)) {
      let lname = lc[locale].name

      getProductsAmount(locale)
        .then(total => {
          console.log(`${lname}: ${total} products`)
        })
    }
  }
}





function getProductList (argument) {
  // body...
}

function getProducts (argument) {
  // body...
}
