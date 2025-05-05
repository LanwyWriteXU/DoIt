const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  sendCommand: (command) => ipcRenderer.send('terminal-command', command),
  onOutput: (callback) => ipcRenderer.on('terminal-output', callback),
  require: (module) => require(module)
});