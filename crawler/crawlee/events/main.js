
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
      await page.waitForSelector('input[value="USA"]', { timeout: 10000 })
      await page.fill('input[value="USA"]', location)
      await page.keyboard.press('Enter')
      // Wait for navigation to results
      await page.waitForSelector('[class*="productListProductsAndSortByContainer"]', { timeout: 25000 })
    }
    const items = await page.$$eval('[class*="productCard"]', cards =>
      cards.map(card => {
        console.log(card)
        const title = card.querySelector('.title')?.textContent?.trim()
        const link = card.querySelector('a')?.href
        const rating = card.querySelector('.rating')?.textContent?.trim()
        const cost = card.querySelector('.price')?.textContent?.trim()
        return { title, link, rating, cost }
      })
    )

    console.log(items)

    await Dataset.pushData(items)
  }
})

await crawler.run([startUrl])
