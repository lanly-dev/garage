const { chromium } = require('playwright')
const fs = require('fs')

(async () => {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  await page.goto('')

  // Wait for the playlist to load
  await page.waitForSelector('ytd-playlist-video-renderer')

  // Extract video details
  const videos = await page.$$eval('ytd-playlist-video-renderer', nodes => {
    return nodes.map(node => {
      const title = node.querySelector('#video-title').innerText
      const url = node.querySelector('#video-title').href
      const duration = node.querySelector('.ytd-thumbnail-overlay-time-status-renderer span').innerText.trim()
      return { title, url, duration }
    })
  })

  // Save the extracted details to a JSON file
  fs.writeFileSync('playlist.json', JSON.stringify(videos, null, 2))

  console.log(videos)

  await browser.close()
})()
