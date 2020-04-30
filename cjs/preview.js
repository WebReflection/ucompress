'use strict';
const {extname} = require('path');

const sharp = (m => m.__esModule ? /* istanbul ignore next */ m.default : /* istanbul ignore next */ m)(require('sharp'));

module.exports = dest => sharp(dest)
  .blur(0x32)
  .modulate({
    brightness: 0.6,
    saturation: 0.9
  })
  .toFile(dest.replace(
    new RegExp(`(\\${extname(dest)})$`),
    '.preview$1'
  ))
;
