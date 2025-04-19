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
    });

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
    workspace.setTheme(appState.isNightMode ? Blockly.Themes.NightTheme : Blockly.Themes.DayTheme);
    document.getElementById('theme-btn').textContent = appState.isNightMode ? '日间模式' : '夜间模式';
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
      
    // 折叠按钮功能
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
    updatePythonCode();
});