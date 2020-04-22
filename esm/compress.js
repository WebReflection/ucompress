import {createHash} from 'crypto';
import {
  createReadStream, createWriteStream,
  statSync, readFileSync, writeFileSync
} from 'fs';
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
  const dest = source + '.brotli';
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
    createWriteStream(dest),
    err => {
      /* istanbul ignore next */
      if (err)
        rej(err);
      else {
        writeFileSync(dest + '.etag', etag(dest, true));
        res();
      }
    }
  );
});

const deflate = source => new Promise((res, rej) => {
  const dest = source + '.deflate';
  pipeline(
    createReadStream(source),
    createDeflate({
      level: Z_BEST_COMPRESSION
    }),
    createWriteStream(dest),
    err => {
      /* istanbul ignore next */
      if (err)
        rej(err);
      else {
        writeFileSync(dest + '.etag', etag(dest, true));
        res();
      }
    }
  );
});

const etag = (source, binary) => {
  const file = readFileSync(source);
  return `"${
    file.length.toString(16)
  }-${
    createHash('sha1')
      .update(file, 'utf8')
      .digest('base64')
      .substring(0, 27)
  }-${
    binary ? 'b' : 'a'
  }"`;
};

const gzip = source => new Promise((res, rej) => {
  const dest = source + '.gzip';
  pipeline(
    createReadStream(source),
    createGzip({
      level: Z_BEST_COMPRESSION
    }),
    createWriteStream(dest),
    err => {
      /* istanbul ignore next */
      if (err)
        rej(err);
      else {
        writeFileSync(dest + '.etag', etag(dest, true));
        res();
      }
    }
  );
});

export default (source, mode) => Promise.all([
  brotli(source, mode),
  deflate(source),
  gzip(source)
]).then(() => {
  writeFileSync(source + '.etag', etag(source, false));
});
