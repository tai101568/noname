steal('jquery/model', function(){

$.Model('Sensolus.Models.ConnectedNodeType',
/* @Static */
{
	
//	  attributes : {
//		    owner: 'Sensolus.Models.User'
//	  },
	
	// REST methods
	findAll: "/server/rest/connectednodetypes",
  	findOne : "/server/rest/connectednodetypes/{id}", 
  	create : function(params, success, error){
		  	    return $.ajax({
		  	      url: "/server/rest/connectednodetypes",
		  	      type: 'post',
		  	      headers: { "Content-Type": "application/json", "Accept": "application/json" },
		  	      dataType: 'json sensolus_models_connected_node.model',
		  	      data:$.toJSON(params),
		  	      success: success,
		  	      error: error})
		  	  },
  	update :  function(id, params, success, error){
		 		 return $.ajax({
			  	   url: "/server/rest/connectednodetypes/"+id,
			  	   type: 'put',
			  	   headers: { "Content-Type": "application/json", "Accept": "application/json" },
			  	   dataType: 'json sensolus_models_connected_node.model',
			  	   data:$.toJSON(params),
			  	   success: success,
			  	   error: error})
			  },
  	destroy : "/server/rest/connectednodetypes/{id}"
},
/* @Prototype */
{});

})