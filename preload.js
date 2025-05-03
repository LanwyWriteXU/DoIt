const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    importProject: () => ipcRenderer.invoke('import-project'),
    exportProject: (projectName) => ipcRenderer.send('export-project', projectName),
    requestProjectPath: () => ipcRenderer.send('request-project-path'),
    readDirectory: (dirPath) => ipcRenderer.invoke('read-directory', dirPath),
    getTempPath: () => ipcRenderer.invoke('get-temp-path'),
    on: (channel, callback) => {
        ipcRenderer.on(channel, (event, ...args) => callback(...args));
    },
    
    // 同步方法
    send: (channel, data) => ipcRenderer.send(channel, data),
    
    // 异步方法
    invoke: (channel, data) => ipcRenderer.invoke(channel, data),
    
    // 事件监听
    on: (channel, callback) => {
        const subscription = (event, ...args) => callback(...args);
        ipcRenderer.on(channel, subscription);
        return () => ipcRenderer.removeListener(channel, subscription);
    }
});