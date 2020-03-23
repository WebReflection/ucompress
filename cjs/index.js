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

const ucompress = (source, dest) => {
  const method = extname(source).toLowerCase().slice(1);
  return (ucompress[method] || ucompress.copy)(source, dest);
};

ucompress.css = (source, dest) => new Promise((res, rej) => {
  readFile(source, (err, data) => {
    if (err)
      rej(err);
    else {
      // csso apparently has no way to detect errors
      writeFile(dest, csso.minify(data).css, err => {
        /* istanbul ignore next */
        err ? rej(err) : res(dest);
      });
    }
  });
});

ucompress.copy = (source, dest) => new Promise((res, rej) => {
  copyFile(source, dest, err => {
    err ? rej(err) : res(dest);
  });
});

ucompress.gif = (source, dest) => new Promise((res, rej) => {
  execFile(gifsicle, ['-o', dest, source], err => {
    err ? rej(err) : res(dest);
  });
});

ucompress.html = (source, dest) => new Promise((res, rej) => {
  readFile(source, (err, data) => {
    if (err)
      rej(err);
    else {
      try {
        writeFile(dest, html.minify(data.toString(), htmlArgs), err => {
          /* istanbul ignore next */
          err ? rej(err) : res(dest);
        });
      }
      catch (error) {
        rej(error);
      }
    }
  });
});

ucompress.jpg = (source, dest) => new Promise((res, rej) => {
  execFile(jpegtran, jpegtranArgs.concat(dest, source), err => {
    err ? rej(err) : res(dest);
  });
});

ucompress.jpeg = ucompress.jpg;

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
          /* istanbul ignore next */
          err ? rej(err) : res(dest);
        });
      }
    }
  });
});

ucompress.png = (source, dest) => new Promise((res, rej) => {
  execFile(pngquant, pngquantArgs.concat(dest, source), err => {
    if (err) {
      copyFile(source, dest, err => {
        err ? rej(err) : res(dest);
      });
    }
    else
      res(dest);
  });
});

ucompress.svg = (source, dest) => new Promise((res, rej) => {
  readFile(source, (err, data) => {
    if (err)
      rej(err);
    else {
      const svgo = new SVGO;
      svgo.optimize(data).then(
        ({data}) => {
          writeFile(dest, data, err => {
            /* istanbul ignore next */
            err ? rej(err) : res(dest);
          });
        },
        rej
      );
    }
  });
});

module.exports = ucompress;
