const he = require('he')

const sanitize = (record) => {
  const blacklist = [
    '<span style=\"font-size:9pt\"><span style=\"color:#D81E05;font-weight:bold\">',
    '<form action="/4DACTION/web_auswahl_wiederherstellen" method="post" name="auswahl" id="auswahl">',
    '</form>'
  ]

  const arr = Object.entries(record).map(([key, value]) => {
    blacklist.forEach((str) => {
      value = value.replace(str, '')
    })
    // decode entities
    value = he.decode(value)
    // brs
    value = value.replace(/<br\s*[\/]?>/gi, '\\n')
    // symbols garbage
    value = value.replace(/\r\n/gi, '')
    value = value.replace(/([#*,\s])\1{1,}/gi, '')
    return [key, value]
  })

  return Object.fromEntries(arr)
}

const EMPTY_ENTRY_SIGNATURE = {
  id: '\r\n                    \r\n                  ',
  name: '',
  weight: '0,00',
  price: '\r\n                  0,00\r\n                  ',
  amount: '\r\n                      \r\n1788.84\r\n                    \r\n                    ',
  description: ''
}

// @todo Note that it will fail to detect not sanitized entries. No time to fix it.
const isEmptyData = (id, data) => Object.entries(data)
  .every(([key, value]) => EMPTY_ENTRY_SIGNATURE[key] === value)

module.exports = {
  sanitize,
  isEmptyData
}
