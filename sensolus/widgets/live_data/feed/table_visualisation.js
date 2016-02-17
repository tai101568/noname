steal( 'jquery/controller',
	   'jquery/view/ejs',
	   'jquery/controller/view',
	   'sensolus/models', 
	   'sensolus/models/realtime_data.js',
	   'jquery/lang/string')
.then( function($){
    	   
    	  


$.Controller('Sensolus.Widgets.LiveData.Feed.TableVisualisation',
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
		this.element.html(this.view('//sensolus/widgets/live_data/feed/views/table_visualisation.ejs'))
		
	},
	
	connect:function(feedID){
		var self = this
		this.disconnect();
		self.pollFeedAlive(feedID)
		self.pollFeedData(feedID)
		this.connection = setInterval( function(){
			self.pollFeedAlive(feedID)
			self.pollFeedData(feedID)
		}, this.options.pollerInterval );
	},
	
	disconnect:function(){
		clearInterval( this.connection );
	},
	
	pollFeedAlive:function(feedID){
		var self = this
		RealTimeDataAPI.pollDataFeedAlive(feedID,function(status){
			if(status.alive){
				var statusField = self.element.find('td[name=status]')
				statusField.html("Online")
				statusField.css('color', 'green');
			}else{
				var statusField = self.element.find('td[name=status]')
				statusField.html("Offline")
				statusField.css('color', 'red');
			}
			//console.log($('td[name=status]'))
		},function(xhr){
			console.log("error while poling alive: ")
			console.log(xhr)
		})
	},
	
	pollFeedData:function(feedID){
		var self = this
		RealTimeDataAPI.pollDataFeedLastValue(feedID,function(data){
			if(data==null){
				self.element.find('td[name=at]').html(" -- ")
				self.element.find('td[name=value]').html(" -- ")
			}else{
				self.element.find('td[name=at]').html(self.formatTimestamp(data.timestamp))
				self.element.find('td[name=value]').html(data.content)
			}
		},function(xhr){
			console.log("error while poling for data: ")
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