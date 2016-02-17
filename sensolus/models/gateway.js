steal('jquery/model', function(){

$.Model('Sensolus.Models.Gateway',
/* @Static */
{
	
//	  attributes : {
//		    owner: 'Sensolus.Models.User'
//	  },
	
	// REST methods
	findAll: "/server/rest/gateways",
  	findOne : "/server/rest/gateways/{id}", 
  	create : function(params, success, error){
		  	    return $.ajax({
		  	      url: "/server/rest/gateways",
		  	      type: 'post',
		  	      headers: { "Content-Type": "application/json", "Accept": "application/json" },
		  	      dataType: 'json sensolus_models_gateway.model',
		  	      data:$.toJSON(params),
		  	      success: success,
		  	      error: error})
		  	  },
  	update :  function(id, params, success, error){
		 		 return $.ajax({
			  	   url: "/server/rest/gateways/"+id,
			  	   type: 'put',
			  	   headers: { "Content-Type": "application/json", "Accept": "application/json" },
			  	   dataType: 'json sensolus_models_gateway.model',
			  	   data:$.toJSON(params),
			  	   success: success,
			  	   error: error})
			  },
  	destroy : "/server/rest/gateways/{id}"
},
/* @Prototype */
{});

})