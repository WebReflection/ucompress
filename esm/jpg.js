import {execFile} from 'child_process';
import {unlink} from 'fs';

import jpegtran from 'jpegtran-bin';
import sharp from 'sharp';

import headers from './headers.js';

const fit = sharp.fit.inside;
const jpegtranArgs = ['-progressive', '-optimize', '-outfile'];
const withoutEnlargement = true;

const optimize = (source, dest, options) => new Promise((res, rej) => {
  execFile(jpegtran, jpegtranArgs.concat(dest, source), err => {
    if (err)
      rej(err);
    else if (options.createFiles)
      headers(source, dest, options.headers)
        .then(() => res(dest), rej);
    else
      res(dest);
  });
});

/**
 * Create a file after optimizing via `jpegtran`.
 * @param {string} source The source JPG/JPEG file to optimize.
 * @param {string} dest The optimized destination file.
 * @param {Options} [options] Options to deal with extra computation.
 * @return {Promise<string>} A promise that resolves with the destination file.
 */
export default (source, dest, /* istanbul ignore next */ options = {}) =>
  new Promise((res, rej) => {
    const {maxWidth: width, maxHeight: height} = options;
    if (width || height) {
      sharp(source)
        .resize({width, height, fit, withoutEnlargement})
        .toFile(`${dest}.resized.jpg`)
        .then(
          () => optimize(`${dest}.resized.jpg`, dest, options).then(
            () => {
              unlink(`${dest}.resized.jpg`, err => {
                /* istanbul ignore if */
                if (err) rej(err);
                else res(dest);
              });
            },
            rej
          ),
          rej
        )
      ;
    }
    else
      optimize(source, dest, options).then(res, rej);
  });
