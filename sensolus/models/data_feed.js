steal('jquery/model', function(){

/**
 * @class Sensolus.Models.DataFeed
 * @parent index
 * @inherits jQuery.Model
 * Wraps backend data_feed services.  
 */
$.Model('Sensolus.Models.DataFeed',
/* @Static */
{
	// REST methods
	findAll: "/server/rest/datafeeds",
  	findOne : "/server/rest/datafeeds/{id}", 
  	create : function(params, success, error){
		  	    return $.ajax({
		  	      url: "/server/rest/datafeed",
		  	      type: 'post',
		  	      headers: { "Content-Type": "application/json", "Accept": "application/json" },
		  	      dataType: 'json sensolus_models_data_feed.model',
		  	      data:$.toJSON(params),
		  	      success: success,
		  	      error: error})
		  	  },
  	update :  function(id, params, success, error){
		 		 return $.ajax({
			  	   url: "/server/rest/datafeeds/"+id,
			  	   type: 'put',
			  	   headers: { "Content-Type": "application/json", "Accept": "application/json" },
			  	   dataType: 'json sensolus_models_data_feed.model',
			  	   data:$.toJSON(params),
			  	   success: success,
			  	   error: error})
			  },
  	destroy : "/server/rest/datafeeds/{id}"
},
/* @Prototype */
{});

})