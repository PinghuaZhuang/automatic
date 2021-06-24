const path = require('path')
const { exec } = require('child_process')

function killChrome() {
  console.log(`>>> kill all chrome's process.`)
  exec('taskkill /f /im chrome.exe')
}

function openChrome(params) {
  console.log(`>>> open new chrome process.`)
  // exec(`start chrome.exe --remote-debugging-port=9222`)
  // exec('start chrome.exe "--remote-debugging-port=9222" "--no-referrers" "--disable-extensions" "--disable-features=SameSiteByDefaultCookies"')
  exec('start ./node_modules/puppeteer/.local-chromium/win64-884014/chrome-win/chrome.exe "--remote-debugging-port=9222" "--disable-extensions" "--disable-features=SameSiteByDefaultCookies,CookiesWithoutSameSiteMustBeSecure,OutOfBlinkCors"')
}

async function exit(browser, msg) {
  const message = typeof browser !== 'object' ? browser : msg
  console.log(`>>> exit.`, message || '')
  if (typeof browser === 'object') {
    await browser.close()
    return exec('exit')
  }
  process.exit(message || -1)
}

function resolve(url) {
  return path.resolve(__dirname, url)
}

function sleep(delay) {
  return new Promise(resolve => setTimeout(resolve, delay * 1000))
}

module.exports = {
  exit,
  resolve,
  sleep,
  killChrome,
  openChrome,
}
