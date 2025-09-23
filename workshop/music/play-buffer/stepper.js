#!/usr/bin/env node
'use strict'

const fs = require('fs')
const path = require('path')
const child_process = require('child_process')
const MidiParser = require('midi-file-parser')
const readline = require('readline')
const { midiToFrequency, generateFloatArray, SimplePlayer } = require('./synth')

const SAMPLE_RATE = 44100
const DEFAULT_STEP_MS = 200

function usage() {
  console.log('Usage: node stepper.js <midi-file> [--step-ms N]')
}

const argv = process.argv.slice(2)
if (!argv[0]) {
  usage()
  process.exit(2)
}

const midiPath = argv[0]
let stepMs = DEFAULT_STEP_MS
for (let i = 1; i < argv.length; i++) {
  if (argv[i] === '--step-ms' && i + 1 < argv.length) {
    stepMs = parseInt(argv[i + 1], 10)
    i++
  }
}

if (!fs.existsSync(midiPath)) {
  console.error('MIDI file not found:', midiPath)
  process.exit(2)
}

const midiBuf = fs.readFileSync(midiPath, 'binary')
const midi = MidiParser(midiBuf)

let ticksPerBeat = midi.header.ticksPerBeat || 480
let tempoMicro = 500000

let events = []
for (const track of midi.tracks) {
  let tick = 0
  for (const ev of track) {
    tick += ev.deltaTime
    events.push(Object.assign({ tick }, ev))
    if (ev.subtype === 'setTempo') tempoMicro = ev.microsecondsPerBeat
  }
}

events.sort((a, b) => a.tick - b.tick)

function ticksToSeconds(ticks) {
  return (ticks * tempoMicro) / (ticksPerBeat * 1000000)
}

let noteEvents = events.filter(e => e.type === 'channel' && (e.subtype === 'noteOn' || e.subtype === 'noteOff'))
  .map(e => ({ time: ticksToSeconds(e.tick), subtype: e.subtype, noteNumber: e.noteNumber, velocity: e.velocity }))

// Prepare synth/player
const player = new SimplePlayer(SAMPLE_RATE)

// Find play_buffer_windows.exe
const exeName = 'play_buffer_windows.exe'
let exePath = path.join(process.cwd(), exeName)
if (!fs.existsSync(exePath)) exePath = path.join(__dirname, '..', exeName)
if (!fs.existsSync(exePath)) {
  console.error('play_buffer_windows.exe not found. Place it next to the project root or in parent of script.')
  process.exit(3)
}

// spawn play_buffer with streaming mode by default for live playback
// use the callback streaming mode by default (lower latency handling)
const spawnArgs = [process.argv.includes('--blocking') ? '--stream-blocking' : '--stream-callback']
// allow disabling streaming via --no-stream argument
if (process.argv.includes('--no-stream')) spawnArgs.length = 0
// inherit stdout/stderr so we see player logs; stdin is a pipe
const proc = child_process.spawn(exePath, spawnArgs, { stdio: ['pipe', 'inherit', 'inherit'] })

proc.on('error', (e) => console.error('Failed to start play_buffer:', e && e.message))
proc.on('close', (code, signal) => console.log('play_buffer exited with code', code, 'signal', signal))
proc.stdin.on && proc.stdin.on('error', (e) => console.error('play_buffer stdin error:', e && e.message))

// Test tone support: --test-tone should write a 440Hz tone for 2 seconds then exit
if (process.argv.includes('--test-tone')) {
  const freq = 440
  const durationSec = 2
  const sampleRate = SAMPLE_RATE
  const frames = Math.floor(sampleRate * durationSec)
  const buf = Buffer.alloc(frames * 4)
  for (let i = 0; i < frames; i++) {
    const t = i / sampleRate
    // louder test tone
    const sample = Math.sin(2 * Math.PI * freq * t) * 0.6
    buf.writeFloatLE(sample, i * 4)
  }
  console.log('Streaming test tone...')
  proc.stdin.write(buf, () => {
    try { proc.stdin.end() } catch (e) {}
    process.exit(0)
  })
}

// Build note list with times
let notes = []
const activeMap = new Map()
for (const ev of noteEvents) {
  if (ev.subtype === 'noteOn' && ev.velocity > 0) {
    notes.push({ midi: ev.noteNumber, time: ev.time, velocity: ev.velocity / 127, duration: 0.5 })
  }
}
notes.sort((a, b) => a.time - b.time || a.midi - b.midi)

console.log('Loaded', notes.length, 'notes')
console.log('Preloading samples...')
for (let i = 0; i < notes.length; i++) {
  const n = notes[i]
  const freq = midiToFrequency(n.midi)
  const dur = Math.max(n.duration || 0.5, 0.7)
  const vol = Math.max(0.01, Math.pow(n.velocity || 1, 2) * 0.2)
  n._float = generateFloatArray(freq, dur, { sampleRate: SAMPLE_RATE, volume: vol })
  if (i % 50 === 0) process.stdout.write('.')
}
console.log('\nPreload complete')

readline.emitKeypressEvents(process.stdin)
if (process.stdin.isTTY) process.stdin.setRawMode(true)

let index = 0
console.log('Controls: Space -> next step, r -> reset, q/Ctrl-C -> quit')

async function playNext() {
  if (index >= notes.length) { console.log('End of notes'); return }
  const n = notes[index++]
  console.log(`Playing ${index}/${notes.length} midi ${n.midi}`)
  try {
    // stream the note buffer in small chunks to avoid large writes
    const floatArr = n._float
    const chunkSamples = 2048
    let pos = 0
    const total = floatArr.length

    await new Promise((resolve, reject) => {
      function pump() {
        while (pos < total) {
          const end = Math.min(pos + chunkSamples, total)
          const slice = floatArr.subarray(pos, end)
          const buf = Buffer.alloc(slice.length * 4)
          for (let i = 0; i < slice.length; i++) buf.writeFloatLE(slice[i], i * 4)
          const ok = proc.stdin.write(buf)
          pos = end
          if (!ok) { proc.stdin.once('drain', pump); return }
        }
        resolve()
      }
      pump()
    })
  } catch (e) {
    console.error('Playback error', e)
  }
}

process.stdin.on('keypress', (str, key) => {
  if (key && key.ctrl && key.name === 'c') process.exit(0)
  const k = key && key.name ? key.name : str
  if (k === 'q') process.exit(0)
  if (k === 'r') { index = 0; console.log('reset'); return }
  if (k === 'space') playNext()
})

// If no TTY, auto-advance by stepMs
if (!process.stdin.isTTY) {
  setInterval(() => playNext(), stepMs)
}

console.log('Ready')
