'use strict';
const {copyFile} = require('fs');
const {extname} = require('path');

const compressed = (m => /* c8 ignore start */ m.__esModule ? m.default : m /* c8 ignore stop */)(require('./compressed.js'));
const compress = (m => /* c8 ignore start */ m.__esModule ? m.default : m /* c8 ignore stop */)(require('./compress.js'));
const headers = (m => /* c8 ignore start */ m.__esModule ? m.default : m /* c8 ignore stop */)(require('./headers.js'));

compressed.add('.csv');
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
module.exports = (source, dest, /* istanbul ignore next */ options = {}) =>
  new Promise((res, rej) => {
    const onCopy = err => {
      if (err)
        rej(err);
      else if (options.createFiles) {
        const ext = extname(source);
        if (compressed.has(ext))
          compress(source, dest, ext === '.woff2' ? 'font' : 'text', options)
            .then(() => res(dest), rej);
        else
          headers(source, dest, options.headers)
            .then(() => res(dest), rej);
      }
      else
        res(dest);
    };
    if (source === dest)
      onCopy(null);
    else
      copyFile(source, dest, onCopy);
  });
