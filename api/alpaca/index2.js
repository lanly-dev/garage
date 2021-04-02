require('dotenv').config()
const Alpaca = require('@alpacahq/alpaca-trade-api')
const API_KEY = process.env.ID
const API_SECRET = process.env.SECRET
const USE_POLYGON = false

class WebsocketSubscriber {
  constructor({ keyId, secretKey, paper = true }) {
    this.alpaca = new Alpaca({ keyId, secretKey, paper, usePolygon: USE_POLYGON })

    const data_client = this.alpaca.data_ws
    data_client.onConnect(() => {
      console.log('Connected')
      const keys = USE_POLYGON ? ['T.FB', 'Q.AAPL', 'A.FB', 'AM.AAPL'] : ['alpacadatav1/T.FB', 'alpacadatav1/Q.AAPL', 'alpacadatav1/AM.FB', 'alpacadatav1/AM.AAPL']
      data_client.subscribe(keys)
    })
    data_client.onDisconnect(() => {
      console.log('Disconnected')
    })
    data_client.onStateChange(newState => {
      console.log(`State changed to ${newState}`)
    })
    data_client.onStockTrades((subject, data) => {
      console.log(`Stock trades: ${subject}, price: ${data.price}`)
    })
    data_client.onStockQuotes((subject, data) => {
      console.log(`Stock quotes: ${subject}, bid: ${data.bidprice}, ask: ${data.askprice}`)
    })
    data_client.onStockAggSec((subject, data) => {
      console.log(`Stock agg sec: ${subject}, ${data}`)
    })
    data_client.onStockAggMin((subject, data) => {
      console.log(`Stock agg min: ${subject}, ${data}`)
    })
    data_client.connect()

    const updates_client = this.alpaca.trade_ws
    updates_client.onConnect(() => {
      console.log('Connected')
      const trade_keys = ['trade_updates', 'account_updates']
      updates_client.subscribe(trade_keys)
    })
    updates_client.onDisconnect(() => {
      console.log('Disconnected')
    })
    updates_client.onStateChange(newState => {
      console.log(`State changed to ${newState}`)
    })
    updates_client.onOrderUpdate(data => {
      console.log(`Order updates: ${JSON.stringify(data)}`)
    })
    updates_client.onAccountUpdate(data => {
      console.log(`Account updates: ${JSON.stringify(data)}`)
    })
    updates_client.connect()
  }
}

// Run the LongShort class
let ls = new WebsocketSubscriber({
  keyId: API_KEY,
  secretKey: API_SECRET,
  paper: true
})
