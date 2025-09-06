
const adb = require('adbkit')
const client = adb.createClient()

async function automate() {
  try {
    const devices = await client.listDevices()
    if (devices.length === 0) {
      console.error('No devices found. Connect your Android device and enable USB debugging.')
      return
    }
    const deviceId = devices[0].id

    // Check if the device screen is ON
    const result = await client.shell(deviceId, 'dumpsys power')
    const output = await adb.util.readAll(result)
    const screenInfo = output.toString()
    const screenOn = /Display Power: state=ON|mScreenOn=true/.test(screenInfo)

    if (!screenOn) {
      // Wake up the device
      await client.shell(deviceId, 'input keyevent 26') // Power button
      // Wait a moment for the screen to turn on
      await new Promise(res => setTimeout(res, 1000))
    }

    // Swipe up to unlock (adjust coordinates as needed)
    await client.shell(deviceId, 'input swipe 300 1000 300 500 300')
    await new Promise(res => setTimeout(res, 500))

    // Enter PIN and press Enter
    await client.shell(deviceId, 'input text 1234')
    await client.shell(deviceId, 'input keyevent 66') // 66 = Enter key
    console.log('PIN entered to unlock the screen!')
  } catch (err) {
    console.error('ADB automation error:', err.message)
  }
}

// // Wait a few seconds for scrcpy to start, then automate
// let timer = setTimeout(automate, 3000)
automate()
