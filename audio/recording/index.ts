import { SpeechRecorder } from 'speech-recorder'
import { createWriteStream } from 'fs'

const recorder = new SpeechRecorder({ sampleRate: 16000, framesPerBuffer: 320 })
const writeStream = createWriteStream('audio.raw')

recorder.start({
  onAudio: (audio, speech) => {
    if (speech) writeStream.write(audio)
  }
})
