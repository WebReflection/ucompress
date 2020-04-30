import {extname} from 'path';

import sharp from 'sharp';

export default dest => sharp(dest)
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
