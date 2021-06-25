import {readFile, writeFile} from 'fs';

import {optimize} from 'svgo';

import compressed from './compressed.js';
import compress from './compress.js';

compressed.add('.svg');

/**
 * Create a file after minifying it via `svgo`.
 * @param {string} source The source SVG file to minify.
 * @param {string} dest The minified destination file.
 * @param {Options} [options] Options to deal with extra computation.
 * @return {Promise<string>} A promise that resolves with the destination file.
 */
export default (source, dest, options = {}) =>
  new Promise((res, rej) => {
    readFile(source, (err, file) => {
      if (err)
        rej(err);
      else {
        const onSVGO = ({data}) => {
          writeFile(dest, data, err => {
            if (err)
              rej(err);
            else if (options.createFiles)
              compress(source, dest, 'text', options)
                .then(() => res(dest), rej);
            else
              res(dest);
          });
        };
        if (options.noMinify)
          onSVGO({data: file});
        else
          onSVGO(optimize(file));
      }
    });
  });
