import run from './src/core'
import { exit } from 'utils/puppeteer'
import {
  createNewPage,
  assertLogin,
  sign,
  getSignBtn,
  getCookies,
  inputAccount,
  getInviteAddress,
} from './src/core'

run(async (browser) => {
  const page = createNewPage(browser)

  await page.goto(jsqpro.url)

  const signBtn = await assertLogin(page)

  if (signBtn) {
    await sign(page, signBtn)
    return exit(`已经登录!`)
  }

  await page.waitForTimeout(8000)
  await getCookies(page)

  await inputAccount(page)
  await page.waitForTimeout(2000)
  await sign(page, signBtn)

  await getInviteAddress(page)

  await page.waitForTimeout(2000)
  await exit(browser)
})
