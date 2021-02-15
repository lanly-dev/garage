import * as Speaker from 'speaker'
import { createReadStream } from 'fs'

const speaker = new Speaker({
  channels: 1,
  bitDepth: 16,
  sampleRate: 16000
})

createReadStream('audio.raw').pipe(speaker)
