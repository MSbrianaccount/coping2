// Main Entry Point for Electron Application
// Sets up the Electron window and application lifecycle

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const dgram = require('dgram');
const os = require('os');
const { startBackendServer } = require('./server.js');
// use the same fs object for promises to avoid duplicate declarations after bundling
const fsPromises = fs.promises;

// Optional SQLite integration (better-sqlite3 wrapper)
let SQLiteDatabase = null;
let sqliteDbInstance = null;
try {
  SQLiteDatabase = require(path.join(__dirname, 'src', 'db', 'sqliteDatabase.js'));
} catch (e) {
  // Module may not be installed or available; keep JSON persistence as fallback
  console.warn('SQLite wrapper not available:', e && e.message);
}

let serverProcess = null;

function discoverWorkspace(name, timeout = 3000) {
  return new Promise((resolve) => {
    const socket = dgram.createSocket('udp4');
    const message = Buffer.from(`workspace-query:${name}`);
    const responses = [];

    socket.on('message', (msg, rinfo) => {
      try {
        const data = JSON.parse(msg.toString());
        if (data && data.type === 'workspace-claim' && data.name === name) {
          responses.push(data);
        }
      } catch (e) {
        // ignore
      }
    });

    socket.bind(() => {
      socket.setBroadcast(true);
      socket.send(message, 0, message.length, 41234, '255.255.255.255');
    });

    setTimeout(() => {
      socket.close();
      resolve(responses[0] || null);
    }, timeout);
  });
}


function startServer(workspaceName, pin) {
  try {
    const started = startBackendServer(workspaceName, pin);
    console.log('[startServer] backend server started', started ? 'ok' : 'unknown');
    return started;
  } catch (err) {
    console.error('[startServer] failed to start backend server', err && err.message, err);
    throw err;
  }
}

function stopServer() {
  console.log('[stopServer] stop requested (no-op for in-process backend)');
}

let mainWindow;
let splash;

function createWindow() {
  // Determine preload path robustly to handle ASAR/unpacked builds
  let preloadPath = path.join(__dirname, 'preload.js');
  try {
    if (!fs.existsSync(preloadPath)) {
      // try common alternatives
      const alt1 = path.join(process.resourcesPath || __dirname, 'app.asar.unpacked', 'preload.js');
      const alt2 = path.join(process.resourcesPath || __dirname, 'app', 'preload.js');
      const alt3 = path.join(__dirname, '..', 'preload.js');
      if (fs.existsSync(alt1)) preloadPath = alt1;
      else if (fs.existsSync(alt2)) preloadPath = alt2;
      else if (fs.existsSync(alt3)) preloadPath = alt3;
    }
  } catch (e) {
    console.warn('preload path check failed', e && e.message);
  }

  // Main application window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true
    },
    // Use platform-appropriate icon. On Windows prefer .ico to avoid white/blank icon issues.
    icon: process.platform === 'win32' ? path.join(__dirname, 'assets', 'silvertech_logo.ico') : path.join(__dirname, 'assets', 'silvertech_logo.png')
  });

  // Load React app
  mainWindow.loadFile(path.join(__dirname, 'index_react.html'));

  // Show main window and ensure it receives focus so keyboard input works
  mainWindow.once('ready-to-show', () => {
    try {
      mainWindow.show();
      mainWindow.focus();
      // also focus webContents to ensure inputs receive keyboard events
      mainWindow.webContents.focus();
    } catch (e) { /* ignore */ }
  });

  // Open dev tools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
}

// App event listeners

