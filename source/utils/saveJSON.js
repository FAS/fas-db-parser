const { writeFile } = require('fs').promises

const saveJSON = async (path, object) => {
  // getOwnPropertyNames make it Errors properties stringification to work
  const stringified = JSON.stringify(object, Object.getOwnPropertyNames(object), 2)
  await writeFile(path, stringified)
}

module.exports = saveJSON
