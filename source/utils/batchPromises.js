const range = require('lodash.range')

const batchPromises = async (start, end, limit, promise) => {
  let processed = start

  while (processed <= end) {
    // +1 counts for zero-based start
    const remained = end - processed + 1
    const to = remained >= limit ? processed + limit : processed + remained

    const promises = range(processed, to, 1)
      .map((id) => promise(id))

    await Promise.all(promises)

    processed = processed + limit
  }
}

module.exports = batchPromises
