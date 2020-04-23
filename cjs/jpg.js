'use strict';
const {execFile} = require('child_process');

const jpegtran = (m => m.__esModule ? /* istanbul ignore next */ m.default : /* istanbul ignore next */ m)(require('jpegtran-bin'));

const headers = (m => m.__esModule ? /* istanbul ignore next */ m.default : /* istanbul ignore next */ m)(require('./headers.js'));

const jpegtranArgs = ['-progressive', '-optimize', '-outfile'];

/**
 * Create a file after optimizing via `jpegtran`.
 * @param {string} source The source JPG/JPEG file to optimize.
 * @param {string} dest The optimized destination file.
 * @param {Options} [options] Options to deal with extra computation.
 * @return {Promise<string>} A promise that resolves with the destination file.
 */
module.exports = (source, dest, /* istanbul ignore next */ options = {}) =>
  new Promise((res, rej) => {
    execFile(jpegtran, jpegtranArgs.concat(dest, source), err => {
      if (err)
        rej(err);
      else
        headers(dest, options.headers).then(() => res(dest), rej);
    });
  });
