const {fork, isMaster} = require('cluster');
const {join} = require('path');
const os = require('os');

const express = require('express');
const {cdn} = require('../cjs');

const {length} = os.cpus();

if (isMaster) {
  for (var i = 0; i < length; i++)
    fork().on('exit', (worker, code, signal) => {
      console.log(`worker ${worker.process.pid} died`);
    });
}
else {
  const app = express();
  app.use(cdn({
    source: join(__dirname, 'source'),
    dest: join(__dirname, 'dest')
  }));
  app.listen(8080);
}
