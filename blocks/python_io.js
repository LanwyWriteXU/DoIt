// 文件操作扩展
  Blockly.Blocks['python_file_open'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("以")
          .appendField(new Blockly.FieldDropdown([["读取","'r'"], ["写入","'w'"], ["追加","'a'"], ["读写","'r+'"]]), "mode");
      this.appendValueInput("filename")
          .setCheck(null)
          .appendField("模式读取文件");
      this.appendDummyInput();
      this.setOutput(true, null);
      this.setColour(290);
  this.setTooltip("打开一个文件并返回文件对象");
  this.setHelpUrl("https://docs.python.org/3/tutorial/inputoutput.html#reading-and-writing-files");
    }
  };

  python.pythonGenerator.forBlock['python_file_open'] = function(block, generator) {
    var dropdown_mode = block.getFieldValue('mode');
    var value_filename = generator.valueToCode(block, 'filename', python.Order.ATOMIC);
    var code = `open(${value_filename}, ${dropdown_mode})`;
    return [code, 1];
  };
  
  Blockly.Blocks['python_file_read'] = {
    init: function() {
      this.appendValueInput("file")
          .setCheck(null)
          .appendField("文件内容");
      this.appendDummyInput();
      this.setOutput(true, "String");
      this.setColour(290);
  this.setTooltip("读取文件内容");
  this.setHelpUrl("https://docs.python.org/3/tutorial/inputoutput.html#reading-and-writing-files");
    }
  };

  python.pythonGenerator.forBlock['python_file_read'] = function(block, generator) {
    var value_file = generator.valueToCode(block, 'file', python.Order.ATOMIC) || 'None';
    var code = `${value_file}.read()`;
    return [code, 1];
  };
  
  Blockly.Blocks['python_file_write'] = {
    init: function() {
      this.appendValueInput("file")
          .setCheck(null)
          .appendField("向文件");
      this.appendValueInput("content")
          .setCheck(null)
          .appendField("写入");
      this.appendDummyInput();
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(290);
   this.setTooltip("向文件写入内容");
   this.setHelpUrl("");
    }
  };
  
  python.pythonGenerator.forBlock['python_file_write'] = function(block, generator) {
    var value_file = generator.valueToCode(block, 'file', python.Order.ATOMIC) || 'None';
    var value_content = generator.valueToCode(block, 'content', python.Order.ATOMIC);
    var code = `${value_file}.write(${value_content})\n`;
    return code;
  };
  
  Blockly.Blocks['python_file_close'] = {
    init: function() {
      this.appendValueInput("file")
          .setCheck(null)
          .appendField("关闭文件");
      this.appendDummyInput();
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(290);
  this.setTooltip("关闭文件");
  this.setHelpUrl("");
    }
  };  

  python.pythonGenerator.forBlock['python_file_close'] = function(block, generator) {
    var value_file = generator.valueToCode(block, 'file', python.Order.ATOMIC);
    var code = `${value_file}.close()\n`;
    return code;
  };