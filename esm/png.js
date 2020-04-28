import {execFile} from 'child_process';
import {copyFile, unlink} from 'fs';

import pngquant from 'pngquant-bin';
import sharp from 'sharp';

import headers from './headers.js';

const fit = sharp.fit.inside;
const pngquantArgs = ['--skip-if-larger', '--speed', '1', '-f', '-o'];
const withoutEnlargement = true;

const optimize = (source, dest, options) => new Promise((res, rej) => {
  execFile(pngquant, pngquantArgs.concat(dest, source), err => {
    if (err) {
      copyFile(source, dest, err => {
        if (err)
          rej(err);
        else if (options.createFiles)
          headers(source, dest, options.headers)
            .then(() => res(dest), rej);
        else
          res(dest);
      });
    }
    else if (options.createFiles)
      headers(source, dest, options.headers)
        .then(() => res(dest), rej);
    else
      res(dest);
  });
});

/**
 * Create a file after optimizing via `pngquant`.
 * @param {string} source The source PNG file to optimize.
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
        .toFile(`${dest}.resized.png`)
        .then(
          () => optimize(`${dest}.resized.png`, dest, options).then(
            () => {
              unlink(`${dest}.resized.png`, err => {
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
