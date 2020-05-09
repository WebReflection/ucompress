'use strict';
const {readFile, writeFile} = require('fs');

const compressed = (m => m.__esModule ? /* istanbul ignore next */ m.default : /* istanbul ignore next */ m)(require('./compressed.js'));
const compress = (m => m.__esModule ? /* istanbul ignore next */ m.default : /* istanbul ignore next */ m)(require('./compress.js'));

compressed.add('.json');

const {parse, stringify} = JSON;

/**
 * Copy a source file into a destination.
 * @param {string} source The source file to copy.
 * @param {string} dest The destination file.
 * @param {Options} [options] Options to deal with extra computation.
 * @return {Promise<string>} A promise that resolves with the destination file.
 */
module.exports = (source, dest, /* istanbul ignore next */ options = {}) =>
  new Promise((res, rej) => {
    readFile(source, (err, data) => {
      /* istanbul ignore if */
      if (err)
        rej(err);
      else {
        /* istanbul ignore next */
        try {
          writeFile(dest, stringify(parse(data.toString())), err => {
            if (err)
              rej(err);
            else if (options.createFiles) {
              compress(source, dest, 'text', options)
                .then(() => res(dest), rej);
            }
          });
        }
        catch (err) {
          rej(err);
        }
      }
    });
  });
