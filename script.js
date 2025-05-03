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

// 文件操作函数
// 在文件顶部添加类型声明
const ipcRenderer = window.electronAPI?.ipcRenderer || {
  invoke: (channel, data) => {
    console.log(`Invoking ${channel} with`, data);
    return window.electronAPI.invoke(channel, data);
  },
  on: (channel, listener) => {
    window.electronAPI.on(channel, listener);
  },
  send: () => console.warn('ipcRenderer not available in browser environment'),
  on: () => console.warn('ipcRenderer not available in browser environment')
};

// 修改导出项目函数
function exportProject() {
    try {
        const projectName = document.getElementById('project-name').value || 'New Project';
        window.electronAPI.invoke('export-project', projectName);
    } catch (error) {
        console.error('导出失败:', error);
        alert('导出项目时出错: ' + error.message);
    }
}

// 修改事件监听方式
window.electronAPI.on('export-complete', (zipPath) => {
    console.log('项目已导出到:', zipPath);
    alert(`项目已成功导出为 ${path.basename(zipPath)}`);
});

function importProject() {
    ipcRenderer.send('import-project');
}

// 监听导出完成事件
if (window.electronAPI && window.electronAPI.on) {
    window.electronAPI.on('export-complete', (zipPath) => {
        console.log('项目已导出到:', zipPath);
        alert(`项目已成功导出为 ${path.basename(zipPath)}`);
    });
} else {
    console.error('electronAPI未正确初始化');
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
    sidebarFrame.addEventListener('load', () => {
        try {
            // 添加安全验证
            if (!window.electronAPI || !sidebarFrame.contentWindow) return;
            
            // 暴露有限API
            const exposedAPI = {
                openFile: () => window.electronAPI.openFile(),
                showDialog: (options) => window.electronAPI.showDialog(options)
            };
            
            sidebarFrame.contentWindow.electron = exposedAPI;
        } catch (e) {
            console.error('安全上下文错误:', e);
        }
    });

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
    document.getElementById('export-project-btn').addEventListener('click', exportProject);
    document.getElementById('import-project-btn').addEventListener('click', async () => {
        const projectPath = await window.electronAPI.importProject();
        if (projectPath) {
            window.electronAPI.requestProjectPath();
            // 加载文件树
            document.getElementById('sidebar-frame').src = `code/files.html?path=${encodeURIComponent(projectPath)}`;
        }
    });

    document.getElementById('export-project-btn').addEventListener('click', () => {
        const projectName = document.getElementById('project-name').value;
        window.electronAPI.exportProject(projectName);
    });

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