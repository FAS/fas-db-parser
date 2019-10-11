#!/usr/bin/env node

const program = require('commander')
const pkg = require('../../package.json')
const Kleptomaniac = require('../index.js')

program
  .usage('')
  .description('FAS DB parsing tool')
  .option('-s, --start <start>', 'id of the start entry', 0)
  .option('-e, --end <end>', 'id of the end entry', 1000000)
  .option('-p, --path <path>', 'path to storage folder', 'db')
  // @todo Not implemented
  // .option('-i, --input <file>', 'use locale db file')
  // .option('-o, --output <file>', 'destination for db file')
  .option('-l --locale [deutsch|englisch|franzoesisch|russisch]', 'specify locale to parse', 'deutsch')
  // @todo Not implemented
  // .option('-u, --update', 'parse remote db', false)
  // .option('-m, --mark', 'mark db entries', false)
  .option('-s, --sanitize', 'sanitize db entries', false)
  .version(pkg.version)
  .parse(process.argv)

Kleptomaniac(program)
