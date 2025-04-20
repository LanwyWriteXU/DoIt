// 列表操作扩展
  Blockly.Blocks['python_list_create'] = {
    init: function() {
      this.setStyle('list_blocks');
      this.appendStatementInput("item")
          .setCheck(null)
          .appendField("创建列表");
      this.setOutput(true, "Array");
  this.setTooltip("创建一个包含指定元素的列表");
  this.setHelpUrl("https://docs.python.org/3/tutorial/datastructures.html#more-on-lists");
    }
  };  
  
  python.pythonGenerator.forBlock['python_list_create'] = function(block, generator) {
    var statements_item = generator.statementToCode(block, 'item');
    var elements = statements_item.split('\n')
      .filter(line => line.trim())
      .map(line => line.trim().replace(/^append\s+(.*)/, '$1'));
    var code = `[${elements.join(', ')}]`;
    return [code, 1];
  };
  
  Blockly.Blocks['python_list_append'] = {
    init: function() {
      this.setStyle('list_blocks');
      this.appendValueInput("item")
          .setCheck(null)
          .appendField("元素");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
   this.setTooltip("向新建的列表添加一个元素");
   this.setHelpUrl("");
    }
  };
  
  python.pythonGenerator.forBlock['python_list_append'] = function(block, generator) {
    var value_item = generator.valueToCode(block, 'item', python.Order.ATOMIC);
    var code = `append ${value_item}\n`;
    return code;
  };

  Blockly.Blocks['python_list_join'] = {
    init: function() {
      this.setStyle('list_blocks');
      this.appendValueInput("array")
          .setCheck(null)
          .appendField("向列表");
      this.appendValueInput("value")
          .setCheck(null)
          .appendField("添加");
      this.appendDummyInput();
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
   this.setTooltip("向列表添加新的项目");
   this.setHelpUrl("");
    }
  };

  python.pythonGenerator.forBlock['python_list_join'] = function(block, generator) {
    var value_array = generator.valueToCode(block, 'array', python.Order.ATOMIC);
    var value_value = generator.valueToCode(block, 'value', python.Order.ATOMIC);
    var code = `${value_array}.append(${value_value})\n`;
    return code;
  };

  Blockly.Blocks['python_list_get'] = {
    init: function() {
      this.setStyle('list_blocks');
      this.appendValueInput("array")
          .setCheck(null)
          .appendField("列表");
      this.appendValueInput("index")
          .setCheck(null)
          .appendField("第");
      this.appendDummyInput()
          .appendField("项");
      this.setOutput(true, null);
   this.setTooltip("获取列表项目");
   this.setHelpUrl("");
    }
  };
  
  python.pythonGenerator.forBlock['python_list_get'] = function(block, generator) {
    var value_array = generator.valueToCode(block, 'array', python.Order.ATOMIC);
    var value_index = generator.valueToCode(block, 'index', python.Order.ATOMIC) - 1;
    var code = value_array + '[' + value_index + ']';
    return [code, 1];
  };
  
  Blockly.Blocks['python_list_set'] = {
    init: function() {
      this.setStyle('list_blocks');
      this.appendValueInput("array")
          .setCheck(null)
          .appendField("设置列表");
      this.appendValueInput("index")
          .setCheck(null)
          .appendField("第");
      this.appendDummyInput()
          .appendField("项为");
      this.appendValueInput("value")
          .setCheck(null);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
   this.setTooltip("修改某一项");
   this.setHelpUrl("");
    }
  };

  python.pythonGenerator.forBlock['python_list_set'] = function(block, generator) {
    var value_array = generator.valueToCode(block, 'array', python.Order.ATOMIC);
    var value_index = generator.valueToCode(block, 'index', python.Order.ATOMIC) - 1;
    var value_value = generator.valueToCode(block, 'value', python.Order.ATOMIC);
    var code = value_array + '[' + value_index + '] = ' + value_value +   '\n';
    return code;
  };

  Blockly.Blocks['python_list_sort'] = {
    init: function() {
      this.setStyle('list_blocks');
      this.appendValueInput("array")
          .setCheck(null)
          .appendField("排序列表");
      this.appendDummyInput()
          .appendField("为")
          .appendField(new Blockly.FieldDropdown([["升序","False"], ["倒序","True"]]), "reserve");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
  this.setTooltip("对列表进行排序");
  this.setHelpUrl("");
    }
  };

  python.pythonGenerator.forBlock['python_list_sort'] = function(block, generator) {
    var value_array = generator.valueToCode(block, 'array', python.Order.ATOMIC);
    var dropdown_reserve = block.getFieldValue('reserve');
    var code = value_array + '.sort(reverse=' + dropdown_reserve +')\n';
    return code;
  };