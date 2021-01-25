const { createWorker } = require('tesseract.js')

const IMG = 'a.jpg'
console.log(`Recognizing ${IMG}`)
// const worker = createWorker({ logger: (m) => console.log(m) })
const worker = createWorker()

;(async () => {
  await worker.load()
  await worker.loadLanguage('eng')
  await worker.initialize('eng')
  const data = await worker.recognize(IMG)
  console.log(data.text)
  await worker.terminate()
})()
