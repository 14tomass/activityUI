const sharp = require('sharp');
const path = require('path');

const inputPath = process.argv[2];
const outputPath = process.argv[3];

async function resize() {
  try {
    await sharp(inputPath)
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .toFile(outputPath);
    console.log('Image resized successfully.');
  } catch (error) {
    console.error('Error resizing image:', error);
  }
}

resize();
