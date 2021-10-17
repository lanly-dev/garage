import { readSync } from 'to-vfile'
import { toString } from 'nlcst-to-string'
import { retext } from 'retext'
import retextPos from 'retext-pos'
import retextKeywords from 'retext-keywords'

const file = readSync('example.txt')

retext()
  .use(retextPos) // Make sure to use `retext-pos` before `retext-keywords`.
  .use(retextKeywords, { maximum: 4})
  .process(file)
  .then((file) => {
    console.log('Keywords:')
    let i = 0
    file.data.keywords.forEach((keyword) => {
      console.log(++i, toString(keyword.matches[0].node))
    })

    console.log()
    console.log('Key-phrases:')
    i = 0
    file.data.keyphrases.forEach((phrase) => {
      console.log(++i, phrase.matches[0].nodes.map((d) => toString(d)).join(''))
    })
  })
