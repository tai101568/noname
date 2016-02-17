steal('jquery/model', function(){

$.Model('Sensolus.Models.ComponentLogEntry',
/* @Static */
{
	
	// REST methods
	findAll: "/server/rest/logs",
  	findOne : "/server/rest/logs/{id}", 
  	create : function(params, success, error){
		  	    return $.ajax({
		  	      url: "/server/rest/logs",
		  	      type: 'post',
		  	      headers: { "Content-Type": "application/json", "Accept": "application/json" },
		  	      dataType: 'json sensolus_models_component_log_entry.model',
		  	      data:$.toJSON(params),
		  	      success: success,
		  	      error: error})
		  	  },
  	destroy : "/server/rest/logs/{id}"
},
/* @Prototype */
{});

})