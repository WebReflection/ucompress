import {execFile} from 'child_process';

import jpegtran from 'jpegtran-bin';

import headers from './headers.js';

const jpegtranArgs = ['-progressive', '-optimize', '-outfile'];

/**
 * Create a file after optimizing via `jpegtran`.
 * @param {string} source The source JPG/JPEG file to optimize.
 * @param {string} dest The optimized destination file.
 * @param {Options} [options] Options to deal with extra computation.
 * @return {Promise<string>} A promise that resolves with the destination file.
 */
export default (source, dest, /* istanbul ignore next */ options = {}) =>
  new Promise((res, rej) => {
    execFile(jpegtran, jpegtranArgs.concat(dest, source), err => {
      if (err)
        rej(err);
      else if (options.createFiles)
        headers(dest, options.headers).then(() => res(dest), rej);
      else
        res(dest);
    });
  });
