/**
 * Mobile Web Server
 * Serves the RehabApp as a Progressive Web App (PWA) for mobile browsers and Capacitor
 */
const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const os = require('os');

function getLocalIps() {
  const nets = os.networkInterfaces();
  const results = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        results.push(net.address);
      }
    }
  }
  return results;
}

const PORT = process.env.PORT || 3000;
const SOCKET_PORT = process.env.SOCKET_PORT || 3001;

// Create Express app
const app = express();
const server = http.createServer(app);

// Configure Socket.IO for mobile
const io = new Server(server, {
  cors: { origin: '*' },
  transports: ['websocket', 'polling'] // Support both transports for mobile compatibility
});

// Middleware
app.use(express.static(path.join(__dirname)));
app.use(express.json());

// Track authenticated sockets
const authenticated = new Set();

// Socket.IO event handling
io.on('connection', (socket) => {
  console.log('[Mobile] Socket.io client connected:', socket.id);

  // Auto-authenticate for now (PIN auth handled in frontend)
  authenticated.add(socket.id);
  socket.emit('auth:ok');

  socket.on('progress:added', (data) => {
    socket.broadcast.emit('progress:update', data);
  });

  socket.on('disconnect', () => {
    authenticated.delete(socket.id);
    console.log('[Mobile] Socket disconnected:', socket.id);
  });
});

// API Routes
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    platform: 'mobile',
    socketPort: SOCKET_PORT,
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Spa fallback - serve index_react.html for all routes
app.get('*', (req, res, next) => {
  // Don't serve HTML for API routes
  if (req.path.startsWith('/api/')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'index_react.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error('[Mobile Server Error]', err);
  res.status(500).json({ error: err.message });
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log('\n========================================');
  console.log('RehabApp Mobile Web Server');
  console.log('========================================');
  console.log(`Web App running at: http://0.0.0.0:${PORT}/`);
  console.log(`Local IPs: ${getLocalIps().join(', ')}`);
  console.log('========================================\n');
  console.log('To access from mobile:');
  getLocalIps().forEach(ip => {
    console.log(`  http://${ip}:${PORT}/`);
  });
  console.log('\n');
});

process.on('SIGINT', () => {
  console.log('\nShutting down mobile server...');
  server.close();
  process.exit();
});

module.exports = server;
