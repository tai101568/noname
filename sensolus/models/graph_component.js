steal('jquery/model', function(){

$.Model('Sensolus.Models.GraphComponent',
/* @Static */
{
	
	// REST methods
	findAll: "/server/rest/graphcomponents",
  	findOne : "/server/rest/graphcomponents/{id}", 
  	create : function(params, success, error){
		  	    return $.ajax({
		  	      url: "/server/rest/graphcomponents",
		  	      type: 'post',
		  	      headers: { "Content-Type": "application/json", "Accept": "application/json" },
		  	      dataType: 'json sensolus_models_graph_component.model',
		  	      data:$.toJSON(params),
		  	      success: success,
		  	      error: error})
		  	  },
  	update :  function(id, params, success, error){
		 		 return $.ajax({
			  	   url: "/server/rest/graphcomponents/"+id,
			  	   type: 'put',
			  	   headers: { "Content-Type": "application/json", "Accept": "application/json" },
			  	   dataType: 'json sensolus_models_graph_component.model',
			  	   data:$.toJSON(params),
			  	   success: success,
			  	   error: error})
			  },
  	destroy : "/server/rest/graphcomponents/{id}"
},
/* @Prototype */
{});

})