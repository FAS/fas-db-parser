import he from 'he'

export function sanitize (record) {
  let { name, description } = record
  const blacklist = [
    '<span style=\"font-size:9pt\"><span style=\"color:#D81E05;font-weight:bold\">',
    '<form action="/4DACTION/web_auswahl_wiederherstellen" method="post" name="auswahl" id="auswahl">',
    '</form>',
    // this two are somehow different
    '\r\n                    ',
    '\r\n                    '
  ]

  blacklist.forEach((str) => {
    description = description.replace(str, '')
  })

  description = he.decode(description)
  name = he.decode(name)

  // brs
  description = description.replace(/<br\s*[\/]?>/gi, '\\n')
  name = name.replace(/<br\s*[\/]?>/gi, '\\n')
  // symbols garbage
  description = description.replace(/([#*,\s])\1{1,}/gi, '')
  name = name.replace(/([#*,\s])\1{1,}/gi, '')


  return {...record, name, description}
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
