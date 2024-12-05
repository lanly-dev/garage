import { createWriteStream } from 'fs'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import got from 'got'
import extractZip from 'extract-zip'
import pb from 'pretty-bytes'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)


const url = `https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/realesrgan-ncnn-vulkan-20220424-windows.zip`
const lastProgesses = {}

function download(url) {
  console.log(`Downloading ${url}`)
  const downloadStream = got.stream(url)
  const fileName = `resrgan-win.zip`
  const fileWriterStream = createWriteStream(fileName)

  downloadStream
    .on(`downloadProgress`, (data) => printProgress(data, fileName))
    .on(`error`, (error) => console.error(`Download failed: ${error.message}`))

  fileWriterStream
    .on(`error`, (error) => console.error(`Could not write file to system: ${error.message}`))
    .on(`finish`, () => {
      console.log(`File downloaded to ${fileName}`)
      extractZip(fileName, { dir: __dirname })
        .then(() => console.log(`Extraction complete`))
        .catch((err) => console.error(err))
    })

  downloadStream.pipe(fileWriterStream)
}

function printProgress({ transferred, total, percent }, fileName) {
  const percentage = round(percent * 100, 2)
  if (percentage % 1 != 0) return
  const str = `progress ${fileName}: ${pb(transferred)}/${pb(total)} (${percentage}%)`
  let last = lastProgesses[fileName]
  if (last != str) console.log(str)
  lastProgesses[fileName] = str
}

function round(value, decimals) {
  return Number(Math.round(+(value + `e` + decimals)) + `e-` + decimals)
}

download(url)
