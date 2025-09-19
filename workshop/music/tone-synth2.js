import Speaker from 'speaker'
import pkg from '@tonejs/midi'
const { Midi } = pkg
import fs from 'fs'

// Tone.js-inspired synthesis in pure Node.js
class NodeSynth {
  constructor(sampleRate = 44100) {
    this.sampleRate = sampleRate
  }

  // Convert MIDI note number to frequency
  midiToFrequency(midiNote) {
    return 440 * Math.pow(2, (midiNote - 69) / 12)
  }

  // Generate a note with ADSR envelope (Tone.js style)
  generateNote(frequency, duration, startTime = 0, options = {}) {
    const {
      attack = 0.01,
      decay = 0.1,
      sustain = 0.8,
      release = 0.1,
      waveform = 'triangle',
      volume = 0.2
    } = options

    const samples = Math.floor(this.sampleRate * duration)
    const startSample = Math.floor(this.sampleRate * startTime)

    const result = { samples, startSample, frequency, duration, options }
    result.buffer = Buffer.alloc(samples * 2) // 16-bit mono

    for (let i = 0; i < samples; i++) {
      const t = i / this.sampleRate

      // ADSR Envelope (like Tone.js Envelope)
      let envelope = 0
      const releaseStart = duration - release

      if (t <= attack) {
        // Attack phase
        envelope = t / attack
      } else if (t <= attack + decay) {
        // Decay phase
        envelope = 1 - (1 - sustain) * (t - attack) / decay
      } else if (t <= releaseStart) {
        // Sustain phase
        envelope = sustain
      } else {
        // Release phase
        envelope = sustain * (1 - (t - releaseStart) / release)
      }

      // Oscillator (like Tone.js Oscillator)
      let oscillatorValue = 0
      switch (waveform) {
        case 'sine':
          oscillatorValue = Math.sin(2 * Math.PI * frequency * t)
          break
        case 'square':
          oscillatorValue = Math.sign(Math.sin(2 * Math.PI * frequency * t))
          break
        case 'triangle':
          oscillatorValue = (2 / Math.PI) * Math.asin(Math.sin(2 * Math.PI * frequency * t))
          break
        case 'sawtooth':
          oscillatorValue = 2 * (t * frequency - Math.floor(0.5 + t * frequency))
          break
      }

      // Apply envelope and volume
      const amplitude = oscillatorValue * envelope * volume
      const int16 = Math.floor(amplitude * 32767)
      result.buffer.writeInt16LE(int16, i * 2)
    }

    return result
  }

  // Play MIDI file
  async playMidiFile(midiFilePath, options = {}) {
    const midiData = fs.readFileSync(midiFilePath)
    const midi = new Midi(midiData)

    console.log(`Parsing MIDI file: ${midiFilePath}`)
    console.log(`Duration: ${midi.duration.toFixed(2)} seconds`)
    console.log(`Tracks: ${midi.tracks.length}`)

    // Extract all notes from all tracks using @tonejs/midi
    let allNotes = []

    midi.tracks.forEach((track, trackIndex) => {
      console.log(`Track ${trackIndex}: ${track.name || 'Untitled'} - ${track.notes.length} notes`)

      track.notes.forEach(note => {
        const frequency = this.midiToFrequency(note.midi)

        allNotes.push({
          frequency,
          startTime: note.time,
          duration: Math.max(note.duration, 0.1), // Minimum duration
          velocity: Math.floor(note.velocity * 127), // Convert 0-1 to 0-127
          midiNote: note.midi,
          noteName: note.name
        })
      })
    })

    console.log(`Found ${allNotes.length} notes`)

    // Sort by start time
    allNotes.sort((a, b) => a.startTime - b.startTime)

    // Calculate total duration
    const totalDuration = Math.max(midi.duration, Math.max(...allNotes.map(n => n.startTime + n.duration))) + 1
    const totalSamples = Math.floor(this.sampleRate * totalDuration)

    console.log(`Total duration: ${totalDuration.toFixed(2)} seconds`)

    // Create final audio buffer
    const finalBuffer = Buffer.alloc(totalSamples * 2)

    // Generate and mix all notes
    allNotes.forEach((note, index) => {
      if (index % 50 === 0) {
        console.log(`Processing note ${index + 1}/${allNotes.length}`)
      }

      const volume = (note.velocity / 127) * 0.1 // Scale velocity
      const noteResult = this.generateNote(
        note.frequency,
        note.duration,
        note.startTime,
        { ...options, volume }
      )

      // Mix into final buffer
      const startSample = Math.floor(note.startTime * this.sampleRate)
      for (let i = 0; i < noteResult.samples && startSample + i < totalSamples; i++) {
        const existingValue = finalBuffer.readInt16LE((startSample + i) * 2)
        const newValue = noteResult.buffer.readInt16LE(i * 2)
        const mixed = Math.max(-32768, Math.min(32767, existingValue + newValue))
        finalBuffer.writeInt16LE(mixed, (startSample + i) * 2)
      }
    })

    return finalBuffer
  }

