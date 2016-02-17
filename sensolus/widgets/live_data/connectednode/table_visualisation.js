steal( 'jquery/controller',
	   'jquery/view/ejs',
	   'jquery/controller/view',
	   'sensolus/models', 
	   'sensolus/models/realtime_data.js',
	   'jquery/lang/string')
.then( function($){
    	   
    	  

/** 
 * Data grid widget module
 * 
 *  
 *  */
$.Controller('Sensolus.Widgets.LiveData.ConnectedNode.TableVisualisation',
/** @Static */
{
	defaults : {
		pollerInterval:3000
	}
},
/** @Prototype */
{
	
	connection:null,
	
	init : function(){
		var self = this;
		this.element.html(this.view('//sensolus/widgets/live_data/connectednode/views/table_visualisation.ejs'))		
	},
	
	connect:function(connectedNodeID){
		var self = this
		this.drawDataFeedTableBody(connectedNodeID)
		this.disconnect();
		self.pollConnectedNodeAlive(connectedNodeID)
		self.pollFeedsData(connectedNodeID)
		this.connection = setInterval( function(){
			self.pollConnectedNodeAlive(connectedNodeID)
			self.pollFeedsData(connectedNodeID)
		}, this.options.pollerInterval );
	},
	
	disconnect:function(){
		clearInterval( this.connection );
	},
	
	drawDataFeedTableBody:function(connectedNodeID){
		var self = this
		$('#providing-feeds-table tbody').empty();
		this.nodeFeeds = [];
		Sensolus.Models.ConnectedNode.findOne({id:connectedNodeID},function(connectedNode){	
			$.each(connectedNode.type.outputs,function(index,output){
				var nodeFeed = {}
				nodeFeed.nodeID = connectedNode.id
				nodeFeed.referenceName = output.referenceName
				var feedID = connectedNode.id+"_"+output.referenceName
				self.nodeFeeds.push(nodeFeed)
				$("#providing-feeds-table tbody").append("<tr><td>"+output.name+"</td><td name="+feedID+"_timestamp> .. loading ..</td><td name="+feedID+"_lastvalue> .. loading ..</td></tr>")
			})	
		})
	},

	pollConnectedNodeAlive:function(connectedNodeID){
		var self = this
		RealTimeDataAPI.pollConnectedNodeAlive(connectedNodeID,function(status){
			if(status.alive){
				var statusField = self.element.find('td[name=connected_node_status]')
				statusField.html("Online")
				statusField.css('color', 'green');
			}else{
				var statusField = self.element.find('td[name=connected_node_status]')
				statusField.html("Offline")
				statusField.css('color', 'red');
			}
			//console.log($('td[name=status]'))
		},function(xhr){
			console.log("error while poling alive: ")
			console.log(xhr)
		})
	},
	
	pollFeedsData:function(connectedNodeID){
		var self = this
		// TODO: replace by 1 last values call for specified connected node
		$.each(this.nodeFeeds,function(index,nodeFeed){
			RealTimeDataAPI.pollDataFeedLastValue(nodeFeed.nodeID+"/"+nodeFeed.referenceName,function(data){
				var feedID =nodeFeed.nodeID+"_"+nodeFeed.referenceName
				if(data==null){
					self.element.find("td[name="+feedID+"_timestamp]").html(" -- ")
					self.element.find("td[name="+feedID+"_lastvalue]").html(" -- ")
				}else{
					self.element.find("td[name="+feedID+"_timestamp]").html(self.formatTimestamp(data.timestamp))
					self.element.find("td[name="+feedID+"_lastvalue]").html(data.content)
				}
			},function(xhr){
				console.log("error while poling for data: ")
				console.log(xhr)
			})		
		})
		
	},
	
	formatTimestamp:function(timestamp){
		 var a = new Date(timestamp);
		 var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	     var year = a.getFullYear();
	     var month = months[a.getMonth()];
	     var date = a.getDate();
	     var hour = a.getHours();
	     var min = a.getMinutes();
	     var sec = a.getSeconds();
	     var time = date+','+month+' '+year+' '+hour+':'+min+':'+sec ;
	     return time;
	}
	

// end controller	
});

// end steal then
});