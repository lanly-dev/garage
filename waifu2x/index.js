const fs = require('fs')
import Waifu2x from './Waifu2x'
const { createCanvas, Image } = require('canvas')

const ANIME_NOISE_WEAK_MODEL_PATH = 'models/anime_style_art_rgb/noise1_model.json'
const ANIME_NOISE_STRONG_MODEL_PATH = 'models/anime_style_art_rgb/noise2_model.json'
const ANIME_SCALE_2X_MODEL_PATH = 'models/anime_style_art_rgb/scale2.0x_model.json'
const PHOTO_SCALE_2X_MODEL_PATH = 'models/ukbench/scale2.0x_model.json'

const m = JSON.parse(fs.readFileSync(PHOTO_SCALE_2X_MODEL_PATH))
const waifu2x = new Waifu2x({
  scale2xModel: m,
  scale: 20
})

const done = (image2x, width, height) => {
  const c2 = createCanvas(width, height)
  const ctx2 = c2.getContext('2d')
  const imgdata2x = ctx2.createImageData(width, height)
  imgdata2x.data.set(image2x)
  ctx2.putImageData(imgdata2x, 0, 0)
  const base64String = c2.toDataURL().replace(/^data:image\/\w+;base64,/, "")
  const buf64 = new Buffer.from(base64String, 'base64')
  fs.writeFileSync('out.png', buf64)
  console.log('done 🚀🚀🚀🚀')
}

const progress = (phase, doneRatio, allBlocks, doneBlocks) => {
  // console.log('working')
}

const bufInput = fs.readFileSync('index.jpg')
const img = new Image()
img.onload = () => {
  const c1 = createCanvas(img.width, img.height)
  const ctx1 = c1.getContext('2d')
  ctx1.drawImage(img, 0, 0)
  const imgData = ctx1.getImageData(0, 0, img.width, img.height)
  waifu2x.calc(imgData.data, imgData.width, imgData.height, done, progress)
}
img.onerror = err => { throw err }
img.src = bufInput
