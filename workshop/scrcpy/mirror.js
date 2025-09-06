const { spawn } = require('child_process')
const adb = require('adbkit')

// Launch scrcpy
const scrcpy = spawn('scrcpy', [], { stdio: 'inherit' })
scrcpy.on('error', (err) => {
  console.error('Failed to start scrcpy:', err.message)
})

// Connect to ADB and send a tap command after a short delay
const client = adb.createClient()

async function automate() {
  try {
    const devices = await client.listDevices()
    if (devices.length === 0) {
      console.error('No devices found. Connect your Android device and enable USB debugging.')
      return
    }
    const deviceId = devices[0].id
    // Example: Tap at coordinates (500, 1000)
    await client.shell(deviceId, 'input tap 500 1000')
    console.log('Tap command sent!')
  } catch (err) {
  console.error('ADB automation error:', err.message)
  }
}

// Wait a few seconds for scrcpy to start, then automate
let timer = setTimeout(automate, 3000)

// Optional: Clean up on exit
process.on('SIGINT', () => {
  scrcpy.kill()
  clearTimeout(timer)
  process.exit()
})
