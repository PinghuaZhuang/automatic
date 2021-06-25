const puppeteer = require('puppeteer-extra')
const { exit, getCookies: _getCookies } = require('utils/puppeteer')
const jsqpro = require('./var')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')

puppeteer.use(StealthPlugin())

async function getSignBtn(page) {
  return await page.$('.i-button.button-check')
}

async function assertLogin(page) {
  console.log(`>>> 判断是否已经登录.`)
  // return getSignBtn(page)
  const usernameHandle = await page.$('.user .info span')
  return page.evaluate((usernameEle) => {
    return usernameEle != null && usernameEle.innerText.trim() === jsqpro.username
  }, usernameHandle)
}

async function getCookies(page) {
  const cookies = await _getCookies(page)
  if (cookies.length <= 1) {
    console.log('<<< cookies error! may be Access denied!')
    exit('Access denied!')
  }
}

async function inputAccount(page) {
  console.log(`>>> 输入账号信息.`)
  await page.type('#email', jsqpro.email)
  await page.type('#passwd', jsqpro.password)
  await page.click('#login')
  await page.waitForTimeout(2000)
  console.log(`>>> 跳转到首页.`)
  await page.click('.confirm')
}

async function signIn(page) {
  // await page.waitForTimeout(3000)
  const signHandle = await getSignBtn(page)
  const signInTxt = await page.evaluate((ele) => {
    return ele && ele.innerText.trim()
  }, signHandle)
  if (signInTxt !== '签到') {
    console.log(`>>> 已经签到了.`)
    return await getPreSignInTime(page)
  }
  signHandle.click()
  console.log(`>>> 签到成功.`)
  await page.waitForTimeout(2000)
  return await getPreSignInTime(page)
}

async function getPreSignInTime(page) {
  const preTxtHandle = await page.$('.tag.is-info')
  const preTxt = await page.evaluate((ele) => {
    return ele && ele.innerText.trim()
  }, preTxtHandle)
  return preTxt
}

async function getInviteAddress(page) {
  console.log(`>>> 跳转到推广返利.`)
  await page.evaluate(() => document.querySelector('[href="/user/invite"]').click())
  await page.waitForTimeout(2000)
  const linkHandle = await page.$('#aff_link')
  const inviteAddress = await page.evaluate(linkEle => linkEle.value, linkHandle)
  console.log('>>> 邀请链接:', inviteAddress)
}

async function signInAndGetUrl(page) {
  const preTxt = await signIn(page)
  await getInviteAddress(page)
  return preTxt
}

async function createBrowser() {
  console.log(`>>> 打开浏览器.`)
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

async function createNewPage(browser) {
  console.log(`>>> 打开新标签.`)
  const page = await browser.newPage({
    waitUntil: 'networkidle2'
  })
  await page.setJavaScriptEnabled(true)
  await page.setExtraHTTPHeaders({
    'X-Forwarded-For': '110.87.83.20'
  })
  return page
}

async function run(cb) {
  const browser = await createBrowser()
  try {
    cb(browser, jsqpro.url)
  } catch (error) {
    browser.close()
    throw error
  }
}

module.exports = {
  getSignBtn,
  assertLogin,
  getCookies,
  inputAccount,
  signIn,
  getInviteAddress,
  createBrowser,
  createNewPage,
  signInAndGetUrl,
  run,
}
