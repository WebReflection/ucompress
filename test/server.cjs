const {createReadStream, readFile} = require('fs');
const {createServer} = require('http');
const {extname, join} = require('path');

const ucompress = require('../cjs');

const {parse} = JSON;

const FOLDER = join(__dirname, 'dest');

createServer((req, res) => {
  let asset = join(FOLDER, req.url.split('?')[0]);
  const ext = extname(asset);
  const {
    ['accept-encoding']: acceptEncoding,
    ['if-modified-since']: ifModifiedSince,
    ['if-none-match']: ifNoneMatch
  } = req.headers;
  if (ucompress.encoded.includes(ext)) {
    const encoding = (acceptEncoding || '').split(/,\s*/);
    if (encoding.includes('br'))
      asset += '.br';
    else if (encoding.includes('gzip'))
      asset += '.gzip';
    else if (encoding.includes('deflate'))
      asset += '.deflate';
  }
  readFile(asset + '.json', (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end();
    }
    else {
      const headers = parse(data);
      const {Etag, ['Last-Modified']: LastModified} = headers;
      if (Etag === ifNoneMatch && LastModified === ifModifiedSince) {
        res.writeHead(304, {'Last-Modified': LastModified});
        res.end();
      }
      else {
        res.writeHead(200, headers);
        createReadStream(asset).pipe(res);
      }
    }
  });
}).listen(8080);
