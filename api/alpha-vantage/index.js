require('dotenv').config()
const alpha = require('alphavantage')({ key: process.env.KEY })

// Simple examples
alpha.data.intraday(`msft`).then(data => {
  console.log(data)
})

// alpha.forex.rate('btc', 'usd').then(data => {
//   console.log(data)
// })

// alpha.crypto.daily('btc', 'usd').then(data => {
//   console.log(data)
// })

alpha.technical.sma(`msft`, `daily`, 60, `close`).then(data => {
  console.log(data)
})

// alpha.performance.sector().then(data => {
//   console.log(data)
// })
