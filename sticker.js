const sharp = require('sharp');
const webp = require('webp-converter');

async function makeSticker(inputBuffer, packName, author) {
    if (!inputBuffer) {
        throw new Error("Buffer de entrada vazio ou inválido.");
    }

    let processedBuffer = await sharp(inputBuffer)
        .resize(512, 512, {
            fit: 'contain', 
            background: { r: 0, g: 0, b: 0, alpha: 0 } 
        })
        .toFormat('png') 
        .toBuffer();

 

    return processedBuffer;

   
}

module.exports = {
    makeSticker
};