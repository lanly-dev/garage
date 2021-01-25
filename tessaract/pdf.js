const fs = require('fs')
const createWorker = require('tesseract.js').createWorker

const IMG = 'a.jpg'

console.log(`Recognizing ${IMG}`)
;(async () => {
  const worker = createWorker()
  await worker.load()
  await worker.loadLanguage('eng')
  await worker.initialize('eng')
  const data = await worker.recognize(IMG)
  console.log(data.text)
  const { data } = await worker.getPDF('Tesseract OCR Result')
  fs.writeFileSync('tesseract-ocr-result.pdf', Buffer.from(data))
  console.log('Generate PDF: tesseract-ocr-result.pdf')
  await worker.terminate()
})()
