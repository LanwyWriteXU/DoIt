// 文件操作扩展
Blockly.Blocks['python_file_open'] = {
    init: function() {
      this.appendValueInput('FILENAME')
        .setCheck('String')
        .appendField('打开文件');
      this.appendDummyInput()
        .appendField('模式')
        .appendField(new Blockly.FieldDropdown([
          ['读取', "'r'"],
          ['写入', "'w'"],
          ['追加', "'a'"],
          ['读写', "'r+'"]
        ]), 'MODE');
      this.setOutput(true, null);
      this.setColour(290);
      this.setTooltip('打开一个文件并返回文件对象');
      this.setHelpUrl('https://docs.python.org/3/tutorial/inputoutput.html#reading-and-writing-files');
    }
  };
  
  Blockly.Python['python_file_open'] = function(block) {
    const filename = Blockly.Python.valueToCode(block, 'FILENAME', Blockly.Python.ORDER_NONE) || '""';
    const mode = block.getFieldValue('MODE');
    return [`open(${filename}, ${mode})`, Blockly.Python.ORDER_FUNCTION_CALL];
  };
  
  Blockly.Blocks['python_file_read'] = {
    init: function() {
      this.appendValueInput('FILE')
        .setCheck(null)
        .appendField('读取文件');
      this.setOutput(true, 'String');
      this.setColour(290);
      this.setTooltip('读取文件内容');
    }
  };
  
  Blockly.Python['python_file_read'] = function(block) {
    const file = Blockly.Python.valueToCode(block, 'FILE', Blockly.Python.ORDER_NONE) || 'None';
    return [`${file}.read()`, Blockly.Python.ORDER_MEMBER];
  };
  
  Blockly.Blocks['python_file_write'] = {
    init: function() {
      this.appendValueInput('FILE')
        .setCheck(null)
        .appendField('写入文件');
      this.appendValueInput('CONTENT')
        .setCheck('String');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(290);
      this.setTooltip('向文件写入内容');
    }
  };
  
  Blockly.Python['python_file_write'] = function(block) {
    const file = Blockly.Python.valueToCode(block, 'FILE', Blockly.Python.ORDER_NONE) || 'None';
    const content = Blockly.Python.valueToCode(block, 'CONTENT', Blockly.Python.ORDER_NONE) || '""';
    return `${file}.write(${content})\n`;
  };
  
  Blockly.Blocks['python_file_close'] = {
    init: function() {
      this.appendValueInput('FILE')
        .setCheck(null)
        .appendField('关闭文件');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(290);
      this.setTooltip('关闭文件');
    }
  };
  
  Blockly.Python['python_file_close'] = function(block) {
    const file = Blockly.Python.valueToCode(block, 'FILE', Blockly.Python.ORDER_NONE) || 'None';
    return `${file}.close()\n`;
  };