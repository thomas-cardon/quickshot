/*
* Extracts region from base64 image using coordinates
* compressionLevel = 1 to 10
*/
function extract(base64data, extractOptions, filePath = 'clipboard', extension = 'png', compressionLevel = 2) {
  console.log('Started extracting image');

  const sharp = require('sharp');

  let buffer = Buffer.from(base64data.split(';base64,').pop(), 'base64');
  console.dir(buffer);

  let compressionOptions = {};

  /*
  * I'm doing that to have a compression level that is pretty much the same for every extension
  */
  if (extension === 'jpeg' || extension === 'webp' || extension === 'tiff' || extension === 'heif')
    compressionOptions.quality = 100 - (compressionLevel * 10);
  else if (extension === 'png')
    compressionOptions.compressionLevel = 9 - (compressionLevel - 1);

  console.log('Compression options:', JSON.stringify(compressionOptions));
  console.log('Processing then outputing to:', filePath, 'as', extension, 'extension');

  let instance = sharp(buffer)
  .extract(extractOptions)
  .toFormat(extension, compressionOptions);

  if (filePath === 'clipboard')
    instance.toBuffer()
    .then(buffer => {
      require('./copy-to-clipboard')(buffer);
      require('electron').remote.getCurrentWindow().close();
    })
    .catch(console.error);
  else instance.toFile(filePath)
    .then(require('electron').remote.getCurrentWindow().close)
    .catch(console.error);
}

module.exports = extract;
