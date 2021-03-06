'use strict';
const {unlink, write, copyFile} = require('fs');

const sharp = (m => /* c8 ignore start */ m.__esModule ? m.default : m /* c8 ignore stop */)(require('sharp'));

const headers = (m => /* c8 ignore start */ m.__esModule ? m.default : m /* c8 ignore stop */)(require('./headers.js'));
const blur = (m => /* c8 ignore start */ m.__esModule ? m.default : m /* c8 ignore stop */)(require('./preview.js'));

const fit = sharp.fit.inside;
const withoutEnlargement = true;

const optimize = (args, source, dest) => new Promise((res, rej) => {
  sharp(source).jpeg(args).toFile(dest).then(
    () => res(dest),
    () => {
      copyFile(source, dest, err => {
        /* istanbul ignore else */
        if (err) rej(err);
        else res(dest);
      });
    }
  );
});

/**
 * Create a file after optimizing via `sharp`.
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
    const args = {progressive: !preview};
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
