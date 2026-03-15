const dgram = require('dgram');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const os = require('os');
const bcrypt = require('bcryptjs');

const UDP_PORT = 41234;
const WS_PORT = process.env.PORT || 3001;

function getLocalIp() {
  const ifaces = os.networkInterfaces();
  for (const name of Object.keys(ifaces)) {
    for (const iface of ifaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

const workspaceName = process.argv[2] || process.env.WORKSPACE_NAME || 'DefaultWorkspace';
const workspacePin = process.argv[3] || process.env.WORKSPACE_PIN || '';

// Hash the workspace PIN for secure comparison. If provided as a bcrypt hash already, use as-is.
let hashedPin = null;
if (workspacePin) {
  try {
    if (String(workspacePin).startsWith('$2')) {
      hashedPin = workspacePin; // assume already hashed
    } else {
      hashedPin = bcrypt.hashSync(String(workspacePin), 10);
    }
  } catch (e) {
    console.warn('Failed to hash workspace PIN:', e && e.message);
    hashedPin = null;
  }
}

// Start UDP responder
const udpSocket = dgram.createSocket('udp4');
udpSocket.on('message', (msg, rinfo) => {
  try {
    const text = msg.toString();
    if (!text) return;
    if (text.startsWith('workspace-query:')) {
      const name = text.split(':')[1];
      if (name === workspaceName) {
        const payload = JSON.stringify({ type: 'workspace-claim', name: workspaceName, host: getLocalIp(), port: WS_PORT, requiresPin: !!workspacePin });
        udpSocket.send(payload, 0, payload.length, rinfo.port, rinfo.address);
      }
    }
  } catch (e) {
    console.warn('UDP parse error', e);
  }
});

udpSocket.bind(UDP_PORT, () => {
  udpSocket.setBroadcast(true);
  console.log(`UDP discovery listener started on port ${UDP_PORT}`);
});

// Start WebSocket (Socket.io) server
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.get('/', (req, res) => res.json({ status: 'ok', workspace: workspaceName }));

// track authenticated sockets
const authenticated = new Set();

io.on('connection', (socket) => {
  console.log('Socket.io client connected', socket.id);

  // require auth:join with pin within 5 seconds
  let authTimeout = setTimeout(() => {
    if (!authenticated.has(socket.id) && workspacePin) {
      socket.emit('auth:failed', { message: 'PIN required' });
      socket.disconnect(true);
    }
  }, 5000);

  socket.on('auth:join', (data) => {
    if (workspacePin) {
      try {
        const candidate = data && data.pin ? String(data.pin) : '';
        if (hashedPin && bcrypt.compareSync(candidate, hashedPin)) {
          authenticated.add(socket.id);
          socket.emit('auth:ok');
          clearTimeout(authTimeout);
          console.log('Socket authenticated', socket.id);
        } else {
          socket.emit('auth:failed', { message: 'Invalid PIN' });
          socket.disconnect(true);
        }
      } catch (e) {
        socket.emit('auth:failed', { message: 'Auth error' });
        socket.disconnect(true);
      }
    } else {
      // no pin required
      authenticated.add(socket.id);
      socket.emit('auth:ok');
      clearTimeout(authTimeout);
    }
  });

  socket.on('progress:added', (data) => {
    if (!authenticated.has(socket.id)) {
      socket.emit('auth:failed', { message: 'Not authenticated' });
      return;
    }
    socket.broadcast.emit('progress:update', data);
  });

  socket.on('disconnect', () => {
    authenticated.delete(socket.id);
    console.log('Socket disconnected', socket.id);
  });
});

server.listen(WS_PORT, () => {
  console.log(`Socket.io server listening on ${WS_PORT} (workspace: ${workspaceName})`);

  // Announce presence on UDP (broadcast claim)
  const claim = Buffer.from(JSON.stringify({ type: 'workspace-claim', name: workspaceName, host: getLocalIp(), port: WS_PORT }));
  const bcast = dgram.createSocket('udp4');
  bcast.bind(() => {
    bcast.setBroadcast(true);
    bcast.send(claim, 0, claim.length, UDP_PORT, '255.255.255.255', () => {
      bcast.close();
    });
  });
});

function startBackendServer(workspaceName = 'DefaultWorkspace', workspacePin = '', port = process.env.PORT || 3001) {
  const WS_PORT = port;
  const workName = workspaceName;
  const workPin = workspacePin;

  const udpSocket = dgram.createSocket('udp4');
  udpSocket.on('message', (msg, rinfo) => {
    try {
      const text = msg.toString();
      if (!text) return;
      if (text.startsWith('workspace-query:')) {
        const name = text.split(':')[1];
        if (name === workName) {
          const payload = JSON.stringify({ type: 'workspace-claim', name: workName, host: getLocalIp(), port: WS_PORT, requiresPin: !!workPin });
          udpSocket.send(payload, 0, payload.length, rinfo.port, rinfo.address);
        }
      }
    } catch (e) {
      console.warn('UDP parse error', e);
    }
  });

  udpSocket.bind(UDP_PORT, () => {
    udpSocket.setBroadcast(true);
    console.log(`UDP discovery listener started on port ${UDP_PORT}`);
  });

  const appServer = express();
  const backend = http.createServer(appServer);
  const io = new Server(backend, { cors: { origin: '*' } });

  appServer.get('/', (req, res) => res.json({ status: 'ok', workspace: workName }));

  const authenticated = new Set();
  io.on('connection', (socket) => {
    console.log('Socket.io client connected', socket.id);

    let authTimeout = setTimeout(() => {
      if (!authenticated.has(socket.id) && workPin) {
        socket.emit('auth:failed', { message: 'PIN required' });
        socket.disconnect(true);
      }
    }, 5000);

    socket.on('auth:join', (data) => {
      if (workPin) {
        try {
          const candidate = data && data.pin ? String(data.pin) : '';
          if (hashedPin && bcrypt.compareSync(candidate, hashedPin)) {
            authenticated.add(socket.id);
            socket.emit('auth:ok');
            clearTimeout(authTimeout);
            console.log('Socket authenticated', socket.id);
          } else {
            socket.emit('auth:failed', { message: 'Invalid PIN' });
            socket.disconnect(true);
          }
        } catch (e) {
          socket.emit('auth:failed', { message: 'Auth error' });
          socket.disconnect(true);
        }
      } else {
        authenticated.add(socket.id);
        socket.emit('auth:ok');
        clearTimeout(authTimeout);
      }
    });

    socket.on('progress:added', (data) => {
      if (!authenticated.has(socket.id)) {
        socket.emit('auth:failed', { message: 'Not authenticated' });
        return;
      }
      socket.broadcast.emit('progress:update', data);
    });

    socket.on('disconnect', () => {
      authenticated.delete(socket.id);
      console.log('Socket disconnected', socket.id);
    });
  });

  backend.listen(WS_PORT, () => {
    console.log(`Socket.io server listening on ${WS_PORT} (workspace: ${workName})`);
    const claim = Buffer.from(JSON.stringify({ type: 'workspace-claim', name: workName, host: getLocalIp(), port: WS_PORT }));
    const bcast = dgram.createSocket('udp4');
    bcast.bind(() => {
      bcast.setBroadcast(true);
      bcast.send(claim, 0, claim.length, UDP_PORT, '255.255.255.255', () => bcast.close());
    });
  });

  process.on('SIGINT', () => {
    udpSocket.close();
    backend.close();
    process.exit();
  });

  return { udpSocket, backend, io };
}

// Only auto-start when run directly (not required as a module)
if (require.main === module) {
  startBackendServer(process.argv[2] || process.env.WORKSPACE_NAME || 'DefaultWorkspace', process.argv[3] || process.env.WORKSPACE_PIN || '');
}

module.exports = { startBackendServer };

