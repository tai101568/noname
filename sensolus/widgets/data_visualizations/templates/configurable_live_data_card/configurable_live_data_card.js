steal( 'jquery/controller',
	   'jquery/view/ejs',
	   'jquery/controller/view',
	   'sensolus/models', 
	   'sensolus/models/realtime_data.js',
	   'sensolus/models/demo_api.js',
	   'sensolus/widgets/historical_data/feed/json_grid.js',
	   'sensolus/widgets/historical_data/feed/graph.js',
	   'sensolus/widgets/data_visualizations/templates/reflective_live_data_card/reflective_live_data_card.js',
	   'jquery/lang/string')
.then( function($){


Sensolus.Widgets.DataVisualization.Templates.ReflectiveLiveDataCard('Sensolus.Widgets.DataVisualization.Templates.ConfigurableLiveDataCard',
/** @Static */
{
	defaults : {
		pollerInterval:3000,
		rows:null,
		titleIcon:"icol-grid",
		actualRows:[],
		pollResultCallback:null
	}
},
/** @Prototype */
{
	
	init : function(){
		var self = this;
		Sensolus.Models.ConnectedNode.findOne({id:this.options.nodeID}, function(node){
			var renderRows = self.buildActualRows(node.type.outputs)
			self.element.html(self.view('//sensolus/widgets/data_visualizations/templates/configurable_live_data_card/views/configurable_live_data_card.ejs',{title:node.name,description:node.description, nodeId:node.id, rows:renderRows}))	
			$.each(node.type.outputs,function(index,output){
				var outputRefName =output.referenceName
				var dataFeedID = node.id+"_"+outputRefName
				self.element.find('i[name='+outputRefName+']').click(function(){
					self.showHistoricalDataChartDialog(node,output,"Node '"+node.name+"': historical "+outputRefName +" data chart")
				});
			})
			
			self.element.parent().find("i.icon-header").attr("class", "icon-header " + self.options.titleIcon)
			self.connect(node.id)
			self.registerEvents()
			
		},function(){console.log("error occured while loading kvv environmental node")} );
			
	},
	
	buildActualRows:function(outputs) {
		var self = this
		
		var renderRows = []
		
		$.each(outputs, function(index, output) {
			$.each(self.options.rows, function(index, row) {
				if (row.referenceName == output.referenceName) {
					self.options.actualRows[output.referenceName] = {}
					self.options.actualRows[output.referenceName].referenceName = output.referenceName
					self.options.actualRows[output.referenceName].title = (row.title != null ? row.title : output.dataType.name)
					self.options.actualRows[output.referenceName].cssIcon = (row.cssIcon != null ? row.cssIcon : output.dataType.cssIcon)
					if (row.renderData != null) {
						self.options.actualRows[output.referenceName].renderData = row.renderData
					}
					
					renderRows.push(self.options.actualRows[output.referenceName])
					return
				}
			})
		})
		
		return renderRows;
	},
	
	pollFeedsData:function(connectedNodeID){
//		console.log("poll feeds data: " + connectedNodeID)
		var self = this
		RealTimeDataAPI.pollConnectedNodeLastValues(connectedNodeID,function(statusResponse){
			self.updateNodeStatus(statusResponse.alive)
			
			$.each(statusResponse.lastValues,function(feedRefName,dataItem){
				if(dataItem==null){
					self.element.find("span[name="+feedRefName+"]").html(" ---- ")
				}else{
					var content = dataItem.content.replace(" ","").replace(":"," : ").replace(","," , ").replace("}"," }").replace("{","{ ")
					if(self.options.actualRows[feedRefName]!=null){
						if (self.options.actualRows[feedRefName].renderData != null) {
							content = self.options.actualRows[feedRefName].renderData(dataItem)
						}
						
						self.element.find("span[name="+feedRefName+"]").html(content)
						$(self.element.find("i[name="+feedRefName+"]")).attr("title", "Last received: " + self.formatTimestamp(dataItem.timestamp) + "\nClick to see historical data")
					}
				}
		
			})
			if(self.options.pollResultCallback!=null){
				self.options.pollResultCallback(connectedNodeID,statusResponse)
			}
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