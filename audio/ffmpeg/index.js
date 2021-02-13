const { exec } = require('child_process')
const fs = require('fs')
const exiftool = require('exiftool-vendored').exiftool
const YAML = require('yaml')
const FPATH = require('ffmpeg-static')

const DIR = 'out'
const IN = 'a.mov'
const INmp3 = 'a.mp3'
const OUT = 'b.mp4'
const fframes = 'frame%3d.jpg'

// exiftool.version().then((version) => {
//   console.log(`We're running ExifTool v${version}`)
//   exiftool.end()
// })

exiftool.read(IN).then((info) => {
  const doc = new YAML.Document()
  doc.contents = info
  fs.writeFileSync('meta.yaml', doc.toString())
  exiftool.end()
})

console.log(FPATH)
const cmd = `${FPATH} -i ${IN}` // Info
// const cmd = `${FPATH} -i ${IN} -f ffmetadata meta.txt` // metadata
// const cmd = `${FPATH} -y -v error -i ${IN} ${OUT}` // convert
// const cmd = `${FPATH} -i ${IN} out/${fframes}` // extract frames
// const cmd = `${FPATH} -i ${IN} -i ${INmp3} -map 0:v -map 1:a -shortest mav-${OUT}` // merge video and audio
// const cmd = `${FPATH} -r 24 -i ${IN} iv${OUT}` // images -> video
// const cmd = `${FPATH} -i mav-b.mp4 ${OUT}.mp3` // extact audio
// const cmd =  `${FPATH} -f s16le -ar 16000 -ac 1 -i audio.raw -ar 44100 -ac 1 ${OUT}raw.mp3` // for recording raw

if (!fs.existsSync('out')) fs.mkdirSync('out')
exec(cmd, (err, stdout, stderr) => {
  if (err) console.error(err)
  // console.log(stdout)
  // console.log(stderr)
})
