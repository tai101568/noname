steal( 'jquery/controller',
	   'jquery/view/ejs',
	   'jquery/controller/view',
	   'jquery/lang/string')
.then( function($){
    	   
    	  

$.Controller('Sensolus.Widgets.DataVisualization.Custom.Demo.IbeaconLiveDataCard',
/** @Static */
{
	defaults : {
		pollerInterval:3000
	}
},
/** @Prototype */
{
	
	connection:null,
	
	init : function(feedID){
		var self = this;
		this.element.html(this.view('//sensolus/widgets/data_visualizations/custom/demo/ibeacon_live_data_card/views/ibeacon_live_data_card.ejs'))
		
	},

	updateDetectionList:function(detections){
		var self = this
		var detectionsHtml="---";
		var locationHtml="---";
		if(detections && detections!=null){
			 if(detections.length>0){
				 detections.sort(function(d1,d2){return d1.rssi<d2.rssi})
				 detectionsHtml="<ol style=\"font-size:20px;\">"
				 for (var i=0;i<detections.length;i++){
					 var detection = detections[i];
					 var a = new Date(detection.timestamp);
				     var time = a.getHours()+':'+a.getMinutes()+':'+a.getSeconds();
					 detectionsHtml+="<li>"+detection.detectedBy.name+" @ "+detection.rssi + "db <p style=\"color:gray;font-size:15px;\">@"+time+"</p></li>"
					 if(i==0){
						 locationHtml=detection.detectedBy.name+" @ "+detection.rssi + "db <p style=\"color:gray;font-size:15px;\">@"+time+"</p>";
					 }
				 }
				 detectionsHtml+="</ol>"
		  	 }
		}
		self.element.find("span[name=beacon_location]").html(locationHtml)
		self.element.find("span[name=beacon_detections]").html(detectionsHtml)
		
		
	}

// end controller	
});

// end steal then
});