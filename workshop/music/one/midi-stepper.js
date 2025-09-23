#!/usr/bin/env node
import fs from 'fs'
import readline from 'readline'
import pkg from '@tonejs/midi'
const { Midi } = pkg
import { midiToFrequency, generateFloatArray, SimplePlayer } from './synth.js'

const argv = process.argv.slice(2)
if (!argv[0]) {
  console.error('Usage: node midi-stepper.js <midi-file>')
  process.exit(2)
}
const midiPath = argv[0]
if (!fs.existsSync(midiPath)) {
  console.error('MIDI file not found:', midiPath)
  process.exit(2)
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
readline.emitKeypressEvents(process.stdin, rl)
if (process.stdin.isTTY) process.stdin.setRawMode(true)

const sampleRate = 44100
const player = new SimplePlayer(sampleRate)

console.log('Loading MIDI...')
const data = fs.readFileSync(midiPath)
const midi = new Midi(data)
let notes = []
midi.tracks.forEach((track, idx) => {
  (track.notes || []).forEach(n => notes.push({ midi: n.midi, time: n.time, duration: n.duration || 0.5, velocity: n.velocity || 1 }))
})
notes.sort((a,b) => a.time - b.time || a.midi - b.midi)
console.log(`Loaded ${notes.length} notes`)

// Preload float arrays
console.log('Preloading samples...')
for (let i = 0; i < notes.length; i++) {
  const n = notes[i]
  const freq = midiToFrequency(n.midi)
  const dur = Math.max(n.duration || 0.5, 0.7)
  const vol = Math.max(0.01, Math.pow(n.velocity || 1, 2) * 0.2)
  n._float = generateFloatArray(freq, dur, { sampleRate, volume: vol })
  if (i % 50 === 0) process.stdout.write(`.${i}`)
}
console.log('\nPreload complete')

let index = 0
console.log('Controls: any key -> next note, r -> reset, q/Ctrl-C -> quit')
process.stdin.on('keypress', async (str, key) => {
  if (key && key.ctrl && key.name === 'c') process.exit(0)
  const k = key && key.name ? key.name : str
  if (k === 'q') process.exit(0)
  if (k === 'r') { index = 0; console.log('reset'); return }
  if (index >= notes.length) { console.log('End of notes'); return }
  const n = notes[index++]
  console.log(`Playing ${index}/${notes.length} midi ${n.midi}`)
  try {
    await player.write(n._float)
  } catch (e) {
    console.error('Playback error', e)
  }
})

console.log('Ready')
