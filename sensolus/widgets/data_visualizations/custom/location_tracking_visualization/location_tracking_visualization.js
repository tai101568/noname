steal( 'jquery/controller',
	   'jquery/view/ejs',
	   'jquery/controller/view',
	   'sensolus/models',
	   'sensolus/widgets/data_visualizations/templates/generic_live_data_card/generic_live_data_card.js',
	   'sensolus/models/realtime_data.js',
	   'sensolus/widgets/historical_data/map/graph.js',
	   'jquery/lang/string')
.then( function($){
    	   
    	  

/** 
 * Data grid widget module
 * 
 *  
 *  */
Sensolus.Widgets.DataVisualization.Templates.GenericLiveDataCard('Sensolus.Widgets.DataVisualization.Custom.LocationTrackingVisualization',
/** @Static */
{
	defaults : {
		pollerInterval:3000,
		node:null,
		graph:null,
		loaded:false
	}
},
/** @Prototype */
{
	
	connection:null,
	
	analyticsConnection:null,
	
	init : function(){
		var self = this;
		
		self.element.html(self.view('//sensolus/widgets/data_visualizations/custom/location_tracking_visualization/views/container.ejs',{}))
		Sensolus.Models.ConnectedNode.findOne({id:this.options.nodeID}, function(node) {
			self.options.node = node
			self.connect(node.id)
			self.registerEvents()
		},function(){console.log("error occured while loading card")} );
	},
	
	loadGraph:function(node) {
		var self = this
		
		self.options.graph = self.element.find("#map-container").sensolus_widgets_historical_data_location_graph({});
		
		for (var i = 0; i < node.type.outputs.length; i++) {
			if (node.type.outputs[i].dataType.id=="gps_location_dt") {
				self.options.graph.controller().loadGraphs(node, node.type.outputs[i], function() {self.options.loaded = true},
					self.view('//sensolus/widgets/data_visualizations/custom/location_tracking_visualization/views/map.ejs'));
				
				break;
			}
		}
	},
	
	updateNodeStatus:function(isAlive) {
		var self = this
		
		if (this.options.graph == null && this.element.is(":visible")) {
			this.loadGraph(this.options.node)
			console.log("Graph for " + this.options.node.id + " loaded")
		}
		
		if(isAlive){
			self.element.css('background-color', '');
			self.element.css('opacity', '')
			self.element.css('filter', '') // for msie
		}else{
			self.element.css('background-color', '#f6f6f6');
			self.element.css('opacity', 0.5)
			self.element.css('filter', 'alpha(opacity=00)') // for msie
		}
	},
	
	pollFeedsData:function(connectedNodeID){
//		console.log("poll feeds data: "+connectedNodeID)
		var self = this
		RealTimeDataAPI.pollConnectedNodeLastValues(connectedNodeID,function(statusResponse){
			self.updateNodeStatus(statusResponse.alive)
			
			$.each(statusResponse.lastValues,function(feedRefName,dataItem){
				if (dataItem != null && feedRefName == "gps_location" && self.options.loaded) {
					var content = $.secureEvalJSON(dataItem.content)
					self.options.graph.controller().addMarker([dataItem.timestamp, content.lat, content.long], true)
				}
			})
		},function(xhr){
			if (xhr.status == 401) {
				self.disconnect()
			}
			
			console.log("error while poling alive: ")
			console.log(xhr)
		})
	},
	
// end controller	
});

// end steal then
});