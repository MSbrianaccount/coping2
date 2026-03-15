const fs = require('fs');
const path = require('path');

// list of libraries we need to vendor. if the file is present inside
// node_modules (e.g. socket.io client) we simply copy it; React's npm
// package no longer includes the UMD build, so in that case we supply a
// url that will be fetched at build-time and cached locally.
const libs = [
  {
    src: 'node_modules/react/umd/react.production.min.js',
    url: 'https://unpkg.com/react@18/umd/react.production.min.js',
    dest: 'vendor/react.production.min.js'
  },
  {
    src: 'node_modules/react-dom/umd/react-dom.production.min.js',
    url: 'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
    dest: 'vendor/react-dom.production.min.js'
  },
  {
    src: 'node_modules/socket.io/client-dist/socket.io.min.js',
    url: 'https://cdn.socket.io/4.7.2/socket.io.min.js',
    dest: 'vendor/socket.io.min.js'
  }
];

libs.forEach(l => {
  const src = path.resolve(__dirname, '..', l.src);
  const dest = path.resolve(__dirname, '..', l.dest);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
  } else if (l.url) {
    // download from CDN if not present locally
    const https = require('https');
    const { URL } = require('url');

    const download = (url, redirectCount = 0) => {
      if (redirectCount > 10) {
        console.warn('too many redirects for', url);
        return;
      }
      const file = fs.createWriteStream(dest);
      https.get(url, (res) => {
        if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
          const loc = res.headers.location;
          file.close();
          if (loc) {
            const nextUrl = new URL(loc, url).toString();
            download(nextUrl, redirectCount + 1);
          } else {
            console.warn('redirect with no location for', url);
          }
        } else if (res.statusCode === 200) {
          res.pipe(file);
        } else {
          console.warn('failed to download', url, res.statusCode);
          file.close();
        }
      }).on('error', (err) => {
        console.warn('error downloading', url, err);
      });
    };

    download(l.url);
  } else {
    console.warn('vendor source not found and no URL provided:', l);
  }
});

console.log('Vendor libraries copied to www/vendor');
