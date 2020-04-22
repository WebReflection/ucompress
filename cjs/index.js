'use strict';
const {execFile} = require('child_process');
const {copyFile, readFile, writeFile} = require('fs');
const {extname} = require('path');

const csso = (m => m.__esModule ? /* istanbul ignore next */ m.default : /* istanbul ignore next */ m)(require('csso'));

const gifsicle = (m => m.__esModule ? /* istanbul ignore next */ m.default : /* istanbul ignore next */ m)(require('gifsicle'));

const html = (m => m.__esModule ? /* istanbul ignore next */ m.default : /* istanbul ignore next */ m)(require('html-minifier'));
const htmlArgs = {
  collapseWhitespace: true,
  html5: true,
  removeAttributeQuotes: true,
  removeComments: true
};

const jpegtran = (m => m.__esModule ? /* istanbul ignore next */ m.default : /* istanbul ignore next */ m)(require('jpegtran-bin'));
const jpegtranArgs = ['-progressive', '-optimize', '-outfile'];

const pngquant = (m => m.__esModule ? /* istanbul ignore next */ m.default : /* istanbul ignore next */ m)(require('pngquant-bin'));
const pngquantArgs = ['--skip-if-larger', '--speed', '1', '-f', '-o'];

const uglify = (m => m.__esModule ? /* istanbul ignore next */ m.default : /* istanbul ignore next */ m)(require('uglify-es'));
const uglifyArgs = {output: {comments: /^!/}};

const SVGO = (m => m.__esModule ? /* istanbul ignore next */ m.default : /* istanbul ignore next */ m)(require('svgo'));

const {compress, headers} = require('./compress.js');

const writeHeaders = (dest, res, rej) => {
  writeFile(dest + '.json', headers(dest), err => {
    /* istanbul ignore next */
    err ? rej(err) : res(dest);
  });
};

/**
 * Create a file after minifying or optimizing it, when possible.
 * @param {string} source The source file to optimize.
 * @param {string} dest The optimized destination file.
 * @return {Promise<string>} A promise that resolves with the destination file.
 */
const ucompress = (source, dest) => {
  const method = extname(source).toLowerCase().slice(1);
  return (ucompress[method] || ucompress.copy)(source, dest);
};

/**
 * Create a file after minifying via `csso`.
 * @param {string} source The source CSS file to minify.
 * @param {string} dest The minified destination file.
 * @return {Promise<string>} A promise that resolves with the destination file.
 */
ucompress.css = (source, dest) => new Promise((res, rej) => {
  readFile(source, (err, data) => {
    if (err)
      rej(err);
    else {
      // csso apparently has no way to detect errors
      writeFile(dest, csso.minify(data).css, err => {
        err ? rej(err) : compress(dest, 'text').then(() => res(dest), rej);
      });
    }
  });
});

/**
 * Copy a source file into a destination.
 * @param {string} source The source file to copy.
 * @param {string} dest The destination file.
 * @return {Promise<string>} A promise that resolves with the destination file.
 */
ucompress.copy = (source, dest) => new Promise((res, rej) => {
  copyFile(source, dest, err => {
    if (err)
      rej(err);
    else {
      switch (extname(source)) {
        /* istanbul ignore next */
        case '.csv':
          /* istanbul ignore next */
        case '.md':
        case '.txt':
          compress(dest, 'text').then(() => res(dest), rej);
          break;
        case '.woff2':
          compress(dest, 'font').then(() => res(dest), rej);
          break;
        default:
          writeHeaders(dest, res, rej);
          break;
      }
    }
  });
});

/**
 * Create a file after optimizing via `gifsicle`.
 * @param {string} source The source GIF file to optimize.
 * @param {string} dest The optimized destination file.
 * @return {Promise<string>} A promise that resolves with the destination file.
 */
ucompress.gif = (source, dest) => new Promise((res, rej) => {
  execFile(gifsicle, ['-o', dest, source], err => {
    if (err)
      rej(err);
    else
      writeHeaders(dest, res, rej);
  });
});

/**
 * Create a file after minifying it via `html-minifier`.
 * @param {string} source The source HTML file to minify.
 * @param {string} dest The minified destination file.
 * @return {Promise<string>} A promise that resolves with the destination file.
 */
ucompress.html = (source, dest) => new Promise((res, rej) => {
  readFile(source, (err, data) => {
    if (err)
      rej(err);
    else {
      try {
        writeFile(dest, html.minify(data.toString(), htmlArgs), err => {
          err ? rej(err) : compress(dest, 'text').then(() => res(dest), rej);
        });
      }
      catch (error) {
        rej(error);
      }
    }
  });
});

/**
 * Create a file after optimizing via `jpegtran`.
 * @param {string} source The source JPG/JPEG file to optimize.
 * @param {string} dest The optimized destination file.
 * @return {Promise<string>} A promise that resolves with the destination file.
 */
ucompress.jpg = (source, dest) => new Promise((res, rej) => {
  execFile(jpegtran, jpegtranArgs.concat(dest, source), err => {
    if (err)
      rej(err);
    else
      writeHeaders(dest, res, rej);
  });
});

/**
 * Create a file after optimizing via `jpegtran`.
 * @param {string} source The source JPG/JPEG file to optimize.
 * @param {string} dest The optimized destination file.
 * @return {Promise<string>} A promise that resolves with the destination file.
 */
ucompress.jpeg = ucompress.jpg;

/**
 * Create a file after minifying it via `uglify-es`.
 * @param {string} source The source JS file to minify.
 * @param {string} dest The minified destination file.
 * @return {Promise<string>} A promise that resolves with the destination file.
 */
ucompress.js = (source, dest) => new Promise((res, rej) => {
  readFile(source, (err, data) => {
    if (err)
      rej(err);
    else {
      const {code, error} = uglify.minify(data.toString(), uglifyArgs);
      if (error)
        rej(error);
      else {
        writeFile(dest, code, err => {
          err ? rej(err) : compress(dest, 'text').then(() => res(dest), rej);
        });
      }
    }
  });
});

/**
 * Create a file after optimizing via `pngquant`.
 * @param {string} source The source PNG file to optimize.
 * @param {string} dest The optimized destination file.
 * @return {Promise<string>} A promise that resolves with the destination file.
 */
ucompress.png = (source, dest) => new Promise((res, rej) => {
  execFile(pngquant, pngquantArgs.concat(dest, source), err => {
    if (err) {
      copyFile(source, dest, err => {
        if (err)
          rej(err);
        else
          writeHeaders(dest, res, rej);
      });
    }
    else
      writeHeaders(dest, res, rej);
  });
});

/**
 * Create a file after minifying it via `svgo`.
 * @param {string} source The source SVG file to minify.
 * @param {string} dest The minified destination file.
 * @return {Promise<string>} A promise that resolves with the destination file.
 */
ucompress.svg = (source, dest) => new Promise((res, rej) => {
  readFile(source, (err, data) => {
    if (err)
      rej(err);
    else {
      const svgo = new SVGO;
      svgo.optimize(data).then(
        ({data}) => {
          writeFile(dest, data, err => {
            err ? rej(err) : compress(dest, 'text').then(() => res(dest), rej);
          });
        },
        rej
      );
    }
  });
});

module.exports = ucompress;
