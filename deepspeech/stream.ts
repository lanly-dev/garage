import { SpeechRecorder } from 'speech-recorder'
import * as DeepSpeech from 'deepspeech'
import * as Ora from 'ora'

const FILE_NAME = 'deepspeech-0.9.3-models'
const SILENCE_THRESHOLD = 600

const model = new DeepSpeech.Model(`${FILE_NAME}.pbmm`)
model.enableExternalScorer(`${FILE_NAME}.scorer`)

const spinner = Ora()
let isSpeaking = false
let recordedAudioLength = 0
let modelStream, bTimeoutId, lTimeoutId

const recorder = new SpeechRecorder({ sampleRate: 16000, framesPerBuffer: 320 })
recorder.start({
  onAudio: (audio, speech) => {
    isSpeaking = speech
    if (speech) processSpeech(audio)
    else silenceStart()
  }
})

function processSpeech(audio) {
  if (!modelStream) createStream()
  feedAudioContent(audio)
  ;[bTimeoutId, lTimeoutId].forEach((id) => {
    if (id) {
      clearTimeout(id)
      id = null
    }
  })
  if (!spinner.isSpinning) spinner.start().spinner = 'runner'
}

function silenceStart() {
  if (!bTimeoutId) bTimeoutId = setTimeout(printResult, SILENCE_THRESHOLD)
}

function printResult() {
  if (isSpeaking || !modelStream) return
  spinner.spinner = 'monkey'
  const start = new Date()
  const text = modelStream.finishStream()
  if (text) {
    const recogTime = new Date().getTime() - start.getTime()
    console.log(text, recogTime, Math.round(recordedAudioLength))
  } else console.log('???')
  spinner.stop().spinner = 'runner'

  if (text == 'stop') {
    recorder.stop()
    console.log('stopped!')
    process.exit()
  } else {
    modelStream = null
    recordedAudioLength = 0
  }
}

function createStream() {
  modelStream = model.createStream()
  recordedAudioLength = 0
}

function feedAudioContent(chunk) {
  recordedAudioLength += (chunk.length / 2) * (1 / 16000) * 1000
  modelStream.feedAudioContent(chunk)
}
