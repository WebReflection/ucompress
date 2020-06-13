import {execFile} from 'child_process';
import {copyFile} from 'fs';

import umeta from 'umeta';

import headers from './headers.js';

const {require: cjs} = umeta(import.meta);

let gifsicle = '';
try {
  gifsicle = cjs('gifsicle');
}
catch(meh) {
  // gifsicle should be installed via npm 
}

/**
 * Create a file after optimizing via `gifsicle`.
 * @param {string} source The source GIF file to optimize.
 * @param {string} dest The optimized destination file.
 * @param {Options} [options] Options to deal with extra computation.
 * @return {Promise<string>} A promise that resolves with the destination file.
 */
export default (source, dest, /* istanbul ignore next */ options = {}) =>
  new Promise((res, rej) => {
    const callback = err => {
      if (err)
        rej(err);
      else if (options.createFiles)
        headers(source, dest, options.headers)
          .then(() => res(dest), rej);
      else
        res(dest);
    };
    /* istanbul ignore else */
    if (gifsicle)
      execFile(gifsicle, ['-o', dest, source], callback);
    else
      copyFile(source, dest, callback);
  });
