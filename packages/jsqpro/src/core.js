const puppeteer = require('puppeteer-extra')
const { exit } = require('utils/puppeteer')
const jsqpro = require('./var')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const { run, getCookies } = require('utils')

puppeteer.use(StealthPlugin())

export async function getSignBtn(page) {
  return await page.$('.i-button.button-check')
}

export async function assertLogin(page) {
  console.log(`>>> assert whether the login.`)
  return getSignBtn(page)
}

export async function getCookies(page) {
  const cookies = await getCookies(page)
  if (cookies.length <= 1) {
    console.log('<<< cookies error! may be Access denied!')
    exit('Access denied!')
  }
}

export async function inputAccount(page) {
  console.log(`>>> input account message.`)
  await page.type('#email', jsqpro.email)
  await page.type('#passwd', jsqpro.password)
  await page.click('#login')
  await page.waitForTimeout(2000)
  console.log(`>>> confirm.`)
  await page.click('.confirm')
  console.log(`>>> redirect to home page.`)
}

export async function sign(page, signBtn) {
  if (signBtn) {
    console.log(`>>> sign success.`)
    return signBtn.click()
  }
  await page.waitForTimeout(3000)
  signBtn = await getSignBtn(page)
  signBtn.click()
  console.log(`>>> sign success.`)
  await page.waitForTimeout(2000)
}

export async function getInviteAddress(page) {
  console.log(`>>> go to InviteAddress view.`)
  await page.evaluate(() => document.querySelector('[href="/user/invite"]').click())
  await page.waitForTimeout(2000)
  const linkHandle = await page.$('#aff_link')
  const inviteAddress = await page.evaluate(linkEle => linkEle.value, linkHandle)
  console.log('>>> InviteAddress:', inviteAddress)
}

export async function createBrowser() {
  console.log(`>>> create brower`)
  const browser = await puppeteer.launch({
    // headless: false,
    args: [
      // ...['--no-sandbox', '--disable-setuid-sandbox']
      // '--headless',
      '--start-maximized',
      '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
      '--disable-extensions',
      '--remote-debugging-port=9222',
      // '--disable-features=SameSiteByDefaultCookies,CookiesWithoutSameSiteMustBeSecure,OutOfBlinkCors',
    ],
    ignoreHTTPSErrors: true,
    // ignoreDefaultArgs: true,
    ignoreDefaultArgs: ['--enable-automation'],
  })
  return browser
}

export async function createNewPage(brower) {
  console.log(`>>> open new page.`)
  const page = await browser.newPage({
    waitUntil: 'networkidle2'
  })
  await page.setJavaScriptEnabled(true)
  await page.setExtraHTTPHeaders({
    'X-Forwarded-For': '110.87.83.20'
  })
  return page
}

export async function run(cb) {
  const browser = createBrowser()
  try {
    cb(browser)
  } catch (error) {
    browser.close()
    throw error
  }
}
