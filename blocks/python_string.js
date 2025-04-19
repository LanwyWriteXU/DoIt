// 字符串操作扩展
  Blockly.Blocks['python_string_upper'] = {
    init: function() {
      this.appendValueInput('STRING')
        .setCheck('String')
        .appendField('转换为大写');
      this.setOutput(true, 'String');
      this.setColour(160);
      this.setTooltip('将字符串转换为大写');
    }
  };
  
  Blockly.Python['python_string_upper'] = function(block) {
    const str = Blockly.Python.valueToCode(block, 'STRING', Blockly.Python.ORDER_NONE) || '""';
    return [`${str}.upper()`, Blockly.Python.ORDER_MEMBER];
  };
  
  Blockly.Blocks['python_string_lower'] = {
    init: function() {
      this.appendValueInput('STRING')
        .setCheck('String')
        .appendField('转换为小写');
      this.setOutput(true, 'String');
      this.setColour(160);
      this.setTooltip('将字符串转换为小写');
    }
  };
  
  Blockly.Python['python_string_lower'] = function(block) {
    const str = Blockly.Python.valueToCode(block, 'STRING', Blockly.Python.ORDER_NONE) || '""';
    return [`${str}.lower()`, Blockly.Python.ORDER_MEMBER];
  };
  
  Blockly.Blocks['python_string_split'] = {
    init: function() {
      this.appendValueInput('STRING')
        .setCheck('String')
        .appendField('分割字符串');
      this.appendValueInput('DELIMITER')
        .setCheck('String')
        .appendField('分隔符');
      this.setOutput(true, 'Array');
      this.setColour(160);
      this.setTooltip('使用分隔符分割字符串');
    }
  };
  
  Blockly.Python['python_string_split'] = function(block) {
    const str = Blockly.Python.valueToCode(block, 'STRING', Blockly.Python.ORDER_NONE) || '""';
    const delimiter = Blockly.Python.valueToCode(block, 'DELIMITER', Blockly.Python.ORDER_NONE) || '" "';
    return [`${str}.split(${delimiter})`, Blockly.Python.ORDER_MEMBER];
  };