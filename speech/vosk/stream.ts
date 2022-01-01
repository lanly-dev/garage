import { SpeechRecorder } from 'speech-recorder'
// @ts-ignore
import * as vosk from 'vosk'
import Ora from 'ora'
import fs from 'fs'

const MODEL_PATH = 'model'
const SILENCE_TIME = 600
const SAMPLE_RATE = 16000

if (!fs.existsSync(MODEL_PATH)) {
  console.log('Please download the model from https://alphacephei.com/vosk/models')
  console.log(`and unpack as ${MODEL_PATH} in the current folder.`)
  process.exit()
}

vosk.setLogLevel(0)
const model = new vosk.Model(MODEL_PATH)
const rec = new vosk.Recognizer({ model: model, sampleRate: SAMPLE_RATE })
const recorder = new SpeechRecorder({ sampleRate: SAMPLE_RATE, framesPerBuffer: 320 })

let spinner = Ora()
let timeoutId: ReturnType<typeof setTimeout>
console.log('Recording start!!!')

spinner.start()
recorder.start({
  //@ts-ignore
  onAudio: (audio, speech) => {
    if (speech) {
      if (rec.acceptWaveform(audio)) spinner.text = rec.result().text
      else spinner.text = rec.partialResult().partial
    } else if (!timeoutId) timeoutId = setTimeout(closingSpeech, SILENCE_TIME)
  }
})

function closingSpeech() {
  console.log('nextLine')
  spinner.text = rec.finalResult().text
}
