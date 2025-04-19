const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  // 创建浏览器窗口
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    icon: path.join(__dirname, 'icon.png'), // 设置窗口图标
    title: 'DoIt!',                // 修改窗口标题
    autoHideMenuBar: true,                // 隐藏工具栏（按 Alt 可临时显示）
    webPreferences: {
      nodeIntegration: true               // 允许渲染进程使用 Node.js
    }
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