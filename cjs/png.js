'use strict';
const {execFile} = require('child_process');
const {copyFile} = require('fs');

const pngquant = (m => m.__esModule ? /* istanbul ignore next */ m.default : /* istanbul ignore next */ m)(require('pngquant-bin'));

const headers = (m => m.__esModule ? /* istanbul ignore next */ m.default : /* istanbul ignore next */ m)(require('./headers.js'));

const pngquantArgs = ['--skip-if-larger', '--speed', '1', '-f', '-o'];

/**
 * Create a file after optimizing via `pngquant`.
 * @param {string} source The source PNG file to optimize.
 * @param {string} dest The optimized destination file.
 * @param {Options} [options] Options to deal with extra computation.
 * @return {Promise<string>} A promise that resolves with the destination file.
 */
module.exports = (source, dest, /* istanbul ignore next */ options = {}) =>
  new Promise((res, rej) => {
    execFile(pngquant, pngquantArgs.concat(dest, source), err => {
      if (err) {
        copyFile(source, dest, err => {
          if (err)
            rej(err);
          else if (options.createFiles)
            headers(dest, options.headers).then(() => res(dest), rej);
          else
            res(dest);
        });
      }
      else if (options.createFiles)
        headers(dest, options.headers).then(() => res(dest), rej);
      else
        res(dest);
    });
  });
