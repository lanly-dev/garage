const { exec } = require('child_process')
const fs = require('fs')
const FPATH = require('ffmpeg-static')

const DIR = 'out'
const IN = 'a.mov'
const OUT = 'b.mp4'

console.log(FPATH)
// const cmd = `${FPATH} -y -v error -i ${IN} -codec copy ${OUT}` // convert
const cmd = `${FPATH} -i ${IN} out/frame%3d.jpg` // extract frames

if (!fs.existsSync('out')) fs.mkdirSync('out')
exec(cmd, (err) => (err ? console.error(err.message) : console.info('done!')))
