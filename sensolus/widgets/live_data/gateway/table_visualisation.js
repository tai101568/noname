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
$.Controller('Sensolus.Widgets.LiveData.Gateway.TableVisualisation',
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
		this.element.html(this.view('//sensolus/widgets/live_data/gateway/views/table_visualisation.ejs'))		
	},
	
	connect:function(gatewayID){
		var self = this
		this.disconnect();
		self.pollGatewayAlive(gatewayID)
		this.connection = setInterval( function(){
			self.pollGatewayAlive(gatewayID)
		}, this.options.pollerInterval );
	},
	
	disconnect:function(){
		clearInterval( this.connection );
	},

	pollGatewayAlive:function(gatewayID){
		var self = this
		RealTimeDataAPI.pollGatewayAlive(gatewayID,function(status){
			if(status.alive){
				var statusField = self.element.find('td[name=gateway_status]')
				statusField.html("Online")
				statusField.css('color', 'green');
			}else{
				var statusField = self.element.find('td[name=gateway_status]')
				statusField.html("Offline")
				statusField.css('color', 'red');
			}
			//console.log($('td[name=status]'))
		},function(xhr){
			console.log("error while polling alive: ")
			console.log(xhr)
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