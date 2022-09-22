const formats = [
  // jpeg
  { width: 640, format: 'jpg', suffix: '-s' },
  { width: 768, format: 'jpg', suffix: '-m' },
  { width: 1024, format: 'jpg', suffix: '-l' },
  // webp
  { width: 640, format: 'webp', suffix: '-s' },
  { width: 768, format: 'webp', suffix: '-m' },
  { width: 1024, format: 'webp', suffix: '-l' },
  // avif
  { width: 640, format: 'avif', suffix: '-s' },
  { width: 768, format: 'avif', suffix: '-m' },
  { width: 1024, format: 'avif', suffix: '-l' }
]

module.exports = {
  formats
}
