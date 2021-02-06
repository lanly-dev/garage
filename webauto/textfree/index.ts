import { config } from 'dotenv'
import { chromium } from 'playwright-chromium'
config()
const MSG = 'HELLOWOLRD'

async function run() {
  const browser = await chromium.launch({
    headless: true
  })
  const constext = await browser.newContext()
  const page = await constext.newPage()
  page.goto('https://messages.textfree.us/login')

  await page.fill('input[type="text"]', process.env.USER)
  await page.fill('input[type="password"]', process.env.PASS)
  await page.click('button[type="submit"]')

  await page.click('div[id="SyncContactsXDismissPopup"]')
  await page.click('div[id="startNewConversationButton"]')
  await page.fill('#contactInput', process.env.PHONE)
  await page.keyboard.press('Enter')
  await page.focus('.emojionearea-editor')
  await page.keyboard.type(MSG)
  await page.click('#sendButton')
  browser.close()
}

run()
