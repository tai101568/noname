steal('jquery/model', function(){

$.Model('Sensolus.Models.TemplatedApplication',
/* @Static */
{
	
	// REST methods
	findAll: "/server/rest/templatedapplications",
  	findOne : "/server/rest/templatedapplications/{id}", 
  	create : function(params, success, error){
		  	    return $.ajax({
		  	      url: "/server/rest/templatedapplications",
		  	      type: 'post',
		  	      headers: { "Content-Type": "application/json", "Accept": "application/json" },
		  	      dataType: 'json sensolus_models_templated_application.model',
		  	      data:$.toJSON(params),
		  	      success: success,
		  	      error: error})
		  	  },
  	update :  function(id, params, success, error){
		 		 return $.ajax({
			  	   url: "/server/rest/templatedapplications/"+id,
			  	   type: 'put',
			  	   headers: { "Content-Type": "application/json", "Accept": "application/json" },
			  	   dataType: 'json sensolus_models_templated_application.model',
			  	   data:$.toJSON(params),
			  	   success: success,
			  	   error: error})
			  },
  	destroy : "/server/rest/templatedapplications/{id}"
},
/* @Prototype */
{});

})