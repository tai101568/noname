steal( 'jquery/controller',
	   'jquery/view/ejs',
	   'jquery/controller/view',
	   'sensolus/models', 
	   'sensolus/models/realtime_data.js',
	   'sensolus/models/demo_api.js',
	   'sensolus/widgets/historical_data/feed/json_grid.js',
	   'sensolus/widgets/historical_data/feed/graph.js',
	   'sensolus/widgets/data_visualizations/templates/generic_live_data_card/generic_live_data_card.js',
	   'jquery/lang/string')
.then( function($){
    	   
    	  

/** 
 * Data grid widget module
 * 
 *  
 *  */
Sensolus.Widgets.DataVisualization.Templates.GenericLiveDataCard('Sensolus.Widgets.DataVisualization.Custom.DoorStatusVisualization',
/** @Static */
{
	defaults : {
		pollerInterval:3000
	}
},
/** @Prototype */
{
	
	connection:null,
	
	analyticsConnection:null,
	
	init : function(){
		var self = this;
		Sensolus.Models.ConnectedNode.findOne({id:this.options.nodeID}, function(node) {
			self.element.html(self.view('//sensolus/widgets/data_visualizations/custom/door_status_visualization/views/door.ejs',{outputs:node.type.outputs}))
			
			$.each(node.type.outputs, function(index, output) {
				self.element.find('i[name='+output.referenceName+']').click(function(){
					self.showHistoricalDataChartDialog(node,output,"Node '"+node.name+"': historical "+output.referenceName +" data chart")
				});
			});
			
			self.connect(node.id)
			self.registerEvents()
			
			self.element.parent().find("i.icon-header").attr("class", "icon-header icol-door")
		},function(){console.log("error occured while loading kvv environmental node")} );
			
	},
	
	updateNodeStatus:function(isAlive){
		//console.log("poll alive: "+connectedNodeID)
		var self = this
		if(isAlive){
			self.element.css('background-color', '');
			self.element.css('opacity', '')
			self.element.css('filter', '') // for msie
		}else{
			self.element.css('background-color', '#f6f6f6');
			self.element.css('opacity', 0.3)
			self.element.css('filter', 'alpha(opacity=00)') // for msie
		}
	},
	
	pollFeedsData:function(connectedNodeID){
		//console.log("poll feeds data: "+connectedNodeID)
		var self = this
		RealTimeDataAPI.pollConnectedNodeLastValues(connectedNodeID,function(statusResponse){
			self.updateNodeStatus(statusResponse.alive)
			
			$.each(statusResponse.lastValues,function(feedRefName,dataItem){
				if(dataItem==null){
					self.element.find("div[name="+feedRefName+"]").html(" ---- ")
				}else{
					if (feedRefName == "door_status") {
						var dateTime = self.formatTimestamp(dataItem.timestamp)
						var status = (dataItem.content.indexOf('true') != -1 ? "opened" : "closed")
					
						self.element.find("div[name="+feedRefName+"]").html("<strong>Last " + status + " at " + dateTime + "</strong>")
						self.element.find("div[name=img_"+feedRefName+"]").html("<img src='../sensolus/widgets/data_visualizations/custom/door_status_visualization/imgs/door_" + status + ".png' />")
					}
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