const puppeteer = require('puppeteer')

async function run() {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  await page.goto('https://www.tradingview.com/chart/?symbol=AMEX%3AZOM')
  const cdp = await page.target().createCDPSession()
  await cdp.send('Network.enable')
  await cdp.send('Page.enable')

  const printResponse = response => console.log('response: ', response)
  console.log(await page.cookies())
  // cdp.on('Network.webSocketFrameReceived', printResponse)
  // cdp.on('Network.webSocketFrameSent', printResponse)
  console.log(browser._connection.url())

  const WebSocket = require('ws')
  // const ws = new WebSocket('wss://websocket.stocktwits.com/stream?symbols=AAPL')
  const ws = new WebSocket('wss://data.tradingview.com/socket.io/websocket?from=&date=2020_12_11-11_52')

  ws.on('open', () => console.log('opened'))

  ws.on('message', data => {
    if (data == 'o' || data == 'h') console.log('send opening message')
    else console.log('Received', data)
  })
}

run()