import {extname} from 'path';

import sharp from 'sharp';

export default source => {
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
