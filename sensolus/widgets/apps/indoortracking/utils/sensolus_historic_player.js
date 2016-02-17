steal( 'jquery/lang/json',
	   'sensolus/js/jquery.timer.js',
	   './sensolus_timer.js',
	   'ui/cms/design/jui/js/jquery-ui-1.9.2.min.js').then(
	   'ui/cms/design/jui/jquery-ui.custom.min.js').then(
	   'sensolus/models/sensolus_datetime.js')
.then( function($){

$.Controller('Sensolus.Utils.HistoricPlayer',
/** @Static */
{
	defaults : {
	}
},
/** @Prototype */
{
	events: {},
	
	speed: 2, // 3 minute per shot
	
	playStatus: 'stopped',
	
	init : function() {
		var self = this
		
		this.element.html(this.view('//sensolus/widgets/apps/indoortracking/utils/views/historic_player.ejs'))
		
		var picker = self.element.find("input[name=time_filter]")
		
		$.sensolus_timer('now_clock', picker[0], 1000, function() {
			this.element.val(SensolusDatetime.format(null, 'client'))
		}).controller().start()
		
		picker.datetimepicker({
			closeText: "Close",
			dateFormat: 'yy-mm-dd',
			timeFormat: 'HH:mm:ss',
			showButtonPanel: true,
			onSelect: function(date, inst) {
				var time = SensolusDatetime.parse(date);
				var now = new Date()
				if (now - time < 60000) {
					picker.datetimepicker("setDate", now)
					picker.datetimepicker("setTime", now)
					self.element.find("button[name=stop_play_history]").trigger("click")
					$.sensolus_timer('now_clock').controller().start()
				} else {
					$.sensolus_timer('now_clock').controller().stop()
				}
				
				self._fireEvent("TIME_CHANGED", time);
			}
		})
		
		this.element.find("button[name=next-min]").click(function(evt) {
			if (!$.sensolus_timer('now_clock').controller().isRunning()) {
				var now = new Date()
				now.setSeconds(0)
				now.setMilliseconds(0)
				var datetime = new Date(SensolusDatetime.parse(picker.val()))
				
				var inc = evt.isTrigger != null ? self.speed : 2
				
				datetime.setMinutes(datetime.getMinutes() + inc)
				if (datetime >= now) {
					self.element.find("button[name=stop_play_history]").trigger("click")
					$.sensolus_timer('now_clock').controller().start()
				} else {
					picker.datetimepicker("setTime", datetime)
					picker.datetimepicker("setDate", datetime)
				}
				
				if (evt.isTrigger == null) {	// If user trigger then just fire the event
					self._fireEvent("TIME_CHANGED", datetime);
				} else {	// If trigger by play button then start history playing
					var sent = moment()
					
					self._fireEvent("TIME_CHANGED", datetime, function() {
						var interval = moment() - sent
						// Continue playing if user have not press stop/pause or have not reach to "now"
						if (self.playStatus == 'playing' && !self.isClockRunning()) {
							setTimeout(function() { self.element.find("button[name=next-min]").trigger("click") }, 1500 - interval)
						}
					});
				}
			}
		})
		
		this.element.find("button[name=prev-min]").click(function(evt) {
			if ($.sensolus_timer('now_clock').controller().isRunning()) {
				var now = new Date()
				picker.datetimepicker("setTime", now)
				picker.datetimepicker("setDate", now)
			}
			
			$.sensolus_timer('now_clock').controller().stop()
			var datetime = new Date(SensolusDatetime.parse(picker.val()))
			
			var inc = evt.isTrigger != null ? self.speed : 2
			
			datetime.setMinutes(datetime.getMinutes() - inc)
			picker.datetimepicker("setTime", datetime)
			picker.datetimepicker("setDate", datetime)
			self._fireEvent("TIME_CHANGED", datetime);
		})
		
		var playBtn = self.element.find("button[name=play_history]");
		var stopBtn = self.element.find("button[name=stop_play_history]");
		var speedControls = self.element.find("#play_speed_controls");
		var speedTxt = self.element.find("input[name=play_speed]");
		
		var stopPlaying = function() {
			playBtn.html('<i class="icon-play"></i>')
			picker.css("background-color", "#F7FAD2")
			
			if (self.isClockRunning()) {
				stopBtn.attr("disabled", "true");
				speedControls.hide()
				picker.css("background-color", "")
			}
			self.playStatus = "stopped"
		}
		
		playBtn.click(function() {
			if (!self.isClockRunning() && self.playStatus != "playing") {
				playBtn.html('<i class="icon-pause"></i>')
				stopBtn.removeAttr("disabled")
				speedControls.show();
				picker.css("background-color", "#C3FAB4")

				self.playStatus = "playing"
				self.element.find("button[name=next-min]").trigger("click")
			} else {
				stopPlaying()
			}
		})
		
		stopBtn.click(function() {
			$(this).attr("disabled", "true");
			
			stopPlaying()
			$.sensolus_timer('now_clock').controller().start()
			speedControls.hide()
			picker.css("background-color", "")
			
			self._fireEvent("TIME_CHANGED", moment());
		})
		
		speedControls.find("button[name=increase_speed]").click(function() {
			self.speed += 1
			speedTxt.val(self.speed + " mins")
		})
		
		speedControls.find("button[name=increase_speed]").click(function() {
			self.speed += 1
			speedTxt.val(self.speed + " mins")
		})
		speedControls.find("button[name=decrease_speed]").click(function() {
			self.speed -= 1
			if (self.speed < 1) { self.speed = 1}
			speedTxt.val(self.speed + " mins")
		})
	},
	
	_fireEvent: function(eventName) {
		this.events[eventName] && this.events[eventName].apply(this, arguments)
	},
	
	registerEvent: function(eventName, callbackFunc) {
		this.events[eventName] = callbackFunc
	},
	
	stopHistoryPlaying: function() {
		this.playStatus == "playing" && this.element.find("button[name=play_history]").trigger("click");
	},
	
	isClockRunning: function() {
		return $.sensolus_timer('now_clock').controller().isRunning()
	}
	
// end controller	
});

// end steal then
});