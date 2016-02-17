steal( 'jquery/controller',
	   'jquery/view/ejs',
	   'jquery/controller/view',
	   'sensolus/models', 
	   'sensolus/models/realtime_data.js',
	   'sensolus/models/demo_api.js',
	   'sensolus/widgets/historical_data/feed/json_grid.js',
	   'sensolus/widgets/historical_data/feed/graph.js',
	   'sensolus/widgets/historical_data/map/graph.js',
	   'jquery/lang/string')
.then( function($){
    	   
    	  

/** 
 * Data grid widget module
 * 
 *  
 *  */
$.Controller('Sensolus.Widgets.DataVisualization.Templates.GenericLiveDataCard',
/** @Static */
{
	defaults : {
		pollerInterval:3000,
		nodeID:null
	}
},
/** @Prototype */
{
	
	connection:null,
	
	analyticsConnection:null,
	
	init : function(){
	},
	
	connect:function(connectedNodeID){
		var self = this
		this.disconnect();
		self.pollFeedsData(connectedNodeID)
		if(this.connection==null){
			this.connection = setInterval( function(){
				self.controlPollingFeedsData(connectedNodeID)
			}, this.options.pollerInterval );
		}
	},
	
	disconnect:function(){
		if (this.connection != null) {
			clearInterval( this.connection );
			this.connection=null;
		}
	},
	
	registerEvents:function() {
		var self = this
		
		this.element.bind("visible", function() {
			console.log(self.options.nodeID + ' become visible now')
			self.connect(self.options.nodeID)
		})
	},
	
	controlPollingFeedsData:function(nodeId) {
		this.pollFeedsData(nodeId)
		
		if (!this.element.is(":visible")) {
			console.log("Disconnecting " + nodeId + " since invisible");
			this.disconnect()
		}
	},
	
	showHistoricalDataChartDialog:function(node,output,title){
		if (output.dataType.id == "gps_location_dt") {
			var chart = $("#demo_kvv_nodes_historical_data_chart_dialog").find('.hist_data_map').sensolus_widgets_historical_data_location_graph({});
		} else {
			var chart = $("#demo_kvv_nodes_historical_data_chart_dialog").find('.hist_data_chart').sensolus_widgets_historical_data_feed_graph({});
		}
		
	    var dialog = $("#demo_kvv_nodes_historical_data_chart_dialog").dialog({
	        autoOpen: false,
	        title: title,
	        modal: true,
	        width: "750",
	        position:'center',
	        buttons: [{
	            text: "Close",
	            click: function () {
	            	chart.controller().reset()
	                $(this).dialog("close");
	            }
	        }]
	    })
	    chart.controller().loadGraphs(node,output,function(){
	    	dialog.dialog('option', 'position', 'center');
	    })
	    dialog.dialog("open");
		dialog.parent().find(".ui-dialog-titlebar-close").click(function() {
			chart.controller().reset()
		});
	    //event.preventDefault();
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
	     var time = hour+':'+min+':'+sec +" - "+date+' '+month+' '+year;
	     return time;
	}

// end controller	
});

// end steal then
});