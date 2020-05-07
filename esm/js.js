import {readFile, writeFile} from 'fs';

import uglify from 'uglify-es';

import compressed from './compressed.js';
import compress from './compress.js';

const uglifyArgs = {output: {comments: /^!/}};

compressed.add('.js');
compressed.add('.mjs');

/**
 * Create a file after minifying it via `uglify-es`.
 * @param {string} source The source JS file to minify.
 * @param {string} dest The minified destination file.
 * @param {Options} [options] Options to deal with extra computation.
 * @return {Promise<string>} A promise that resolves with the destination file.
 */
export default (source, dest, /* istanbul ignore next */ options = {}) =>
  new Promise((res, rej) => {
    readFile(source, (err, data) => {
      if (err)
        rej(err);
      else {
        const {code, error} = uglify.minify(data.toString(), uglifyArgs);
        if (error)
          rej(error);
        else {
          writeFile(dest, code, err => {
            if (err)
              rej(err);
            else if (options.createFiles)
              compress(source, dest, 'text', options)
                .then(() => res(dest), rej);
            else
              res(dest);
          });
        }
      }
    });
  });
