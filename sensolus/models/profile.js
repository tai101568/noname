steal('jquery/model', function(){

/**
 * @class Sensolus.Models.Profile
 * @parent index
 * @inherits jQuery.Model
 * Wraps backend user services.  
 */
$.Model('Sensolus.Models.Profile',
/* @Static */
{
	findAll: "/server/rest/profiles",
  	findOne : "/server/rest/profiles/{id}", 
  	create : function(params, success, error){
		  	    return $.ajax({
		  	      url: "/	s",
		  	      type: 'post',
		  	      headers: { "Content-Type": "application/json", "Accept": "application/json" },
		  	      dataType: 'json sensolus_models_profile.model',
		  	      data:$.toJSON(params),
		  	      success: success,
		  	      error: error})
		  	  },
 	update :  function(id, params, success, error){
		 		 return $.ajax({
			  	   url: "/server/rest/profiles/"+id,
			  	   type: 'put',
			  	   headers: { "Content-Type": "application/json", "Accept": "application/json" },
			  	   dataType: 'json sensolus_models_profile.model',
			  	   data:$.toJSON(params),
			  	   success: success,
			  	   error: error})
			  },
  	destroy : "/server/rest/profiles/{id}"
},
/* @Prototype */
{});

})