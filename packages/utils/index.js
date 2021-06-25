const path = require('path')

export async function run(cb, error) {
  try {
    cb()
  } catch (e) {
    error(e)
    throw e
  }
}

export function sleep(delay) {
  return new Promise(resolve => setTimeout(resolve, delay * 1000))
}

export function resolve(url) {
  return path.resolve(__dirname, url)
}
