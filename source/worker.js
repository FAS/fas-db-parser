const fg = require('fast-glob')
const fs = require('graceful-fs')
const { promisify } = require('util')
const { sanitize } = require('./utils/sanitize')

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

const stream = fg.stream('./db/russisch/*.json')

async function process() {
  for await (const entry of stream) {
    readFile(entry)
      .then(JSON.parse)
      .then(sanitize)
      .then(obj => JSON.stringify(obj, null, 2))
      .then(str => writeFile(entry, str))
      .then(console.log(`File processed successfully: ${entry}`))
      .catch(error => console.error(`Unable to process file: ${entry}`, error))
  }
}

process()
