import Database from './lib/database'

let de = new Database(1, 'de', 'Deutsch')
let en = new Database(2, 'en', 'Englisch')
let fr = new Database(3, 'fr', 'Franzoesisch')
let ru = new Database(4, 'ru', 'Russisch')

async function init () {
  await ru.parse()
}

init()
