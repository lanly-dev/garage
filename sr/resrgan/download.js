import axios from 'axios'
import extractZip from 'extract-zip'
import fs from 'fs'
import path from 'path'
import pb from 'pretty-bytes'

const url = `https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/realesrgan-ncnn-vulkan-20220424-windows.zip`
const dlLoc = path.resolve(process.cwd(), 'resrgan.zip')
const unzipLoc = path.resolve(process.cwd(), 'resrgan')

const lastProgesses = {}

async function downloadFile(url, dlLoc, unzipLoc) {
  const writer = fs.createWriteStream(dlLoc)

  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
    onDownloadProgress: progressEvent => printProgress(progressEvent, dlLoc)
  })

  response.data.pipe(writer)

  return new Promise((resolve, reject) => {
    writer.on('finish', () => {
      extractZip(dlLoc, { dir: unzipLoc })
        .then(() => console.log(`Extraction complete`))
        .catch((err) => console.error('Error extracting file:', err))
    })
    writer.on('error', (error) => console.error(`Write failed: ${error.message}`))
  })
}

function printProgress({ progress, loaded, total }, fileName) {
  const percentage = round(progress * 100, 2)
  if (percentage % 1 != 0) return
  const str = `progress ${fileName}: ${pb(loaded)}/${pb(total)} (${percentage}%)`
  let last = lastProgesses[fileName]
  if (last != str) console.log(str)
  lastProgesses[fileName] = str
}


function round(value, decimals) {
  return Number(Math.round(+(value + `e` + decimals)) + `e-` + decimals)
}


downloadFile(url, dlLoc, unzipLoc)
  .then(() => console.log('Download complete!'))
  .catch((err) => console.error('Error downloading file:', err))
