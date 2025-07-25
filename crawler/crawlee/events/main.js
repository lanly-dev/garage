
import { PlaywrightCrawler, Dataset } from 'crawlee'

// Get location from command line argument
const location = process.argv[2] || 'New York' // default to New York if not provided
const startUrl = 'https://www.viator.com/USA/d77'

const crawler = new PlaywrightCrawler({
  launchContext: {
    launchOptions: {
      // headless: false
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
      // get current URL and append ?sortType=rating
      const currentUrl = page.url()
      const newUrl = `${currentUrl}?sortType=rating`
      await page.goto(newUrl, { waitUntil: 'networkidle' })
      await page.waitForTimeout(2000 + Math.random() * 2000)
    }
    const items = await page.$$eval('[class*="productCard"]', cards =>
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
    const filteredItems = items.filter(item => item !== undefined)
    console.log(filteredItems.length)
    await page.waitForTimeout(2000 + Math.random() * 2000)

    for (const item of filteredItems) {
      await page.goto(item.link, { waitUntil: 'networkidle' })
      await page.screenshot({path: "test.png", fullPage: true})
      item.overview = await page.$$eval('[class*="bis_skin_checked"]', cards => cards.map(card => card.textContent.trim()))
      item.photos = await page.$$eval('[class*="galleryImage"] img', imgs => imgs.map(img => img.src))
      item.featureList = await page.$$eval('[class*="featureList"] li', features => features.map(feature => feature.textContent.trim()))
      await page.waitForTimeout(2000 + Math.random() * 2000)
    }
    console.log(items)
    await Dataset.pushData(items)
  }
})

await crawler.run([startUrl])
