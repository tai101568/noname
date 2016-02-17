steal('jquery/model', function(){

/**
 * @class Sensolus.Models.User
 * @parent index
 * @inherits jQuery.Model
 * Wraps backend user services.  
 */
$.Model('Sensolus.Models.User',
/* @Static */
{
	findAll: "/server/rest/users",
  	findOne : "/server/rest/users/{id}", 
  	create : function(params, success, error){
		  	    return $.ajax({
		  	      url: "/server/rest/users",
		  	      type: 'post',
		  	      headers: { "Content-Type": "application/json", "Accept": "application/json" },
		  	      dataType: 'json sensolus_models_user.model',
		  	      data:$.toJSON(params),
		  	      success: success,
		  	      error: error})
		  	  },
 	update :  function(id, params, success, error){
		 		 return $.ajax({
			  	   url: "/server/rest/users/"+id,
			  	   type: 'put',
			  	   headers: { "Content-Type": "application/json", "Accept": "application/json" },
			  	   dataType: 'json sensolus_models_user.model',
			  	   data:$.toJSON(params),
			  	   success: success,
			  	   error: error})
			  },
  	destroy : "/server/rest/users/{id}"
},
/* @Prototype */
{});

})