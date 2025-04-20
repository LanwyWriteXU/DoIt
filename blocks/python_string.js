//一个"print"的范例

// Blockly.Blocks['printblock'] = {
//   init: function() {
//     this.appendValueInput("NAME")
//         .setCheck(null)
//         .appendField("print");
//     this.setPreviousStatement(true, null);
//     this.setNextStatement(true, null);
//     this.setColour(230);
//  this.setTooltip("");
//  this.setHelpUrl("");
//   }
// };
// python.pythonGenerator.forBlock['printblock'] = function(block, generator) {
//   var value_name = generator.valueToCode(block, 'NAME', python.Order.ATOMIC);
//   // TODO: Assemble python into code variable.
//   var code = 'print(' + value_name + ')\n';
//   return code;
// };

// 字符串操作扩展
  Blockly.Blocks['python_string_upper'] = {
    init: function() {
      this.setStyle('text_blocks');
      this.appendValueInput("NAME")
          .setCheck("String")
          .appendField("转换为大写");
      this.setOutput(true, "String");
  this.setTooltip("将字符串转换为大写");
  this.setHelpUrl("");
    }
  };

  python.pythonGenerator.forBlock['python_string_upper'] = function(block, generator) {
    var value_name = generator.valueToCode(block, 'NAME', python.Order.ATOMIC);
    var code = value_name + '.upper()';
    return [code, 1];
  };
  
  Blockly.Blocks['python_string_lower'] = {
    init: function() {
      this.setStyle('text_blocks');
      this.appendValueInput("NAME")
          .setCheck("String")
          .appendField("转换为小写");
      this.setOutput(true, "String");
   this.setTooltip("将字符串转换为小写");
   this.setHelpUrl("");
    }
  };
  
  python.pythonGenerator.forBlock['python_string_lower'] = function(block, generator) {
    var value_name = generator.valueToCode(block, 'NAME', python.Order.ATOMIC);
    var code = value_name + '.lower()';
    return [code, 1];
  };
  
  Blockly.Blocks['python_string_split'] = {
    init: function() {
      this.setStyle('text_blocks');
      this.appendValueInput("string")
          .setCheck("String")
          .appendField("切割字符串");
      this.appendValueInput("del")
          .setCheck("String")
          .appendField("分隔符");
      this.setOutput(true, "String");
   this.setTooltip("使用分隔符分割字符串");
   this.setHelpUrl("");
    }
  };

  python.pythonGenerator.forBlock['python_string_split'] = function(block, generator) {
    var value_string = generator.valueToCode(block, 'string', python.Order.ATOMIC);
    var value_del = generator.valueToCode(block, 'del', python.Order.ATOMIC);
    var code = value_string + '.split(' + value_del +')';
    return [code, 1];
  };