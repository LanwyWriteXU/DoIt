const { app, BrowserWindow } = require('electron');
const { ipcMain, dialog } = require('electron');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

let currentProjectPath = '';

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    icon: path.join(__dirname, 'icon.png'), // 设置窗口图标
    title: 'DoIt!',                // 修改窗口标题
    autoHideMenuBar: true,                // 隐藏工具栏（按 Alt 可临时显示）
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,  // 必须禁用nodeIntegration
      contextIsolation: true,  // 启用上下文隔离
      enableRemoteModule: false,  // 禁用remote模块
      sandbox: true            // 启用沙箱模式
    },
  });
  
  // 加载本地 HTML 文件
  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

// 关闭所有窗口时退出应用（macOS 除外）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 处理文件系统操作
ipcMain.handle('read-directory', async (event, dirPath) => {
  try {
    const files = fs.readdirSync(dirPath);
    return files.map(file => {
      const fullPath = path.join(dirPath, file);
      const stats = fs.statSync(fullPath);
      return {
        name: file,
        path: fullPath,
        isDirectory: stats.isDirectory()
      };
    });
  } catch (err) {
    console.error('读取目录失败:', err);
    throw err;
  }
});

ipcMain.handle('create-file', async (event, filePath) => {
    fs.writeFileSync(filePath, '');
});

ipcMain.handle('create-directory', async (event, dirPath) => {
    fs.mkdirSync(dirPath);
});

ipcMain.handle('rename-file', async (event, { oldPath, newPath }) => {
    fs.renameSync(oldPath, newPath);
});

ipcMain.handle('delete-file', async (event, filePath) => {
    if (fs.statSync(filePath).isDirectory()) {
        fs.rmdirSync(filePath, { recursive: true });
    } else {
        fs.unlinkSync(filePath);
    }
});

ipcMain.on('request-project-path', (event) => {
    event.sender.send('project-path', currentProjectPath);
});

// 添加临时路径获取接口
ipcMain.handle('get-temp-path', () => {
    return require('os').tmpdir();
});

// 处理.dp文件导入导出
ipcMain.handle('import-project', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'DoIt! Projects', extensions: ['dp'] }]
  });

  if (!result.canceled) {
    const zipPath = result.filePaths[0];
    const tempDir = require('os').tmpdir();
    currentProjectPath = path.join(tempDir, `doit_${Date.now()}`);

    const zip = new AdmZip(zipPath);
    zip.extractAllTo(currentProjectPath, true);
    return currentProjectPath; // 返回解压后的路径
  }
  return null;
});

ipcMain.on('export-project', (event, projectName) => {
    if (!currentProjectPath) return;
    
    const zip = new AdmZip();
    zip.addLocalFolder(currentProjectPath);
    
    const zipData = zip.toBuffer();
    const zipPath = path.join(require('os').homedir(), 'Downloads', `${projectName}.dp`);
    
    fs.writeFileSync(zipPath, zipData);
    
    // 通知渲染进程导出完成
    event.sender.send('export-complete', zipPath);
});