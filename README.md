# <em>µ</em>compress

[![Build Status](https://travis-ci.com/WebReflection/ucompress.svg?branch=master)](https://travis-ci.com/WebReflection/ucompress) [![Coverage Status](https://coveralls.io/repos/github/WebReflection/ucompress/badge.svg?branch=master)](https://coveralls.io/github/WebReflection/ucompress?branch=master)

A <em>micro</em>, all-in-one, compressor for common Web files.

```js
import ucompress from 'ucompress';
// const ucompress = require('ucompress');

// automatic extension => compression
ucompress(source, dest).then(dest => console.log(dest));

// explicit compression
ucompress.html(source, dest).then(dest => console.log(dest));

// handy fallback
ucompress.copy(source, dest).then(dest => console.log(dest));
```

### Compressions

  * **css** files via [csso](https://www.npmjs.com/package/csso)
  * **gif** files via [gifsicle](https://www.npmjs.com/package/gifsicle)
  * **html** files via [html-minifier](https://www.npmjs.com/package/html-minifier)
  * **jpg** or **jpeg** files via [jpegtran-bin](https://www.npmjs.com/package/jpegtran-bin)
  * **js** files via [uglify-es](https://www.npmjs.com/package/uglify-es)
  * **png** files via [pngquant-bin](https://www.npmjs.com/package/pngquant-bin)
  * **svg** files via [svgo](https://www.npmjs.com/package/svgo)
  * **xml** files via [html-minifier](https://www.npmjs.com/package/html-minifier)

Each file will automatically generate its own related `.json` file which includes a [RFC-7232](https://tools.ietf.org/html/rfc7232#section-2.3.3) compliant _ETag_, among other details such as `last-modified`, `content-type`, and `content-length`.

### Brotli, Deflate, and GZip

The following file extensions, available via the `ucompress.encoded` _set_ too, will create their `.br`, `.deflate`, and `.gzip` version in the destination folder, plus their own `.json` file, per each different compression, **only** if the method received an option with `{createFile: true}`.

  * **.css**
  * **.html**
  * **.js**
  * **.json**
  * **.md**
  * **.svg**
  * **.txt**
  * **.woff2**
  * **.xml**
  * **.yml**

Incompatible files will fallback as regular copy `source` into `dest` when the module is used as callback, without creating any optimized version.

### Micro CDN

The `ucompress.cdn` accepts a configuration object with a `source` path, an optional `dest` which fallbacks to the _temp_ folder, and eventually extra `headers` property to pollute headers via `allow-origin` or other things.

#### CDN Example

The following example will serve every file within any folder in the `source` directory, automatically optimizing on demand all operations, including the creation of _brotli_, _gzip_, or _deflate_.

```js
import {createServer} from 'http';
import {join} from 'path';

import umeta from 'umeta';
const {dirName} = umeta(import.meta);

import ucompress from 'ucompress';
const callback = ucompress.cdn({
  source: join(dirName, 'source'),
  // dest: join(dirName, 'dest')
});

createServer(callback).listen(8080);
```

The callback works with _Express_ too, and similar modules, where all non existent files in the source folder will be ignored, and anything else will execute regularly.

```js
const {join} = require('path');

const express = require('express');
const {cdn} = require('ucompress');

const app = express();
app.use(cdn({
  source: join(__dirname, 'source'),
  dest: join(__dirname, 'dest')
}));
app.get('/unknown', (req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('OK');
});
app.listen(8080);

```

#### Performance

When used as CDN, the compression is done once per static asset, and never more than once. This reduces both RAM and CPU overhead in the long run, but it is slower than express static and compressed outcome the first time a file not compressed yet is reached.

However, once the cache is ready, `ucompress.cdn` is _1.2x_ up to _2.5x_ faster than express with static and compress.
