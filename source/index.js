import Database from './database'

let de = new Database(1, 'de', 'Deutsch', 'ISO-8859-1')
let en = new Database(2, 'en', 'Englisch', 'ISO-8859-1')
let fr = new Database(3, 'fr', 'Franzoesisch', 'ISO-8859-1')
let ru = new Database(4, 'ru', 'Russisch', 'windows-1251')

async function init () {
  await de.parse()
  await en.parse()
  await fr.parse()
  await ru.parse()
}

init()
