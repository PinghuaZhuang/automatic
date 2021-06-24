// const puppeteer = require('puppeteer')
const puppeteer = require('puppeteer-extra')
const fetch = require('node-fetch')
const { sleep, exit/* , killChrome, openChrome */ } = require('./utils')
const { jsqpro } = require('./var')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')

puppeteer.use(StealthPlugin())

async function getSignBtn(page) {
  return await page.$('.i-button.button-check')
}

async function assertLogin(page) {
  console.log(`>>> assert whether the login.`)
  return getSignBtn(page)
}

async function getCookies(page) {
  const cookies = await page.cookies()
  console.log('>>> cookies', cookies.map(o => o.name))
  if (cookies.length <= 1) {
    console.log('<<< cookies error! may be Access denied!')
    exit('Access denied!')
  }
}

async function logHtml() {
  const htmlHandle = await page.$('html')
  const html = await page.evaluate(html => html.innerHTML, htmlHandle);
  await htmlHandle.dispose()
  console.log('html-content:', html)
}

async function inputAccount(page) {
  console.log(`>>> input account message.`)
  await page.type(jsqpro.emailSelector, jsqpro.email)
  await page.type(jsqpro.passwordSelector, jsqpro.password)
  await page.click(jsqpro.loginSelector)
  await sleep(2)
  console.log(`>>> confirm.`)
  await page.click('.confirm')
  console.log(`>>> redirect to home page.`)
}

async function sign(page, signBtn) {
  if (signBtn) {
    console.log(`>>> sign success.`)
    return signBtn.click()
  }
  await sleep(3)
  signBtn = await getSignBtn(page)
  signBtn.click()
  console.log(`>>> sign success.`)
  await sleep(2)
}

async function getInviteAddress(page) {
  console.log(`>>> go to InviteAddress view.`)
  await page.evaluate(() => document.querySelector('[href="/user/invite"]').click())
  await sleep(2)
  const linkHandle = await page.$('#aff_link')
  const inviteAddress = await page.evaluate(linkEle => linkEle.value, linkHandle)
  console.log('>>> InviteAddress:', inviteAddress)
}

async function run() {
  console.log(`>>> open new page.`)
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

  // browser.on('targetdestroyed', () => exit(`浏览器外部关闭!`))

  try {
    const page = await browser.newPage({
      waitUntil: 'networkidle2'
    })
    await page.setJavaScriptEnabled(true)
    await page.setExtraHTTPHeaders({
      'X-Forwarded-For': '110.87.83.20'
    })

    await page.goto(jsqpro.url)

    const signBtn = await assertLogin(page)

    if (signBtn) {
      await sign(page, signBtn)
      return exit(`已经登录!`)
    }

    await sleep(8)
    await getCookies(page)

    await inputAccount(page)
    await sleep(2)
    await sign(page, signBtn)

    await getInviteAddress(page)

    await page.waitForTimeout(2000)
    await exit(browser)
  } catch (error) {
    await browser.close()
    throw error
  }
}

run()
