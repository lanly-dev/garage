import { createWriteStream, readdir, rename } from 'fs'
import * as extractZip from 'extract-zip'
import * as got from 'got'
import * as path from 'path'
import * as pb from 'pretty-bytes'

const ASDK_URL = 'https://dl.google.com/android/repository/commandlinetools-win-6858069_latest.zip'
const GRADEL_URL = 'https://services.gradle.org/distributions/gradle-6.8.3-bin.zip'
// prettier-ignore
const JDK_URL = 'https://github.com/AdoptOpenJDK/openjdk8-binaries/releases/download/jdk8u282-b08/OpenJDK8U-jdk_x64_windows_hotspot_8u282b08.zip'
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

function asdkRename(destPath) {
  rename(path.join(destPath, 'cmdline-tools'), path.join(destPath, 'tools'), (err) =>
    err ? console.error(err) : console.log('Renamed to "tools"')
  )
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

// download(ASDK_URL, path.resolve(__dirname, '../', 'sdk', 'android', 'cmdline-tools'), asdkRename)
// download(JDK_URL, path.resolve(__dirname, '../', 'sdk'), changeName('jdk', 'openjdk'))
// download(GRADEL_URL, path.resolve(__dirname, '../', 'sdk'), changeName('gradle'))
