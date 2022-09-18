const sharp = require("sharp");
const fs = require("fs/promises");
const { exec } = require('child_process');

const ORIGIN_IMAGES_FOLDER = "./originals/";
const TARGET_RESIZE_FOLDER = "./images/resize/";
const TARGET_COMPARATIVE_FOLDER = "./images/comparative/";

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

function getImageName(file) {
  return file.split(".").slice(0, -1).join(".");
}

async function doComparative(data) {

  const { imageName, format, originalImageComparativePath, resizedImageCompartivePath } = data;
  const command = `dssim ${originalImageComparativePath} ${resizedImageCompartivePath}`;

  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) reject(`error: ${error.message}`);
      else if (stderr) reject(`stderr: ${stderr}`);
      else resolve(`  ${imageName}(${format}): ${stdout.split('\t')[0]}`);
    });
  });

}

async function main() {

  await fs.rmdir(TARGET_RESIZE_FOLDER, { recursive: true });
  await fs.rmdir(TARGET_COMPARATIVE_FOLDER, { recursive: true });
  console.log(`\nRemoved image folders!`);

  await fs.mkdir(TARGET_RESIZE_FOLDER, { recursive: true });
  await fs.mkdir(TARGET_COMPARATIVE_FOLDER, { recursive: true });
  console.log(`Created image folders!`);

  console.log(`\nStarting resize...`);
  console.time('resize');

  const images = await fs.readdir(ORIGIN_IMAGES_FOLDER);

  const resizedImages = await Promise.all(images
    .filter((image) => /\.(jpe?g|png|tif?f|webp|avif)$/i.test(image))
    .map(async (image) => {

      // Copy original image and resize to 1024 in the comparative folder
      const imageName = getImageName(image);
      const originalImagePath = `${ORIGIN_IMAGES_FOLDER}/${image}`;
      const originalImageComparativePath = `${TARGET_COMPARATIVE_FOLDER}${imageName}.png`;
      await sharp(originalImagePath).resize(1024).toFile(originalImageComparativePath);

      // Resize original image for difference formats and save them inthe comparative folder
      return await Promise.all(
        formats.map(async ({ width, format, suffix }) => {

          const resizedImagePath = `${TARGET_RESIZE_FOLDER}${imageName}${suffix}.${format}`
          await sharp(originalImagePath).resize(width).toFile(resizedImagePath);

          const size = suffix.replace('-', '');
          const resizedImagePaths = { format, imageName, originalImageComparativePath };
          resizedImagePaths[`${size}`] = resizedImagePath;

          return resizedImagePaths;

        }));

    }));

  console.log(`Finished resize!`);
  console.timeEnd('resize')

  console.log(`\nStarting comparative...`);
  console.time('comparative');

  // 1. Copy large(l) images in the comparative folder
  // 2. Convert images from different formats to png
  // 3. Delete images with different formats, we wants png format only to compare
  const comparativeImages = await Promise.all(resizedImages
    .flat()
    .filter((image) => 'l' in image)
    .map(async (image) => {
      const resizedImagePath = image['l'];
      const comparativeImagePath = image['l'].replace(TARGET_RESIZE_FOLDER, TARGET_COMPARATIVE_FOLDER);
      const convertPngImageName = `${TARGET_COMPARATIVE_FOLDER}${image['imageName']}-${image['format']}.png`;

      await fs.copyFile(resizedImagePath, comparativeImagePath);
      await sharp(comparativeImagePath).resize(1024).toFile(convertPngImageName);
      await fs.unlink(comparativeImagePath);

      return {
        imageName: image['imageName'],
        format: image['format'],
        originalImageComparativePath: image['originalImageComparativePath'],
        resizedImageCompartivePath: convertPngImageName,
      };

    }));

  // Execute dssim to compare original image with the differents images
  const comparativeValues = await Promise.all(comparativeImages.map(doComparative));
  comparativeValues.forEach((comparativeValue) => console.log(comparativeValue));

  console.log(`Finished comparatived!`);
  console.timeEnd('comparative');

}

main();