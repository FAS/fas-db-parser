const sanitize = (record) => {
  const blacklist = [
    '\r\n                    <form action="/4DACTION/web_auswahl_wiederherstellen" method="post" name="auswahl" id="auswahl">\r\n                    </form>\r\n                 '
  ]

  blacklist.forEach((str) => {
    record.description = record.description.replace(str, '')
  })

  return record
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
