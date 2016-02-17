steal( 'jquery/controller',
       'jquery/view/ejs',
	   'jquery/lang/json',
	   'jquery/controller/view',
	   'sensolus/models',
	   'sensolus/js/tv4.min.js',
	   'sensolus/js/jquery.textarearesizer.compressed.js',
	   'sensolus/js/jquery-linedtextarea.js',
	   'sensolus/js/jquery-linedtextarea.css',
       'jquery/dom/route')
	.then( function($){


$.Controller('Sensolus.Widgets.Component.ConfigurationParametersField',
/** @Static */
{
	defaults : {
		paramFieldsSettings:{}
	}
},/** @Prototype */
{
	init : function() {
		this.initCustomValidators();
	},
	
	setData:function(component, isEditMode) {
		self = this
		
		this.reset();
		
		if (component.type.inputs.length != 0) {
			self.element.find("#configuration-parameters-header").show();
		}
		
		var container = self.element.find("#content");
		$.each(component.type.inputs, function(index, input) {
			if(input.configuration){
				var inputTextAreaRows = 2
				if(self.options.paramFieldsSettings!=null && self.options.paramFieldsSettings[input.referenceName]!=null && self.options.paramFieldsSettings[input.referenceName].rows!=null){
					inputTextAreaRows = self.options.paramFieldsSettings[input.referenceName].rows
				}
				container.append(
						"<div class=\"mws-form-row\">"+
						"	<label class=\"mws-form-label\">"+input.name+"</label>"+
						"	<div class=\"mws-form-item\">"+
						"		<textarea rows=\""+inputTextAreaRows+"\" " + (isEditMode!=true ? "readonly" : "") + " name=\"input_"+input.referenceName+"\" class=\"large lined resizable\">"+
						"	</div>"+
						"</div>");
				
				var inputField = $("textarea[name=input_"+input.referenceName+"]");
				
				var schema = {}
				try {
					schema = $.parseJSON(input.dataType.jsonSchema)
				} catch(err) {
					alert("Invalid schema\n\n" + input.dataType.jsonSchema)
				}
				
				inputField.rules("add", {
					schemaCheck: schema
				});
				
				inputField.val((component.defaultInputValues[input.id]!=null)?component.defaultInputValues[input.id]:component.defaultInputValues[input.referenceName])
				if(index==component.type.inputs.length-1){			
					$('textarea.resizable:not(.processed)').TextAreaResizer();$('iframe.resizable:not(.processed)').TextAreaResizer();	
					$(".lined").linedtextarea();
				}
			}
			
		})
	},
	
	reset:function() {
		this.element.find("#configuration-parameters-header").hide();
		
		this.element.find("#content").html("");
		this.options.validator = {rules:{}, messages:{}}
	},

	initCustomValidators:function() {
		$.validator.addMethod('schemaCheck', function(value, element, schema) {
			var validator = this;
			if (value == null || value == "") return true;
			
			var json =  "";
			try {
				json = $.parseJSON(value)
			} catch(err) {
				console.error("Invalid JSON: " + err)
	    		$.validator.messages.schemaCheck = "Invalid JSON: " + err;
				return false;
			}
			var jsonSchemaValidation = tv4.validateResult(json, schema)
			var valid = jsonSchemaValidation.valid
			if(valid){
				$.validator.messages.schemaCheck = "";
				return true;
			}else{
				$.validator.messages.schemaCheck = "Incorrect data format: " + jsonSchemaValidation.error;
				return false;
			}
			
	    },'Invalid JSON value or not matched with schema');
	}
})

});