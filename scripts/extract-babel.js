const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'index_react.html');
const outPath = path.join(__dirname, '..', 'src', 'app.jsx');

try {
  const html = fs.readFileSync(htmlPath, 'utf8');
  const m = html.match(/<script type="text\/babel">([\s\S]*?)<\/script>/);
  if (m) {
    fs.writeFileSync(outPath, m[1]);
    console.log('extracted script into', outPath);
  } else {
    console.log('no inline babel script found');
  }
} catch (e) {
  console.error('error extracting', e);
}
