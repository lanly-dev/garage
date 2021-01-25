const ts = require('tesseract.js')
const IMG = 'a.jpg'
ts.detect(IMG, { logger: (m) => console.log(m) }).then((data) => console.log(data))
// ts.recognize(IMG, 'eng', { logger: (m) => console.log(m) }).then(({ data: { text } }) => console.log(text))
ts.recognize(IMG).then((data) => console.log(data))
