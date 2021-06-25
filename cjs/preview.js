'use strict';
const {extname} = require('path');

const sharp = (m => /* c8 ignore start */ m.__esModule ? m.default : m /* c8 ignore stop */)(require('sharp'));

module.exports = source => {
  const dest = source.replace(
    new RegExp(`(\\${extname(source)})$`),
    '.preview$1'
  );
  return sharp(source)
    .blur(0x32)
    .modulate({
      brightness: 0.6,
      saturation: 0.9
    })
    .toFile(dest)
    .then(() => dest)
  ;
};
