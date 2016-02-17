steal( 'jquery/controller',
	   'jquery/view/ejs',
	   'jquery/controller/view',
	   'sensolus/models', 
	   'sensolus/models/realtime_data.js',
	   'sensolus/models/demo_api.js',
	   'sensolus/widgets/historical_data/feed/json_grid.js',
	   'sensolus/widgets/historical_data/feed/graph.js',
	   'sensolus/widgets/data_visualizations/templates/configurable_live_data_card/configurable_live_data_card.js',
	   'sensolus/models/indoor_tracking_api.js',
	   'jquery/lang/string')
.then( function($){


Sensolus.Widgets.DataVisualization.Templates.ConfigurableLiveDataCard('Sensolus.Widgets.DataVisualization.Custom.IbeaconDetectorLiveDataCard',
/** @Static */
{
	defaults : {
		pollerInterval:3000,
		beaconInfo:{},
		titleIcon:"sicon-node-beacon",
		rows:[
		       {
		    	  referenceName:"beacon_advertisement",
		    	  title:"Beacon advertisments",
		    	  cssIcon:"icol32-distribution-partnerships",
		    	  renderData:function(dataItem) {
		    		  var advJSONObj =  $.parseJSON(dataItem.content)
		    		  if(advJSONObj!=null){
		    			  var a = new Date(advJSONObj.timestamp);
		    			  var time = a.getHours()+':'+a.getMinutes()+':'+a.getSeconds();		    
		    			  return  "<p style=\"font-size:20px;\">Beacon id: "+IndoorTrackingAPI.getLogicalBeaconName(advJSONObj.beacon_id)+"<br>Distance: "+advJSONObj.zone + " ("+ advJSONObj.rssi + " db)<br><p style=\"color:gray;font-size:15px;\">@"+time+"</p></p>"
		    	  	  }	
		    		  else
		    			  return "bad distance json format"
		    	  }
		      }, 
		      {
		    	  referenceName:"detected_beacon_list",
		    	  title:"Detected beacons",
		    	  cssIcon:"icol32-radiolocator",
		    	  renderData:function(dataItem) {
		    		  var beaconListJSONObj =  $.parseJSON(dataItem.content)
		    		  if(beaconListJSONObj!=null){
		    			 var html=""
    					 if(beaconListJSONObj.beacon_list==null || beaconListJSONObj.beacon_list.length==0)
    						 return "No beacons detected"
    					 html+="<ol style=\"font-size:20px;\">"
    					 for (var i=0;i<beaconListJSONObj.beacon_list.length;i++){
    						 var beacon = beaconListJSONObj.beacon_list[i];
    						 var a = new Date(beacon.timestamp);
    					     var time = a.getHours()+':'+a.getMinutes()+':'+a.getSeconds();
    						 html+="<li>"+IndoorTrackingAPI.getLogicalBeaconName(beacon.beacon_id)+" @ "+beacon.rssi + "db ("+ beacon.zone + ")<p style=\"color:gray;font-size:15px;\">@"+time+"</p></li>"
    					 }
    					 html+="</ol>"
    					 return html;
		    		  }
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