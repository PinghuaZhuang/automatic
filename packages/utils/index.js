const path = require('path')

async function run(cb, error) {
  try {
    cb()
  } catch (e) {
    error(e)
    throw e
  }
}

function sleep(delay) {
  return new Promise(resolve => setTimeout(resolve, delay * 1000))
}

function resolve(url) {
  return path.resolve(__dirname, url)
}

module.exports = {
  run,
  sleep,
  resolve,
}
