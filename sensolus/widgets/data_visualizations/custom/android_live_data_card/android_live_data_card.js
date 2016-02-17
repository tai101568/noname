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


Sensolus.Widgets.DataVisualization.Templates.ConfigurableLiveDataCard('Sensolus.Widgets.DataVisualization.Custom.AndroidLiveDataCard',
/** @Static */
{
	defaults : {
		pollerInterval:3000,
		titleIcon:"icol-mobile-phone",
		rows:[
		      {
		    	  referenceName:"battery",
		    	  title:"Battery remain",
		    	  renderData:function(dataItem) {
		    		  var batteryJSONObj =  $.parseJSON(dataItem.content)
		    		  if(batteryJSONObj!=null)
		    			  return  batteryJSONObj.voltage +" mV,<br>"+batteryJSONObj.remaining+" %"
		    		  else
		    			  return "bad battery json format"
		    		 
		    	  }
		      },
		      {
		    	  referenceName:"acceleration",
		    	  renderData:function(dataItem) {
		    		  return dataItem.content.replace("{", "").replace("}", "")
			    		  .replace(/\"/g, "")
			    		  .replace(/,/g, ", ")
			    		  .replace(/acc/g, "")
			    		  .replace(/:/g,"=")
		    	  }
		      },
		      {
		    	  referenceName:"location",
		    	  title:"Location",
		    	  cssIcon:"icol32-radiolocator"
		      }]
	}
},
/** @Prototype */
{
		
// end controller	
});

// end steal then
});