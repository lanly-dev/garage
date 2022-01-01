import got from 'got'

const word = 'run'
const data = await got.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`).json()
// console.log(data)

for (const d of data) {
  console.log('----')
  const { word, phonetic, phonetics, origin, meanings } = d
  console.log(`word: ${word}`)
  console.log(`origin: ${origin}`)
  console.log(`phonetic: ${phonetic}`)
  for (const m of meanings) {
    const { partOfSpeech, definitions } = m
    console.log('----')
    console.log(`partOfSpeech: ${partOfSpeech}`)
    for (const d of definitions) {
      console.log('----')
      const { definition, example, synonyms, antonyms } = d
      console.log(`definition: ${definition}`)
      console.log(`example: ${example}`)
      console.log(`synonyms: ${synonyms.join(', ')}`)
      console.log(`antonyms: ${antonyms.join(', ')}`)
    }
  }
  // for (const p of phonetics) console.log(p)
}
