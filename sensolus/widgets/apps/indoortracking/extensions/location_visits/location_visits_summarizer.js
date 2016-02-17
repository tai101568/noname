steal( 'jquery/dom/form_params',
	   'jquery/lang/json',
	   'ui/cms/design/jui/js/jquery-ui-1.9.2.min.js').then(
	   'ui/cms/design/jui/jquery-ui.custom.min.js').then(
	   'ui/cms/design/plugins/datatables/jquery.dataTables.js',
	   'sensolus/js/lib/highstock/highstock.js',
	   'sensolus/js/sensolus_datetimepicker/sensolus_daterangepicker.js',
	   'sensolus/models/sensolus_datetime.js',
	   'sensolus/models/indoor_tracking_api.js')
.then( function($){


/** 
 * Data grid widget module
 * 
 *  
 *  */
$.Controller('Sensolus.Widgets.IndoorTrackingApp.LocationVisitSummarizer',
/** @Static */
{
	defaults : {
		beaconsDef:null,
	}
},
/** @Prototype */
{
	data: [],
	visitorDetails: null,
	
	chart: null,
	
	table: null,
	uvTable: null,
	
	location: null,
	beacons: null,
	appId: null,
	
	timerangePicker: null,
	
	init : function() {
		var self = this
		
		Highcharts.setOptions({  // This is for all plots, change Date axis to local timezone
            global : {
                useUTC : false
            }
        });
		
		this.element.html(this.view("//sensolus/widgets/apps/indoortracking/extensions/location_visits/view.ejs", {}))
		
		this.element.find(".location-tbl_close_btn").on("click", function() {
			self.element.hide()
		})
		
        this.uvTable = this.element.find("#UV_table table").dataTable({
			"aaSorting": [[ 0, 'desc' ]],
            sPaginationType: "full_numbers"
        })
        
        this.element.find("select[name=select_report_type]").on("change", function() {
        	self.element.find(".graph_canvas").hide()
        	self.element.find($(this).val()).show();
        	self.timerangePicker.hide()
        	
        	if (self.data.length != 0) {
	        	self.element.dialog({
				    position: { 'my': 'center', 'at': 'center' }
				});
        	}
        })
        
        this.timerangePicker = this.element.find("input[name=from_date]").sensolus_utils_date_range_picker().controller()
		this.timerangePicker.onSelected = function() {
			self.reload(self.beacons, self.location, self.appId)
		}
	},
	
	setTimerange: function(end, start) {
		this.timerangePicker.setTimeRange(end, start)
	},
	
	_loadUVs: function(appId, locId, end, start, beacons) {
		var self = this
		
		this.uvTable.fnClearTable(true);
		
		IndoorTrackingAPI.loadLocationDensity(appId, locId,	end, start, beacons, function(dataItems) {
			console.log("Density data from " + start.toLocaleString() + " to " + end.toLocaleString() + " for " + locId)
			console.log(dataItems)
			
			// Summarize by beacon 
			var beaconVisit = {}
			
			$.each(dataItems, function(idx, item) {
				beaconVisit[item.beacon_id] = beaconVisit[item.beacon_id] || {count: 0, time: 0}
				beaconVisit[item.beacon_id].count += 1
				beaconVisit[item.beacon_id].time += SensolusDatetime.parse(item.end, "server") - SensolusDatetime.parse(item.start, "server")
			})
			
			$.each(beaconVisit, function(beaconId, data) {
				self.uvTable.fnAddData([self.options.beaconsDef[beaconId].name, data.count, SensolusDatetime.msToTime(data.time)]);
			})
		}, function(xhr) {
			self.element.find("#UV_table .dataTables_empty").html("Error... Please close and try again")
		})
	},
	
	reload: function(beacons, loc, appId) {
		var self = this
		
		this.location = loc
		this.beacons = beacons
		this.appId = appId
		
		self.data = []
		
		var timeRange = this.timerangePicker.getTimeRange()
		
		this.table && this.table.fnDestroy();
		this.element.find("select[name=select_report_type]").val("#visit_chart").trigger("change")
		
		self.element.find("#visit_chart").css("height", "400px").html("Loading.....")
		
		var tableData = []
		
		IndoorTrackingAPI.summaryLocationVisits(appId, loc.id, timeRange.end, timeRange.start, beacons, function(dataItems) {
			self._loadUVs(appId, loc.id, timeRange.end, timeRange.start, beacons);
			
			var prev = [-1, 0];		// [date, #visitor]	Use array of [x, y] instead of {x: n, y: b} otherwise graph will not render with more than 1000 point.
			$.each(dataItems, function(index, item) {
				if (item[0] == prev[0]) {
					prev[1] = item[3]
				} else {
					prev = [ item[0], item[3] ]
					self.data.push(prev)
				}
				
				tableData.push([SensolusDatetime.format(moment(item[0])), item[3],
				                self.options.beaconsDef[item[1]].name + ' ' + item[2]]);
			})
			
			self.table = self.element.find("#visit_table table").dataTable({
				"aaSorting": [[ 0, 'asc' ]],
				sPaginationType: "full_numbers",
				"aaData": tableData
			})
			self.table.css("width", "").css("margin-top", "")
			
			self._drawGraph();
			self.element.dialog({
			    position: { 'my': 'center', 'at': 'center' }
			});
		}, function(xhr) {
			self.element.find("#visit_chart").html("Error... Please close and try again")
		})
	},
	
	_drawGraph: function() {
		this.chart && this.chart.destroy()
		this.chart = new Highcharts.StockChart({
			chart : {
				renderTo : this.element.find("#visit_chart")[0]
			},
			
			title: {
				text: 'Visitors over time'
			},
			
			xAxis: {
				ordinal: false
			},
			
			yAxis: {
				allowDecimals:false,
				min:0
	        },
			
			rangeSelector : {
				buttons : [{
					type : 'hour',
					count : 1,
					text : '1h'
				}, {
					type : 'day',
					count : 1,
					text : '1D'
				}, {
					type : 'week',
					count : 1,
					text : '1W'
				}, {
					type : 'all',
					count : 1,
					text : 'All'
				}],
				selected : 3,
				inputEnabled : false
			},
			
			series : [{
				type: 'line',
				name: "Visitors",
				data : this.data,
				step: true,
				tooltip: {
					valueDecimals: 0
				}
			}],
			
			plotOptions: {
				series: {
					dataGrouping: {
						approximation: "sum",
						enabled: false
					}
				}
			}
		})
	},
	
	show: function() {
		var self = this;
		
		this.element.dialog({
			 title: "Visits detail of <b>" + this.location.name + "</b>",
			 postition:'top',
			 width: "650",
			 autoOpen: true,
			 modal: true,
			 resizable: false,		// This version of graph doesn't support reflow, so disable resize
			 closeOnEscape: false,
			 close: function() {
				 self.timerangePicker.hide();
			 }
		 })
	}
// end controller	
});

// end steal then
});