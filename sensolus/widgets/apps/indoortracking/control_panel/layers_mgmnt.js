steal( 'jquery/dom/form_params',
	   'jquery/lang/json').then(
	   'sensolus/models/indoor_tracking_api.js')
.then( function($){
    	   
    	  

/** 
 * Data grid widget module
 * 
 *  
 *  */
$.Controller('Sensolus.Widgets.IndoorTrackingApp.ControlPanel.Layers',
/** @Static */
{
	defaults : {
		appWidget:null,
		
		locationsDef: null
	}
},
/** @Prototype */
{
	floorPlan: null,
	locations_markers: [],
	
	locations_region: [],
	
	tracking_sensors: [],
	
	init : function(){
		var self = this
		
		this.floorPlan = this.options.appWidget.floorPlan
		
		this.element.html(this.view('//sensolus/widgets/apps/indoortracking/control_panel/views/layers_mgmnt.ejs', {}))
		
		var locations = this.options.locationsDef.locations
		for (var i = 0; i < locations.length; ++i) {
			var location_region = new visualization.floorplan.Marker({
					symbol:"circle",
					size: {r:locations[i].radius},
					border:{width:2, color:"#00ff00", dashArray: "- ", noScale: true}
		 		},
		 		{x:locations[i].coordX, y:locations[i].coordY}, self.floorPlan)
			
			location_region.toBack().setVisibility(false)
			self.locations_region.push(location_region)
			
			var location_marker = new visualization.floorplan.Marker({
					symbol: "image",
					src: "/server/sensolus/widgets/apps/indoortracking/images/position_marker_green.png",
					size: {width:48, height:48, scale: "icon"},
					title: {text:locations[i].name, position:"top", size:12, color:"#00cc00", show:false}
				},
		 		{x:locations[i].coordX, y:locations[i].coordY}, self.floorPlan)
			
			location_marker.toBack().setVisibility(false)
			self.locations_markers.push(location_marker)
		}
		
		IndoorTrackingAPI.loadTrackingSensors(this.options.appWidget.options.applicationId, function(sensors) {
			for (var i = 0; i < sensors.length; ++i) {
				if (sensors[i].location == null) {
					console.warn("Sensor " + sensors[i].name + " doesn't has coordinate!")
					consle.warn(sensors[i]);
					continue;
				}
				
				var sensor_marker = new visualization.floorplan.Marker({
					symbol: "image",
					src: "/server/sensolus/widgets/apps/indoortracking/images/radiolocator.png",
					size: {width:48, height:48, scale: "icon"}
				},
		 		{x:sensors[i].location.coordX, y:sensors[i].location.coordY}, self.floorPlan)
			
				sensor_marker.toBack().setVisibility(false)
				self.tracking_sensors.push(sensor_marker)
			}
			
			self.element.find("input[name=show_hide_layers]").bind("change", function() {
				switch($(this).val()) {
				case "locations":
					self.toggleLocationMarkers($(this).is(":checked"))
					break;
				case "location_regions":
					self.toggleLocationRegions($(this).is(":checked"))
					break;
				case "location_titles":
					self.toggleLocationTitles($(this).is(":checked"))
					break;
				case "tracking_sensors":
					self.toggleTrackingSensors($(this).is(":checked"))
					break;
				}
			})
		})
	},
	
	toggleLocationMarkers: function(show) {
		for (i = 0; i < this.locations_markers.length; ++i) {
			this.locations_markers[i].setVisibility(show, false)
		}
	},
	
	toggleLocationRegions: function(show) {
		for (i = 0; i < this.locations_markers.length; ++i) {
			this.locations_region[i].setVisibility(show)
		}
	},
	
	toggleLocationTitles: function(show) {
		for (i = 0; i < this.locations_markers.length; ++i) {
			this.locations_markers[i].showTitle(show)
		}
	},
	
	toggleTrackingSensors: function(show) {
		for (i = 0; i < this.tracking_sensors.length; ++i) {
			this.tracking_sensors[i].setVisibility(show)
		}
	},
	
	active: function() {
	},
	
	deactive: function() {
	
	}
	
	
// end controller	
});

// end steal then
});