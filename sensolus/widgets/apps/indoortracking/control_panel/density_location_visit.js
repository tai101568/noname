steal( 'jquery/dom/form_params',
	   'jquery/lang/json').then(
	   'sensolus/models/sensolus_datetime.js',
	   'sensolus/js/sensolus_datetimepicker/sensolus_daterangepicker.js',
	   'sensolus/widgets/apps/indoortracking/extensions/location_visits/location_visits_summarizer.js',
	   'sensolus/models/indoor_tracking_api.js')
.then( function($){
    	   
    	  

/** 
 * Data grid widget module
 * 
 *  
 *  */
$.Controller('Sensolus.Widgets.IndoorTrackingApp.ControlPanel.DensityLocationVisits',
/** @Static */
{
	defaults : {
		appWidget:null,
		
		locationsDef: null,
		beaconsDef: null
	}
},
/** @Prototype */
{
	floorPlan: null,
	locations: {},
	
	beaconsCache: {},
	
	densityGraph: [],
	
	pathsDensity: [],
	
	timerangePicker: null,
	
	init : function(){
		var self = this
		
		this.floorPlan = this.options.appWidget.floorPlan
		
		// Cache the images
		var objectTypes = this.options.beaconsDef.objectTypes
		var getImage = function(type) {
			for (var i = 0; i < objectTypes.length; ++i) {
				if (objectTypes[i].id == type) {
					return objectTypes[i].image
				}
			}
		}
		$.each(this.options.beaconsDef.beacons, function(idx, beacon) {
			beacon.img = getImage(beacon.objectType)
			self.beaconsCache[beacon.id] = beacon
		})
		
		this.element.html(this.view('//sensolus/widgets/apps/indoortracking/control_panel/views/density_location_visits.ejs', {beacons:this.options.beaconsDef.beacons}))
		
		$("body").children("#visits_sumarization_table_popup").remove()
		$("body").append('<div id="visits_sumarization_table_popup" style="display:none"></div>')
		
		this._initFormEvents();

		// Render locations
		var locations = this.options.locationsDef.locations
		for (var i = 0; i < locations.length; ++i) {
			var location = new visualization.floorplan.Marker({
					symbol:"circle",
					size: {r:50, scale: "icon"}, fillColor: "#FCFCD2", opacity: 0.8,
					border:{width:20, color:"#cccccc", noScale: true}
		 		},
		 		{x:locations[i].coordX, y:locations[i].coordY}, self.floorPlan)
			
			location.setOverlayText(locations[i].id, "middle").setVisibility(false, true)
			location.onClick(function(location) {
				self.getLocationVisitsSummary(location, this)
			}, locations[i])
			
			
			location.onHover(function() {
				this.raphaelEl.stop().animate({
					"50%": {"fill-opacity": 0.5, fill: "#f00"},
					"100%": {"fill-opacity": 1, fill: "#FCFCD2"}}, 200)
			}, function() {
				this.raphaelEl.stop().animate({"fill-opacity": 0.8, fill: "#FCFCD2"}, 200)
			})
			
			self.locations[locations[i].id] = {location: locations[i], marker: location}
		}
		
		this._initGraphAttr()
	},
	
	_initGraphAttr: function() {
		if (this.floorPlan.paper.customAttributes.arc == null) {
			this.floorPlan.paper.customAttributes.arc = function (xloc, yloc, value, total, R) {
			    var alpha = 360 / total * value,
			        a = (90 - alpha) * Math.PI / 180,
			        x = xloc + R * Math.cos(a),
			        y = yloc - R * Math.sin(a),
			        path;
			    if (total == value) {
			        path = [
			            ["M", xloc, yloc - R],
			            ["A", R, R, 0, 1, 1, xloc - 0.01, yloc - R]
			        ];
			    } else {
			        path = [
			            ["M", xloc, yloc - R],
			            ["A", R, R, 0, +(alpha > 180), 1, x, y]
			        ];
			    }
			    return {
			        path: path
			    };
			};
		}
	},
	
	_initFormEvents: function() {
		var self = this
		
		this.element.find("a.select_all").click(function() {
			self.element.find("input[name=beacons]").attr("checked", true);
			self.updateVisitsSummary( $("#form_filters").formParams() );
		})
		this.element.find("a.select_none").click(function() {
			self.element.find("input[name=beacons]").attr("checked", false);
			self.updateVisitsSummary( $("#form_filters").formParams() );
		})
		this.element.find("a.select_invert").click(function() {
			self.element.find("input[name=beacons]").each(function() {
				$(this).attr("checked", !$(this).is(":checked"));
				self.updateVisitsSummary( $("#form_filters").formParams() );
			})
		})
		
		this.element.find("#form_filters select[name=time_span],input[name=beacons]").on("change", function( event ) {
			self.updateVisitsSummary( $("#form_filters").formParams() );
		});
		
		this.timerangePicker = this.element.find("#form_filters input[name=from_date]").sensolus_utils_date_range_picker().controller();
		this.timerangePicker.onSelected = function() {
			self.updateVisitsSummary( $("#form_filters").formParams() );
		}
		
		
		this.element.find("input[name=chck_show_paths_density]").on( "change", function( event ) {
			self.clearPathDensity()
			
			if ($(this).is(":checked")) {
				var locations = self.options.locationsDef.locations
				Raphael.getColor.reset()
				
				for (var i = 5; i > 0; --i) {
					var loc1 = visualization.floorplan.random(0, locations.length - 1)
					var loc2 = visualization.floorplan.random(0, locations.length - 1)
					while (loc2 == loc1) {
						loc2 = visualization.floorplan.random(0, locations.length - 1)
					}
					self.drawPathDensity(i,
							self.locations[locations[loc1].id].marker.point,
							self.locations[locations[loc2].id].marker.point,
							Raphael.getColor(0.85))
				}
			}
		});
	},
	
	drawPathDensity: function(value, startPoint, endPoint, color) {
		var path = ["M", startPoint.x, startPoint.y, endPoint.x, endPoint.y].join(",");
		
		this.pathsDensity.push(this.floorPlan.paper.path(path).attr({stroke: "#00bb00", fill: "none", "stroke-width": value * 7, "stroke-linecap":"round"}))
		this.pathsDensity.push(this.floorPlan.paper.path(path).attr({stroke: color, fill: "none", "stroke-width": value * 7 - 4, "stroke-linecap":"round"}))
	},
	
	clearPathDensity: function() {
		$.each(this.pathsDensity, function(idx, el) {
			el.remove()
		})
		
		this.pathsDensity = []
	},
	
	active: function() {
		this.timerangePicker.setTimeRange(moment())
		this.updateVisitsSummary( $("#form_filters").formParams() );
	},
	
	deactive: function() {
		$.each(this.locations, function(key, loc) {
			loc.marker.setVisibility(false)
		})
		
		$.each(this.densityGraph, function(idx, raph) { raph.remove() })
		this.densityGraph = []
		
		this.timerangePicker.hide();
	},
	
	getLocationVisitsSummary: function(location, marker) {
		var self = this
		
		if (marker.data("spent") == 0) { return }
		
		var time = marker.data("time")
		var beacons = $("#form_filters").formParams().beacons
		
		this.timerangePicker.hide()
		
		var table = $("#visits_sumarization_table_popup").sensolus_widgets_indoor_tracking_app_location_visit_summarizer({beaconsDef:self.beaconsCache});
		table.controller().setTimerange(time.end, time.start)
		table.controller().reload(beacons, location, self.options.appWidget.options.applicationId)
		table.controller().show();
	},
	
	updateVisitsSummary: function(params) {
		var self = this
		
		if (params.beacons.length == 0) { return }
		
		var dlg = loadingDialog.show("Loading, please wait...")
		
		var time = this.timerangePicker.getTimeRange()
		
		$.each(this.densityGraph, function(idx, raph) { raph.remove() })
		this.densityGraph = []
		
		IndoorTrackingAPI.loadLocationsDensity(this.options.appWidget.options.applicationId, time.end, time.start,
				Object.keys(this.locations), params.beacons, function(dataItems) {
			
			dataItems.sort(function(a, b) { return a.density.beacon_ids < b.density.beacon_ids ? -1 : 1 })
			
			var updatedList = []
			
			var total = 0;
			$.each(dataItems, function(idx, item) { total += item.density.time_spent })
			
			var i = 2;
			$.each(dataItems, function(idx, item) {
				percent = (item.density.time_spent/total * 100).toFixed(2)
				
				self.locations[item.location].marker.data("time", {start: time.start, end: time.end})
				self.locations[item.location].marker.data("spent", item.density.time_spent)
				self.locations[item.location].marker
					.setTitle(item.density.beacon_ids + " UVs\n" + SensolusDatetime.msToTime(item.density.time_spent*1000), {size:15, position: "bottom"})
					.setOverlayText(percent + "%", "middle", {size:15, color:"#0000ff"}).setVisibility(true, true)
					
				self.densityGraph.push(self.floorPlan.paper.path().attr({
				    "stroke": "#00aa00",
				    "stroke-width": 20,
				    arc: [self.locations[item.location].marker.point.x, self.locations[item.location].marker.point.y, item.density.time_spent, total, 50 * self.floorPlan.getIconScale()]
				}));
					
				updatedList.push(item.location)
			})
			
			$.each(self.locations, function(key, location) {
				if (updatedList.indexOf(key) == -1) {
					location.marker.data("time", {start: time.start, end: time.end})
					location.marker.data("spent", 0)
					location.marker.setTitle("",  {}).setOverlayText(0, "middle", {size:24}).setVisibility(true, true)
				}
			})
			
			dlg.dialog("close")
		}, function(xhr) {
			dlg.dialog("close");
			console.error("Error loading data ");
			console.error(xhr);
		})
	}
	
// end controller	
});

// end steal then
});