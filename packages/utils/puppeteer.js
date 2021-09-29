const { exec } = require('child_process')

async function logHtml() {
  const htmlHandle = await page.$('html')
  const html = await page.evaluate(html => html.innerHTML, htmlHandle);
  await htmlHandle.dispose()
  console.log('html-content:', html)
}

async function getCookies(page) {
  const cookies = await page.cookies()
  console.log('>>> cookies', cookies.map(o => o.name))
  return cookies
}

function killChrome() {
  console.log(`>>> kill all chrome's process.`)
  exec('taskkill /f /im chrome.exe')
}

function openChrome() {
  console.log(`>>> open new chrome process.`)
  // exec(`start chrome.exe --remote-debugging-port=9222`)
  // exec('start chrome.exe "--remote-debugging-port=9222" "--no-referrers" "--disable-extensions" "--disable-features=SameSiteByDefaultCookies"')
  exec('start ./node_modules/puppeteer/.local-chromium/win64-884014/chrome-win/chrome.exe "--remote-debugging-port=9222" "--disable-extensions" "--disable-features=SameSiteByDefaultCookies,CookiesWithoutSameSiteMustBeSecure,OutOfBlinkCors"')
}

async function exit(message, browser) {
  console.log(`>>> exit.`, message)
  if (typeof browser === 'object') {
    await browser.close()
    throw new Error(`>>> exit. ${message}`)
    // return exec('exit')
  }
  // process.exit(message || -1)
}

module.exports = {
  logHtml,
  getCookies,
  killChrome,
  openChrome,
  exit,
}
