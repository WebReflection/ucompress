'use strict';
const {readFile, writeFile} = require('fs');

const csso = (m => m.__esModule ? /* istanbul ignore next */ m.default : /* istanbul ignore next */ m)(require('csso'));

const compressed = (m => m.__esModule ? /* istanbul ignore next */ m.default : /* istanbul ignore next */ m)(require('./compressed.js'));
const compress = (m => m.__esModule ? /* istanbul ignore next */ m.default : /* istanbul ignore next */ m)(require('./compress.js'));

compressed.add('.css');

/**
 * Create a file after minifying via `csso`.
 * @param {string} source The source CSS file to minify.
 * @param {string} dest The minified destination file.
 * @param {Options} [options] Options to deal with extra computation.
 * @return {Promise<string>} A promise that resolves with the destination file.
 */
module.exports = (source, dest, options = {}) => new Promise((res, rej) => {
  readFile(source, (err, data) => {
    if (err)
      rej(err);
    else {
      // csso apparently has no way to detect errors
      writeFile(dest, csso.minify(data).css, err => {
        if (err)
          rej(err);
        else if (options.createFiles)
          compress(source, dest, 'text', options)
            .then(() => res(dest), rej);
        else
          res(dest);
      });
    }
  });
});
