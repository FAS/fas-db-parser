export function sanitize (record) {
  const blacklist = [
    "\r\n                    <form action=\"/4DACTION/web_auswahl_wiederherstellen\" method=\"post\" name=\"auswahl\" id=\"auswahl\">\r\n                    </form>\r\n                 "
  ]

  blacklist.forEach((str) => {
    record.description = record.description.replace(str, '')
  })

  return record
}
