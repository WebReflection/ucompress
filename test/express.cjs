const {join} = require('path');

const express = require('express');
const {cdn} = require('../cjs');

const app = express();
app.use(cdn({
  source: join(__dirname, 'source'),
  dest: join(__dirname, 'dest')
}));
app.listen(8080);
