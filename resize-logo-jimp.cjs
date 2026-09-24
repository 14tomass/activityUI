const Jimp = require('jimp');

const inputPath = process.argv[2];
const outputPath = process.argv[3];

async function resize() {
  try {
    const image = await Jimp.read(inputPath);
    // Resize to 512x512, contain within the box, fill background with white
    await image
      .contain(512, 512, Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE, 0xFFFFFFFF)
      .writeAsync(outputPath);
    console.log('Image resized successfully.');
  } catch (error) {
    console.error('Error resizing image:', error);
  }
}

resize();
