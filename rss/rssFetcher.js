const Parser = require('rss-parser')
const parser = new Parser()

async function fetchRSSFeed(url) {
  try {
    const feed = await parser.parseURL(url)
    return feed.items
  } catch (error) {
    console.error('Error fetching RSS feed:', error)
    return []
  }
}

module.exports = fetchRSSFeed
