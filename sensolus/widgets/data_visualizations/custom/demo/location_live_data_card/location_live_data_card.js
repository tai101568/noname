steal( 'jquery/controller',
	   'jquery/view/ejs',
	   'jquery/controller/view',
	   'sensolus/models/indoor_tracking_api.js',
	   'jquery/lang/string')
.then( function($){
    	   
    	  

$.Controller('Sensolus.Widgets.DataVisualization.Custom.Demo.LocationLiveDataCard',
/** @Static */
{
	defaults : {
		pollerInterval:3000
	}
},
/** @Prototype */
{
	
	connection:null,
	
	init : function(locationID){
		var self = this;
		this.element.html(this.view('//sensolus/widgets/data_visualizations/custom/demo/location_live_data_card/views/location_live_data_card.ejs'))
		
	},

	updateBeaconList:function(beacons){
		var self = this
		var beaconsHtml="---";
		if(beacons && beacons!=null){
			 if(beacons.length>0){
				 beacons.sort(function(b1,b2){return b1.localeCompare(b2)})
				 beaconsHtml="<ul style=\"font-size:20px;\">"
				 for (var i=0;i<beacons.length;i++){
					 var beaconName = IndoorTrackingAPI.getLogicalBeaconName(beacons[i].replace(/\_/g,":"));
					 beaconsHtml+="<li>"+beaconName+"</li>"
				 }
				 beaconsHtml+="</ul>"
		  	 }
		}
		self.element.find("span[name=beacons]").html(beaconsHtml)
		
		
	}

// end controller	
});

// end steal then
});