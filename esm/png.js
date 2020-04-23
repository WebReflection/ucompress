import {execFile} from 'child_process';
import {copyFile} from 'fs';

import pngquant from 'pngquant-bin';

import headers from './headers.js';

const pngquantArgs = ['--skip-if-larger', '--speed', '1', '-f', '-o'];

/**
 * Create a file after optimizing via `pngquant`.
 * @param {string} source The source PNG file to optimize.
 * @param {string} dest The optimized destination file.
 * @param {Options} [options] Options to deal with extra computation.
 * @return {Promise<string>} A promise that resolves with the destination file.
 */
export default (source, dest, /* istanbul ignore next */ options = {}) =>
  new Promise((res, rej) => {
    execFile(pngquant, pngquantArgs.concat(dest, source), err => {
      if (err) {
        copyFile(source, dest, err => {
          if (err)
            rej(err);
          else
            headers(dest, options.headers).then(() => res(dest), rej);
        });
      }
      else
        headers(dest, options.headers).then(() => res(dest), rej);
    });
  });
