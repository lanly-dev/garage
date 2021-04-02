const fmp = require('financialmodelingprep')

// API route: /quote/AAPL
fmp.stock('ibio').quote().then(response => console.log(response))

// API route: /quote/AAPL,MSFT
fmp.stock(['AAPL', 'MSFT']).quote().then(response => console.log(response))

// API route: /stock/sectors-performance
fmp.market.sector_performance().then(response => console.log(response))

// API route: /quote/USDEUR
fmp.forex('USD', 'EUR').rate().then(response => console.log(response))