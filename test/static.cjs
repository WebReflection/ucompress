const {fork, isMaster} = require('cluster');
const {join} = require('path');
const os = require('os');

const express = require('express');
const compression = require('compression');

const {length} = os.cpus();

if (isMaster) {
  for (var i = 0; i < length; i++)
    fork().on('exit', (worker, code, signal) => {
      console.log(`worker ${worker.process.pid} died`);
    });
}
else {
  const app = express();
  app.use(compression());
  app.use(express.static(join(__dirname, 'source')));
  app.listen(8080);
}
