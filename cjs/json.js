'use strict';
const {readFile, writeFile} = require('fs');

const compressed = (m => /* c8 ignore start */ m.__esModule ? m.default : m /* c8 ignore stop */)(require('./compressed.js'));
const compress = (m => /* c8 ignore start */ m.__esModule ? m.default : m /* c8 ignore stop */)(require('./compress.js'));

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
          const content = options.noMinify || !/[\r\n]\s/.test(data) ?
                            data : stringify(parse(data.toString()));
          writeFile(dest, content, err => {
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
