const fetchRSSFeed = require('./rssFetcher')
const sendAlertNotification = require('./alertNotification')

const RSS_URL = 'https://vnexpress.net/rss/tam-su.rss'

async function checkRSSFeed() {
  const items = await fetchRSSFeed(RSS_URL)
  items.forEach(item => {
    sendAlertNotification(`New item: ${item.title}\nContent: ${item.content}`)
  })
}

checkRSSFeed()
