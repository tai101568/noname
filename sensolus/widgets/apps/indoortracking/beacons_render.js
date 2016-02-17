steal( 'sensolus/widgets/apps/indoortracking/interactivefloorplan.js')
.then( function($){

window.visualization = window.visualization || {floorplan:{}}
var me = window.visualization.floorplan

me.BeaconRender = function(mapController) {
	this.mapController = mapController;
	this.locationsDef = mapController.locationsDef.locations;
	
	this.floorPlan = mapController.floorPlan;
	
	this.beacon_menu = mapController.beacon_menu;
	
	this.beaconMarkersCache = {}; // format: {beaconID: { markers: [marker1, marker2], hidden:true }}
	
	this.activeMarker = null;

	this.markerGroups = {};
	for (var i = 0; i < this.locationsDef.length; ++i) {
		this.markerGroups[this.locationsDef[i].id] = new visualization.floorplan.MarkersGroup({x: this.locationsDef[i].coordX, y: this.locationsDef[i].coordY}, this.floorPlan)
	}
}

me.BeaconRender.prototype = {
	// We reuse markers instead of destroying it.
	// Removing is a expensive process and it cause memory leak in RaphaelJS
	updateBeaconsMarker: function(locData, unfreezed, removeActiveMarker) {
		var self = this
		
		// Destroy all markers
		var marker;
		$.each(this.markerGroups, function(key, group) {
			while(group.markers.length != 0) {
				marker = group.markers[0]
				
				group.removeMarker(marker)
				if (unfreezed || !marker.data("freezed")) {
					marker.setVisibility(false, true);
					marker.data("freezed", false);	// In case force unfreezed
				} else {
					console.warn(marker.title.text + " freezed: " + marker.data("freezed"))
				}
			}
		})
		
		// If we're in historic mode then remove the active marker
		if (this.activeMarker != null && removeActiveMarker) {
			if (this.activeMarker.isHighLighted) {
				this.activeMarker.setHighLight(false);
			}
			this.activeMarker.data("freezed", false);
			this.activeMarker.setVisibility(false, true);
			this.activeMarker = null;
		}
		
		// For each beacon found in the list
		$.each(locData, function(beaconID, data) {
			self.updateBeaconMarkers(beaconID, data)
		})
	},
	
	updateBeaconMarkers: function(beaconID, data) {
		if (data == null) { return }
		
		var self = this
		
		var beaconInfo = self.mapController.findBeaconInfo(beaconID);
		if (beaconInfo == null) {
//				console.warn("Beacon " + beaconID + " not selected to be used!")
			return;
		// If the beacon is marked hidden then ignore
		} else if (self.beaconMarkersCache[beaconID] != null && self.beaconMarkersCache[beaconID].hidden) {
			return;
		}
		
		if (self.beaconMarkersCache[beaconID] == null) { self.beaconMarkersCache[beaconID] = {markers: [], hidden:false } } 
		
		var lastItem = 0;
		$.each(data, function(idx, loc) {		// With each location found for one beacon
			var marker = null;
			
			lastItem = self._findLastValid(self.beaconMarkersCache[beaconID].markers, lastItem)
			
			if (lastItem == null) {		// If there's no marker exists or it's being freeze
				marker = new visualization.floorplan.Marker({	// then create a new one
					symbol: "image",
					src: beaconInfo.img,
					size: {width:48, height:48, scale: "icon"},
					title: {text:beaconInfo.name, position:"bottom", size:12, show:true}
		 		}, {x:loc.loc.coordX, y:loc.loc.coordY}, self.floorPlan)
				
				marker.onClick(function() {
					self.activeMarker = this;
					
					this.data("freezed", true)
					this.toFront()
					this.showTitle(true)
					self._showBeaconMenu(this)
				})
				self.beaconMarkersCache[beaconID].markers.push(marker)
				lastItem = self.beaconMarkersCache[beaconID].markers.length
			} else {
				marker = self.beaconMarkersCache[beaconID].markers[lastItem]
				marker.setVisibility(true, true)
				lastItem += 1;
			}
			
			marker.data("loc", loc)
			marker.data("beaconinfo", beaconInfo)
			marker.data("freezed", false)
			
			self.markerGroups[loc.loc.id].addMarker(marker)
		})
		
		// Hide other markers
		for (var i = lastItem + 1; i < self.beaconMarkersCache[beaconID].markers.length; ++i) {
			if (!self.beaconMarkersCache[beaconID].markers[i].data("freezed")) {
				self.beaconMarkersCache[beaconID].markers[i].setVisibility(false, true)
			}
		}
	},
	
	_showBeaconMenu: function(marker) {
		var self = this
		
		self.mapController.clearBeaconTracks()
		
		var beacon = marker.data("beaconinfo")
		var location = marker.data("loc")
		
		$(this.beacon_menu.domE).find("#beacon-visit-info").html("")
			.append("<img style=\"margin:10px; float:left; max-width:48px; height:auto\" src=\"" + beacon.img +"\" />")
			.append("<div style=\"padding: 5px\">"
					+ "<span style=\"display:block\"><strong>" + location.loc.name + "</strong></span>"
					+ "<span style=\"display:block\"><strong>Arrived at:</strong> " + SensolusDatetime.format(location.start) + "</span>"
					+ "<span style=\"display:block\"><strong>Time spent:</strong> " + SensolusDatetime.msToTime((location.end || moment()) - location.start) + "</span>"
					+ "</div>")
			.siblings("div").find("select[name=beacon_time_track_selection]").unbind("change").on("change", function() {
				if ($(this).val() != "") {
					self.mapController.drawBeaconTracks(beacon, $(this).val())
				}
			})
		
		this.beacon_menu.setMarker(marker)
		this.beacon_menu.setVisibility(true)
		marker.setHighLight(true)
		marker.raphaelEl.transform("")
		
		$(this.beacon_menu.domE).find(".close_btn").unbind("click").click(function() {
			marker.data("freezed", false)
			marker.setHighLight(false)
			self.mapController.clearBeaconTracks()
			self.beacon_menu.setVisibility(false)
			
			
			// Update group visua
			var group = marker.group
			if (group != null) { group.redraw(marker) }
			
			// If it does not belongs to any group then it's orphan. Remove orphan markers
			if (group == null) {
				//marker.destroy();
				if (marker.isHighLighted) {
					marker.setHighLight(false);
				}
				marker.setVisibility(false, true)
				self.activeMarker = null;
			}
		})
	},
	
	hideBeaconsMarker: function(hidden) {
		if (hidden === false) {
			$.each(this.markerGroups, function(idx, group) {
				group.setVisibility(true, true)
			})
		} else {
			$.each(this.markerGroups, function(idx, group) {
				group.setVisibility(false, true)
				group.hidePopup()
			})
			
			if (this.beacon_menu.getMarker != null && this.beacon_menu.getVisibility()) {
				this.beacon_menu.close()
			}
		}
	},
	
	hideBeaconMarker: function(id, visibility, currentLocations) {
		var markers = this.beaconMarkersCache[id]
		if (markers == null) {
			this.beaconMarkersCache[id] = {markers: [], hidden:false }
			markers = this.beaconMarkersCache[id]
		} 
		
		markers.hidden = visibility;
		
		this.beacon_menu.setVisibility(false)
		$.each(markers.markers, function(idx, marker) {
			if (marker.group != null) {
				marker.group.removeMarker(marker, true, true)
			}
			
			marker.data("freezed", false);
			marker.setHighLight(false)
			marker.setVisibility(false, true)
		})
		
		this.updateBeaconMarkers(id, currentLocations)
	},
	
	_findLastValid: function(array, startIdx) {
		for (var i = startIdx; i < array.length; ++i) {
			if (!(array[i] == null || array[i].data("freezed"))) {
				return i;
			}
		}
		
		return null;
	},
	
	destroy: function() {
		$.each(this.markerGroups, function(idx, group) {
			group.destroy()
		})
	}
}

})();