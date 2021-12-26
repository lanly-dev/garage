import { readFileSync } from 'fs'
import * as DeepSpeech from 'deepspeech'

const FILE_NAME = 'deepspeech-0.9.3-models'
const model = new DeepSpeech.Model(`${FILE_NAME}.pbmm`)
model.enableExternalScorer(`${FILE_NAME}.scorer`)
const desiredSampleRate = model.sampleRate()

const buffer = readFileSync('audio.raw')
const audioLength = (buffer.length / 2) * (1 / desiredSampleRate)
const result = model.stt(buffer)

console.log('model desired sample rate:', desiredSampleRate)
console.log('audio length:', audioLength)
console.log('result:', result)
