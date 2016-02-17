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


Sensolus.Widgets.DataVisualization.Templates.ConfigurableLiveDataCard('Sensolus.Widgets.DataVisualization.Custom.TIGenericNodeLiveDataCard',
/** @Static */
{
	defaults : {
		pollerInterval:3000,
		titleIcon:"sicon-node-generic",
		rows:[
		       {
		    	  referenceName:"ir_temperature",
		    	  title:"Temperature",
		    	  cssIcon:"icol32-temperature-3",
		    	  renderData:function(dataItem) {
		    		  var tempJSONObj =  $.parseJSON(dataItem.content)
		    		  if(tempJSONObj!=null)
		    			  return  "ambient: "+ tempJSONObj.ambient_temperature + " &deg;C <br> "+"object: "+ tempJSONObj.object_temperature + " &deg;C"
		    		  else
		    			  return "bad json format"
		    	  }
		      },
		      {
		    	  referenceName:"pressure",
		    	  title:"Barometric pressure",
		    	  renderData:function(dataItem) {
		    		  return dataItem.content.replace("{", "").replace("}", "")
		    		  	  .replace(/\"/g, "")
			    		  .replace("value", "").replace(":","") + " Pascal"
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
		    	  referenceName:"acceleration",
		    	  title:"Acceleration [g]",
		    	  renderData:function(dataItem) {
		    		  return dataItem.content.replace("{", "").replace("}", "")
			    		  .replace(/\"/g, "")
			    		  .replace(/,/g, ", ")
			    		  .replace(/acc/g, "")
			    		  .replace(/:/g,"=")
		    	  }
		      },
		      {
		    	  referenceName:"magnetic_field_strength",
		    	  title:"Magnetic field strength [T]",
		    	  renderData:function(dataItem) {
		    		  return dataItem.content.replace("{", "").replace("}", "")
			    		  .replace(/\"/g, "")
			    		  .replace(/,/g, ", ")
			    		  .replace(/magnetic/g, "")
			    		  .replace(/:/g,"=")
		    	  }
		      },	
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