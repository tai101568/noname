steal( 'jquery/dom/form_params',
	   'jquery/lang/json',
	   'ui/cms/design/jui/js/jquery-ui-1.9.2.min.js').then(
	   'ui/cms/design/jui/jquery-ui.custom.min.js').then(
	   'ui/cms/design/plugins/datatables/jquery.dataTables.js',
	   'sensolus/models/sensolus_datetime.js',
	   'sensolus/js/sensolus_datetimepicker/sensolus_daterangepicker.js',
	   'sensolus/models/indoor_tracking_api.js',
	   'sensolus/js/lib/highstock/highstock.js')
.then('sensolus/js/lib/highstock/modules/exporting.js',
//	  'sensolus/js/lib/highstock/modules/no-data-to-display.js',
	  'sensolus/js/lib/highstock/highcharts-more.js')
.then( function($){
    	   
    	  

/** 
 * Data grid widget module
 * 
 *  
 *  */
$.Controller('Sensolus.Widgets.IndoorTrackingApp.BeaconLocationTable',
/** @Static */
{
	defaults : {
		applicationId: null
	}
},
/** @Prototype */
{
	beacon: null,
	
	invoker: null,
	
	table: null,
	chart: null,
	
	locationsDef: {},
	
	tableData: null,
	
	picker: null,

	init : function() {
		var self = this
		
		$.each(this.options.locationsDef.locations, function(idx, location) {
			self.locationsDef[location.id] = location
		})
		
		this.element.html(this.view('//sensolus/widgets/apps/indoortracking/extensions/beacon_location_details/location_table.ejs', {}))
		this.element.css("min-height", "400px");
		
		this.element.find("select[name=select_report_type]").on("change", function() {
        	self.element.find(".graph_canvas").hide()
        	self.element.find($(this).val()).show();
        	self.picker.hide()
        	
        	if (self.tableData != null) {
	        	self.element.dialog({
				    position: { 'my': 'center', 'at': 'center' }
				});
        	}
        })
		
		this.picker = this.element.find("input[name=from_date]").sensolus_utils_date_range_picker().controller()
		this.picker.onSelected = function() {
			self._loadLocationData()
		}
		
		this.element.find(".location-tbl_close_btn").on("click", function() {
			self.element.hide()
		})
	},
	
	reload: function(time, beacon, done) {
		this.beacon = beacon;
		
		time = SensolusDatetime.parse(time, "client")
		
		this.picker.setTimeRange(time)
		
		this.element.find("#location_chart").css("height", "400px").html("Loading.....")
		
		this._loadLocationData()
	},
	
	_loadLocationData: function() {
		var self = this
		
		this.element.find("select[name=select_report_type]").val("#location_chart").trigger("change")
		
		var time = this.picker.getTimeRange()
		
		this.table && this.table.fnDestroy();
		this.element.find("#location_chart").html("Loading...")
		
		self.tableData = []
		
		var data = {}
		
		IndoorTrackingAPI.loadBeaconHistoricLocations(this.options.applicationId, time.end, time.start, this.beacon.id, function(dataItems) {
			console.log(dataItems)
			
			$.each(dataItems, function(idx, value) {
				if (self.locationsDef[value.location] != null) {
					start = SensolusDatetime.parse(value.start, "server")
					spentTime = SensolusDatetime.parse(value.end, "server") - start
					
					data[value.location] = (data[value.location] || 0) + spentTime

					self.tableData.push([SensolusDatetime.format(start),
					                      SensolusDatetime.msToTime(spentTime),
					                      self.locationsDef[value.location].name]);
				}
			})
			
			var graphData = []
			$.each(data, function(key, val) {
				graphData.push([self.locationsDef[key].name, val])
			})
			
			self.table = self.element.find("table").dataTable({
				"aaSorting": [[ 0, 'desc' ]],
				sPaginationType: "full_numbers",
				"aaData": self.tableData
			})
			self.table.css("width", "").css("margin-top", "")
			
			self._drawGraph(graphData)
						
        	self.element.dialog({
			    position: { 'my': 'center', 'at': 'center' }
			});
		})
	},
	
	_drawGraph: function(graphData) {
		this.chart && this.chart.destroy()
		this.chart = new Highcharts.Chart({
			chart : {
				renderTo : this.element.find("#location_chart")[0],
				plotBackgroundColor: null,
	            plotBorderWidth: null,
	            plotShadow: false
			},
			
			title: {
				text: ''
			},
			
	        tooltip: {
	        	formatter: function() {
	        		return 'Percentage: <b>' + this.percentage.toFixed(2) + '%</b>'
	        	}
	        	
	        },
	        
	        plotOptions: {
	            series: {
	                dataLabels: {
	                    enabled: true,
	                    formatter: function() {
	                    	return this.key + '<br/><b>' + SensolusDatetime.msToTime(this.y) + '</b>'
	                    }
	                },
	                showInLegend: false
	            }
	        },
			
	        series: [{
	            type: 'pie',
	            name: 'Spent time',
	            data: graphData
	        }]
		})
	},
	
	show: function(invoker) {
		var self = this
		
		this.element.dialog({
			 title: "Location report of <b>" + this.beacon.name + "</b>",
			 postition:'top',
			 width: "650",
			 autoOpen: true,
			 modal: true,
			 resizable: false,		// This version of graph doesn't support reflow, so disable resize
			 closeOnEscape: false,
			 close: function() {
				 self.picker.hide()
			 }
		 })
		
	},
	
// end controller	
});

// end steal then
});