process.env.EDGE_USE_CORECLR=1
const edge = require('edge-js')

const speak = edge.func({
  assemblyFile: './speech.dll',
  typeName: 'Speech.Speech',
  methodName: 'Speak'
})

speak('javascript')
