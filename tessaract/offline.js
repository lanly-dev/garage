const { createWorker } = require('tesseract.js')
const path = require('path')

const IMG = 'a.jpg'

const worker = createWorker({
  langPath: path.join(__dirname, 'lang-data'),
  logger: (m) => console.log(m)
})

;(async () => {
  await worker.load()
  await worker.loadLanguage('custom')
  await worker.initialize('custom')
  const data = await worker.recognize(IMAG)
  console.log(data.text)
  await worker.terminate()
})()
