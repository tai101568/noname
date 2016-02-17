steal( 'jquery/controller',
       'jquery/view/ejs',
	   'jquery/dom/form_params',
	   'jquery/lang/json',
	   'jquery/controller/view',
	   'sensolus/models',
       'jquery/dom/route')
	.then( function($){


$.Controller('Sensolus.Widgets.Component.ConfigurationEditor',
/** @Static */
{
	defaults : {
		// inputs to configure
		inputs:[],
		
		// structure
		model:null,
		editTemplate:null,
		validator: {rules: {},messages: {}},   	
		customFieldDefinitions:[],
		//messages
		widgetTitle: "Edit [data item]",
		widgetIconClass: "icon-grid",
		loadingErrorMsg:"An error occured while loading data item details",
		savingErrorMsg:"An error occured while saving data item details",
		saveButtonText:"save",
		// template methods	
		onInit:function(){},
		onSetData:function(){},
		onView:function(){},
		onCancelClicked:function(){}
	}
},/** @Prototype */
{
	init : function(){
		var self=this;
		var editor_el_id = this.element.attr('id');
		this.formID=editor_el_id+"_configuration_form"
		
		this.formElement=$("#"+this.formID);
		this.successMsgElement = this.element.find('.edit-form-success');
		this.warningMsgElement = this.element.find('.edit-form-warning');
		this.errorMsgElement = this.element.find('.edit-form-error');
		
		// create view from template
		this.element.html(this.view('//sensolus/widgets/component/views/init.ejs',{formID:this.formID}));
		
        self.options.onInit(self.formElement)
	},
	
	addInput:function(input){	
		var self=this
		console.log(this.isInputAddedToForm(input))
		if(this.isInputAddedToForm(input)){
			return
		}
		this.options.inputs.push(input)
		// draw input title
		$("#"+this.element.attr('id')).find('div[class=input_name]').html("&nbsp;&nbsp;&nbsp&nbsp;&nbsp;&nbsp;"+input.name)
		// draw form fields related with the input
		$("#"+this.element.attr('id')).find('div[class=configuration_fields]').html("") // reset it
		var dataTypeSchema = $.secureEvalJSON(input.dataType.jsonSchema)
		var dataTypeSchemaProps=[]
		$.each(dataTypeSchema.properties, function(key, property){  
			self.drawInputField(key,property,input)
		});
		
	},
	
	isInputAddedToForm:function(anInput){
		for (var i = 0; i < this.options.inputs.length; i++) {
		    var input = this.options.inputs[i]
		    if(input.id===anInput.id){
				return true;
			}
		}
		return false;
	},
	
	drawInputField:function(key,schemaProp, input){	
		var self=this	
		var inputType= "text"
		switch(schemaProp.type)  
		    {  		 		
		        case "string" : 
		        case "number" : 
		        case "integer" : 
		        	this.inputConfField=$('<input>').attr({type: 'hidden',name: key}) 
		        break;  
		    }  	
		$("#"+this.element.attr('id')).find('div[class=configuration_fields]').append(
				"<div class=\"mws-form-row\">"+
				"	<label class=\"mws-form-label\">"+schemaProp.description+"</label>"+
				"	<div class=\"mws-form-item\">"+
				"		<input type=\""+inputType+"\" name=\""+key+"\" class=\"required large\">"+
				"	</div>"+
				"</div>");
		// add validation rule
		self.options.validator.rules[key]={required: true}
		self.options.validator.messages[key]={required: "This field is required"}
		
		
	},
	
	setData: function(component) {  
		var self = this
		$.each(component.default_values, function(key, defaultValue){  
			//if(defaultValue.input_id===self.options.input.id){
				var configValues = $.secureEvalJSON(defaultValue.value)
				$.each(configValues, function(key, value){  
					console.log(key+" --> "+value)
				    var $ctrl = $('[name='+key+']')//, $("#"+self.formID));  
				    switch($ctrl.attr("type"))  
				    {  
				    
				        case "text" : 
				        case "password" : 
				        case "hidden":  
				        case "textarea":
				        	$ctrl.val(value);   
				        break;   
				        case "radio" : case "checkbox":   
				        	$ctrl.attr("checked",value);  
				        break;  
				    }  
			    	switch($ctrl.prop("tagName"))  
				    {  
				        case "SELECT":
				        	//console.log($ctrl.children("option"))
				        	$ctrl.children("option").filter(function() {
				        		// TODO: change: dit is geen text maar de value die je moet vg.. value() zelf werkt wel niet
				        	    return $(this).val() == value; 
				        	}).attr('selected', true);
			        	break;
				    }
				});
			//}
		});

		
	    
	},
	
	getData: function() {  
		var self = this
		var configValues = []
		$.each(this.options.inputs,function(index,input){
			var jsonValue={}
			var dataTypeSchema = $.secureEvalJSON(input.dataType.jsonSchema)
			$.each(dataTypeSchema.properties, function(key, schemaProp){
				var $ctrl = $('[name='+key+']')
				switch(schemaProp.type)  
			    {  		 		
			        case "string" :
			        	jsonValue[key]=$ctrl.val()
			        	break
			        case "number" : 
			        	jsonValue[key]=parseFloat($ctrl.val())
			        	break
			        case "integer" : 
			        	jsonValue[key]=parseInt($ctrl.val())
			        	break;
			        default:
			        	jsonValue[key]=$ctrl.val()
			    }  	
			});
			var configValue = {}
			configValue.input_id=input.id
			configValue.input_ref_name=input.referenceName
			configValue.value=JSON.stringify(jsonValue);
			configValues.push(configValue)
		})	
		return configValues   
	},
	
	getValidator: function() {  
		return this.options.validator
	},

	
	
	
	setEditable:function(editable){
		if(editable){
			$("#"+this.element.attr('id')).find('input:text, input:password, input:file, select, textarea').removeAttr('disabled');
			$("#"+this.element.attr('id')).find('input:radio, input:checkbox').removeAttr('disabled');
			$('.save_data').show();
		}else{
			$("#"+this.element.attr('id')).find('input:text, input:password, input:file, select, textarea').attr("disabled","disabled");
			$("#"+this.element.attr('id')).find('input:radio, input:checkbox').attr("disabled","disabled");
			$('.save_data').hide();
		}
		
	
	},
	
	resetForm:function(){
		this.errorMsgElement.hide();
    	this.successMsgElement.hide();
    	this.warningMsgElement.hide();
    	$("[name=id]", $("#"+this.formID)).remove();
    	$("#"+this.formID).find('input:text, input:password, input:file, select, textarea').val('');
    	$("#"+this.formID).find('input:radio, input:checkbox').removeAttr('checked').removeAttr('selected');
    	$("#"+this.formID).validate().resetForm( )
	}

})

});