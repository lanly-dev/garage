// Ensure verbose logging for Crawlee
process.env.CRAWLEE_VERBOSE_LOG = '1'
// NOTE: not sure if this one helps?
// https://github.com/apify/crawlee/blob/master/docs/examples/crawler-plugins/playwright-extra.ts
// For playwright-extra you will need to import the browser type itself that you want to use!
// By default, PlaywrightCrawler uses chromium, but you can also use firefox or webkit.
import { chromium } from 'playwright-extra'
import stealthPlugin from 'puppeteer-extra-plugin-stealth'

// First, we tell playwright-extra to use the plugin (or plugins) we want.
// Certain plugins might have options you can pass in - read up on their documentation!
chromium.use(stealthPlugin())

import { PlaywrightCrawler, Dataset } from 'crawlee'

// Get location from command line argument
const location = process.argv[2] || 'New York' // default to New York if not provided
const startUrl = 'https://www.viator.com/USA/d77'

const crawler = new PlaywrightCrawler({
  launchContext: {
    launchOptions: {
      // headless: false,
      viewport: { width: 1280, height: 800 },
      args: [
        '--window-size=1280,800',
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
      ]
    }
  },
  maxRequestRetries: 5,
  requestHandlerTimeoutSecs: 1200,
  requestHandler: async ({ page, request, log }) => {
    log.info(`Navigating to ${request.url}`)

    // Go to homepage and search for the location
    if (request.url === startUrl) {
      // await page.waitForSelector('input[value="USA"]', { timeout: 30000 })

      // await page.screenshot({path: "test.png", fullPage: true})
      await page.waitForTimeout(2000 + Math.random() * 2000)
      await page.fill('input[value="USA"]', location)
      await page.waitForTimeout(2000 + Math.random() * 2000)
      await page.keyboard.press('Enter')
      await page.waitForTimeout(2000 + Math.random() * 2000)
      // Wait for navigation to results
      await page.waitForLoadState('load')
      // await page.screenshot({path: "test2.png", fullPage: true})
      // get current URL and append ?sortType=rating
      const currentUrl = page.url()
      const newUrl = `${currentUrl}?sortType=rating`
      await page.goto(newUrl, { waitUntil: 'networkidle' })
      await page.waitForTimeout(2000 + Math.random() * 2000)
    }

    const items = await page.$$eval('[data-automation="ttd-product-list-card"]', cards =>
      cards.map(card => {
        const link = card.querySelector('a')?.href
        if (!link) return
        const title = card.querySelector('[class*="title"]')?.textContent?.trim()
        const rating = card.querySelector('[class*="rating"]')?.textContent?.trim()
        const cost = card.querySelector('[class*="price"]')?.textContent?.trim()
        return { title, link, rating, cost }
      })
    )

    // Filter out undefined items
    const filteredItems = items.filter(item => {
      if (!item) return false
      if (item.rating && parseFloat(item.rating) < 4.0) return false
      return true
    })
    await randomClick(page, log)
    await randomMovement(page, log)
    await randomScroll(page, log)
    await page.waitForTimeout(5000 + Math.random() * 3000)

    let i = 0
    for (const item of filteredItems) {
      log.info(`Processing: link=${item.link}, title=${item.title}`)
      await page.goto(item.link, { waitUntil: 'networkidle' })
      // await page.screenshot({ path: 'test.png', fullPage: true })
      page = await getLegitPage(page, log)
      if (!page) continue
      item.overview = await page.$$eval('[data-automation="product-overview"] > div > div', cards => cards.map(card => card.textContent.trim()))
      item.overviewFeatures = await page.$$eval('[data-automation="product-overview"] > ul > li', cards => cards.map(card => card.textContent.trim()))
      item.photos = await page.$$eval('[class*="mediaGallery"] img', imgs => imgs.map(img => img.src))
      const featureList = await page.$$eval('[data-automation="whats-included-section"] ul', uls => uls.map(ul => Array.from(ul.querySelectorAll('li')).map(li => li.textContent.trim())))
      item.included = featureList[0] || []
      item.excluded = featureList[1] || []

      item.additionalInfo = await page.$$eval('[data-automation="additional-info-section"] li', items => items.map(item => item.textContent.trim()))
      log.info(`Processed item ${i++}/${filteredItems.length}: ${item.title}`)
    }
    // console.log(filteredItems[0])
    // console.log(filteredItems[1])
    await Dataset.pushData(filteredItems)
  }
})

// This is for when you want to click on the "See More" button in the modal to get full list of additional info
// async function additionalInfoModal({ request, error }) {
//   const showMoreButton = page.locator('[class*="seeMoreWrapper"] button')
//   await showMoreButton.click()
//   // await page.screenshot({ path: 'test.png', fullPage: true })
//   await page.waitForSelector('[class*="ReactModal__Content"] [class*="featureList"] li')
//   item.additionalInfo = await page.$$eval('[class*="ReactModal__Content"] [class*="featureList"] li', items => items.map(item => item.textContent.trim()))
//   await page.waitForTimeout(2000 + Math.random() * 2000)
// }


async function getLegitPage(page, log, count = 0) {
  if (count > 3) {
    log.warning('Tried: ' + count + ' times to get a legit page! Skipping this page.')
    return null
  }
  const html = await page.content()
  if (html.includes('DataDome')) {
    log.warning('🤖 Bot prevention detected! Skipping this page.')
    // await page.screenshot({ path: 'bot-prevention.png', fullPage: true })
    await page.waitForTimeout(2000 + Math.random() * 2000)
    return getLegitPage(page, log) // to retry the request
  }
  return page
}

async function randomClick(page, log) {
  await page.waitForTimeout(2000 + Math.random() * 2000)
  await page.mouse.click(
    Math.floor(Math.random() * 1280), // random x within viewport width
    Math.floor(Math.random() * 800)   // random y within viewport height
  )
  log.info('Simulated random mouse click on the page')
}

async function randomMovement(page, log) {
  // Simulate mouse movement to random positions
  for (let i = 0; i < 5; i++) {
    const x = Math.floor(Math.random() * 1280)
    const y = Math.floor(Math.random() * 800)
    await page.mouse.move(x, y)
    await page.waitForTimeout(500 + Math.random() * 500)
  }
  log.info('Simulated random mouse movement on the page')
}

async function randomScroll(page, log) {
  // Simulate random scrolling on the page
  const scrollHeight = await page.evaluate(() => document.body.scrollHeight)
  for (let i = 0; i < 5; i++) {
    const scrollY = Math.floor(Math.random() * scrollHeight)
    await page.evaluate(y => window.scrollTo(0, y), scrollY)
    await page.waitForTimeout(500 + Math.random() * 500)
  }
  log.info('Simulated random scrolling on the page')
}

await crawler.run([startUrl])
