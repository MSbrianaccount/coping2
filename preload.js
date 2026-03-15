// Preload Script for Electron Security
// Provides secure context isolation between renderer and main processes

const { contextBridge, ipcRenderer } = require('electron');

// Expose limited API to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimize: () => ipcRenderer.invoke('minimize-window'),
  maximize: () => ipcRenderer.invoke('maximize-window'),
  close: () => ipcRenderer.invoke('close-window'),

  // IPC communication
  send: (channel, data) => {
    const validChannels = [
      'app-ready',
      'close-app',
      'save-data',
      'load-data',
      'export-report'
    ];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },

  receive: (channel, func) => {
    const validChannels = [
      'reply-data',
      'error-message',
      'success-message'
    ];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },

  // File system operations
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  saveFile: (content) => ipcRenderer.invoke('dialog:saveFile', content),

  // Database operations
  queryDatabase: (query) => ipcRenderer.invoke('db:query', query),
  executeDatabase: (query) => ipcRenderer.invoke('db:execute', query),
  exportDatabaseSQL: () => ipcRenderer.invoke('db:export'),
  importDatabaseSQL: (data) => ipcRenderer.invoke('db:import', data),
  // Upload files (images) to assets/uploads via main process
  saveUpload: (name, dataUrl) => ipcRenderer.invoke('fs:saveUpload', { name, data: dataUrl }),
  // Network discovery & server control
  discoverWorkspace: (name) => ipcRenderer.invoke('discovery:query', name),
  startServer: (name, pin) => ipcRenderer.invoke('server:start', name, pin),
  prompt: (message, defaultValue) => ipcRenderer.invoke('dialog:prompt', { message, defaultValue }),
  stopServer: () => ipcRenderer.invoke('server:stop'),
  // File-system DB persistence (Electron main)
  saveDatabaseFile: (db) => ipcRenderer.invoke('fs:saveDatabase', db),
  loadDatabaseFile: () => ipcRenderer.invoke('fs:loadDatabase')
});

// Shim `window.prompt` in the renderer to route to the packaged modal prompt
// This makes existing `prompt()` calls work in packaged builds without changing renderer code.
try {
  window.prompt = (message = '', defaultValue = '') => ipcRenderer.invoke('dialog:prompt', { message, defaultValue });
} catch (e) {
  // If we can't assign, silently ignore — renderer may not allow override.
}
