export function mark (record) {
  record.marks = []

  Object.entries(filters).forEach(([name, filter]) => {
    filter(record) || record.marks.push(name)
  })
  return record
}

let filters = {
  'wrong-id': function (record) {
    return record.id === Math.abs(record.id)
  },
  'wrong-language': function (record) {
    return true
  },
  'wrong-encoding': function (record) {
    return true
  }
}
