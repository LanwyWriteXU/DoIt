// Blockly 工作区和应用状态
let workspace;
const appState = {
    isNightMode: false,
    currentFile: null,
    zoomLevel: 1.0,
    outputCollapsed: false,
    isResizing: false,
    startWidth: 0,
    minWidth: 300,
    maxWidth: 800,
    projectName: "New Project",
    sidebarExpanded: false,
    activeSidebarTab: null,
    terminalHistory: [],
    commandHistory: [],
    historyIndex: -1,
};

// 初始化 Blockly 工作区
function initWorkspace() {
    
    workspace = Blockly.inject('blocklyDiv', {
        toolbox: document.getElementById('toolbox'),
        media: './media',
        trashcan: true,
        scrollbars: true,
        sounds: true,
        renderer: 'zelos',
        theme: Blockly.Themes.DayTheme,
        grid: {spacing: 20,length: 3,colour: '#ccc',snap: true},
        zoom: {
            controls: true,
            wheel: true,
            startScale: 1.0,
            maxScale: 3,
            minScale: 0.3,
            scaleSpeed: 1.2
        },
        move: {
            scrollbars: true,
            drag: true,
            wheel: true
        },
        toolboxPosition: 'start'
    });
    
    // 将Blockly生成的工具箱移动到我们的自定义容器中
    const toolboxDiv = document.querySelector('.blocklyToolboxDiv');
    const customToolboxContainer = document.querySelector('.blockly-toolbox-scrollable');
    if (toolboxDiv && customToolboxContainer) {
        customToolboxContainer.appendChild(toolboxDiv);
    }

    // 确保所有工具箱项都有data-category属性
    setTimeout(() => {
        document.querySelectorAll('.blocklyTreeRow').forEach(row => {
        const label = row.querySelector('.blocklyTreeLabel');
        if (label) {
            const category = label.textContent.trim();
            row.setAttribute('data-category', category);
        }
        });
    }, 500);

    // 初始化自定义变量管理器
    CustomVariableManager.init(workspace);
    
    // 覆盖默认的变量类别flyout生成器
    Blockly.Variables.flyoutCategory = function(workspace) {
        return CustomVariableCreator.getFlyoutContents(workspace);
    };

    registerPythonGenerators();
    workspace.addChangeListener(updatePythonCode);
    setupTerminal();

    // 确保工作区初始大小正确
    setTimeout(() => Blockly.svgResize(workspace), 100);
}

