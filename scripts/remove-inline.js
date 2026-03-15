const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'index_react.html');
let lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
let out = [];
let inBlock = false;
for (let line of lines) {
  if (line.includes('<script type="text/babel">')) {
    out.push('  <!-- compiled application bundle -->');
    out.push('  <script src="app.bundle.js"></script>');
    inBlock = true;
    continue;
  }
  if (inBlock && line.includes('</script>')) {
    inBlock = false;
    continue;
  }
  // skip second service worker registration earlier in file left by previous change?
  if (line.trim().startsWith('// Register service worker for PWA') || line.trim().startsWith('navigator.serviceWorker.register')) {
    // also skip surrounding script tag
    continue;
  }
  out.push(line);
}
fs.writeFileSync(file, out.join('\n'));
console.log('Inline script removed, bundle tag inserted');
