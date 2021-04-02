import { TwitterClient } from 'twitter-api-client'
import { config } from 'dotenv'
config()

const {
  ACCESS_SECRET,
  ACCESS_TOKEN,
  API_KEY,
  API_SECRET
} = process.env

const twitterClient = new TwitterClient({
  apiKey: API_KEY,
  apiSecret: API_SECRET,
  accessToken: ACCESS_TOKEN,
  accessTokenSecret: ACCESS_SECRET
})

// // Search for a user
// const data = await twitterClient.accountsAndUsers.usersSearch({ q: 'twitterDev' })

// // Get message event by Id
// const data = await twitterClient.directMessages.directMessagesEventsShow({ id: '1234' })

// // Get most recent 25 retweets of a tweet
// const data = await twitterClient.tweets.statusesRetweetsById({ id: '12345', count: 25 })

// Get local trends
;(async () => {
  const data = await twitterClient.trends.trendsAvailable()
  console.log(data)
})()
