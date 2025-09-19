// Can play in nodejs, but needs a SoundFont file (.sf2)

const fs = require('fs')
const Speaker = require('speaker')
const JSSynth = require('js-synthesizer')
const libfluidsynth = require('js-synthesizer/libfluidsynth')

async function playMidiWithSound(midiFile) {
  let speaker = null
  let synth = null

  try {
    console.log('🎵 Initializing js-synthesizer...')

    // Initialize
    JSSynth.Synthesizer.initializeWithFluidSynthModule(libfluidsynth)
    await JSSynth.waitForReady()

    synth = new JSSynth.Synthesizer()
    synth.init(44100)

    // Set up basic instrument mapping without SoundFont
    console.log('🎹 Setting up basic instruments...')

    // Try to load a basic SoundFont if available, otherwise use built-in sounds
    try {
      // Check if there's a SoundFont in the directory
      const soundFontFiles = fs.readdirSync('.').filter(f => f.endsWith('.sf2'))
      if (soundFontFiles.length > 0) {
        console.log(`🎼 Loading SoundFont: ${soundFontFiles[0]}`)
        const sfData = fs.readFileSync(soundFontFiles[0])
        await synth.loadSFont(sfData.buffer)
        console.log('✅ SoundFont loaded')
      } else {
        console.log('ℹ️  No SoundFont found, using built-in sounds')

        // Set up basic instrument assignments
        for (let channel = 0; channel < 16; channel++) {
          if (channel === 9) {
            // Channel 10 (index 9) is drums
            synth.midiSetChannelType(channel, true)
            synth.midiProgramChange(channel, 0) // Standard drum kit
          } else {
            // Other channels use melodic instruments
            synth.midiSetChannelType(channel, false)
            synth.midiProgramChange(channel, 0) // Piano
          }
        }
      }
    } catch (e) {
      console.log('⚠️  SoundFont loading failed, using defaults:', e.message)
    }

    // Test audio output first
    console.log('🔊 Testing audio output...')
    await testAudioOutput(synth)

    // Now load and play MIDI
    console.log('📁 Loading MIDI file...')
    const midiData = fs.readFileSync(midiFile)
    await synth.addSMFDataToPlayer(new Uint8Array(midiData).buffer)

    // Set up audio output with higher volume
    speaker = new Speaker({
      channels: 2,
      bitDepth: 16,
      sampleRate: 44100,
      highWaterMark: 16384 // Larger buffer
    })

    console.log('▶️  Starting playback...')
    await synth.playPlayer()

    // Audio rendering with amplification
    let framesRendered = 0
    let isPlaying = true
    const frameSize = 1024
    const amplification = 2.0 // Boost volume

    const audioLoop = () => {
      if (!isPlaying) return

      try {
        const leftBuffer = new Float32Array(frameSize)
        const rightBuffer = new Float32Array(frameSize)

        synth.render([leftBuffer, rightBuffer])

        // Check for audio content and amplify
        let hasAudio = false
        for (let i = 0; i < frameSize; i++) {
          leftBuffer[i] *= amplification
          rightBuffer[i] *= amplification

          if (Math.abs(leftBuffer[i]) > 0.001 || Math.abs(rightBuffer[i]) > 0.001) {
            hasAudio = true
          }
        }

        if (hasAudio || synth.isPlayerPlaying()) {
          // Convert to PCM
          const pcmBuffer = new Int16Array(frameSize * 2)
          for (let i = 0; i < frameSize; i++) {
            pcmBuffer[i * 2] = Math.max(-32767, Math.min(32767, leftBuffer[i] * 32767))
            pcmBuffer[i * 2 + 1] = Math.max(-32767, Math.min(32767, rightBuffer[i] * 32767))
          }

          speaker.write(Buffer.from(pcmBuffer.buffer))
          framesRendered++

          if (framesRendered % 100 === 0) {
            const seconds = (framesRendered * frameSize / 44100).toFixed(1)
            const audioLevel = hasAudio ? '🔊' : '🔇'
            process.stdout.write(`\r${audioLevel} ${seconds}s`)
          }
        }

        if (synth.isPlayerPlaying() || hasAudio) {
          setImmediate(audioLoop)
        } else if (framesRendered > 50) {
          console.log(`\n✅ Finished after ${(framesRendered * frameSize / 44100).toFixed(1)}s`)
          cleanup()
        } else {
          setTimeout(audioLoop, 50)
        }

      } catch (error) {
        console.error('❌ Audio error:', error)
        cleanup()
      }
    }

    audioLoop()

    function cleanup() {
      isPlaying = false
      if (speaker && !speaker.destroyed) speaker.end()
      if (synth) synth.close()
    }

    process.on('SIGINT', () => {
      console.log('\n🛑 Stopping...')
      cleanup()
      process.exit(0)
    })

  } catch (error) {
    console.error('❌ Error:', error)
    if (speaker) speaker.end()
    if (synth) synth.close()
    process.exit(1)
  }
}

async function testAudioOutput(synth) {
  return new Promise((resolve) => {
    console.log('🎶 Playing test note...')

    // Play a test note
    synth.midiNoteOn(0, 60, 127) // Middle C, full velocity

    setTimeout(() => {
      synth.midiNoteOff(0, 60)
      console.log('✅ Test note sent')
      resolve()
    }, 500)
  })
}

// CLI
if (process.argv.length < 3) {
  console.log('Usage: node play-midi-with-sound.cjs <midi-file>')
  console.log('\nTip: Place a .sf2 SoundFont file in this directory for better sound quality')
  console.log('Press Ctrl+C to stop')
  process.exit(1)
}

playMidiWithSound(process.argv[2])
