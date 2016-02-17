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


Sensolus.Widgets.DataVisualization.Templates.ConfigurableLiveDataCard('Sensolus.Widgets.DataVisualization.Custom.TIEnvNodeLiveDataCard',
/** @Static */
{
	defaults : {
		pollerInterval:3000,
		titleIcon:"sicon-node-environmental",
		rows:[
		       {
		    	  referenceName:"ir_temperature",
		    	  title:"Temperature",
		    	  cssIcon:"icol32-temperature-3",
		    	  renderData:function(dataItem) {		
		    		  var ambientStringPart = dataItem.content.substring(0,dataItem.content.search(",\\s*\"object_temperature"));
		    		  return ambientStringPart.replace("{", "").replace("}", "")
		    		  	  .replace(/\"/g, "")
			    		  .replace("ambient_temperature", "").replace(":","") + " &deg;C"
		    	  }
		      },
		      {
		    	  referenceName:"pressure",
		    	  title:"Barometric pressure",
		    	  renderData:function(dataItem) {
		    		  return dataItem.content.replace("{", "").replace("}", "")
		    		  	  .replace(/\"/g, "")
			    		  .replace("value", "").replace(":","") + " Pa"
		    	  }
		      },
		      {
		    	  referenceName:"humidity",
		    	  title:"Humidity",
		    	  renderData:function(dataItem) {
		    		  
		    		  return dataItem.content.replace("{", "").replace("}", "")
		    		  	  .replace(/\"/g, "")
			    		  .replace("value", "").replace(":","") + " % RH"
		    	  }
		      },
		      {
		    	  referenceName:"battery",
		    	  title:"Battery remaining",
		    	  renderData:function(dataItem) {
		    		  var batteryJSONObj =  $.parseJSON(dataItem.content)
		    		  if(batteryJSONObj!=null)
		    			  return  batteryJSONObj.remaining+" %"
		    		  else
		    			  return "bad battery json format"
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