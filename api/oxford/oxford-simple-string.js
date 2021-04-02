require('dotenv').config()
const Dictionary = require('oxford-dictionary-api')
const app_id = process.env.APP_ID
const app_key = process.env.APP_KEY
const dict = new Dictionary(app_id, app_key)
dict.find('ace', (error, data) => {
  let string = ''
  if (error) return console.log(error)
  for (const lexEntry of data.results[0].lexicalEntries) {
    string = string + lexEntry.lexicalCategory + '\n'
    for (let i = 0; i < lexEntry.entries.length; i++) {
      let entry = lexEntry.entries[i]
      if (entry.etymologies) string = `${string}${i + 1}. ${entry.etymologies.join(' | ')}\n`
      if (entry.senses) {
        for (let j = 0; j < entry.senses.length; j++) {
          let sense = entry.senses[j]
          string = `${string}\t${j + 1}. Main Def: ${sense.definitions.join()}\n`
          if (sense.examples) {
            let index = 0
            let array = []
            for (k of sense.examples) {
              if (k.text) array.push([`(${(index = index + 1)})`, k.text].join(''))
            }
            string = `${string}\t   Ex: ${array.join(' ')}\n`
          }
        }
      }
    }
  }
  console.log(string.length)
})
