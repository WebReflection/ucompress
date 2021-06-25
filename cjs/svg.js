'use strict';
const {readFile, writeFile} = require('fs');

const {optimize} = require('svgo');

const compressed = (m => /* c8 ignore start */ m.__esModule ? m.default : m /* c8 ignore stop */)(require('./compressed.js'));
const compress = (m => /* c8 ignore start */ m.__esModule ? m.default : m /* c8 ignore stop */)(require('./compress.js'));

compressed.add('.svg');

/**
 * Create a file after minifying it via `svgo`.
 * @param {string} source The source SVG file to minify.
 * @param {string} dest The minified destination file.
 * @param {Options} [options] Options to deal with extra computation.
 * @return {Promise<string>} A promise that resolves with the destination file.
 */
module.exports = (source, dest, options = {}) =>
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
