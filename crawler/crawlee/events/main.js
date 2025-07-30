// Ensure verbose logging for Crawlee
process.env.CRAWLEE_VERBOSE_LOG = '1'

import { PlaywrightCrawler, Dataset } from 'crawlee'

// Get location from command line argument
const location = process.argv[2] || 'New York' // default to New York if not provided
const startUrl = 'https://www.viator.com/USA/d77'

const crawler = new PlaywrightCrawler({
  launchContext: {
    launchOptions: {
      // headless: false
      viewport: { width: 1280, height: 800 },
      args: [
        '--window-size=1280,800',
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
      ]
    }
  },
  maxRequestRetries: 0,
  requestHandlerTimeoutSecs: 120,
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
    const filteredItems = items.filter(item => {
      if (!item) return false
      if (item.rating && parseFloat(item.rating) < 4.0) return false
      return true
    })
    await randomClick(page)
    await randomMovement(page)
    await page.waitForTimeout(3000 + Math.random() * 3000)

    let i = 0
    for (const item of filteredItems) {
      console.log(`Processing: link=${item.link}, title=${item.title}`)
      await page.goto(item.link, { waitUntil: 'networkidle' })
      await page.screenshot({ path: "test.png", fullPage: true })
      if (!await isLegitPage(page)) return
      item.overview = await page.$$eval('[data-automation="product-overview"] > div > div', cards => cards.map(card => card.textContent.trim()))
      item.overviewFeatures = await page.$$eval('[data-automation="product-overview"] > ul > li', cards => cards.map(card => card.textContent.trim()))
      item.photos = await page.$$eval('[class*="mediaGallery"] img', imgs => imgs.map(img => img.src))
      item.featureList = await page.$$eval('[class*="featureList"] li', features => features.map(feature => feature.textContent.trim()))
      await page.waitForTimeout(2000 + Math.random() * 2000)
      console.log(`Processed item ${i++}/${filteredItems.length}: ${item.title}`)
      if (i === 1) break
    }
    console.log(filteredItems[0])
    console.log(filteredItems[1])
    await Dataset.pushData(filteredItems)
  }
})

async function isLegitPage(page) {
  const html = await page.content()
  if (html.includes('DataDome')) {
    console.warn('🤖 Bot prevention detected! Skipping this page.')
    // await page.screenshot({ path: 'bot-prevention.png', fullPage: true })
    return false
  }
  return true
}

async function randomClick(page) {
  await page.waitForTimeout(2000 + Math.random() * 2000)
  await page.mouse.click(
    Math.floor(Math.random() * 1280), // random x within viewport width
    Math.floor(Math.random() * 800)   // random y within viewport height
  )
  console.info('Simulated random mouse click on the page')
}

async function randomMovement(page) {
  // Simulate mouse movement to random positions
  for (let i = 0; i < 5; i++) {
    const x = Math.floor(Math.random() * 1280)
    const y = Math.floor(Math.random() * 800)
    await page.mouse.move(x, y)
    await page.waitForTimeout(500 + Math.random() * 500)
  }
  console.info('Simulated random mouse movement on the page')
}

await crawler.run([startUrl])
