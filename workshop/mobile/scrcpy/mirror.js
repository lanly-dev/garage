const { spawn } = require('child_process')

// Launch scrcpy
const scrcpy = spawn('scrcpy', [], { stdio: 'inherit' })
scrcpy.on('error', (err) => {
  console.error('Failed to start scrcpy:', err.message)
})
