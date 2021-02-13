import { createReadStream, createWriteStream } from 'fs'
import * as path from 'path'
import * as sox from 'sox-stream'
process.env.PATH += `;${path.resolve(__dirname, 'sox-14.4.2')}`

const OUTPUT = 'audio.wav'

const src = createReadStream('audio.raw')
const transcode = sox({
  // soxPath: './sox-14.4.2/sox.exe',
  input: {
    bits: 16,
    rate: 16000,
    channels: 1,
    encoding: 'signed-integer',
    type: 'raw'
  },
  output: {
    bits: 16,
    rate: 44100,
    channels: 2,
    type: 'wav'
  }
})
const dest = createWriteStream(OUTPUT)
src.pipe(transcode).pipe(dest)

transcode.on('error', (err) => console.log(err.message))
