'use strict';
const {readFile, writeFile} = require('fs');

const SVGO = (m => m.__esModule ? /* istanbul ignore next */ m.default : /* istanbul ignore next */ m)(require('svgo'));

const compressed = (m => m.__esModule ? /* istanbul ignore next */ m.default : /* istanbul ignore next */ m)(require('./compressed.js'));
const compress = (m => m.__esModule ? /* istanbul ignore next */ m.default : /* istanbul ignore next */ m)(require('./compress.js'));

compressed.add('.svg');

/**
 * Create a file after minifying it via `svgo`.
 * @param {string} source The source SVG file to minify.
 * @param {string} dest The minified destination file.
 * @param {Options} [options] Options to deal with extra computation.
 * @return {Promise<string>} A promise that resolves with the destination file.
 */
module.exports = (source, dest, /* istanbul ignore next */ options = {}) =>
  new Promise((res, rej) => {
    readFile(source, (err, file) => {
      if (err)
        rej(err);
      else {
        (new SVGO).optimize(file).then(
          ({data}) => {
            writeFile(dest, data, err => {
              if (err)
                rej(err);
              else if (options.createFiles)
                compress(source, dest, 'text', options)
                  .then(() => res(dest), rej);
              else
                res(dest);
            });
          },
          rej
        );
      }
    });
  });
