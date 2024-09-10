import { createWriteStream, readdir, rename } from 'fs'
import { extractFull } from 'node-7z'
import * as got from 'got'
import * as path from 'path'
import * as pb from 'pretty-bytes'
import * as sevenBin from '7zip-bin'

const url = 'https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-full.7z'
const lastProgresses = {}

function download(url) {
  const downloadStream = got.default.stream(url)
  const fileName = url.split('/').pop()
  const fileWriterStream = createWriteStream(fileName)
  let rootDirName

  downloadStream
    .on('downloadProgress', (data) => printProgress(data, fileName))
    .on('error', (error) => console.error(`Download failed: ${error.message}`))

  fileWriterStream
    .on('error', (error) => console.error(`Could not write file to system: ${error.message}`))
    .on('finish', () => {
      console.log(`File downloaded to ${fileName}`)
      // myStream is an Readable stream
      const zipStream = extractFull(fileName, null, { $bin: sevenBin.path7za })
      zipStream.on('data', ({ status, file}) => {
        console.log(status, file)
        if (file.indexOf('/') == -1) rootDirName = file
      })
      zipStream.on('end', () => {
        console.log('Extracted', fileName)
        rename(path.join(__dirname, rootDirName), path.join(__dirname, 'ffmpeg'), (err) =>
        err ? console.error(err) : console.log(`Renamed "${rootDirName}" -> "ffmpeg"`)
      )
      })
      zipStream.on('error', (err) => console.error(err))
    })

  downloadStream.pipe(fileWriterStream)
}

function renameCb(destPath) {
  readdir(destPath, (err, files) => {
    if (err) console.log(err)
    else {
      const jdkDirName = files.filter((elm) => elm.indexOf('jdk') != -1)[0]
      rename(path.join(destPath, jdkDirName), path.join(destPath, 'openjdk'), (err) =>
        err ? console.error(err) : console.log('Renamed to "openjdk"')
      )
    }
  })
}

function printProgress({ transferred, total, percent }, fileName) {
  const percentage = round(percent * 100, 2)
  if (percentage % 1 != 0) return
  const str = `progress ${fileName}: ${pb(transferred)}/${pb(total)} (${percentage}%)`
  let last = lastProgresses[fileName]
  if (last != str) console.log(str)
  lastProgresses[fileName] = str
}

function round(value, decimals) {
  return Number(Math.round(+(value + 'e' + decimals)) + 'e-' + decimals)
}

download(url)
