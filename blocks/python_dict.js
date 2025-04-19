// 字典操作扩展
Blockly.Blocks['python_dict_create'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('创建字典');
      this.appendStatementInput('ITEMS')
        .setCheck(null);
      this.setOutput(true, null);
      this.setColour(300);
      this.setTooltip('创建一个包含键值对的字典');
      this.setHelpUrl('https://docs.python.org/3/tutorial/datastructures.html#dictionaries');
    }
  };
  
  Blockly.Python['python_dict_create'] = function(block) {
    const items = Blockly.Python.statementToCode(block, 'ITEMS');
    const pairs = items.split('\n')
      .filter(line => line.trim())
      .map(line => line.trim().replace(/^set\s+([^\s]+)\s+to\s+(.*)/, '$1: $2'));
    return [`{${pairs.join(', ')}}`, Blockly.Python.ORDER_ATOMIC];
  };
  
  Blockly.Blocks['python_dict_set'] = {
    init: function() {
      this.appendValueInput('DICT')
        .setCheck(null)
        .appendField('设置字典');
      this.appendValueInput('KEY')
        .setCheck(null)
        .appendField('键');
      this.appendValueInput('VALUE')
        .setCheck(null)
        .appendField('值');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(300);
      this.setTooltip('设置字典中的键值对');
    }
  };
  
  Blockly.Python['python_dict_set'] = function(block) {
    const dict = Blockly.Python.valueToCode(block, 'DICT', Blockly.Python.ORDER_NONE) || '{}';
    const key = Blockly.Python.valueToCode(block, 'KEY', Blockly.Python.ORDER_NONE) || '""';
    const value = Blockly.Python.valueToCode(block, 'VALUE', Blockly.Python.ORDER_NONE) || 'None';
    return `${dict}[${key}] = ${value}\n`;
  };
  
  Blockly.Blocks['python_dict_get'] = {
    init: function() {
      this.appendValueInput('DICT')
        .setCheck(null)
        .appendField('获取字典');
      this.appendValueInput('KEY')
        .setCheck(null)
        .appendField('键');
      this.appendDummyInput()
        .appendField('的值');
      this.setOutput(true, null);
      this.setColour(300);
      this.setTooltip('获取字典中指定键的值');
    }
  };
  
  Blockly.Python['python_dict_get'] = function(block) {
    const dict = Blockly.Python.valueToCode(block, 'DICT', Blockly.Python.ORDER_NONE) || '{}';
    const key = Blockly.Python.valueToCode(block, 'KEY', Blockly.Python.ORDER_NONE) || '""';
    return [`${dict}[${key}]`, Blockly.Python.ORDER_MEMBER];
  };
  
  Blockly.Blocks['python_dict_keys'] = {
    init: function() {
      this.appendValueInput('DICT')
        .setCheck(null)
        .appendField('获取字典的所有键');
      this.setOutput(true, 'Array');
      this.setColour(300);
      this.setTooltip('获取字典的所有键组成的列表');
    }
  };
  
  Blockly.Python['python_dict_keys'] = function(block) {
    const dict = Blockly.Python.valueToCode(block, 'DICT', Blockly.Python.ORDER_NONE) || '{}';
    return [`list(${dict}.keys())`, Blockly.Python.ORDER_FUNCTION_CALL];
  };