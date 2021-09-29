const { exit, logHtml } = require('utils/puppeteer')
const write = require('./write')
const {
  createNewPage,
  assertLogin,
  getCookies,
  inputAccount,
  signInAndGetUrl,
  commit,
} = require('./core')
const { sendEmail } = require('./notify')

module.exports = async (browser, url) => {
  const page = await createNewPage(browser)
  let info

  await page.goto(url)

  if (await assertLogin(page)) {
    info = await signInAndGetUrl(page)
    return exit(`已经登录!`)
  }

  await page.waitForTimeout(10000)
  await logHtml(page)
  await getCookies(page)

  await inputAccount(page)
  info = await signInAndGetUrl(page)

  await write(info.signInTime, info.inviteAddress)
  await commit(info.signInTime)

  await page.waitForTimeout(2000)
  await sendEmail()
  await exit('done. ', browser)
  return info
}
