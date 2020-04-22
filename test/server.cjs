const {createReadStream, readFile} = require('fs');
const {createServer} = require('http');
const {extname, join} = require('path');

const {encoded} = require('../cjs');

const {parse} = JSON;

const FOLDER = join(__dirname, 'dest');

createServer((req, res) => {
  const {url} = req;
  const q = url.indexOf('?');
  let asset = join(FOLDER, q < 0 ? url : url.slice(0, q));
  const compressed = encoded.includes(extname(asset));
  const {
    ['accept-encoding']: AcceptEncoding,
    ['if-modified-since']: IfModifiedSince,
    ['if-none-match']: IfNoneMatch
  } = req.headers;
  if (compressed) {
    switch (true) {
      case /\bbr\b/.test(AcceptEncoding):
        asset += '.br';
        break;
      case /\bgzip\b/.test(AcceptEncoding):
        asset += '.gzip';
        break;
      case /\bdeflate\b/.test(AcceptEncoding):
        asset += '.deflate';
        break;
    }
  }
  readFile(asset + '.json', (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end();
    }
    else {
      const headers = parse(data);
      const {Etag, ['Last-Modified']: LastModified} = headers;
      if (Etag === IfNoneMatch && LastModified === IfModifiedSince) {
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