app.on('ready', () => {
  // Automatically start backend server with default workspace name and pin (if any)
  const workspaceName = process.env.WORKSPACE_NAME || 'DefaultWorkspace';
  const workspacePin = process.env.WORKSPACE_PIN || '';
  startServer(workspaceName, workspacePin);
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

console.log('RehabApp Electron Application Started');

// IPC handlers for discovery and server control
ipcMain.handle('discovery:query', async (evt, workspaceName) => {
  return await discoverWorkspace(workspaceName, 3000);
});

ipcMain.handle('server:start', async (evt, workspaceName, pin) => {
  try {
    const providedPin = typeof pin === 'string' ? pin : (process.env.WORKSPACE_PIN || '');
    startServer(workspaceName, providedPin);
    return { success: true };
  } catch (err) {
    console.error('server:start error', err);
    return { success: false, error: String(err) };
  }
});

ipcMain.handle('server:stop', async () => {
  stopServer();
  return { success: true };
});

// Prompt dialog: create a small modal BrowserWindow to collect input and return value
ipcMain.handle('dialog:prompt', async (evt, { message, defaultValue }) => {
  return new Promise((resolve) => {
    try {
      const id = String(Date.now()) + '-' + Math.floor(Math.random()*1000);
      const promptWin = new BrowserWindow({
        width: 420,
        height: 150,
        resizable: false,
        parent: mainWindow || undefined,
        modal: !!mainWindow,
        show: false,
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false
        }
      });

      const url = `file://${path.join(__dirname, 'prompt.html')}`;
      promptWin.loadURL(url);

      ipcMain.once('prompt-response-' + id, (e, arg) => {
        resolve(arg && typeof arg.value !== 'undefined' ? arg.value : null);
        try { promptWin.close(); } catch (e) {}
      });

      promptWin.webContents.on('did-finish-load', () => {
        promptWin.show();
        promptWin.webContents.send('prompt-data', { id, message, defaultValue });
      });

      // In case the user closes the window
      promptWin.on('closed', () => resolve(null));
    } catch (err) {
      console.error('dialog:prompt error', err);
      resolve(null);
    }
  });
});

// File system persistence for renderer DB
ipcMain.handle('fs:saveDatabase', async (evt, db) => {
  try {
    const userDir = app.getPath('userData');
    const filePath = path.join(userDir, 'rehab_db.json');
    await fsPromises.writeFile(filePath, JSON.stringify(db, null, 2), 'utf8');
    return { success: true, path: filePath };
  } catch (err) {
    console.error('fs:saveDatabase error', err);
    return { success: false, error: String(err) };
  }
});

ipcMain.handle('fs:loadDatabase', async () => {
  try {
    const userDir = app.getPath('userData');
    const filePath = path.join(userDir, 'rehab_db.json');
    const data = await fsPromises.readFile(filePath, 'utf8');
    return { success: true, data: JSON.parse(data), path: filePath };
  } catch (err) {
    // file may not exist - return null data
    console.warn('fs:loadDatabase warning', err.message);
    return { success: false, error: String(err) };
  }
});

// Save uploaded asset (base64) to assets/uploads
ipcMain.handle('fs:saveUpload', async (evt, { name, data }) => {
  try {
    const userDir = __dirname; // app root
    const uploadsDir = path.join(userDir, 'assets', 'uploads');
    await fsPromises.mkdir(uploadsDir, { recursive: true });

    // Generate safe filename
    const timestamp = Date.now();
    const safeName = (name || `upload-${timestamp}`).replace(/[^a-z0-9_.-]/gi, '_');
    const ext = (safeName.includes('.') ? '' : '.png');
    const filename = `${timestamp}-${safeName}${ext}`;
    const filePath = path.join(uploadsDir, filename);

    // data is expected to be base64 string or dataURL
    let b64 = data;
    if (String(b64).startsWith('data:')) {
      b64 = b64.split(',')[1];
    }
    const buf = Buffer.from(b64, 'base64');
    await fsPromises.writeFile(filePath, buf);

    // Return relative path for use in renderer
    const relPath = `assets/uploads/${filename}`;
    return { success: true, path: relPath };
  } catch (err) {
    console.error('fs:saveUpload error', err);
    return { success: false, error: String(err) };
  }
});

// Initialize SQLite DB if wrapper loaded
app.whenReady().then(() => {
  if (SQLiteDatabase) {
    try {
      const userDir = app.getPath('userData');
      const dbPath = path.join(userDir, 'rehab_app.db');
      sqliteDbInstance = new SQLiteDatabase(dbPath);
      sqliteDbInstance.init();
      console.log('[main] SQLite initialized at', dbPath);
    } catch (err) {
      console.warn('[main] Failed to init SQLite, falling back to JSON persistence:', err && err.message);
      sqliteDbInstance = null;
    }
  }
});

// IPC handlers to proxy basic DB operations to main-process SQLite instance
ipcMain.handle('db:query', async (evt, sql, params = []) => {
  try {
    if (!sqliteDbInstance) return { success: false, error: 'sqlite-not-available' };
    const stmt = String(sql || '').trim();
    const method = stmt.split(/\s+/)[0].toUpperCase();
    if (method === 'SELECT' || stmt.toUpperCase().startsWith('PRAGMA') ) {
      const rows = sqliteDbInstance.all(sql, params);
      return { success: true, rows };
    } else {
      const result = sqliteDbInstance.run(sql, params);
      return { success: true, result };
    }
  } catch (err) {
    console.error('[db:query] error', err && err.message);
    return { success: false, error: String(err) };
  }
});

ipcMain.handle('db:execute', async (evt, sql, params = []) => {
  try {
    if (!sqliteDbInstance) return { success: false, error: 'sqlite-not-available' };
    const res = sqliteDbInstance.run(sql, params);
    return { success: true, result: res };
  } catch (err) {
    console.error('[db:execute] error', err && err.message);
    return { success: false, error: String(err) };
  }
});

ipcMain.handle('db:export', async () => {
  try {
    if (!sqliteDbInstance) return { success: false, error: 'sqlite-not-available' };
    const data = sqliteDbInstance.exportToJSON();
    return { success: true, data };
  } catch (err) {
    return { success: false, error: String(err) };
  }
});

ipcMain.handle('db:import', async (evt, data) => {
  try {
    if (!sqliteDbInstance) return { success: false, error: 'sqlite-not-available' };

    // Ensure latest patients schema for import compatibility
    try {
      sqliteDbInstance.exec('ALTER TABLE patients ADD COLUMN firstName TEXT');
    } catch (e) {}
    try {
      sqliteDbInstance.exec('ALTER TABLE patients ADD COLUMN lastName TEXT');
    } catch (e) {}

    sqliteDbInstance.importFromJSON(data);
    return { success: true };
  } catch (err) {
    console.error('[db:import] import failed', err && err.message);
    return { success: false, error: String(err) };
  }
});
