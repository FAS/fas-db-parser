#!/usr/bin/env node

const program = require('commander')
const pkg = require('../../package.json')
const Kleptomaniac = require('../index.js')

program
  .usage('')
  .description('FAS DB parsing tool')
  .option('-s, --start <start>', 'id of the start entry', parseFloat, 0)
  .option('-e, --end <end>', 'id of the end entry', parseFloat, 1000000)
  .option('-p, --path <path>', 'path to the storage folder', 'db')
  // @todo Not implemented
  // .option('-i, --input <file>', 'use locale db file')
  // .option('-o, --output <file>', 'destination for db file')
  .option('-l --locale [deutsch|englisch|franzoesisch|russisch]', 'specify locale to parse', 'deutsch')
  // @todo Not implemented
  // .option('-u, --update', 'parse remote db', false)
  // .option('-m, --mark', 'mark db entries', false)
  .option('-a, --sanitize <sanitize>', 'sanitize db entries', true)
  .version(pkg.version)
  .parse(process.argv)

Kleptomaniac(program.opts())
