import { createWriteStream } from 'fs'
import extractZip from 'extract-zip'
import fs from 'fs'
import got from 'got'
import ora from 'ora'
import path from 'path'
import pb from 'pretty-bytes'

const DOTNET_URL = 'https://download.visualstudio.microsoft.com/download/pr/8e55ce37-9740-41b7-a758-f731043060da/4b8bfd4aad9d322bf501ca9e473e35c5/dotnet-sdk-6.0.101-win-x64.zip'
const ANDROID_URL = 'https://dl.google.com/android/repository/commandlinetools-win-7583922_latest.zip'

const lastProgress: { [key: string]: string } = {}

function download(url: string, destPath: string) {
  let spinner: any
  const fileName = <string>url.split('/').pop()
  if (fs.existsSync(fileName)) {
    console.log(`File ${fileName} exists`)
    extract(fileName, destPath, spinner)
    return
  }

  const downloadStream = got.stream(url)
  const fileWriterStream = createWriteStream(fileName)

  downloadStream
    .on('downloadProgress', (data) => printProgress(data, fileName, spinner))
    .on('error', (error) => {
      spinner.fail()
      console.error(`${fileName} - Download failed: ${error.message}`)
      process.exit(1)
    })

  fileWriterStream
    .on('error', (error) => {
      spinner.fail()
      console.error(`${fileName} - Could not write file to system: ${error.message}`)
      process.exit(1)
    })
    .on('finish', () => {
      spinner.succeed()
      console.log(`File downloaded: ${fileName}`)
      extract(fileName, destPath, spinner)
    })

  spinner = ora().start()
  downloadStream.pipe(fileWriterStream)
}

function printProgress(data: any, fileName: string, spinner: any) {
  const { transferred, total, percent } = data
  if (!total) return
  const percentage = round(percent * 100, 2)
  if (percentage % 1 != 0) return
  const str = `Downloading ${fileName}: ${pb(transferred)}/${pb(total)} (${percentage}%)`
  let last = lastProgress[fileName]
  if (last != str) spinner.text = str
  lastProgress[fileName] = str
}

function extract(fileName: string, destPath: string, spinner: any) {
  spinner = ora().start()
  extractZip(fileName, { dir: destPath, onEntry: (entry, zipFile) => onEntry(entry, zipFile, fileName, spinner) })
    .catch((err) => {
      spinner.fail()
      console.error(err)
      process.exit(1)
    })
    .then(() => {
      spinner.succeed()
      console.log(`${fileName} extracted to ${destPath}`)
    })
}

// Extracting event
function onEntry(entry: any, zipFile: any, fileName: string, spinner: any) {
  const { entryCount, entriesRead } = zipFile
  const percentage = round(entriesRead / entryCount * 100, 2)
  if (percentage % 1 != 0) return
  spinner.text = `Extracting: ${fileName}: ${entriesRead}/${entryCount}-${percentage}%`
}

function round(value: number, decimals: number) {
  return Number(Math.round(+(value + 'e' + decimals)) + 'e-' + decimals)
}

download(DOTNET_URL, path.resolve(path.resolve(), '../sdk/dotnet'))
download(ANDROID_URL, path.resolve(path.resolve(), '../sdk/android/cmdline-tools'))
