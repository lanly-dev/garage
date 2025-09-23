import Speaker from 'speaker'

// Simple synth and player utilities
export function midiToFrequency(m) {
  return 440 * Math.pow(2, (m - 69) / 12)
}

export function triangleSample(freq, t) {
  // triangle via arcsin(sin()) normalized
  return (2 / Math.PI) * Math.asin(Math.sin(2 * Math.PI * freq * t))
}

export function generateFloatArray(frequency, durationSec, options = {}) {
  const sampleRate = options.sampleRate || 44100
  const minDur = options.minDuration || 0.7
  const dur = Math.max(durationSec || 0.5, minDur)
  const samples = Math.floor(sampleRate * dur)
  const out = new Float32Array(samples)
  const volume = options.volume !== undefined ? options.volume : 0.15
  const attackSec = options.attack || 0.01
  const attackSamples = Math.max(1, Math.floor(sampleRate * attackSec))
  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate
    const val = triangleSample(frequency, t)
    // simple attack + linear release envelope
    let env = 1
    if (i < attackSamples) env = i / attackSamples
    else env = 1 - (i / samples)
    out[i] = val * env * volume
  }
  return out
}

export class SimplePlayer {
  constructor(sampleRate = 44100) {
    this.speaker = new Speaker({ channels: 1, bitDepth: 16, sampleRate })
    this.queue = Promise.resolve()
  }

  _floatToBuffer(floatArr) {
    const buf = Buffer.alloc(floatArr.length * 2)
    for (let i = 0; i < floatArr.length; i++) {
      let v = floatArr[i]
      if (v > 1) v = 1
      if (v < -1) v = -1
      buf.writeInt16LE(Math.floor(v * 32767), i * 2)
    }
    return buf
  }

  write(bufferOrFloat) {
    const buf = (ArrayBuffer.isView(bufferOrFloat) && bufferOrFloat.constructor.name === 'Float32Array')
      ? this._floatToBuffer(bufferOrFloat)
      : bufferOrFloat

    this.queue = this.queue.then(() => new Promise((resolve) => {
      try {
        const ok = this.speaker.write(buf)
        if (!ok) {
          this.speaker.once('drain', resolve)
        } else {
          // give a tick to allow internal buffering
          setImmediate(resolve)
        }
      } catch (err) {
        // ignore errors but resolve so the queue continues
        resolve()
      }
    }))

    return this.queue
  }
}
