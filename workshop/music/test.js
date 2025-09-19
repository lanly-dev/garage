import Speaker from 'speaker'

const sampleRate = 44100
const freq = 440 // A4
const duration = 2 // seconds
const samples = sampleRate * duration
const buffer = Buffer.alloc(samples * 2) // 16-bit mono

for (let i = 0; i < samples; i++) {
  const t = i / sampleRate
  const amplitude = Math.sin(2 * Math.PI * freq * t)
  const int16 = Math.floor(amplitude * 32767)
  buffer.writeInt16LE(int16, i * 2)
}

const speaker = new Speaker({
  channels: 1,
  bitDepth: 16,
  sampleRate: sampleRate
})

speaker.write(buffer)
speaker.end() // Close the stream properly

console.log('Playing 440Hz tone for 2 seconds...')

// Wait for audio to finish before exiting
setTimeout(() => {
  console.log('Audio playback complete')
  process.exit(0)
}, duration * 1000 + 500) // Add 500ms buffer
