steal('jquery/model', function(){

$.Model('Sensolus.Models.DataType',
/* @Static */
{
	
	
	// REST methods
	findAll: "/server/rest/datatypes",
  	findOne : "/server/rest/datatypes/{id}"
},
/* @Prototype */
{});

})