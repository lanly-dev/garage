const Example = require('./out/speech').Program
const result = Example.hello('.NET')

console.log(result)

Example.speak('how are you dude?')
