const SAMPLE_RATE = 44100

function midiToFrequency(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12)
}

// Generate a mono Float32Array with a simple sine tone and linear fade-out
function generateFloatArray(freq, durationSec, opts = {}) {
  const sampleRate = opts.sampleRate || SAMPLE_RATE
  const length = Math.floor(durationSec * sampleRate)
  const volume = typeof opts.volume === 'number' ? opts.volume : 0.2
  const arr = new Float32Array(length)
  for (let i = 0; i < length; i++) {
    const t = i / sampleRate
    // simple sine
    let s = Math.sin(2 * Math.PI * freq * t)
    // apply envelope: quick attack, linear release
    const attack = Math.min(0.01, durationSec * 0.1)
    const releaseStart = Math.max(0, durationSec - 0.05)
    let env = 1.0
    if (t < attack) env = t / attack
    else if (t > releaseStart) env = Math.max(0, (durationSec - t) / (durationSec - releaseStart))
    arr[i] = s * env * volume
  }
  return arr
}

// Simple player that writes Float32Array buffers to a writable stream
class SimplePlayer {
  constructor(sampleRate = SAMPLE_RATE) {
    this.sampleRate = sampleRate
  }

  // write a Float32Array to a writable stream (stdin of play_buffer)
  writeToStream(stream, floatArray) {
    return new Promise((resolve, reject) => {
      const buf = Buffer.alloc(floatArray.length * 4)
      for (let i = 0; i < floatArray.length; i++) buf.writeFloatLE(floatArray[i], i * 4)
      const ok = stream.write(buf)
      if (!ok) stream.once('drain', resolve)
      else resolve()
    })
  }
}

module.exports = { midiToFrequency, generateFloatArray, SimplePlayer }