// 注册 Python 代码生成器
function registerPythonGenerators() {
    Blockly.Python.addReservedWords('math,random,time,json,os,sys');
    
    Blockly.Python['math_number'] = function(block) {
        return [block.getFieldValue('NUM'), Blockly.Python.ORDER_ATOMIC];
    };
    
    Blockly.Python['text_print'] = function(block) {
        const value = Blockly.Python.valueToCode(block, 'TEXT', Blockly.Python.ORDER_NONE) || "''";
        return `print(${value})\n`;
    };
    
    Blockly.Python['variables_set'] = function(block) {
        const varName = Blockly.Python.variableDB_.getName(
            block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
        const value = Blockly.Python.valueToCode(block, 'VALUE', Blockly.Python.ORDER_NONE) || 'None';
        return `${varName} = ${value}\n`;
    };
}

// 更新 Python 代码显示
function updatePythonCode() {
    try {
        const code = Blockly.Python.workspaceToCode(workspace);
        document.getElementById('pythonCode').textContent = code;
    } catch (error) {
        console.error('代码生成错误:', error);
        document.getElementById('pythonCode').textContent = `# 错误: ${error.message}`;
    }
}

// 文件操作函数
function saveFile() {
    try {
        const code = Blockly.Python.workspaceToCode(workspace);
        const blob = new Blob([code], {type: 'text/plain'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = appState.currentFile || 'blockly_code.py';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('保存失败:', error);
        alert('保存文件时出错: ' + error.message);
    }
}

function newFile() {
    if (confirm('确定要新建文件吗？所有未保存的更改将丢失。')) {
        workspace.clear();
        appState.currentFile = null;
        updatePythonCode();
    }
}

function exportWorkspace() {
    try {
      const projectName = document.getElementById('project-name').value || 'New Project';
      const xml = Blockly.Xml.workspaceToDom(workspace);
      const xmlText = Blockly.Xml.domToPrettyText(xml);
      const blob = new Blob([xmlText], {type: 'application/xml'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectName}.xml`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出工作区时出错: ' + error.message);
    }
  }

  function importWorkspace() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xml';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        const xmlText = await file.text();
        if (!xmlText.trim().startsWith('<xml')) {
          throw new Error('无效的Blockly XML文件');
        }
        
        const xml = Blockly.utils.xml.textToDom(xmlText);
        workspace.clear();
        Blockly.Xml.domToWorkspace(xml, workspace);
        console.log("导入文件");
        
        // 设置项目名称为文件名
        const projectName = file.name.replace('.xml', '');
        document.getElementById('project-name').value = projectName;
        appState.projectName = projectName;
      } catch (error) {
        console.error('导入失败:', error);
        alert('导入工作区时出错: ' + error.message);
      }
    };
    
    input.click();
  }

// 其他功能函数
async function copyCode() {
    try {
        const code = Blockly.Python.workspaceToCode(workspace);
        await navigator.clipboard.writeText(code);
        
        const btn = document.getElementById('copy-code-btn');
        const originalText = btn.textContent;
        btn.textContent = '✓ 已复制';
        btn.disabled = true;
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.disabled = false;
        }, 2000);
    } catch (error) {
        console.error('复制失败:', error);
        
        // 降级方案
        const textarea = document.createElement('textarea');
        textarea.value = Blockly.Python.workspaceToCode(workspace);
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            document.execCommand('copy');
            alert('代码已复制到剪贴板');
        } catch (err) {
            alert('复制失败，请手动选择并复制代码');
        }
        
        document.body.removeChild(textarea);
    }
}

function toggleTheme() {
    appState.isNightMode = !appState.isNightMode;
    document.body.classList.toggle('night-mode', appState.isNightMode);
    
    // 立即更新工作区
    workspace.setTheme(appState.isNightMode ? Blockly.Themes.NightTheme : Blockly.Themes.DayTheme);
    Blockly.svgResize(workspace);
    
    document.getElementById('theme-btn').textContent = appState.isNightMode ? '日间模式' : '夜间模式';
    
    // 同步到已加载的侧栏iframe
    const sidebarFrame = document.getElementById('sidebar-frame');
    if (sidebarFrame.contentWindow) {
        sidebarFrame.contentWindow.postMessage({
            type: 'themeSync',
            isNightMode: appState.isNightMode
        }, '*');
    }
}

function showAboutSoftware() {
    alert('DoIt! - 放手去做!\n版本: 1.0.0');
}

function showAboutDeveloper() {
    alert('开发者信息:\nCyberexplorer(程序)\n_KOSHINO_(美工)');
}

function setupZoomControls() {
    document.getElementById('zoom-in-btn')?.addEventListener('click', () => {
        workspace.zoomCenter(1.2);
        appState.zoomLevel *= 1.2;
    });
    
    document.getElementById('zoom-out-btn')?.addEventListener('click', () => {
        workspace.zoomCenter(0.8);
        appState.zoomLevel *= 0.8;
    });
    
    document.getElementById('zoom-reset-btn')?.addEventListener('click', () => {
        workspace.zoomCenter(1 / appState.zoomLevel);
        appState.zoomLevel = 1.0;
    });
}

//侧栏初始化函数
function initSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const filesBtn = document.getElementById('files-btn');
    const debugBtn = document.getElementById('debug-btn');
    const extensionsBtn = document.getElementById('extensions-btn');
    const sidebarFrame = document.getElementById('sidebar-frame');

    // 切换侧栏展开/折叠 - 直接显示/隐藏，无动画
    function toggleSidebar(expand) {
        appState.sidebarExpanded = expand !== undefined ? expand : !appState.sidebarExpanded;
        sidebar.classList.toggle('expanded', appState.sidebarExpanded);
        
        // 立即调整工作区大小
        Blockly.svgResize(workspace);
    }

    // 加载侧栏内容
    function loadSidebarContent(tab) {
        if (appState.activeSidebarTab === tab) {
            toggleSidebar(!appState.sidebarExpanded);
            return;
        }
        
        appState.activeSidebarTab = tab;
        
        document.querySelectorAll('.sidebar-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`${tab}-btn`).classList.add('active');
        
        const themeParam = appState.isNightMode ? '?theme=dark' : '?theme=light';
        const sidebarFrame = document.getElementById('sidebar-frame');
        sidebarFrame.src = `code/${tab}.html${themeParam}`;
        
        // 确保iframe加载完成后调整大小
        sidebarFrame.onload = function() {
            try{
                // 发送主题信息
                sidebarFrame.contentWindow.postMessage({
                    type: 'themeSync',
                    isNightMode: appState.isNightMode
                }, '*');
            } catch (e) {
                console.error('无法与iframe通信',e);
            }
            
            // 确保iframe内容高度正确
            setTimeout(() => {
                Blockly.svgResize(workspace);
            }, 100);
        };

        toggleSidebar(true);
    }

    // 按钮点击事件
    filesBtn.addEventListener('click', () => loadSidebarContent('files'));
    debugBtn.addEventListener('click', () => loadSidebarContent('debug'));
    extensionsBtn.addEventListener('click', () => loadSidebarContent('extensions'));
    
    // 初始化时发送主题状态
    setTimeout(() => {
        const sidebarFrame = document.getElementById('sidebar-frame');
        if (sidebarFrame && sidebarFrame.contentWindow) {
            sidebarFrame.contentWindow.postMessage({
                type: 'themeChange',
                isNightMode: appState.isNightMode
            }, '*');
        }
    }, 500);

    // 初始化时折叠侧栏
    toggleSidebar(false);
}

// 初始化事件监听
function setupEventListeners() {
    // 文件操作
    document.getElementById('save-btn').addEventListener('click', saveFile);
    document.getElementById('new-btn').addEventListener('click', newFile);
    document.getElementById('export-xml-btn').addEventListener('click', exportWorkspace);
    document.getElementById('import-xml-btn').addEventListener('click', importWorkspace);
    document.getElementById('project-name').addEventListener('change', (e) => {
        appState.projectName = e.target.value || 'New Project';
    });

    // 其他功能
    document.getElementById('copy-code-btn').addEventListener('click', copyCode);
    document.getElementById('theme-btn').addEventListener('click', toggleTheme);
    
    //Tab功能
    document.querySelectorAll('.tab-buttons .tab-button').forEach(button => {
        button.addEventListener('click', () => {
          // 移除所有active类
          document.querySelectorAll('.tab-buttons .tab-button').forEach(btn => {
            btn.classList.remove('active');
          });
          
          // 添加active类到当前按钮
          button.classList.add('active');
        });
    });
      
    // 代码生成面板折叠按钮功能
    const collapseBtn = document.querySelector('.collapse-btn');
    if (collapseBtn) {
        collapseBtn.addEventListener('click', () => {
        const outputContainer = document.getElementById('outputContainer');
        const isCollapsed = outputContainer.style.display === 'none';
        
        if (isCollapsed) {
            outputContainer.style.display = '';
            collapseBtn.classList.remove('collapsed');
            document.querySelector('.collapse-btn span').textContent = '折叠';
        } else {
            outputContainer.style.display = 'none';
            collapseBtn.classList.add('collapsed');
            document.querySelector('.collapse-btn span').textContent = '展开';
        }
        
        // 调整工作区大小
        setTimeout(() => Blockly.svgResize(workspace), 100);
        });
    }

    window.addEventListener('resize', () => {
        Blockly.svgResize(workspace);
    });

    window.addEventListener('message', (event) => {
        if (event.data.type === 'requestTheme') {
            const iframe = document.getElementById('sidebar-frame');
            if (iframe && iframe.contentWindow) {
                iframe.contentWindow.postMessage({
                    type: 'themeResponse',
                    isNightMode: appState.isNightMode
                }, '*');
            }
        }
    });

    // 关于菜单
    document.getElementById('about-software-btn').addEventListener('click', showAboutSoftware);
    document.getElementById('about-developer-btn').addEventListener('click', showAboutDeveloper);
    
    // 缩放控制（如果存在）
    setupZoomControls();
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    initWorkspace();
    setupEventListeners();
    initSidebar();
    updatePythonCode();
});

// 初始化WebSocket客户端
const socket = new WebSocket('ws://localhost:8080');
socket.binaryType = 'arraybuffer'; // 使用二进制传输格式

// 添加编码处理器
const encoder = new TextEncoder('utf-8');
const decoder = new TextDecoder('utf-8');
const term = document.getElementById('terminal');

// 创建简易终端模拟器
const createTerminal = () => {
  term.innerHTML = ''; // 清空内容
  term.style.fontFamily = 'Consolas, monospace';
  term.style.color = appState.isNightMode ? '#e0e0e0' : '#1e1e1e';
  term.style.backgroundColor = appState.isNightMode ? '#252526' : '#ffffff';
  term.style.padding = '10px';
  term.style.whiteSpace = 'pre-wrap';
  term.style.overflow = 'auto';
};

// WebSocket事件处理
socket.onopen = () => {
  createTerminal();
  term.innerHTML += '$ ';
  inputElement.focus();
};

// 新增输入框处理
const inputHandler = (e) => {
  if (e.key === 'Enter') {
    ws.send('\r\n');
    term.innerHTML += '\r\n$ ';
  } else if (e.key === 'Backspace') {
    term.innerHTML = term.innerHTML.replace(/.[\u2588]$/, '');
  } else if (/^[\x20-\x7F]$/.test(e.key)) {
    term.innerHTML += e.key.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    ws.send(e.key);
  }
  term.scrollTop = term.scrollHeight;
};

// term.addEventListener('keydown', inputHandler);
// term.setAttribute('tabindex', '0');
// term.focus();
// };

// 接收服务端输出
// 获取系统类型
const isWindows = navigator.platform.toLowerCase().includes('win');
let promptSymbol = isWindows ? '>' : '$';

// 错误处理
socket.onerror = (error) => {
  const errorMsg = document.createElement('div');
  errorMsg.style.color = '#ff4444';
  errorMsg.textContent = `连接失败: ${error.message || '请检查服务器是否运行'}`;
  terminal.appendChild(errorMsg);
};

socket.onclose = (event) => {
  if (event.wasClean) {
    console.log(`连接关闭，状态码=${event.code}`);
  } else {
    console.error('连接意外中断');
  }
};

// 在终端容器中添加可编辑的pre元素
const terminal = document.getElementById('terminal');
const inputElement = document.createElement('pre');
inputElement.contentEditable = true;
inputElement.style.cssText = 'outline: none; white-space: pre-wrap;';
terminal.appendChild(inputElement);

// 处理中文输入
let compositionLock = false;
inputElement.addEventListener('compositionstart', () => compositionLock = true);
inputElement.addEventListener('compositionend', () => compositionLock = false);

// 输入事件监听
inputElement.addEventListener('keydown', (e) => {
  if (compositionLock) return;
  
  if (e.key === 'Enter') {
    e.preventDefault();
    const command = inputElement.textContent;
    window.electronAPI.sendCommand(command); // 使用预加载脚本暴露的API
    inputElement.textContent = '';
  }
});

// 接收服务端输出
ipcRenderer.on('terminal-output', (event, output) => {
  const outputSpan = document.createElement('span');
  outputSpan.style.whiteSpace = 'pre-wrap';
  outputSpan.textContent = output;
  terminal.insertBefore(outputSpan, inputElement);
  terminal.scrollTop = terminal.scrollHeight;
});

function setupTerminal() {
    const terminal = document.getElementById('terminal');
    terminal.innerHTML = '> ';
    terminal.contentEditable = true;

    terminal.addEventListener('keydown', (e) => {
        if (compositionLock) return;
        
        if (e.key === 'Enter') {
            e.preventDefault();
            const command = terminal.textContent.slice(1).trim();
            handleTerminalInput(command);
            terminal.innerHTML = '> ';
        }
        // 保持原有历史导航逻辑
    });
}

// 修改IPC通信处理
ipcRenderer.on('terminal-output', (event, output) => {
    const outputSpan = document.createElement('div');
    outputSpan.style.whiteSpace = 'pre-wrap';
    outputSpan.textContent = output;
    terminal.insertBefore(outputSpan, inputElement);
    terminal.scrollTop = terminal.scrollHeight;
});

function handleTerminalInput(command) {
  command = command.trim();
  if (!command) return;

  // 执行命令逻辑
  try {
    const result = executeCommand(command);
    displayTerminalOutput(`> ${command}\n${result}`);
    appState.commandHistory.push(command);
    appState.historyIndex = appState.commandHistory.length;
  } catch (error) {
    displayTerminalOutput(`> ${command}\nError: ${error.message}`);
  }
}

function executeCommand(command) {
  // 添加实际命令处理逻辑
  if (command === 'clear') {
    document.getElementById('terminal').innerHTML = '> ';
    return '';
  }
  return `Executed: ${command}`;
}

function displayTerminalOutput(text) {
  const terminal = document.getElementById('terminal');
  const div = document.createElement('div');
  div.textContent = text;
  terminal.appendChild(div);
  terminal.scrollTop = terminal.scrollHeight;
}

function navigateHistory(direction) {
  const history = appState.commandHistory;
  if (history.length === 0) return;

  // 边界检查
  appState.historyIndex = Math.max(0, Math.min(appState.historyIndex + direction, history.length));

  const terminal = document.getElementById('terminal');
  const currentText = terminal.textContent;
  
  // 获取当前历史命令（处理超出索引的情况）
  const command = appState.historyIndex < history.length 
    ? history[appState.historyIndex]
    : '';

  // 保留提示符并更新命令
  terminal.textContent = `> ${command}`;
  
  // 光标定位到末尾
  const range = document.createRange();
  const sel = window.getSelection();
  range.selectNodeContents(terminal);
  range.collapse(false);
  sel.removeAllRanges();
  sel.addRange(range);
}