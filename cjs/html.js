'use strict';
const {readFile, writeFile} = require('fs');

const html = (m => m.__esModule ? /* istanbul ignore next */ m.default : /* istanbul ignore next */ m)(require('html-minifier'));

const compressed = (m => m.__esModule ? /* istanbul ignore next */ m.default : /* istanbul ignore next */ m)(require('./compressed.js'));
const compress = (m => m.__esModule ? /* istanbul ignore next */ m.default : /* istanbul ignore next */ m)(require('./compress.js'));

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
module.exports = (source, dest, /* istanbul ignore next */options = {}) =>
  new Promise((res, rej) => {
    readFile(source, (err, file) => {
      if (err)
        rej(err);
      else {
        try {
          writeFile(dest, html.minify(file.toString(), htmlArgs), err => {
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
