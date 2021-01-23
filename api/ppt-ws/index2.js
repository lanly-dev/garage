const WebSocket = require('ws')
const ws = new WebSocket('wss://data.tradingview.com/socket.io/websocket?from=symbols/NASDAQ-AAPL')
ws.on('open', function open() {
  console.log('opened')
})

ws.on('message', function incoming(data) {
  if (data == 'o' || data == 'h') {
    console.log('sending opening message')
  }
  else {
    console.log('Received', data)
  }
})
