import Database from './database'

const Kleptomaniac = {
  init: async function (options) {
    const db = new Database(options.locale)
    await db.parse()
  }
}

export default Kleptomaniac
