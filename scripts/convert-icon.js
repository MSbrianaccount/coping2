const fs = require('fs');
const path = require('path');
const pngToIco = require('png-to-ico');

const src = path.join(__dirname, '..', 'assets', 'silvertech_logo.png');
const out = path.join(__dirname, '..', 'assets', 'silvertech_logo.ico');

if (!fs.existsSync(src)) {
  console.error('Source PNG not found:', src);
  process.exit(2);
}

pngToIco(src)
  .then(buf => {
    fs.writeFileSync(out, buf);
    console.log('Wrote ICO:', out);
  })
  .catch(err => {
    console.error('Conversion failed:', err && err.message ? err.message : err);
    process.exit(1);
  });
