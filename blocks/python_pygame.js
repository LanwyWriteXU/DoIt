    // 初始化 Pygame 块
    Blockly.Blocks['pygame_init'] = {
        init: function() {
        this.setStyle('loop_blocks');
        this.appendDummyInput()
            .appendField("初始化 Pygame");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
        this.setTooltip("初始化 Pygame 库");
        this.setHelpUrl("https://www.pygame.org/docs/");
        }
    };
  
    // 创建 Pygame 窗口
    Blockly.Blocks['pygame_create_window'] = {
        init: function() {
        this.setStyle('loop_blocks');
        this.appendValueInput("WIDTH")
            .setCheck("Number")
            .appendField("创建窗口 宽度");
        this.appendValueInput("HEIGHT")
            .setCheck("Number")
            .appendField("高度");
        this.appendDummyInput()
            .appendField("标题")
            .appendField(new Blockly.FieldTextInput("My Game"), "TITLE");
            this.appendDummyInput();
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
        this.setTooltip("创建一个 Pygame 窗口");
        this.setHelpUrl("https://www.pygame.org/docs/ref/display.html");
        }
    };
  
    // 游戏主循环
    Blockly.Blocks['pygame_main_loop'] = {
        init: function() {
        this.setStyle('loop_blocks');
        this.appendDummyInput()
            .appendField("游戏主循环");
        this.appendStatementInput("LOOP_CONTENT")
            .setCheck(null);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
        this.setTooltip("Pygame 主游戏循环");
        this.setHelpUrl("https://www.pygame.org/docs/");
        }
    };
    
    // 初始化导入管理器
    (function() {
        // 保存原始生成器
        const originalFinish = python.pythonGenerator.finish;
        const imports = new Set();
        
        // 添加导入语句的方法
        python.pythonGenerator.addImport = function(importStatement) {
        imports.add(importStatement);
        };
        
        // 重写 finish 方法以包含导入
        python.pythonGenerator.finish = function(code) {
        const importCode = Array.from(imports).join('\n');
        const result = importCode + (importCode ? '\n\n' : '') + originalFinish.call(this, code);
        imports.clear(); // 清空以备下次生成
        return result;
        };
    })();
  
    // 初始化 Pygame
    python.pythonGenerator.forBlock['pygame_init'] = function(block, generator) {
        generator.addImport('import pygame');
        return 'pygame.init()\n';
    };
  
    // 创建窗口
    python.pythonGenerator.forBlock['pygame_create_window'] = function(block, generator) {
        generator.addImport('import pygame');
        const width = generator.valueToCode(block, 'WIDTH', python.Order.ATOMIC) || '800';
        const height = generator.valueToCode(block, 'HEIGHT', python.Order.ATOMIC) || '600';
        const title = block.getFieldValue('TITLE') || 'My Game';
        return `screen = pygame.display.set_mode((${width}, ${height}))\npygame.display.set_caption("${title}")\n`;
    };
  
    // 游戏主循环
    python.pythonGenerator.forBlock['pygame_main_loop'] = function(block, generator) {
        generator.addImport('import pygame');
        const content = generator.statementToCode(block, 'LOOP_CONTENT');
        // 添加缩进
        const indentedContent = content.replace(/^/gm, '    ');
        return `running = True\nwhile running:\n${indentedContent}    pygame.display.flip()\n`;
    };
  
    // 绘制矩形 (新增示例) 
    Blockly.Blocks['pygame_draw_rect'] = {
        init: function() {
        this.setStyle('loop_blocks');
        this.appendValueInput("SURFACE")
            .setCheck(null)
            .appendField("在表面");
        this.appendValueInput("COLOR")
            .setCheck("Colour")
            .appendField("颜色");
        this.appendValueInput("X")
            .setCheck("Number")
            .appendField("X 位置");
        this.appendValueInput("Y")
            .setCheck("Number")
            .appendField("Y 位置");
        this.appendValueInput("WIDTH")
            .setCheck("Number")
            .appendField("宽度");
        this.appendValueInput("HEIGHT")
            .setCheck("Number")
            .appendField("高度");
        this.appendDummyInput();
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
        this.setTooltip("绘制一个矩形");
        this.setHelpUrl("https://www.pygame.org/docs/ref/draw.html");
        }
  };
  
    python.pythonGenerator.forBlock['pygame_draw_rect'] = function(block, generator) {
        generator.addImport('import pygame');
        const surface = generator.valueToCode(block, 'SURFACE', python.Order.ATOMIC) || 'screen';
        const color = generator.valueToCode(block, 'COLOR', python.Order.ATOMIC) || '(255, 255, 255)';
        const x = generator.valueToCode(block, 'X', python.Order.ATOMIC) || '0';
        const y = generator.valueToCode(block, 'Y', python.Order.ATOMIC) || '0';
        const width = generator.valueToCode(block, 'WIDTH', python.Order.ATOMIC) || '50';
        const height = generator.valueToCode(block, 'HEIGHT', python.Order.ATOMIC) || '50';
        return `pygame.draw.rect(${surface}, ${color}, (${x}, ${y}, ${width}, ${height}))\n`;
    };
  
    // 事件检 测 (新增示例)
    Blockly.Blocks['pygame_event_quit'] = {
        init: function() {
        this.setStyle('logic_blocks');
        this.appendDummyInput()
            .appendField("检测退出事件");
        this.setOutput(true, "Boolean");
        this.setColour(230);
        this.setTooltip("检测用户是否点击了关闭按钮");
        this.setHelpUrl("https://www.pygame.org/docs/ref/event.html");
        }
    };
  
    python.pythonGenerator.forBlock['pygame_event_quit'] = function(block, generator) {
        generator.addImport('import pygame');
        return [ 'any(event.type == pygame.QUIT for event in pygame.event.get())', python.Order.ATOMIC ];
    };