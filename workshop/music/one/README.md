# MIDI Stepper (Node)

This small tool plays one MIDI note per keypress from a MIDI file. It uses a lightweight triangle synth and Node `speaker` for audio output.

Files
- `midi-stepper.js` - CLI: press any key to play the next note. `r` to reset, `q` to quit.
- `synth.js` - minimal synth + `SimplePlayer` that writes sequentially to `speaker`.

Quick run (PowerShell):

```powershell
# Windows PowerShell example
$env:SIMPLE_OUTPUT = '1'  # (optional) use SimplePlayer fallback
node .\midi-stepper.js '.\akaza\'s-love-theme.mid'
```

Environment variables (advanced tuning):
- `SIMPLE_OUTPUT` - not used by `midi-stepper.js` (it always uses `SimplePlayer`).
- `MAX_QUEUE` - if you use a Mixer path, limits queue length.
- `DROP_OLDEST` - if set to `1`, the mixer will drop oldest items when the queue is full.
- `MIX_CHUNK` - mixer chunk size (samples).
- `TAIL_FADE_SAMPLES` - tail fade length (samples) applied at end of notes to reduce clicks.

Notes
- This is intentionally simple and uses `speaker` native bindings. On Windows, the `SimplePlayer` approach (sequential writes) is often more stable.
- If you want lower latency, consider tuning `MIX_CHUNK` or using the `Node` with a dedicated low-latency audio library.

> NOT WORKING FOR FAST TYPING
