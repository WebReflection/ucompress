'use strict';
const {execFile} = require('child_process');
const {unlink, write} = require('fs');

const jpegtran = (m => m.__esModule ? /* istanbul ignore next */ m.default : /* istanbul ignore next */ m)(require('jpegtran-bin'));
const sharp = (m => m.__esModule ? /* istanbul ignore next */ m.default : /* istanbul ignore next */ m)(require('sharp'));

const headers = (m => m.__esModule ? /* istanbul ignore next */ m.default : /* istanbul ignore next */ m)(require('./headers.js'));
const blur = (m => m.__esModule ? /* istanbul ignore next */ m.default : /* istanbul ignore next */ m)(require('./preview.js'));

const fit = sharp.fit.inside;
const withoutEnlargement = true;

const optimize = (args, source, dest) => new Promise((res, rej) => {
  execFile(jpegtran, args.concat(dest, source), err => {
    if (err) rej(err);
    else res(dest);
  });
});

/**
 * Create a file after optimizing via `jpegtran`.
 * @param {string} source The source JPG/JPEG file to optimize.
 * @param {string} dest The optimized destination file.
 * @param {Options} [options] Options to deal with extra computation.
 * @return {Promise<string>} A promise that resolves with the destination file.
 */
module.exports = (source, dest, /* istanbul ignore next */ options = {}) =>
  new Promise((res, rej) => {
    const {maxWidth: width, maxHeight: height, createFiles, preview} = options;
    const done = () => res(dest);
    const walkThrough = () => {
      if (createFiles)
        writeHeaders(dest).then(
          () => {
            if (preview)
              blur(dest).then(dest => writeHeaders(dest).then(done, rej), rej);
            else
              done();
          },
          rej
        );
      /* istanbul ignore next */ 
      else if (preview) blur(dest).then(done, rej);
      else done();
    };
    const writeHeaders = dest => headers(source, dest, options.headers);
    const args = preview ? [] : ['-progressive'];
    args.push('-optimize', '-outfile');
    if (width || height) {
      sharp(source)
        .resize({width, height, fit, withoutEnlargement})
        .toFile(`${dest}.resized.jpg`)
        .then(
          () => optimize(args, `${dest}.resized.jpg`, dest).then(
            () => {
              unlink(`${dest}.resized.jpg`, err => {
                /* istanbul ignore if */
                if (err) rej(err);
                else walkThrough();
              });
            },
            rej
          ),
          rej
        )
      ;
    }
    else
      optimize(args, source, dest).then(walkThrough, rej);
  });
