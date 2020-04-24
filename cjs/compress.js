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

const br = (source, mode) => new Promise((res, rej) => {
  const dest = source + '.br';
  stat(source, (err, stats) => {
    /* istanbul ignore next */
    if (err) rej(err);
    else pipeline(
      createReadStream(source),
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
        if (err) rej(err);
        else res(dest);
      }
    );
  });
});

const deflate = source => new Promise((res, rej) => {
  const dest = source + '.deflate';
  pipeline(
    createReadStream(source),
    createDeflate(zlibDefaultOptions),
    createWriteStream(dest),
    err => {
      /* istanbul ignore next */
      if (err) rej(err);
      else res(dest);
    }
  );
});

const gzip = source => new Promise((res, rej) => {
  const dest = source + '.gzip';
  pipeline(
    createReadStream(source),
    createGzip(zlibDefaultOptions),
    createWriteStream(dest),
    err => {
      /* istanbul ignore next */
      if (err) rej(err);
      else res(dest);
    }
  );
});

module.exports = (source, dest, mode, options) => Promise.all([
    br(dest, mode),
    gzip(dest),
    deflate(dest)
]).then(([br, gzip, deflate]) => Promise.all([
  headers(source, dest, options.headers),
  headers(source, br, {
    ...options.headers,
    'Content-Encoding': 'br'
  }),
  headers(source, gzip, {
    ...options.headers,
    'Content-Encoding': 'gzip'
  }),
  headers(source, deflate, {
    ...options.headers,
    'Content-Encoding': 'deflate'
  })
]));
