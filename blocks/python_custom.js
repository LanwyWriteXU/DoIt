Blockly.Blocks['import'] = {
    init: function() {
    this.appendDummyInput()
        .appendField("导入")
        .appendField(new Blockly.FieldTextInput("math"), "lib");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(250);
this.setTooltip("导入外置库");
this.setHelpUrl("");
    }
};

python.pythonGenerator.forBlock['import'] = function(block, generator) {
    var text_lib = block.getFieldValue('lib');
    generator.addImport('import ' + text_lib);
    var code = '';
    return code;
};

Blockly.Blocks['import_from'] = {
    init: function() {
    this.appendDummyInput()
       .appendField("从")
       .appendField(new Blockly.FieldTextInput("math"), "lib")
       .appendField("导入")
       .appendField(new Blockly.FieldTextInput("pi"), "name");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(250);
this.setTooltip("从外置库导入指定内容");
this.setHelpUrl("");
    }
}
python.pythonGenerator.forBlock['import_from'] = function(block, generator) {
    var text_lib = block.getFieldValue('lib');
    var text_name = block.getFieldValue('name');
    generator.addImport('from ' + text_lib + ' import ' + text_name);
    var code = '';
    return code;
}

Blockly.Blocks['code'] = {
    init: function() {
    this.appendDummyInput()
        .appendField("运行")
        .appendField(new Blockly.FieldTextInput("print(\"Hello World!\")"), "code");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(250);
this.setTooltip("运行自定义代码");
this.setHelpUrl("");
    }
};

python.pythonGenerator.forBlock['code'] = function(block, generator) {
    var text_code = block.getFieldValue('code');
    var code = text_code + '\n';
    return code;
  };

Blockly.Blocks['get'] = {
init: function() {
    this.appendDummyInput()
        .appendField("运行并返回")
        .appendField(new Blockly.FieldTextInput("1+1"), "code");
    this.setOutput(true, null);
    this.setColour(250);
this.setTooltip("运行自定义代码");
this.setHelpUrl("");
    }
};

python.pythonGenerator.forBlock['get'] = function(block, generator) {
    var text_code = block.getFieldValue('code');
    return [text_code, 1];
};