steal( 'jquery/controller',
	   'jquery/view/ejs',
	   'jquery/controller/view',
	   'sensolus/models', 
	   'sensolus/models/realtime_data.js',
	   'sensolus/models/demo_api.js',
	   'sensolus/widgets/historical_data/feed/json_grid.js',
	   'sensolus/widgets/historical_data/feed/graph.js',
	   'sensolus/widgets/data_visualizations/templates/configurable_live_data_card/configurable_live_data_card.js',
	   'jquery/lang/string')
.then( function($){


Sensolus.Widgets.DataVisualization.Templates.ConfigurableLiveDataCard('Sensolus.Widgets.DataVisualization.Custom.TIBeaconLiveDataCard',
/** @Static */
{
	defaults : {
		pollerInterval:3000,
		titleIcon:"sicon-node-beacon",
		rows:[
		       {
		    	  referenceName:"router_distance",
		    	  title:"Location",
		    	  cssIcon:"icol32-radiolocator",
		    	  renderData:function(dataItem) {
		    		  var distanceJSONObj =  $.parseJSON(dataItem.content)
		    		  if(distanceJSONObj!=null)
		    			  return  "@"+distanceJSONObj.router_id+"<br>distance: "+distanceJSONObj.qualitative_distance + " ("+ distanceJSONObj.rssi + ")"
		    		  else
		    			  return "bad distance json format"
		    	  }
		      }]
	}
},
/** @Prototype */
{
		
// end controller	
});

// end steal then
});