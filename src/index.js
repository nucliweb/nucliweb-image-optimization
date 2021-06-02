const sharp = require("sharp");
const fs = require("fs");

const ORIGINALS = "./originals/";
const IMAGES = "./images/";
const formats = [
  // jpeg
  { width: 640, format: "jpg", suffix: "-s" },
  { width: 768, format: "jpg", suffix: "-m" },
  { width: 1024, format: "jpg", suffix: "-l" },
  // webp
  { width: 640, format: "webp", suffix: "-s" },
  { width: 768, format: "webp", suffix: "-m" },
  { width: 1024, format: "webp", suffix: "-l" },
  // avif
  { width: 640, format: "avif", suffix: "-s" },
  { width: 768, format: "avif", suffix: "-m" },
  { width: 1024, format: "avif", suffix: "-l" },
];

fs.rmdirSync(IMAGES, { recursive: true });

if (!fs.existsSync(IMAGES)) {
  fs.mkdirSync(IMAGES);
}

fs.readdirSync(ORIGINALS).forEach((file) => {
  const isImageFile = /\.(jpe?g|png|tif?f|avif)$/i.test(file);

  if (isImageFile) {
    formats.map(({ width, format, suffix }) => {
      const filename = file.split(".").slice(0, -1).join(".");

      sharp(`${ORIGINALS}/${file}`)
        .resize(width)
        .toFile(`${IMAGES}${filename}${suffix}.${format}`, () =>
          console.log(`${IMAGES}${filename}${suffix}.${format}`)
        );
    });
  }
});
