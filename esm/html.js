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
export default (source, dest, /* istanbul ignore next */options = {}) =>
  new Promise((res, rej) => {
    readFile(source, (err, file) => {
      if (err)
        rej(err);
      else {
        try {
          writeFile(dest, html.minify(file.toString(), htmlArgs), err => {
            if (err)
              rej(err);
            else
              compress(dest, 'text', options).then(() => res(dest), rej);
          });
        }
        catch (error) {
          rej(error);
        }
      }
    });
  });
