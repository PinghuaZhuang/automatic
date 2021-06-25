const { exit } = require('utils/puppeteer')
const {
  createNewPage,
  assertLogin,
  signIn,
  getCookies,
  inputAccount,
  signInAndGetUrl,
  run,
} = require('./src/core')

run(async (browser, url) => {
  const page = await createNewPage(browser)
  let preTxt = ''

  await page.goto(url)

  if (await assertLogin(page)) {
    preTxt = await signInAndGetUrl(page)
    return exit(`已经登录!`)
  }

  await page.waitForTimeout(8000)
  await getCookies(page)

  await inputAccount(page)
  await page.waitForTimeout(2000)
  preTxt = await signInAndGetUrl(page)

  await page.waitForTimeout(2000)
  await exit('done. ', browser)
})
