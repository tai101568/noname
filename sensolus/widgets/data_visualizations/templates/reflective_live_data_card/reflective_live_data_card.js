steal( 'jquery/controller',
	   'jquery/view/ejs',
	   'jquery/controller/view',
	   'sensolus/models', 
	   'sensolus/models/realtime_data.js',
	   'sensolus/models/demo_api.js',
	   'sensolus/widgets/historical_data/feed/json_grid.js',
	   'sensolus/widgets/historical_data/feed/graph.js',
	   'sensolus/widgets/data_visualizations/templates/generic_live_data_card/generic_live_data_card.js',
	   'sensolus/js/Vague.js',
	   'jquery/lang/string')
.then( function($){
    	   
    	  

/** 
 * Data grid widget module
 * 
 *  
 *  */
Sensolus.Widgets.DataVisualization.Templates.GenericLiveDataCard.extend('Sensolus.Widgets.DataVisualization.Templates.ReflectiveLiveDataCard',
/** @Static */
{
	defaults : {
		pollerInterval:3000
	}
},
/** @Prototype */
{
	init : function(){
		var self = this;
		Sensolus.Models.ConnectedNode.findOne({id:this.options.nodeID}, function(node){
			self.element.html(self.view('//sensolus/widgets/data_visualizations/templates/reflective_live_data_card/views/reflective_live_data_card.ejs',{title:node.name,description:node.description, nodeId:node.id, outputs:node.type.outputs}))	
			$.each(node.type.outputs,function(index,output){
				var outputRefName =output.referenceName
				var dataFeedID = node.id+"_"+outputRefName
				self.element.find('i[name='+outputRefName+']').click(function(){
					self.showHistoricalDataChartDialog(node,output,"Node '"+node.name+"': historical "+outputRefName +" data chart")
				});
			})	
			self.connect(node.id)
			self.registerEvents()
		},function(){console.log("error occured while loading kvv environmental node")} );
			
	},
	

	updateNodeStatus:function(isAlive){
//		console.log("poll alive: "+connectedNodeID)
		var self = this
		if(isAlive){
			self.element.find('span.mws-stat-content').css('background-color', '')
			self.element.find('span.mws-stat-content').css('opacity', '')
			self.element.find('span.mws-stat-content').css('filter', '') // for msie
		}else{
			if (self.blurItem == null) {
				self.element.find('span.mws-stat-content').css('background-color', '#e6e6e6')
				self.element.find('span.mws-stat-content').css('opacity', 0.3)
				self.element.find('span.mws-stat-content').css('filter', 'alpha(opacity=00)') // for msie
			}
		}
	},
	
	pollFeedsData:function(connectedNodeID) {
//		console.log("poll feeds data: "+connectedNodeID)
		var self = this
		RealTimeDataAPI.pollConnectedNodeLastValues(connectedNodeID,function(statusResponse){
			self.updateNodeStatus(statusResponse.alive)
			
			$.each(statusResponse.lastValues,function(feedRefName,dataItem){
				if(dataItem==null){
					self.element.find("span[name="+feedRefName+"]").html(" ---- ")
				}else{
					if("movement"!=feedRefName){
						var content = dataItem.content.replace("{", "").replace("}", "")
			    		  .replace(/\"/g, "")
			    		  .replace(/,/g, "<br/>")
			    		  .replace(/:/g,": ")
						self.element.find("span[name="+feedRefName+"]").html(content)
						$(self.element.find("i[name="+feedRefName+"]")).attr("title", "Last received: " + self.formatTimestamp(dataItem.timestamp) + "\nClick to see historical data")
					}else{
						self.element.find("span[name="+feedRefName+"]").html(self.formatTimestamp(dataItem.timestamp))
					}
					
//					self.element.find("span[name="+feedRefName+"_container]").css('background-color', '');
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