const {createServer} = require('http');
const {join} = require('path');

const {cdn} = require('../cjs');
const callback = cdn({
  source: join(__dirname, 'source'),
  // dest: join(__dirname, 'dest')
});

createServer(callback).listen(8080);
