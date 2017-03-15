#!/usr/bin/env node

import program from 'commander'
import pkg from './../../package.json'
import Kleptomaniac from './../index.js'

program
  .usage('[options] <file>')
  .description('FAS DB parsing tool')
  .option('-p, --path <path>', 'path to file storage folder', './db/')
  .option('-i, --input <file>', 'use locale db file')
  .option('-o, --output <file>', 'destination for db file')
  .option('-l --locale [all|de|en|fr|ru]', 'specify locale to parse', 'all')
  .option('-u, --update', 'parse remote db', false)
  .option('-m, --mark', 'mark db entries', false)
  .option('-s, --sanitize', 'sanitize db entries', false)
  .version(pkg.version)
  .parse(process.argv)

Kleptomaniac.init(program)
