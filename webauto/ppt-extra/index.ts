import puppeteer from 'puppeteer-extra'

import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

puppeteer.use(AdblockerPlugin()).use(StealthPlugin())

puppeteer
  .launch({ headless: false, defaultViewport: null })
  .then(async browser => {
    const page = await browser.newPage()
    await page.goto('https://bot.sannysoft.com')
    await page.waitForTimeout(5000)
    await page.screenshot({ path: 'stealth.png', fullPage: true })
    await browser.close()
  })
