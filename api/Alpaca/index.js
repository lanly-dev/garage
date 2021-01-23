require('dotenv').config()
const Alpaca = require('@alpacahq/alpaca-trade-api')

const alpaca = new Alpaca({
  keyId: process.env.ID,
  secretKey: process.env.SECRET,
  paper: true
})

alpaca.getAccount().then(account => console.log('Current Account:', account))
