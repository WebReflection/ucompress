'use strict';
/**
 * A list of all extensions that will be compressed via brotli and others.
 * Every other file will simply be served as is (likely binary).
 */
module.exports = [
  '.css',
  '.html',
  '.js',
  '.md',
  '.svg',
  '.txt',
  '.woff2'
];
