import pkg from '@tonejs/midi'
const { Midi } = pkg
import fs from 'fs'
import Speaker from 'speaker'
import puppeteer from 'puppeteer'

class ToneJsMidiPlayer {
  constructor() {
    this.browser = null
    this.page = null
  }

  async initialize() {
    console.log('Starting headless browser with Tone.js...')
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--autoplay-policy=no-user-gesture-required',
        '--disable-web-security',
        '--allow-running-insecure-content'
      ]
    })
    this.page = await this.browser.newPage()

    // Load a basic HTML page
    await this.page.goto('data:text/html,<html><head><title>Tone.js Player</title></head><body></body></html>')

    // Inject Tone.js
    await this.page.addScriptTag({ url: 'https://cdn.jsdelivr.net/npm/tone@15.1.22/build/Tone.min.js' })

    // Wait for Tone.js to be ready
    await this.page.waitForFunction(() => typeof Tone !== 'undefined')

    console.log('Tone.js loaded in browser environment')
  }

  async renderMIDI(midiFilePath) {
    if (!this.page) {
      throw new Error('Browser not initialized. Call initialize() first.')
    }

    // Parse MIDI file with @tonejs/midi in Node.js
    console.log(`Parsing MIDI: ${midiFilePath}`)
    const midiData = fs.readFileSync(midiFilePath)
    const midi = new Midi(midiData)

    console.log(`MIDI Info:`)
    console.log(`- Duration: ${midi.duration.toFixed(2)} seconds`)
    console.log(`- Tracks: ${midi.tracks.length}`)
    console.log(`- Total notes: ${midi.tracks.reduce((sum, track) => sum + track.notes.length, 0)}`)

    // Convert MIDI data to a simple format for the browser
    const midiForBrowser = {
      duration: midi.duration,
      tracks: midi.tracks.map(track => ({
        name: track.name || 'Untitled',
        instrument: track.instrument.name,
        notes: track.notes.map(note => ({
          name: note.name,
          pitch: note.pitch,
          time: note.time,
          duration: note.duration,
          velocity: note.velocity
        }))
      }))
    }

    console.log('Rendering with Tone.js in browser...')

    // Execute Tone.js synthesis in the browser
    const audioData = await this.page.evaluate(async (midiData) => {
      console.log('Starting Tone.js synthesis in browser...')

      // Calculate total duration with some buffer
      const totalDuration = midiData.duration + 2
      console.log('Total duration:', totalDuration.toFixed(2), 'seconds')

      // Create offline audio context for rendering
      const sampleRate = 44100
      const offlineCtx = new OfflineAudioContext(2, sampleRate * totalDuration, sampleRate) // Stereo

      // Set Tone.js to use offline context
      Tone.setContext(offlineCtx)

      // Create different synths for different tracks
      const synths = []

      midiData.tracks.forEach((track, index) => {
        if (track.notes.length === 0) return

        // Create different synth types for variety
        let synth
        if (index % 4 === 0) {
          // Piano-like
          synth = new Tone.Synth({
            oscillator: { type: "triangle" },
            envelope: {
              attack: 0.01,
              decay: 0.2,
              sustain: 0.6,
              release: 0.8
            }
          })
        } else if (index % 4 === 1) {
          // Bell-like
          synth = new Tone.FMSynth({
            harmonicity: 8,
            modulationIndex: 2,
            oscillator: { type: "sine" },
            envelope: {
              attack: 0.001,
              decay: 2,
              sustain: 0.1,
              release: 2
            },
            modulation: { type: "square" },
            modulationEnvelope: {
              attack: 0.002,
              decay: 0.2,
              sustain: 0,
              release: 0.2
            }
          })
        } else if (index % 4 === 2) {
          // Warm pad
          synth = new Tone.AMSynth({
            harmonicity: 2,
            oscillator: { type: "sawtooth" },
            envelope: {
              attack: 0.1,
              decay: 0.2,
              sustain: 0.8,
              release: 1
            },
            modulation: { type: "sine" },
            modulationEnvelope: {
              attack: 0.5,
              decay: 0,
              sustain: 1,
              release: 0.5
            }
          })
        } else {
          // Pluck
          synth = new Tone.PluckSynth({
            attackNoise: 1,
            dampening: 4000,
            resonance: 0.9
          })
        }

        // Add some effects
        const reverb = new Tone.Reverb(1.5)
        const filter = new Tone.Filter(2000, "lowpass")

        synth.chain(filter, reverb, Tone.getDestination())

        synths.push({ synth, track: index, notes: track.notes })
      })

      console.log('Created', synths.length, 'synths for', midiData.tracks.length, 'tracks')

      // Schedule all notes
      let totalNotes = 0
      synths.forEach(({ synth, notes }) => {
        notes.forEach(note => {
          try {
            synth.triggerAttackRelease(note.name, note.duration, note.time, note.velocity)
            totalNotes++
          } catch (e) {
            console.warn('Could not schedule note:', note.name, e.message)
          }
        })
      })

      console.log('Scheduled', totalNotes, 'notes')
      console.log('Starting offline rendering...')

      // Render audio
      const renderedBuffer = await offlineCtx.startRendering()
      console.log('Rendering complete!')

      // Convert to interleaved stereo array
      const leftChannel = renderedBuffer.getChannelData(0)
      const rightChannel = renderedBuffer.getChannelData(1)
      const interleavedArray = new Array(leftChannel.length * 2)

      for (let i = 0; i < leftChannel.length; i++) {
        interleavedArray[i * 2] = leftChannel[i]
        interleavedArray[i * 2 + 1] = rightChannel[i]
      }

      return interleavedArray

    }, midiForBrowser)

    console.log('Audio rendered, converting to buffer...')

    // Convert back to Node.js buffer (stereo)
    const buffer = Buffer.alloc(audioData.length * 2)
    for (let i = 0; i < audioData.length; i++) {
      const sample = Math.max(-1, Math.min(1, audioData[i]))
      const int16 = Math.floor(sample * 32767)
      buffer.writeInt16LE(int16, i * 2)
    }

    return buffer
  }

  async close() {
    if (this.browser) {
      await this.browser.close()
    }
  }
}

// Usage
async function main() {
  const midiFilePath = process.argv[2]

  if (!midiFilePath || !fs.existsSync(midiFilePath)) {
    console.log('Usage: node tonejs-midi-player.js <midi-file-path>')
    console.log('Example: node tonejs-midi-player.js song.mid')
    process.exit(1)
  }

  const player = new ToneJsMidiPlayer()

  try {
    await player.initialize()

    console.log('Rendering MIDI with Tone.js + @tonejs/midi...')
    const audioBuffer = await player.renderMIDI(midiFilePath)

    console.log('Playing high-quality Tone.js audio...')
    const speaker = new Speaker({
      channels: 2,          // Stereo
      bitDepth: 16,
      sampleRate: 44100
    })

    speaker.write(audioBuffer)
    speaker.end()

    const durationMs = (audioBuffer.length / 4) / 44100 * 1000 // 4 bytes per sample (2 channels * 2 bytes)
    setTimeout(async () => {
      console.log('Tone.js playback complete!')
      await player.close()
      process.exit(0)
    }, durationMs + 1000)

  } catch (error) {
    console.error('Error:', error)
    await player.close()
    process.exit(1)
  }
}

main()