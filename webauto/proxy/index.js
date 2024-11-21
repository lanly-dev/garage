const puppeteer = require(`puppeteer`)

  ; (async () => {
    const browser = await puppeteer.launch({
      headless: false,
      args: [`--proxy-server=socks4://5.39.69.35:50721`]
    })

    const page = await browser.newPage()
    // page.setDefaultNavigationTimeout(60000)
    // page.setDefaultTimeout(60000)
    await page.goto(`https://www.joox.com`, {
      timeout: 60000, // Set timeout to 60 seconds
      waitUntil: `load` // Ensure the page fully loads
    });
  })()
