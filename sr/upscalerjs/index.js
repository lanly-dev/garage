const fs = require('fs')
const tf = require('@tensorflow/tfjs-node-gpu')
const Upscaler = require('upscaler/node-gpu')

async function upscaleImage(inputPath, outputPath) {
  // Read the image file
  const imageBuffer = fs.readFileSync(inputPath)
  const imageTensor = tf.node.decodeImage(imageBuffer, 3) // 3 for RGB

  // Create an Upscaler instance
  const upscaler = new Upscaler()

  // Upscale the image
  const upscaledTensor = await upscaler.upscale(imageTensor)

  // Convert the upscaled tensor back to an image buffer
  const upscaledImageBuffer = await tf.node.encodePng(upscaledTensor)

  // Write the upscaled image to a file
  fs.writeFileSync(outputPath, upscaledImageBuffer)

  // Dispose of tensors to free memory
  imageTensor.dispose()
  upscaledTensor.dispose()
}

// Path to your input image and output image
const inputPath = './chi2.jpg'
const outputPath = '.output.jpg'

upscaleImage(inputPath, outputPath)
  .then(() => {
    console.log('Image upscaled successfully!')
  })
  .catch((error) => {
    console.error('Error during image upscaling:', error)
  })
