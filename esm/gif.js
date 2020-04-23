import {execFile} from 'child_process';

import gifsicle from 'gifsicle';

import headers from './headers.js';

/**
 * Create a file after optimizing via `gifsicle`.
 * @param {string} source The source GIF file to optimize.
 * @param {string} dest The optimized destination file.
 * @param {Options} [options] Options to deal with extra computation.
 * @return {Promise<string>} A promise that resolves with the destination file.
 */
export default (source, dest, /* istanbul ignore next */ options = {}) =>
  new Promise((res, rej) => {
    execFile(gifsicle, ['-o', dest, source], err => {
      if (err)
        rej(err);
      else
        headers(dest, options.headers).then(() => res(dest), rej);
    });
  });
