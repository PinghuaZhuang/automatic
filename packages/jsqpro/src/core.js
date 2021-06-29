const puppeteer = require('puppeteer-extra')
const { exit, getCookies: _getCookies } = require('utils/puppeteer')
const jsqpro = require('./var')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const { execFile } = require('child_process')
const path = require('path')
const write = require('./write')
const { sendDD } = require('utils')
const debounce = require('lodash/debounce')

puppeteer.use(StealthPlugin())

async function assertLogin(page) {
  console.log(`>>> 判断是否已经登录.`)
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
  await page.waitForTimeout(3000)

  console.log(`>>> 跳转到首页.`)
  await page.click('.confirm')
}

async function signIn(page) {
  // await page.waitForTimeout(3000)
  const signHandle = await page.click('.i-button.button-check')
  const signInTxt = await page.evaluate((ele) => {
    return ele && ele.innerText.trim()
  }, signHandle)
  if (signInTxt !== '签到') {
    console.log(`>>> 已经签到了.`)
    return await getPreSignInTime(page)
  }
  await signHandle.click()
  console.log(`>>> 签到成功.`)
  await page.waitForTimeout(2000)
  await page.click('.confirm')
  await page.reload({
    waitUntil: 'networkidle2'
  })
  await page.waitForTimeout(4000)
  return await getPreSignInTime(page)
}

async function getPreSignInTime(page) {
  const preTxtHandle = await page.$('.tag.is-info')
  const signInTime = await page.evaluate((ele) => {
    return ele && ele.innerText.trim()
  }, preTxtHandle)
  console.log(`>>> 签到时间:`, signInTime)
  return signInTime || ''
}

async function getInviteAddress(page) {
  console.log(`>>> 跳转到推广返利.`)
  await page.evaluate(() => document.querySelector('[href="/user/invite"]').click())
  await page.waitForTimeout(2000)

  // 没有使用重置链接不会变
  console.log(`>>> 重置邀请链接.`)
  const linkHandle = await page.$('#aff_link')
  // 刷新页面
  const inviteAddressPre = await page.evaluate(linkEle => linkEle.value, linkHandle)
  await page.click('#resetiv')
  await page.waitForTimeout(1000)
  await page.reload({
    waitUntil: 'networkidle2'
  })
  const linkHandle2 = await page.$('#aff_link')
  const inviteAddress = await page.evaluate(linkEle => linkEle.value, linkHandle2)

  console.log(`>>> 重置邀请链接成功. inviteAddress:`, inviteAddressPre, inviteAddress)
  return inviteAddress
}

async function signInAndGetUrl(page) {
  const signInTime = await signIn(page)
  const inviteAddress = await getInviteAddress(page)
  return { signInTime: signInTime.trim(), inviteAddress }
}

async function updateInviteAddress(page) {
  const signInTime = await signIn(page)

  console.log(`>>> 跳转到推广返利.`)
  await page.evaluate(() => document.querySelector('[href="/user/invite"]').click())
  await page.waitForTimeout(2000)

  console.log(`>>> 重置邀请链接.`)
  const linkHandle = await page.$('#aff_link')
  const inviteAddressPre = await page.evaluate(linkEle => linkEle.value, linkHandle)
  await page.click('#resetiv')
  const inviteAddress = await page.evaluate(linkEle => linkEle.value, linkHandle)

  console.log(`>>> 重置邀请链接成功. inviteAddress:`, inviteAddressPre, inviteAddress)
  return { signInTime: signInTime.trim(), inviteAddress }
}

async function createBrowser() {
  console.log(`===================================================================================`)
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

async function commit() {
  return await execFile(path.resolve(__dirname, '../../../bin/commit.bat'), {
    windowsHide: true,
  }, function (error) {
    if (error) {
      throw error
    }
    console.log('>>> 提交代码.')
  })
}

async function run(cb, isUpdateInviteAddress) {
  const browser = await createBrowser()
  const errorHandle = debounce(async function (error) {
    console.log(`<<< error!`, error)
    await browser.close()
    await write('-1', '-1')
    await sendDD(process.env.DD_WEBHOOK_TOKEN, `jsqpro error: ${error}`)
    process.exit(error)
  }, 1000)
  process.on('unhandledRejection', errorHandle)
  process.on('uncaughtException', errorHandle)
  return cb(browser, jsqpro.url, isUpdateInviteAddress)
}

module.exports = {
  assertLogin,
  getCookies,
  inputAccount,
  signIn,
  getInviteAddress,
  createBrowser,
  createNewPage,
  signInAndGetUrl,
  updateInviteAddress,
  commit,
  run,
}
