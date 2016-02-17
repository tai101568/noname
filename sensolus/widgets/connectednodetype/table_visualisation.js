steal( 'jquery/controller',
	   'jquery/view/ejs',
	   'jquery/controller/view',
	   'sensolus/models', 
	   'jquery/lang/string')
.then( function($){
    	   
    	  

/** 
 * Data grid widget module
 * 
 *  
 *  */
$.Controller('Sensolus.Widgets.ConnectedNodeTypeOutputs.TableVisualisation',
/** @Prototype */
{
	
	init : function(){
		var self = this;
		this.element.html(this.view('//sensolus/widgets/connectednodetype/views/table_visualisation.ejs'))		
	},
	
	showOutputs:function(outputs){
		this.drawDataFeedTableBody(outputs)
	},
	
	drawDataFeedTableBody:function(outputs){
		$('#connected_node_type_outputs-table tbody').empty();
		$.each(outputs, function(index, output){
			var jsonObject = $.parseJSON(output.dataType.jsonSchema)
			var textarea = "<textarea readonly rows='4' cols='60'>" + JSON.stringify(jsonObject, null, 4) + "</textarea>"
			
			$("#connected_node_type_outputs-table tbody").append("<tr><td>"+output.referenceName+"</td><td name="+output.id+"_description>" + output.description + "</td><td name="+output.id+"_jsonschema>" + textarea + "</td></tr>")
		})
	}
// end controller	
});

// end steal then
});