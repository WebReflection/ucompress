import {readFile, writeFile} from 'fs';

import html from 'html-minifier';

import compressed from './compressed.js';
import compress from './compress.js';

const htmlArgs = {
  collapseWhitespace: true,
  html5: true,
  removeAttributeQuotes: true,
  removeComments: true
};

compressed.add('.htm');
compressed.add('.html');

/**
 * Create a file after minifying it via `html-minifier`.
 * @param {string} source The source HTML file to minify.
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
        try {
          /* istanbul ignore next */
          const content = options.noMinify ?
                            file :
                            html.minify(file.toString(), htmlArgs);
          writeFile(dest, content, err => {
            if (err)
              rej(err);
            else if (options.createFiles)
              compress(source, dest, 'text', options)
                .then(() => res(dest), rej);
            else
              res(dest);
          });
        }
        catch (error) {
          rej(error);
        }
      }
    });
  });
