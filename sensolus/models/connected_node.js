steal('jquery/model', function(){

$.Model('Sensolus.Models.ConnectedNode',
/* @Static */
{
	
//	  attributes : {
//		    owner: 'Sensolus.Models.User'
//	  },
	
	// REST methods
	findAll: "/server/rest/connectednodes",
  	findOne : "/server/rest/connectednodes/{id}", 
  	create : function(params, success, error){
		  	    return $.ajax({
		  	      url: "/server/rest/connectednodes",
		  	      type: 'post',
		  	      headers: { "Content-Type": "application/json", "Accept": "application/json" },
		  	      dataType: 'json sensolus_models_connected_node.model',
		  	      data:$.toJSON(params),
		  	      success: success,
		  	      error: error})
		  	  },
  	update :  function(id, params, success, error){
		 		 return $.ajax({
			  	   url: "/server/rest/connectednodes/"+id,
			  	   type: 'put',
			  	   headers: { "Content-Type": "application/json", "Accept": "application/json" },
			  	   dataType: 'json sensolus_models_connected_node.model',
			  	   data:$.toJSON(params),
			  	   success: success,
			  	   error: error})
			  },
  	destroy : "/server/rest/connectednodes/{id}"
},
/* @Prototype */
{});

})