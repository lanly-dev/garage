import { performance } from 'perf_hooks'
import waifu2x from 'waifu2x'

const scale = 50 // ~5 min
const noise = 2

console.log(`Started with x${scale}`)
const t0 = performance.now()
waifu2x.upscaleImage('index.jpg', `out${scale}x.jpg`, { noise, scale }).then(() => {
  const t1 = performance.now()
  const ms = t1 - t0
  const t = new Date(ms).toISOString().substr(11, 8)
  console.log(`${ms} milliseconds.`)
  console.log(t)
})

// await waifu2x.upscaleImages("./images", "./upscaled", {recursion: 1, rename: "2x"})
