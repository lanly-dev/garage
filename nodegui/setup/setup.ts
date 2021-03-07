import { createWriteStream, readdir, rename } from 'fs'
import * as extractZip from 'extract-zip'
import * as got from 'got'
import * as path from 'path'
import * as pb from 'pretty-bytes'

const CMK_URL = 'https://github.com/Kitware/CMake/releases/download/v3.19.6/cmake-3.19.6-win64-x64.zip'
const lastProgesses = {}

function download(url, destPath, renameCb) {
  const downloadStream = got.default.stream(url)
  const fileName = url.split('/').pop()
  const fileWriterStream = createWriteStream(fileName)

  downloadStream
    .on('downloadProgress', (data) => printProgress(data, fileName))
    .on('error', (error) => console.error(`Download failed: ${error.message}`))

  fileWriterStream
    .on('error', (error) => console.error(`Could not write file to system: ${error.message}`))
    .on('finish', () => {
      console.log(`File downloaded to ${fileName}`)
      extractZip(fileName, { dir: destPath })
        .catch((err) => console.error(err))
        .then(() => {
          console.log(`Extraction ${fileName} completed`)
          renameCb(destPath)
        })
    })

  downloadStream.pipe(fileWriterStream)
}

function changeName(substring, name?) {
  return (destPath) => {
    readdir(destPath, (err, files) => {
      if (err) console.log(err)
      else {
        const jdkDirName = files.filter((elm) => elm.indexOf(substring) != -1)[0]
        rename(path.join(destPath, jdkDirName), path.join(destPath, name || substring), (err) =>
          err ? console.error(err) : console.log(`Renamed to "${name || substring}"`)
        )
      }
    })
  }
}

function printProgress({ transferred, total, percent }, fileName) {
  if (!total) return
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

download(CMK_URL, path.resolve(__dirname, '../', 'sdk'), changeName('cmake'))
