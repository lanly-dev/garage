const puppeteer = require('puppeteer')

;(async () => {
  const browser = await puppeteer.launch({ headless: false })
  const context = await browser.createBrowserContext()
  const page = await context.newPage()
  await page.goto('https://example.com')
})()
