import {execFile} from 'child_process';
import {copyFile, readFile, writeFile} from 'fs';
import {extname} from 'path';

import csso from 'csso';

import gifsicle from 'gifsicle';

import html from 'html-minifier';
const htmlArgs = {
  collapseWhitespace: true,
  html5: true,
  removeAttributeQuotes: true,
  removeComments: true
};

import jpegtran from 'jpegtran-bin';
const jpegtranArgs = ['-progressive', '-optimize', '-outfile'];

import pngquant from 'pngquant-bin';
const pngquantArgs = ['--skip-if-larger', '--speed', '1', '-f', '-o'];

import uglify from 'uglify-es';
const uglifyArgs = {output: {comments: /^!/}};

import SVGO from 'svgo';

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

export default ucompress;
