steal('jquery/model', function(){

$.Model('Sensolus.Models.DataFeedType',
/* @Static */
{
	
//	  attributes : {
//		    owner: 'Sensolus.Models.User'
//	  },
	
	// REST methods
	findAll: "/server/rest/datafeedtypes",
  	findOne : "/server/rest/datafeedtypes/{id}"
},
/* @Prototype */
{});

})