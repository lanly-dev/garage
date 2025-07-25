
import { PlaywrightCrawler, Dataset } from 'crawlee'

// Get location from command line argument
const location = process.argv[2] || 'New York' // default to New York if not provided
const startUrl = 'https://www.viator.com/USA/d77'

const crawler = new PlaywrightCrawler({
  launchContext: {
    launchOptions: {
      headless: false
    }
  },
  maxRequestRetries: 0,
  requestHandler: async ({ page, request, log }) => {
    log.info(`Navigating to ${request.url}`)

    // Go to homepage and search for the location
    if (request.url === startUrl) {
      // await page.waitForSelector('input[value="USA"]', { timeout: 30000 })
      // wait for payload to load
      // await page.screenshot({path: "test.png", fullPage: true})
      await page.waitForTimeout(2000 + Math.random() * 2000)
      await page.fill('input[value="USA"]', location)
      await page.waitForTimeout(2000 + Math.random() * 2000)
      await page.keyboard.press('Enter')
      await page.waitForTimeout(2000 + Math.random() * 2000)
      // Wait for navigation to results
      await page.waitForLoadState('load')
      // await page.screenshot({path: "test2.png", fullPage: true})
      // add ?sortType=rating
      await page.goto(`${request.url}?sortType=rating`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(2000 + Math.random() * 2000)
    }
    const items = await page.$$eval('[class*="productCard"]', cards =>
      cards.map(card => {
        const title = card.querySelector('[class*="title"]')?.textContent?.trim()
        const link = card.querySelector('a')?.href
        const rating = card.querySelector('[class*="rating"]')?.textContent?.trim()
        const cost = card.querySelector('[class*="price"]')?.textContent?.trim()
        return { title, link, rating, cost }
      })
    )

    console.log(items)
    await Dataset.pushData(items)
  }
})

await crawler.run([startUrl])
