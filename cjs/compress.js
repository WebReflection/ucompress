'use strict';
const {createReadStream, createWriteStream, stat} = require('fs');
const {pipeline} = require('stream');
const zlib = (m => m.__esModule ? /* istanbul ignore next */ m.default : /* istanbul ignore next */ m)(require('zlib'));

const headers = (m => m.__esModule ? /* istanbul ignore next */ m.default : /* istanbul ignore next */ m)(require('./headers.js'));

const {
  BROTLI_MAX_QUALITY,
  BROTLI_MODE_GENERIC,
  BROTLI_MODE_FONT,
  BROTLI_MODE_TEXT,
  BROTLI_PARAM_MODE,
  BROTLI_PARAM_QUALITY,
  BROTLI_PARAM_SIZE_HINT,
  Z_BEST_COMPRESSION
} = zlib.constants;

const {
  createBrotliCompress,
  createDeflate,
  createGzip
} = zlib;

const zlibDefaultOptions = {
  level: Z_BEST_COMPRESSION
};

const br = (source, target, options, mode) => new Promise((res, rej) => {
  const dest = target + '.br';
  stat(target, (err, stats) => {
    /* istanbul ignore next */
    if (err) rej(err);
    else pipeline(
      createReadStream(target),
      createBrotliCompress({
        [BROTLI_PARAM_SIZE_HINT]: stats.size,
        [BROTLI_PARAM_QUALITY]: BROTLI_MAX_QUALITY,
        [BROTLI_PARAM_MODE]: mode == 'text' ?
          BROTLI_MODE_TEXT : (
            mode === 'font' ?
              BROTLI_MODE_FONT :
              /* istanbul ignore next */
              BROTLI_MODE_GENERIC
          )
      }),
      createWriteStream(dest),
      err => {
        /* istanbul ignore next */
        if (err)
          rej(err);
        else {
          headers(source, dest, {
            ...options.headers,
            'Content-Encoding': 'br'
          }).then(res, rej);
        }
      }
    );
  });
});

const deflate = (source, target, options) => new Promise((res, rej) => {
  const dest = target + '.deflate';
  pipeline(
    createReadStream(target),
    createDeflate(zlibDefaultOptions),
    createWriteStream(dest),
    err => {
      /* istanbul ignore next */
      if (err)
        rej(err);
      else {
        headers(source, dest, {
          ...options.headers,
          'Content-Encoding': 'deflate'
        }).then(res, rej);
      }
    }
  );
});

const gzip = (source, target, options) => new Promise((res, rej) => {
  const dest = target + '.gzip';
  pipeline(
    createReadStream(target),
    createGzip(zlibDefaultOptions),
    createWriteStream(dest),
    err => {
      /* istanbul ignore next */
      if (err)
        rej(err);
      else {
        headers(source, dest, {
          ...options.headers,
          'Content-Encoding': 'gzip'
        }).then(res, rej);
      }
    }
  );
});

module.exports = (source, dest, mode, options) => Promise.all([
    headers(source, dest, options.headers),
    br(source, dest, options, mode),
    deflate(source, dest, options),
    gzip(source, dest, options)
]);
