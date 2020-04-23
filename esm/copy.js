import {copyFile} from 'fs';
import {extname} from 'path';

import compressed from './compressed.js';
import compress from './compress.js';
import headers from './headers.js';

compressed.add('.csv');
compressed.add('.json');
compressed.add('.md');
compressed.add('.txt');
compressed.add('.woff2');
compressed.add('.yml');

/**
 * Copy a source file into a destination.
 * @param {string} source The source file to copy.
 * @param {string} dest The destination file.
 * @param {Options} [options] Options to deal with extra computation.
 * @return {Promise<string>} A promise that resolves with the destination file.
 */
export default (source, dest, /* istanbul ignore next */ options = {}) =>
  new Promise((res, rej) => {
    copyFile(source, dest, err => {
      if (err)
        rej(err);
      else {
        const ext = extname(source);
        if (compressed.has(ext))
          compress(dest, ext === '.woff2' ? 'font' : 'text', options)
            .then(() => res(dest), rej);
        else
          headers(dest, options.headers).then(() => res(dest), rej);
      }
    });
  });
