steal( 'sensolus/models/indoor_tracking_api.js',
	   'sensolus/models/realtime_data.js',
	   'sensolus/js/jquery.delayKeyup.js',
	   'ui/cms/design/jui/jquery-ui.custom.min.js',
	   'sensolus/widgets/apps/indoortracking/beacons_render.js',
	   'sensolus/models/sensolus_datetime.js',
	   'sensolus/widgets/apps/indoortracking/utils/sensolus_historic_player.js',
	   'sensolus/widgets/apps/indoortracking/extensions/beacon_location_details/beacon_location_table.js',
	   'ui/cms/design/jui/js/timepicker/jquery-ui-timepicker.min.js')
.then( function($){
    	   

/** 
 * Data grid widget module
 * 
 *  
 *  */
$.Controller('Sensolus.Widgets.IndoorTrackingApp.ControlPanel.ObjectsMgmnt',
/** @Static */
{
	defaults : {
		appWidget:null,
		pollerInterval:3000,
		
		locationsDef: null,
		beaconsDef: null
	}
},
/** @Prototype */
{
	beaconsLocCache: {},	// Format {beaconID: [{locId: location, start: new Date(), end: new Date()}]}
	
	tracking_markers: {connections: null, markers: []},
	
	floorPlan: null,
	
	beacon_menu: null,
	
	beacon_location_table: null,
	
	beaconRender: null,
	
	historicController: null,
	
	locationsDef: null,
	
	init : function() {
		var self = this
		
		this.floorPlan = this.options.appWidget.floorPlan
		this.locationsDef = this.options.locationsDef
		
		var beacons = this.options.beaconsDef.beacons
		var objectTypes = this.options.beaconsDef.objectTypes
		var getImage = function(type) {
			for (var i = 0; i < objectTypes.length; ++i) {
				if (objectTypes[i].id == type) {
					return objectTypes[i].image
				}
			}
		}
		
		$.each(beacons, function(idx, beacon) {
			beacons[idx].img = getImage(beacon.objectType)
		})
		
		this.element.html(this.view('//sensolus/widgets/apps/indoortracking/control_panel/views/objects_mgmnt.ejs', {beacons:this.options.beaconsDef.beacons}))
		
		$("body").children("#beacons_option_menu_popup").remove()
		$("body").append(this.element.find("#beacons_option_menu_popup").remove())
		
		$("body").children("#beacons_location_table_popup").remove()
		$("body").append('<div id="beacons_location_table_popup" style="display:none;"></div>')
		this.beacon_location_table = $("#beacons_location_table_popup").sensolus_widgets_indoor_tracking_app_beacon_location_table({applicationId: this.options.appWidget.options.applicationId, locationsDef: this.options.locationsDef})
		
		this.beacon_menu = new visualization.floorplan.OverlayElement($("body #beacons_option_menu_popup").css("cursor", "default").draggable()[0])
		
		this.element.bind("viewPortChanged", $.proxy(this.onViewPortChanged, this))

		this.beaconRender = new visualization.floorplan.BeaconRender(this);
		
		this._initGuiControls();
		
		this.element.find(".beacon-show-history").on("click", function() {
			self.beacon_location_table.controller().reload(self.element.find("input[name=time_filter]").val(), self.findBeaconInfo($(this).attr('id').replace('icol_', '')))
			self.beacon_location_table.controller().show(this)
		})
	},
	
	_initGuiControls: function() {
		var self = this;
		
		this.element.find("a.select_all").click(function() {
			self.element.find("input[name=beacons]").attr("checked", true).trigger("change")
		})
		this.element.find("a.select_none").click(function() {
			self.element.find("input[name=beacons]").attr("checked", false).trigger("change")
		})
		this.element.find("a.select_invert").click(function() {
			self.element.find("input[name=beacons]").each(function() {
				$(this).attr("checked", !$(this).is(":checked")).trigger("change")
			})
		})
		
		this.element.find("input[name=beacons]").on("change", function() {
			var id = $(this).val()
			
			self.beaconRender.hideBeaconMarker(id, !$(this).is(":checked"), self.beaconsLocCache[id])
		})
		
		var reloadLocation = function(time, callback) {
			self.disconnect();
			self.loadHistoricLocation(time, callback)
		}
		
		this.historicController = this.element.find("#historic_controls").sensolus_utils_historic_player();
		this.historicController.controller().registerEvent("TIME_CHANGED", function(evt, time, callback) {
			if (this.isClockRunning()) {
				self.connection == null && self.connect()
			} else {
				reloadLocation(time, callback)
			}
		})
	},
	
	onViewPortChanged: function() {
		this.beacon_menu.updatePosition()
	},
	
	loadHistoricLocation: function(time, callback) {
		var self = this
		
		this.beacon_menu.setVisibility(false)
		
		this.clearBeaconTracks()
		
		var dlg = loadingDialog.create("Loading, please wait...")
		
		callback == null && setTimeout(function() {
			if (!dlg.forceClosed) { dlg.dialog("open") }
		}, 1000)
		
		IndoorTrackingAPI.loadHistoricLocations(this.options.appWidget.options.applicationId, time, null, function(dataItems) {
			console.log("Historic data at " + time)
			console.log(dataItems)
			
			dlg.forceClosed = true;
			dlg.dialog("close")
			
			self.beaconsLocCache = {}
			
			$.each(dataItems, function(idx, item) {
				self.beaconsLocCache[item.beacon_id] = self.beaconsLocCache[item.beacon_id] || []
				
				$.each(self.options.locationsDef.locations, function(index, location) {
					if (location.id == item.location) {
						self.beaconsLocCache[item.beacon_id].push({ loc: location,
							start: SensolusDatetime.parse(item.start, "server"),
							end: SensolusDatetime.parse(item.end, "server")})
						
						return false
					}
				})
			})
			
			self.beaconRender.updateBeaconsMarker(self.beaconsLocCache, true)
			callback != null && callback()
			
		}, function(err) {
			dlg.dialog("close")
			
			console.log(err)
		})
	},
	
	updateBeaconsLocation: function(unFreezed) {
		var self = this

		IndoorTrackingAPI.loadHistoricLocations(this.options.appWidget.options.applicationId, "now", null, function(dataItems) {
			self.beaconsLocCache = {}
			
			var now = moment()
			
			$.each(dataItems, function(idx, item) {
				var end = item.end.toLowerCase() != "now" ? SensolusDatetime.parse(item.end, "server") : now
				if (now - end > 30000) { return }
				
				self.beaconsLocCache[item.beacon_id] = self.beaconsLocCache[item.beacon_id] || []
				
				$.each(self.options.locationsDef.locations, function(index, location) {
					if (location.id == item.location) {
						self.beaconsLocCache[item.beacon_id].push({ loc: location,
							start: SensolusDatetime.parse(item.start, "server"),
							end: end})
						
						return false
					}
				})
			})
			
			self.beaconRender.updateBeaconsMarker(self.beaconsLocCache, unFreezed)
		}, function(err) {
			console.log(err)
		})
	},
	
	findBeaconInfo: function(beaconId) {
		var beacons = this.options.beaconsDef.beacons
		var objectTypes = this.options.beaconsDef.objectTypes
		
		var found = null;
		$.each(beacons, function(idx, beacon) {
			if (beacon.id == beaconId) {
				found = beacon;
				
				$.each(objectTypes, function(idx, type) {
					if (beacon.objectType == type.id) {
						found.img = type.image
						return false;
					}
				})
				
				return false;
			}
		})
		
		return found;
	},
	
	_getCurrLoc: function(locId) {
		var locations = this.options.locationsDef.locations
		for (var i = 0; i < locations.length; ++i) {
			if (locations[i].id == locId) {
				return locations[i]
			}
		}
	},
	
	drawBeaconTracks: function(beacon, timeTrack) {
		var self = this
		
		this.clearBeaconTracks()
		
		var tempTime = new Date(SensolusDatetime.parse(self.element.find("input[name=time_filter]").val()))
		
		var startTime = new Date(tempTime)
		tempTime.setMinutes(tempTime.getMinutes() - parseInt(timeTrack))
		var endTime = tempTime
		
		IndoorTrackingAPI.loadBeaconHistoricLocations(this.options.appWidget.options.applicationId, endTime, startTime, beacon.id, function(dataItems) {
			var locationDef = null;
			self.tracking_markers.connections = new visualization.floorplan.MarkersConnection(self.floorPlan)
			
			var sortFunc = function(v1, v2) { return v1.start < v2.start ? -1 : 1 }
			
			dataItems.sort(sortFunc)
			
			var circles = []
			$.each(dataItems, function(idx, item) {
				circles.push(new Date(item.end).getTime() - new Date(item.start).getTime())
			})
			circles.sort(function(v1, v2) { return v1 < v2 ? -1 : 1 })
			
			console.log("Historic location of " + beacon.id + " from " + startTime.toLocaleString() + " to " + endTime.toLocaleString())
			console.log(dataItems)

			var timeDiff;
			$.each(dataItems, function(idx, item) {
				locationDef = self._getCurrLoc(item.location)
				d = visualization.floorplan.random(-locationDef.radius/2, locationDef.radius/2)
				
				timeDiff = SensolusDatetime.parse(item.end, "server") - SensolusDatetime.parse(item.start, "server")
				
				var location = new visualization.floorplan.Marker({
					symbol:"circle",
					size: {r: 35 + circles.indexOf(timeDiff) * 4, scale: "icon"},
					fillColor: "#FAF9C8",
					opacity: 0.6,
					border:{width:4, color:"#1FD60B", noScale: true},
					title: {text: SensolusDatetime.msToTime(timeDiff), position:"middle", size:16, show:true}
		 		},
		 		{x:locationDef.coordX + d, y:locationDef.coordY + d}, self.floorPlan)
				
				self.tracking_markers.markers.push(location)
				connection = self.tracking_markers.connections.addMarker(location, {color: "#1FD60B"})
				if (connection != null) {
					connection.onClick(function() {
						this.toggleHighLight()
//						self.beacon_menu.getMarker().toFront()
					})
				}
			})
			
			self.tracking_markers.connections.toFront()
		})
	},
	
	clearBeaconTracks: function() {
		for (var i = 0; i < this.tracking_markers.markers.length; ++i) {
			this.tracking_markers.markers[i].destroy()
		}
		if (this.tracking_markers.connections != null) {
			this.tracking_markers.connections.destroy()
			this.tracking_markers.connections = null
		}
		this.tracking_markers.markers = []
	},
	
	destroy: function() {
		this.beaconRender.destroy();
		
		this._super();
	},
	
	deactive: function() {
		this.disconnect();
		
		this.beaconRender.hideBeaconsMarker();
		
		this.historicController.controller().stopHistoryPlaying()
	},
	
	active:function() {
		var self = this
		
		this.beaconRender.hideBeaconsMarker(false);
		
		if (this.historicController.controller().isClockRunning()) { this.connect() }
	},
	

	connect: function(appID){
		var self = this
		
		this.disconnect();
		this.clearBeaconTracks()

		this.beacon_menu.setVisibility(false)
		
		self.updateBeaconsLocation(true)
		if(this.connection==null){
			this.connection = setInterval( function(){
				self.updateBeaconsLocation(false)
			}, this.options.pollerInterval );
		}
	},
	
	disconnect:function(){
		if (this.connection != null) {
			clearInterval( this.connection );
			this.connection=null;
		}
	}
	
// end controller	
});

// end steal then
});