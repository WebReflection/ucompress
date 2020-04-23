const {fork, isMaster} = require('cluster');
const {createServer} = require('http');
const {join} = require('path');
const os = require('os');

const {cdn} = require('../cjs');
const callback = cdn({
  source: join(__dirname, 'source'),
  dest: join(__dirname, 'dest')
});

const {length} = os.cpus();

if (isMaster) {
  for (var i = 0; i < length; i++)
    fork().on('exit', (worker, code, signal) => {
      console.log(`worker ${worker.process.pid} died`);
    });
}
else
  createServer(callback).listen(8080);
