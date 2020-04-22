import {createReadStream, createWriteStream, statSync} from 'fs';
import {pipeline} from 'stream';
import zlib from 'zlib';

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

const brotli = (source, mode) => new Promise((res, rej) => {
  pipeline(
    createReadStream(source),
    createBrotliCompress({
      [BROTLI_PARAM_SIZE_HINT]: statSync(source).size,
      [BROTLI_PARAM_QUALITY]: BROTLI_MAX_QUALITY,
      [BROTLI_PARAM_MODE]: mode == 'text' ?
        BROTLI_MODE_TEXT : (
          mode === 'font' ?
            BROTLI_MODE_FONT :
            /* istanbul ignore next */
            BROTLI_MODE_GENERIC
        )
    }),
    createWriteStream(source + '.brotli'),
    err => {
      /* istanbul ignore next */
      err ? rej(err) : res();
    }
  );
});

const deflate = source => new Promise((res, rej) => {
  pipeline(
    createReadStream(source),
    createDeflate({
      level: Z_BEST_COMPRESSION
    }),
    createWriteStream(source + '.deflate'),
    err => {
      /* istanbul ignore next */
      err ? rej(err) : res();
    }
  );
});

const gzip = source => new Promise((res, rej) => {
  pipeline(
    createReadStream(source),
    createGzip({
      level: Z_BEST_COMPRESSION
    }),
    createWriteStream(source + '.gzip'),
    err => {
      /* istanbul ignore next */
      err ? rej(err) : res();
    }
  );
});

export default (source, mode) => Promise.all([
  brotli(source, mode),
  deflate(source),
  gzip(source)
]);
