// automatically pick platform
const say = require('say')

// // or, override the platform
// const Say = require('say').Say
// const say = new Say('darwin' || 'win32' || 'linux')

// Use default system voice and speed
say.speak('Hello!')

// Stop the text currently being spoken
say.stop()

// More complex example (with an OS X voice) and slow speed
// say.speak("What's up, dog?", 'Alex', 0.5)

// Fire a callback once the text has completed being spoken
// say.speak("What's up, dog?", 'Good News', 1.0, (err) => {
//   if (err) {
//     return console.error(err)
//   }

//   console.log('Text has been spoken.')
// })

// Export spoken audio to a WAV file
say.export("I'm sorry, Dave.", 'Cellos', 0.75, 'hal.wav', (err) => {
  if (err) {
    return console.error(err)
  }
  console.log('Text has been saved to hal.wav.')
})
