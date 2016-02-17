steal('jquery/model', function(){

$.Model('Sensolus.Models.ApplicationTemplate',
/* @Static */
{
	
	// REST methods
	findAll: "/server/rest/componenttemplates",
  	findOne : "/server/rest/componenttemplates/{id}?tag=application", 
  	create : function(params, success, error){
		  	    return $.ajax({
		  	      url: "/server/rest/componenttemplates",
		  	      type: 'post',
		  	      headers: { "Content-Type": "application/json", "Accept": "application/json" },
		  	      dataType: 'json sensolus_models_application_template.model',
		  	      data:$.toJSON(params),
		  	      success: success,
		  	      error: error})
		  	  },
  	update :  function(id, params, success, error){
		 		 return $.ajax({
			  	   url: "/server/rest/componenttemplates/"+id,
			  	   type: 'put',
			  	   headers: { "Content-Type": "application/json", "Accept": "application/json" },
			  	   dataType: 'json sensolus_models_application_template.model',
			  	   data:$.toJSON(params),
			  	   success: success,
			  	   error: error})
			  }
},
/* @Prototype */
{});

})