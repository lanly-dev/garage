const WebSocket = require('ws')
// const ws = new WebSocket('wss://websocket.stocktwits.com/stream?symbols=AAPL')
const ws = new WebSocket('wss://streamer.finance.yahoo.com/')

ws.on('open', () => console.log('opened'))

ws.on('message', data => {
  if (data == 'o' || data == 'h') console.log('send opening message')
  else console.log('Received', data)
})
