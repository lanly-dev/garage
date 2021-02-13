import { createWriteStream } from 'fs'
import * as got from 'got'
import * as pb from 'pretty-bytes'

const url = 'https://github.com/mozilla/DeepSpeech/releases/download/v0.9.3/deepspeech-0.9.3-models'
const lastProgesses = {}

function download(url) {
  const downloadStream = got.default.stream(url)
  const fileName = url.split('/').pop()
  const fileWriterStream = createWriteStream(fileName)

  downloadStream
    .on('downloadProgress', (data) => printProgress(data, fileName))
    .on('error', (error) => console.error(`Download failed: ${error.message}`))

  fileWriterStream
    .on('error', (error) => console.error(`Could not write file to system: ${error.message}`))
    .on('finish', () => console.log(`File downloaded to ${fileName}`))

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
  return Number(Math.round(+(value + 'e' + decimals)) + 'e-' + decimals)
}

download(`${url}.pbmm`)
download(`${url}.scorer`)
