steal( 'jquery/lang/json',
	   'sensolus/js/jquery.timer.js',
	   'ui/cms/design/jui/js/jquery-ui-1.9.2.min.js').then(
	   'ui/cms/design/jui/jquery-ui.custom.min.js').then(
	   'sensolus/models/sensolus_datetime.js')
.then( function($){

$.Controller('Sensolus.Utils.DateRangePicker',
/** @Static */
{
	defaults : {
		onSelect: null,
		textFormat: 's'
	}
},
/** @Prototype */
{
	id: null,
	
	container: null,
	
	from: moment(),							// from a historic date
	to: moment().subtract("hours", 1),	// backward to another historic date
	
	onSelected: null,
	
	fromPicker: null,
	toPicker: null,
	
	lastFrom: null,
	lastTo: null,
	
	init : function() {
		var self = this
		
		this.id = Math.round(Math.random() * 10000000);
		
		this.container = $('<div id="sensolus_daterange_' + this.id + '" class="popup_element"></div>')
		this.container.html(this.view("//sensolus/js/sensolus_datetimepicker/datetimerange.ejs", {id: this.id}))
		
		$("body").append(this.container[0]);
		
		this.toPicker = this.container.find("#rangepicker_to" + this.id)
		
		this.toPicker.datetimepicker({
			closeText: "Close",
			dateFormat: 'yy-mm-dd',
			timeFormat: 'HH:mm:ss',
			showButtonPanel: false,
			onSelect: function(date, inst) {
				self.container.find("select[name=to_span]").val("");
				self.to = SensolusDatetime.parse(date, "client");
				self.container.find("select[name=to_span]").trigger("change");
			}
		})
		this.toPicker.datetimepicker("setDate", new Date(self.to))
		this.toPicker.datetimepicker("setTime", new Date(self.to))

		this.fromPicker = this.container.find("#rangepicker_from" + this.id)
		this.fromPicker.datetimepicker({
			closeText: "Close",
			dateFormat: 'yy-mm-dd',
			timeFormat: 'HH:mm:ss',
			showButtonPanel: false,
			onSelect: function(date, inst) {
				self.from = SensolusDatetime.parse(date, "client");
				self.container.find("select[name=from_span]").val("");
				
				var now = moment()
				if (self.from.isAfter(now)) {
					self.fromPicker.datetimepicker("setDate", new Date(now))
					self.fromPicker.datetimepicker("setTime", new Date(now))
					self.from = now;
					
					self.container.find("select[name=from_span]").val("0");
				}
				
				self.container.find("select[name=to_span]").trigger("change");
			}
		})
		
		
		this.container.find(".btn").on("click", function() {
			self.toggleVisibility()
			
			if ($(this).hasClass('btn-danger')) {
				self.from = self.lastFrom;
				self.to = self.lastTo;
				
				self.formatInnerText()
			} else {
				self._selected()
			}
			
		})
		this.element.on("click", function() {
			self.toggleVisibility()
		})
		
		this.container.find(".list-item").on("click", function() {
			switch($(this).attr("value")) {
			case 'today':
				self.container.find("select[name=from_span]").val("0");
				self.container.find("select[name=to_span]").val("");
				self.to = moment().startOf("day")
				break;
			case 'yesterday':
				self.from = moment().startOf('day');
				self.to = moment(self.from)
				self.to.subtract("days", 1)
				self.from.subtract("seconds", 1)
				
				self.container.find("select[name=from_span]").val("");
				self.container.find("select[name=to_span]").val("");
				break;
			case 'last7days':
				self.container.find("select[name=from_span]").val("0");
				self.container.find("select[name=to_span]").val("");
				self.from = moment()
				self.to = moment(self.from)
				self.to.subtract("days", 7)
				break;
			case 'thisweek':
				self.container.find("select[name=to_span]").val("");
				self.container.find("select[name=from_span]").val("0");
				self.to = moment().startOf('week');
				self.from = moment()
				break;
			case 'lastweek':
				self.from = moment().startOf('week');
				self.to = moment(self.from)
				self.to.subtract("days", 7)
				self.from.subtract("minutes", 1)
				
				self.container.find("select[name=from_span]").val("");
				self.container.find("select[name=to_span]").val("");
				break;
			case 'last30days':
				self.container.find("select[name=to_span]").val("720");
				self.container.find("select[name=from_span]").val("0");
				break;
			case 'thismonth':
				self.container.find("select[name=from_span]").val("0");
				self.to = moment().startOf('month');
				self.container.find("select[name=to_span]").val("");
				break;
			case 'lastmonth':
				self.from = moment().startOf('month');
				self.from.subtract("months", 1)
				self.to = moment(self.from)
				self.to.subtract("months", 1)
				self.from.subtract("minutes", 1)
				
				self.container.find("select[name=from_span]").val("");
				self.container.find("select[name=to_span]").val("");
				break;
			}
			
			self.container.find("select[name=from_span]").trigger("change");
			$(this).css("background-color", "#4386BC");
		})
		
		this._initTimeControls()
	},
	
	_selected: function() {
		this.onSelected && this.onSelected(this.getTimeRange())
	},
	
	_initTimeControls: function() {
		var self = this;
		
		$.timer('clock' + this.id, function() {
			self.formatInnerText()
		}, 30000).start()
		
		this.container.find("select[name=from_span]").on("change", function() {
			var val = $(this).val();
			if (val != "") {
				self.from = moment()
				self.from.subtract("hours", val)
			} else {
				self.container.find("#unknown_from").html('--- ' + self.from.fromNow() + ' ---')
			}
			
			self.fromPicker.datetimepicker("setDate", new Date(self.from))
			self.fromPicker.datetimepicker("setTime", new Date(self.from))
			
			if (val == 0) {	$(this).val("") }
			
			self.container.find("select[name=to_span]").trigger("change");
		})
		
		this.container.find("select[name=to_span]").on("change", function() {
			var val = $(this).val();
			if (val != "") {
				self.to = moment(self.from);
				self.to.subtract("hours", val)
			}
			
			if (!self.to.isBefore(self.from)) {
				self.to = moment(self.from)
				self.to.subtract("minutes", 1)
			}

			self.toPicker.datetimepicker("setDate", new Date(self.to))
			self.toPicker.datetimepicker("setTime", new Date(self.to))
			
			self.container.find("#unknown_from").html('--- ' + self.from.fromNow() + ' ---')
			self.container.find("#unknown_to").html('--- ' + SensolusDatetime.msToTime(self.from - self.to) + ' before ---')
			self.container.find(".list-item").css("background-color", "");
			
			self.formatInnerText()
		})
		
		this.container.find("select[name=from_span]").trigger("change");
	},
	
	formatInnerText: function() {
		var textLong = this.to.format('lll') + ' - ' + this.from.format('lll')
		var text = textLong;
		
		if (moment() - this.from < 900000) {
			text = "Last " + this.to.fromNow().replace('ago','').replace(/an?\s/g, '1 ');
		} else if (this.from.isSame(this.to, 'day')) {
			text = this.to.format('lll') + ' - ' + this.from.format('LT')
		}
		
		this.element.val(text)
		this.element.attr("title", textLong)
		
		this.container.find("#unknown_from").html('--- ' + this.from.fromNow() + ' ---')
	},
	
	toggleVisibility: function() {
		if (this.container.is(":visible")) {
			this.hide()
		} else {
			var fromS = this.container.find("select[name=from_span]")
			if (fromS.val() == 0) { fromS.val("")} 
			
			// Update the controls
			this.setTimeRange(this.from, this.to);
			
			// Save current value for cancel event
			this.lastFrom = moment(this.from)
			this.lastTo = moment(this.to)
			
			var offset = this.element.offset()
			
			this.container.show()
			this.container.css("position", "absolute").css("z-index", 10001)
					.css("left", offset.left).css("top", offset.top + this.element.height() + 10)
		}
	},
	
	hide: function() {
		this.container.hide()
	},
	
	getTimeRange: function() {
		return {start: this.to, end: this.from}
	},
	
	setTimeRange: function(endTime, startTime) {
		if (endTime != null) {
			this.from = endTime;
			this.container.find("select[name=from_span]").val("")
		}
		
		if (startTime != null) {
			this.to = startTime;
			this.container.find("select[name=to_span]").val("")
		}
		
		this.container.find("select[name=from_span]").trigger("change");
	},
	
	destroy: function() {
		this.container.remove()
		this._super()
	}
	
// end controller	
});

// end steal then
});