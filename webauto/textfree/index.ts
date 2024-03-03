import { config } from 'dotenv'
import { chromium } from 'playwright-chromium'
config()
const MSG = 'HELLO_WORLD'
const { USER, PASS, PHONE } = process.env

async function run() {
  const browser = await chromium.launch({
    headless: false
  })
  const context = await browser.newContext()
  const page = await context.newPage()
  page.goto('https://messages.textfree.us/login')

  await page.fill('input[type="text"]', USER!)
  await page.fill('input[type="password"]', PASS!)
  await page.click('button[type="submit"]')

  await page.click('div[id="SyncContactsXDismissPopup"]')
  await page.click('div[id="startNewConversationButton"]')
  await page.fill('#contactInput', PHONE!)
  await page.keyboard.press('Enter')
  await page.focus('.emojionearea-editor')
  await page.keyboard.type(MSG)
  await page.click('#sendButton')
  browser.close()
}

run()
