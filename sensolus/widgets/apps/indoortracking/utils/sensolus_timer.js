steal( 'jquery/lang/json',
	   'ui/cms/design/jui/js/jquery-ui-1.9.2.min.js').then(
	   'ui/cms/design/jui/jquery-ui.custom.min.js').then(
	   'sensolus/models/sensolus_datetime.js')
.then( function($){

var timers = {}
	
$.Controller('Sensolus.Utils.Timer',
/** @Static */
{
	defaults : {
		//applicationId: null
		interval: null,
		callback: null
	}
},
/** @Prototype */
{
	clock_timer: null,
	
	callback: null,

	init : function() {
		this.callback = this.options.callback
	},
	
	isRunning: function() {
		return this.clock_timer != null;
	},
	
	start: function(newInterval) {
		var self = this
		
		if (newInterval != null) {
			this.options.interval = newInterval;
		}
		
		this.stop();
		
		this.clock_timer = setInterval(function() {
			self.callback()
		}, this.options.interval)
	},
	
	stop: function(callback) {
		if (this.clock_timer != null) {
			clearInterval(this.clock_timer);
			this.clock_timer = null;
		}
	}
	
// end controller	
});

$.sensolus_timer = function(id, element, interval, callback) {
	if (timers[id] != null && element != null) {
		throw new Error("Duplicated id")
	}
	
	if (timers[id] == null) {
		timers[id] = $(element).sensolus_utils_timer({interval: interval, callback:callback})
	}
	
	return timers[id];
}

// end steal then
});