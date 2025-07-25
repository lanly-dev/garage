
import { PlaywrightCrawler, Dataset } from 'crawlee'



// Get location from command line argument
const location = process.argv[2] || 'New York'; // default to New York if not provided
const startUrl = 'https://www.viator.com/USA/d77';

const crawler = new PlaywrightCrawler({
  launchContext: {
    launchOptions: {
      headless: false,
    },
  },
  requestHandler: async ({ page, request, log }) => {
    log.info(`Navigating to ${request.url}`);

    // Go to homepage and search for the location
    if (request.url === startUrl) {
      await page.waitForSelector('input[placeholder*="Search"]', { timeout: 15000 });
      await page.fill('input[placeholder*="Search"]', location);
      await page.keyboard.press('Enter');
      // Wait for navigation to results
      await page.waitForSelector('[data-automation="product-card"]', { timeout: 15000 });
    }

    // Scrape the results
    const attractions = await page.evaluate(() => {
      const results = [];
      document.querySelectorAll('[data-automation="product-card"]').forEach((item) => {
        const title = item.querySelector('[data-automation="product-card-title"]')?.innerText || '';
        const description = item.querySelector('[data-automation="product-card-description"]')?.innerText || '';
        const price = item.querySelector('[data-automation="product-card-price"]')?.innerText || '';
        const rating = item.querySelector('[data-automation="product-card-rating-value"]')?.innerText || '';
        results.push({ title, description, price, rating });
      });
      return results;
    });

    await Dataset.pushData(attractions);
  },
});

await crawler.run([startUrl]);
