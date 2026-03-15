const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'index_react.html');
let html = fs.readFileSync(file,'utf8');
const parts = html.split('<div id="root"></div>');
if(parts.length < 2){
  console.error('root placeholder not found');
} else {
  const head = parts[0];
  const tail = parts[1];
  // keep closing body and html from tail
  const closingIndex = tail.indexOf('</body>');
  const closing = closingIndex !== -1 ? tail.slice(closingIndex) : '</body>\n</html>';
  const newBody = `
  <div id="root"></div>

  <!-- Load utilities first -->
  <script src="src/auth/passwordAuthManager.js"></script>
  <script src="src/utils/databaseManager.js"></script>

  <!-- Load React -->
  <script src="vendor/react.production.min.js"></script>
  <script src="vendor/react-dom.production.min.js"></script>

  <!-- Socket.io client -->
  <script src="vendor/socket.io.min.js"></script>

  <!-- Application bundle -->
  <script src="app.bundle.js"></script>

  <!-- Service worker registration only over http/https -->
  <script>
    if ('serviceWorker' in navigator && location.protocol && (location.protocol.startsWith('http') || location.protocol.startsWith('https'))) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then(reg => console.log('Service Worker registered.'))
          .catch(err => console.warn('Service Worker registration failed:', err));
      });
    }
  </script>

  ${closing}`;
  fs.writeFileSync(file, head + newBody);
  console.log('HTML rewritten with bundled scripts');
}
