import Database from './database'

let de = new Database(1, 'de', 'Deutsch', 'utf-8')
let en = new Database(2, 'en', 'Englisch', 'utf-8')
let fr = new Database(3, 'fr', 'Franzoesisch', 'utf-8')
let ru = new Database(4, 'ru', 'Russisch', 'utf-8')

async function init () {
  await de.parse()
  await en.parse()
  await fr.parse()
  await ru.parse()
}

init()
