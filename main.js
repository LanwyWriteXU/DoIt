const { app, BrowserWindow } = require('electron')
const path = require('path')
const WebSocket = require('ws')

let wss = null

app.whenReady().then(() => {
  // 创建浏览器窗口
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    icon: path.join(__dirname, 'icon.png'),
    title: 'DoIt!',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,  // 启用上下文隔离
      preload: path.join(__dirname, 'preload.js')  // 添加预加载脚本
    }
  })

  // 加载应用界面
  mainWindow.loadFile('index.html')

  // 启动WebSocket服务器
  wss = new WebSocket.Server({ port: 8080 }, () => {
    console.log('WS server ready on port 8080')
  })

  // 处理连接
  wss.on('connection', (ws) => {
    ws.on('message', (message) => {
      console.log('Received:', message.toString())
    })
  })
  
  // 退出时关闭服务器
  app.on('will-quit', () => {
    if (wss) {
      wss.close()
      wss = null
    }
  })

  // 在创建BrowserWindow后添加
  mainWindow.webContents.openDevTools({ mode: 'detach' });
  
})