  // Play a note (like Tone.js triggerAttackRelease)
  triggerAttackRelease(note, duration, options = {}) {
    // Convert note names to frequencies (basic implementation)
    const noteFrequencies = {
      'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23,
      'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
      'C5': 523.25, 'D5': 587.33, 'E5': 659.25
    }

    const frequency = noteFrequencies[note] || 440
    const durationSeconds = parseFloat(duration.replace('n', '')) * 0.5 // Simple note duration conversion

    return this.generateNote(frequency, durationSeconds, 0, options).buffer
  }
}

// Usage - Play MIDI file or demo notes
const synth = new NodeSynth()

// Check if MIDI file path is provided as command line argument
const midiFilePath = process.argv[2]

if (midiFilePath && fs.existsSync(midiFilePath)) {
  console.log(`Playing MIDI file: ${midiFilePath}`)

  // Play MIDI file
  synth.playMidiFile(midiFilePath, {
    waveform: 'triangle',
    attack: 0.01,
    decay: 0.1,
    sustain: 0.8,
    release: 0.2
  })
    .then(audioBuffer => {
      console.log('Starting MIDI playback...')

      const speaker = new Speaker({
        channels: 1,
        bitDepth: 16,
        sampleRate: 44100
      })

      speaker.write(audioBuffer)
      speaker.end()

      const durationMs = (audioBuffer.length / 2) / 44100 * 1000
      setTimeout(() => {
        console.log('MIDI playback complete!')
        process.exit(0)
      }, durationMs + 1000)
    })
    .catch(error => {
      console.error('Error playing MIDI file:', error)
      process.exit(1)
    })

} else {
  // Play demo notes if no MIDI file provided
  console.log('No MIDI file provided. Playing demo notes...')
  console.log('Usage: node tone-style-synth.js <midi-file-path>')

  // Generate different notes with different timbres
  const notes = [
    { note: 'A4', duration: '4n', options: { waveform: 'sine', volume: 0.3 } },
    { note: 'C5', duration: '4n', options: { waveform: 'triangle', volume: 0.25 } },
    { note: 'E5', duration: '2n', options: { waveform: 'square', volume: 0.2 } }
  ]

  // Create speaker
  const speaker = new Speaker({
    channels: 1,
    bitDepth: 16,
    sampleRate: 44100
  })

  console.log('Playing demo synthesis...')

  // Play each note
  let totalBuffer = Buffer.alloc(0)
  for (const noteData of notes) {
    const noteBuffer = synth.triggerAttackRelease(
      noteData.note,
      noteData.duration,
      noteData.options
    )
    totalBuffer = Buffer.concat([totalBuffer, noteBuffer])
  }

  speaker.write(totalBuffer)
  speaker.end()

  setTimeout(() => {
    console.log('Demo synthesis complete!')
    process.exit(0)
  }, 4000)
}
