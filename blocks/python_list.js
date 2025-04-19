// 列表操作扩展
Blockly.Blocks['python_list_create'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('创建列表');
      this.appendStatementInput('ITEMS')
        .setCheck(null);
      this.setOutput(true, 'Array');
      this.setColour(260);
      this.setTooltip('创建一个包含指定元素的列表');
      this.setHelpUrl('https://docs.python.org/3/tutorial/datastructures.html#more-on-lists');
    }
  };
  
  Blockly.Python['python_list_create'] = function(block) {
    const items = Blockly.Python.statementToCode(block, 'ITEMS');
    const elements = items.split('\n')
      .filter(line => line.trim())
      .map(line => line.trim().replace(/^append\s+(.*)/, '$1'));
    return [`[${elements.join(', ')}]`, Blockly.Python.ORDER_ATOMIC];
  };
  
  Blockly.Blocks['python_list_append'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('添加元素');
      this.appendValueInput('ITEM')
        .setCheck(null);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(260);
      this.setTooltip('向列表添加一个元素');
    }
  };
  
  Blockly.Python['python_list_append'] = function(block) {
    const item = Blockly.Python.valueToCode(block, 'ITEM', Blockly.Python.ORDER_NONE) || 'None';
    return `append ${item}\n`;
  };
  
  Blockly.Blocks['python_list_get'] = {
    init: function() {
      this.appendValueInput('LIST')
        .setCheck('Array')
        .appendField('获取列表中索引为');
      this.appendValueInput('INDEX')
        .setCheck('Number');
      this.appendDummyInput()
        .appendField('的元素');
      this.setOutput(true, null);
      this.setColour(260);
      this.setTooltip('获取列表中指定索引的元素');
    }
  };
  
  Blockly.Python['python_list_get'] = function(block) {
    const list = Blockly.Python.valueToCode(block, 'LIST', Blockly.Python.ORDER_NONE) || '[]';
    const index = Blockly.Python.valueToCode(block, 'INDEX', Blockly.Python.ORDER_NONE) || '0';
    return [`${list}[${index}]`, Blockly.Python.ORDER_MEMBER];
  };
  
  Blockly.Blocks['python_list_set'] = {
    init: function() {
      this.appendValueInput('LIST')
        .setCheck('Array')
        .appendField('设置列表');
      this.appendValueInput('INDEX')
        .setCheck('Number')
        .appendField('索引');
      this.appendValueInput('VALUE')
        .setCheck(null)
        .appendField('值为');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(260);
      this.setTooltip('设置列表中指定索引的元素');
    }
  };
  
  Blockly.Python['python_list_set'] = function(block) {
    const list = Blockly.Python.valueToCode(block, 'LIST', Blockly.Python.ORDER_NONE) || '[]';
    const index = Blockly.Python.valueToCode(block, 'INDEX', Blockly.Python.ORDER_NONE) || '0';
    const value = Blockly.Python.valueToCode(block, 'VALUE', Blockly.Python.ORDER_NONE) || 'None';
    return `${list}[${index}] = ${value}\n`;
  };
  
  Blockly.Blocks['python_list_sort'] = {
    init: function() {
      this.appendValueInput('LIST')
        .setCheck('Array')
        .appendField('排序列表');
      this.appendDummyInput()
        .appendField('顺序')
        .appendField(new Blockly.FieldDropdown([
          ['升序', 'False'],
          ['降序', 'True']
        ]), 'REVERSE');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(260);
      this.setTooltip('对列表进行排序');
    }
  };
  
  Blockly.Python['python_list_sort'] = function(block) {
    const list = Blockly.Python.valueToCode(block, 'LIST', Blockly.Python.ORDER_NONE) || '[]';
    const reverse = block.getFieldValue('REVERSE');
    return `${list}.sort(reverse=${reverse})\n`;
  };