'use strict';
const {execFile} = require('child_process');

const gifsicle = (m => m.__esModule ? /* istanbul ignore next */ m.default : /* istanbul ignore next */ m)(require('gifsicle'));

const headers = (m => m.__esModule ? /* istanbul ignore next */ m.default : /* istanbul ignore next */ m)(require('./headers.js'));

/**
 * Create a file after optimizing via `gifsicle`.
 * @param {string} source The source GIF file to optimize.
 * @param {string} dest The optimized destination file.
 * @param {Options} [options] Options to deal with extra computation.
 * @return {Promise<string>} A promise that resolves with the destination file.
 */
module.exports = (source, dest, /* istanbul ignore next */ options = {}) =>
  new Promise((res, rej) => {
    execFile(gifsicle, ['-o', dest, source], err => {
      if (err)
        rej(err);
      else if (options.createFiles)
        headers(dest, options.headers).then(() => res(dest), rej);
      else
        res(dest);
    });
  });
