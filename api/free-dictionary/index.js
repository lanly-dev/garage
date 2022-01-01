const https = require('https')

const word = 'hello'

function httpReq() {
  let str = ''
  https.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`, (resp) => {
    resp.on('data', (chunk) => (str += chunk))
    resp.on('end', () => console.log(str))
  })
}

httpReq()
