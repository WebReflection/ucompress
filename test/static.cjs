const {join} = require('path');
const express = require('express');
const compression = require('compression');

const app = express();
app.use(compression());
app.use(express.static(join(__dirname, 'source')));
app.listen(8080);
