export function mark (record) {
  record.marks = []

  Object.entries(filters).forEach(([name, filter]) => {
    filter(record) && record.marks.push(name)
  })

  return record
}

// if return true - mark entry
const filters = {
  'wrong-id': function (record) {
    return record.id !== Math.abs(record.id)
  },
  'wrong-language': function (record) {
    return false
  },
  'wrong-encoding': function (record) {
    return false
  }
}
