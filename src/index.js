const sharp = require('sharp')
const fs = require('fs')
const { formats } = require('./formats')

const ORIGINALS = './originals/'
const IMAGES = './images/'

function convertToimg ({ isImageFile, file }) {
  if (isImageFile) {
    formats.map(({ width, format, suffix }) => {
      const filename = file.split('.').slice(0, -1).join('.')

      return sharp(`${ORIGINALS}/${file}`)
        .resize(width)
        .toFile(`${IMAGES}${filename}${suffix}.${format}`, () =>
          console.log(`${IMAGES}${filename}${suffix}.${format}`)
        )
    })
  }
}

fs.rmdirSync(IMAGES, { recursive: true })

if (!fs.existsSync(IMAGES)) {
  fs.mkdirSync(IMAGES)
}

fs.readdirSync(ORIGINALS).forEach((file) => {
  const isImageFile = /\.(jpe?g|png|tif?f|avif)$/i.test(file)

  convertToimg({ isImageFile, file })
})
