steal( 'sensolus/js/authentication/authentication_manager.js')
.then('jquery/controller',
//		'https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false',
	   'sensolus/models/historical_data.js')
.then( 
       function($){


$.Controller('Sensolus.Widgets.HistoricalData.Location.Graph',
/** @Static */
{
},
/** @Prototype */
{
	map:null,
	markers:[],
	data:{},
	
	lastMarker:null,
	overlayLine:null,
	
	init : function(){
		this.overlayLine = new google.maps.Polyline({
			geodesic: true,
			strokeColor: '#FF0000',
			strokeOpacity: 1.0,
			strokeWeight: 2
		});
	},
	
	loadGraphs:function(node,output,loaded, view){
		AuthenticationManager.authenticate()
		
		var self = this
		
		this.reset()
		
		if (view == null) view = this.view('//sensolus/widgets/historical_data/map/views/graph.ejs',{})
		this.element.html(view)
		
		var group = new Date().toDateString()
		self.data[group] = []
		
		var dateFilter = $(self.element.find("select[id=date-filter-selection]"))
		dateFilter.append("<option value=\"" + group + "\">Today</option>");
		dateFilter.append("<optgroup label=\"-------------------\">");
		
		HistoricalDataAPI.getHistoricalFeedData(node.id,output.referenceName, function(searchResult){
			$.each(searchResult.data, function(i, dataItem){  
				try{
					var content = $.secureEvalJSON(dataItem.content)
					
					var date = new Date(dataItem.timestamp)
					group = date.toDateString()
					
					if (self.data[group] == null) {
						self.data[group] = []
						dateFilter.append("<option>" + group + "</option>");
					}
					
					self.data[group].push([date,
								content.lat,
								content.long])
				}catch(e){
				}
			});
			
			dateFilter.append("</optgroup>");

			self.map = new google.maps.Map(self.element.find("#map-canvas")[0], { zoom: 14 });
			self.changeDate(group)
			
			dateFilter.val(group)
			dateFilter.on('change', function() {
				self.changeDate($(this).val())
			});
			
			$(self.element.find("#reset-map")).on("click", function() {
				self.reAlign();
			})
			
			$(self.element.find("#toggle-line")).on("click", function() {
				self.overlayLine.setVisible(!self.overlayLine.getVisible())
			})
			
			if (loaded != null) {
				loaded()
			}
			
		},self.callback('loadingError') 
		);
	},
	
	loadingError : function(jqXHR, exception, thrownError) {
		//$.showErrorMessages(jqXHR, exception, thrownError,"#grid-warning-panel",this.options.loadingErrorMsg)
		console.log(jqXHr)
	},
	

	reset:function(){
		this.element.html("")
		this.data = {}
		
		if (this.lastMarker != null) {
			this.lastMarker.setMap(null)
			this.lastMarker = null
		}
	},
	
	changeDate:function(date) {
		this.setMarkers(this.map, this.data[date])
		if (new Date().toDateString() == date && this.lastMarker != null) {
			this.lastMarker.setMap(this.map)
			this.lastMarker.setAnimation(google.maps.Animation.BOUNCE)
			this.overlayLine.getPath().push(this.lastMarker.getPosition())
		}
	},
	
	addMarker:function(location, center) {
		var self = this
		
		var date = new Date(location[0])
		var locationTimeStamp = this.formatTimestamp(date)
		var group = date.toDateString()
		
		if (this.lastMarker == null) {
			for (var i = 0; i < this.markers.length; i++) {
				if (this.markers[i].getTitle() == locationTimeStamp) {
					this.lastMarker = this.markers[i]
					this.lastMarker.setAnimation(google.maps.Animation.BOUNCE)
					
					return
				}
			}
		} else if (this.lastMarker.getTitle() == locationTimeStamp) {
			return;
		}
		
		console.log("New location detected " + location)
		
		if (self.lastMarker != null) {
			self.lastMarker.setAnimation(null);
		}
		
		var myLatLng = new google.maps.LatLng(location[1], location[2]);
		
		this.lastMarker = new google.maps.Marker({
	        position: myLatLng,
	        animation: google.maps.Animation.BOUNCE,
	        icon: new google.maps.MarkerImage("https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=" + this.data[group].length + "|0000ff|ffffff"),	// get color ffffff - i with 20 steps
	        title: locationTimeStamp,
	        zIndex: this.data[group].length
	    })
		
		this.markers.push(this.lastMarker);
		this.data[group].push([date, location[1], location[2]])

		if ($(this.element.find("select[id=date-filter-selection]")).val() == date.toDateString()) {
			this.lastMarker.setMap(this.map)
			this.overlayLine.getPath().push(myLatLng)
			
			if (center != null && center == true) {
				self.map.setCenter(myLatLng)
			}
		}
	},
	
	reAlign:function() {
		var bounds = new google.maps.LatLngBounds();
		for (var i = 0; i < this.markers.length; i++) {
			 bounds.extend(this.markers[i].getPosition());
		}
		
		if (this.lastMarker != null) {
			bounds.extend(this.lastMarker.getPosition());
		}
		
		this.map.fitBounds(bounds);
	},
	
	setMarkers:function(map, locations) {
		var bounds = new google.maps.LatLngBounds ();
 
		// Clear all markers
		for (var i = 0; i < this.markers.length; i++) {
			this.markers[i].setMap(null)
		}
		
		this.markers = []
		var dots = []
		
		// clear overlayline
		this.overlayLine.setPath([])
  
		locations.sort(function(a, b) {
			return a[0] < b[0] ? -1 : 1
		})
		
		var colors = this.hsbGradient(locations.length, {h:123, s:50, b:100}, {h:250, s:100, b:50}, -1)
  
		for (var i = 0; i < locations.length; i++) {
			var beach = locations[i]
			var title = this.formatTimestamp(beach[0])
			var myLatLng = new google.maps.LatLng(beach[1], beach[2]);
			
			bounds.extend(myLatLng);
			dots.push(myLatLng)
			
			var newMarker = this.lastMarker
			if (this.lastMarker == null || this.lastMarker.getTitle() != title) {
				newMarker = new google.maps.Marker({
					position: myLatLng,
					icon: new google.maps.MarkerImage("https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=" + i.toString() + "|" + this.hsv2hex(colors[i]) + "|000000"),	// get color ffffff - i with 20 steps
					title: title,
					zIndex: i
				})
			}

			newMarker.setMap(map)
			this.markers.push(newMarker);
		}
		
		this.overlayLine.setPath(dots);
		this.overlayLine.setMap(map);
		map.fitBounds(bounds);
	},
	
	/*
	 * Generate gradient color based on hsv color space
	 * @Direction: -1: CW, 1: CCW 
	 */
	hsbGradient:function(steps, start, end, direction) {
		var ccwDist = start.h > end.h ? (360 - start.h) + end.h : end.h - start.h
		var cwDist = start.h < end.h ? start.h + (360 - end.h) : start.h - end.h
		var range = direction == 1 ? ccwDist : cwDist 
		
		var gradient = new Array(steps);
				
		for (var step = 0; step < steps; step ++) {
			var p = step / steps;
			// interpolate h, s, b
			var h = Math.round(start.h + direction * p * range)
			if (h < 0) h = 360 - h
			else if (h > 360) h = h - 360 
			
			var s = (1 - p) * start.s + p * end.s;
			var b = (1 - p) * start.b + p * end.b;
			// add to gradient array
			gradient[step] = {h:h, s:s, b:b};
		}
		return gradient;
	},
	
	hsv2hex:function(h, s, v) {
		if (h && s === undefined && v === undefined) {
	        s = h.s, v = h.b, h = h.h;
	    }
		
		var r, g, b;
		var i;
		var f, p, q, t;
		 
		// Make sure our arguments stay in-range
		h = Math.max(0, Math.min(360, h));
		s = Math.max(0, Math.min(100, s));
		v = Math.max(0, Math.min(100, v));
		 
		// We accept saturation and value arguments from 0 to 100 because that's
		// how Photoshop represents those values. Internally, however, the
		// saturation and value are calculated from a range of 0 to 1. We make
		// That conversion here.
		s /= 100;
		v /= 100;
		 
		if(s == 0) {
			// Achromatic (grey)
			r = g = b = v;
			
			 return (Math.round(r * 255)+0x10000).toString(16).substr(-2) +
	    			(Math.round(g * 255)+0x10000).toString(16).substr(-2) +
	    			(Math.round(b * 255)+0x10000).toString(16).substr(-2)
		}
		 
		h /= 60; // sector 0 to 5
		i = Math.floor(h);
		f = h - i; // factorial part of h
		p = v * (1 - s);
		q = v * (1 - s * f);
		t = v * (1 - s * (1 - f));
		 
		switch(i) {
			case 0: r = v; g = t; b = p; break;
			case 1: r = q; g = v; b = p; break;
			case 2: r = p; g = v; b = t; break;
			case 3: r = p; g = q; b = v; break;
			case 4: r = t; g = p; b = v; break; 
			default: // case 5:
				r = v; g = p; b = q;
		}
		 
		return (Math.round(r * 255)+0x10000).toString(16).substr(-2) +
				(Math.round(g * 255)+0x10000).toString(16).substr(-2) +
				(Math.round(b * 255)+0x10000).toString(16).substr(-2)
	},
	
	formatTimestamp:function(a){
		 var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	     var year = a.getFullYear();
	     var month = months[a.getMonth()];
	     var date = a.getDate();
	     var hour = a.getHours();
	     var min = a.getMinutes();
	     var sec = a.getSeconds();
	     var time = hour+':'+min+':'+sec +" - "+date+' '+month+' '+year;
	     return time;
	}
});

// steal then
});