module.exports = function(buffer) {
  const { clipboard, nativeImage } = require('electron');

  clipboard.writeImage(nativeImage.createFromBuffer(buffer));
}
