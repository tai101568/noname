
(function() {
	
Raphael.el.trigger = function (str/*name of event*/, scope, params){ 
    scope = scope || this;
    for(var i = 0; i < this.events.length; i++){
        if(this.events[i].name === str){
            this.events[i].f.call(scope, params);
        }
    }
};

window.visualization = {floorplan:{}}

var self = window.visualization.floorplan

/**
 * 
 *  Main FloorPlan class 
 * 
 */

var STANDARD_LONG_RES = 904;

self.FloorPlan = function(svgBackground, imageWidth, imageLength, offsetX, offsetY, scaleX, scaleY) {
	this.id = Math.random().toString(10).substr(2)
	
	this.svgBackground = svgBackground
	this.xRes = imageWidth
	this.yRes = imageLength
	
	this.offsetX = offsetX || 0
	this.offsetY = offsetY || 0
	this.scaleX = scaleX || 1
	this.scaleY = scaleY || 1
	
	this.overlayLayerEl = null;
	
	this.backgroundEl = null;
}

self.FloorPlan.prototype = {
	render:function(domElement, zoomToFit) {
		var me = this
		
		var container = $(domElement).append("<div id=\"svg-paper\" style=\"display:inline; height:100%\"></div>");
		container.css("position", "relative")
		
		this.paper = Raphael(container.find("#svg-paper")[0], domElement.scrollWidth, domElement.scrollHeight);
		this.overlayLayerEl = this.paper.rect(0, 0, this.xRes, this.yRes).attr({fill:"#dddddd", "stroke-width":0, "fill-opacity":0.4})
		this.backgroundEl = this.paper.image(this.svgBackground, 0, 0, this.xRes, this.yRes);
		
		this.panzoom = this.paper.panzoom({ initialZoom: 0, initialPosition: { x: 0, y: 0}, contentSize:{width:this.xRes, height:this.yRes} });
		this.panzoom.enable()
		
		if (zoomToFit !== true) {
			while(me.backgroundEl.node.getBoundingClientRect().width < container.width() - 20) {
				me.panzoom.zoomIn(0.1);
			}
		}
		me.panzoom.pan(0, 100000)
		
		$(window).resize(function() {
			me.paper.setSize(container.width(), container.height())
			me.panzoom.paperSizeChanged()
		})
		
		container.append('<div id="controls" style="padding: 5px; position: absolute; right: 20px; top: 15px;">'
				+ '<a id="zoomin" title="Zoom in" class="icol32-zoom-in" href="javascript:;" style="display: block;"></a>'
				+ '<a id="zoomfit" title="Fit to current window" class="icol32-zoom-refresh" href="javascript:;" style="display: block;"></a>'
				+ '<a id="zoomout" title="Zoom out" class="icol32-zoom-out" href="javascript:;" style="display: block;"></a></div>')
		container.find("#zoomin").bind("click", function(evt) {
			me.panzoom.zoomIn(0.25);
		})
		container.find("#zoomout").bind("click", function(evt) {
			me.panzoom.zoomOut(0.25);
		})
		container.find("#zoomfit").bind("click", function(evt) {
			me.panzoom.zoomFit();
		})
	},
	
	getScale: function() {
		return { x: this.scaleX, y: this.scaleY }
	},
	
	getIconScale: function() {
		return Math.max(this.xRes, this.yRes) / STANDARD_LONG_RES
	},
	
	translate: function(x, y) {
		return {x: Math.floor(x*this.scaleX + this.offsetX), y: Math.floor(y*this.scaleY + this.offsetY)}
	},
	
	reverseTranslate: function(X, Y) {
		return {x: (X - this.offsetX)/this.scaleX, y: (Y - this.offsetY)/this.scaleY }
	},
	
	showOverlayLayer: function() {
		if (this.overlayLayerEl != null) {
			this.overlayLayerEl.toFront()
		}
	},
	
	hideOverlayLayer: function() {
		if (this.overlayLayerEl != null) {
			this.overlayLayerEl.toBack()
		}
	},
	
	setViewPoint: function(x, y) {
		this.panzoom.center(x, y);
	},
	
	getPaper: function() {
		return this.paper;
	},
	
	getId: function() {
		return this.id
	}
}

/**
 * 
 * Markers
 * 
 */

var drawMarker = function(paper, marker) {
	var markerStyle = marker.getStyle()
	
	var scale = marker.getFloorPlan().getScale()
	var iconScale = marker.getFloorPlan().getIconScale()
	
	if (markerStyle.size.scale != null && markerStyle.size.scale == "icon") {
		scale.x = iconScale
		scale.y = iconScale
	}
	
	switch (markerStyle.symbol) {
		case 'ellipse':
		case 'circle':
			markerStyle.size.rx = Math.floor((markerStyle.size.rx || markerStyle.size.r) * scale.x)
			markerStyle.size.ry = Math.floor((markerStyle.size.ry || markerStyle.size.r) * scale.y)
			el = paper.ellipse(marker.getPosition().x, marker.getPosition().y, markerStyle.size.rx, markerStyle.size.ry)
			break
		case 'rect':
		case 'rectangle':
			markerStyle.corner = markerStyle.corner || 0
			markerStyle.size.width = markerStyle.size.width * scale.x
			markerStyle.size.height = markerStyle.size.height * scale.y
			el = paper.rect(marker.getPosition().x - markerStyle.size.width/2, marker.getPosition().y -  markerStyle.size.height/2,  markerStyle.size.width,  markerStyle.size.height, markerStyle.corner)
			break
		case 'image':
			markerStyle.size.width = markerStyle.size.width * scale.x
			markerStyle.size.height = markerStyle.size.height * scale.y
			el = paper.image(markerStyle.src, marker.getPosition().x - markerStyle.size.width/2, marker.getPosition().y - markerStyle.size.height/2, markerStyle.size.width, markerStyle.size.height)
			markerStyle.border = {width:0}
			break;
		default:
			el = paper.circle(marker.getPosition().x, marker.getPosition().y, 20 * Math.max(scale.x, scale.y))
			break;
	}
	
	el.attr({cursor:"pointer"})
	updateElBorder(el, markerStyle, scale)
	
	return el
}

var updateElBorder = function(el, markerStyle, scale) {
	if (markerStyle.border != null) {
		if (markerStyle.border.width != null) {
			el.attr({"stroke-width":markerStyle.border.width * (markerStyle.border.noScale == null ? Math.min(scale.x, scale.y) : 1) })
		}
		if (markerStyle.border.color != null) {
			el.attr({"stroke":markerStyle.border.color})
		}
		if (markerStyle.border.dashArray != null) {
			el.attr({"stroke-dasharray":markerStyle.border.dashArray})
		}
		if (markerStyle.border.opacity != null) {
			el.attr({"stroke-opacity": markerStyle.border.opacity})
		}
	}
	
	if (markerStyle.fillColor != null) {
		el.attr({fill: markerStyle.fillColor, "fill-opacity": markerStyle.opacity || 1.0})
	} else {
		el.attr({fill: "#ffffff", "fill-opacity": 0})
	}
}

var calculateRelativePosition = function(marker, relativePosition, elHeight) {
	var markerHeight = marker.raphaelEl.getBBox().height/2
	var y = marker.getPosition().y
	
	if (relativePosition == "bottom") {
		y += markerHeight + elHeight/2 + 10 * marker.getFloorPlan().getIconScale()
	} else if (relativePosition == "top") {
		y -= markerHeight + elHeight/2 + 10 * marker.getFloorPlan().getIconScale()
	}
	
	return {x:marker.getPosition().x, y:y}
}

self.Marker = function(options, point, floorPlan) {
	var self = this
	
	this.id = "_marker_" + Math.random().toString(10).substr(2)
	
	if (floorPlan == null) {
		throw new Error("Floor plan should not be null")
	}
	this.floorPlan = floorPlan
	
	if (point == null || point.x == null || point.y == null) {
		throw new Error("point should be {x, y}")
	}
	
	this.point = floorPlan.translate(point.x, point.y);
	this.point.oX = point.x;
	this.point.oY = point.y
	
	this.styleDesc = options
	if (options.symbol == null) {
		throw new Error("Symbol is required!")
	} else if (options.size == null) {
		throw new Error("Size is missing!")
	}
	
	this.raphaelEl = drawMarker(this.floorPlan.getPaper(), this)
	
	this.title = options.title || {}
	this.titleEl = this.floorPlan.getPaper().text(this.point.x, this.point.y, "")
	this.setTitle(this.title.text, this.title)
	if (this.title.show == null || this.title.show == false) {
		this.showTitle(false);
	}
	
	this.titleEl.click(function() {
		self.toFront()
	})
	
	this.overlayTextEl = this.floorPlan.getPaper().text(0, 0, "")
	
	this.isHighLighted = false;
	
	this._click = null;
	this._hover = null;
	this._mouseOut = null;
}

self.Marker.prototype = {
		
	getId: function() {
		return this.id;
	},
		
	getFloorPlan: function() {
		return this.floorPlan
	},
	
	getRaphaelEl: function() {
		return this.raphaelEl;
	},
	
	setTitle: function(title, style) {
		this.title.text = title || ""
		this.title.position = style.position || "top"
		this.title.size = (style.size || 10) * this.floorPlan.getIconScale()
		this.title.color = style.color || "#0000ff"
		
		// Set text and other things
		this.titleEl.attr({
			text: this.title.text,
			"font-size": this.title.size, "font-weight":"bold",
			fill:this.title.color})
		
		// Calculate y position
		var titlePos = calculateRelativePosition(this, this.title.position, this.titleEl.getBBox().height)
		
		this.titleEl.attr({x: this.point.x, y: titlePos.y})
		this.titleEl.insertAfter(this.raphaelEl)
		
		if (style.show != null && style.show == false) {
			this.titleEl.hide()
		}
		
		return this
	},
	
	data: function(key, value) {
		return value == null ? this.raphaelEl.data(key) : this.raphaelEl.data(key, value)
	},
		
	moveTo: function(x, y, callbackFunc) {
		var me = this
		
		this.point = this.floorPlan.translate(x, y)
		this.point.oX = x;
		this.point.oY = y;

		var titlePos = calculateRelativePosition(this, this.title.position, this.titleEl.getBBox().height)
		
		if (this.raphaelEl.type == "circle" || this.raphaelEl.type == "ellipse") {
			this.raphaelEl.stop().animate({cx:this.point.x, cy:this.point.y}, 200)
		} else {
			this.raphaelEl.stop().animate({x:this.point.x - this.styleDesc.size.width/2, y:this.point.y - this.styleDesc.size.height/2}, 200)
		}
		
		if (callbackFunc != null) {
			this.titleEl.stop().animate({x:this.point.x, y:titlePos.y}, 200, "linear", function() {
				callbackFunc.call(me)
			})
		} else {
			this.titleEl.stop().animate({x:this.point.x, y:titlePos.y}, 200, "linear")
		}
	},
	
	getPosition: function() {
		return this.point
	},
	
	setVisibility: function(isDisplayed, includeTitle) {
		if (isDisplayed) {
			this.raphaelEl.show()
			this.overlayTextEl.show()
		} else {
			this.raphaelEl.hide()
			this.overlayTextEl.hide()
		}
		
		if (includeTitle == null || includeTitle == true) {
			this.showTitle(isDisplayed)
		}
		
		return this
	},
	
	showTitle: function(shown) {
		if (shown) {
			this.titleEl.show()
		} else {
			this.titleEl.hide()
		}
		
		return this;
	},
	
	toFront: function(marker) {
		if (marker == null) {
			this.raphaelEl.toFront()
		}
		
		this.titleEl.insertAfter(this.raphaelEl)
		this.overlayTextEl.insertAfter(this.raphaelEl)
		
		return this
	},
	
	toBack: function(marker) {
		if (marker == null) {
			this.raphaelEl.insertAfter(this.floorPlan.backgroundEl)
		} else {
			this.raphaelEl.insertBefore(marker.raphaelEl)
		}
		
		this.titleEl.insertAfter(this.raphaelEl)
		this.overlayTextEl.insertAfter(this.raphaelEl)
		
		return this
	},
	
	setHighLight: function(isHighLight) {
		if (isHighLight) {
			this.floorPlan.showOverlayLayer()
			this.toFront()
		} else {
			this.floorPlan.hideOverlayLayer()
		}
		
		this.isHighLighted = isHighLight
		
		return this
	},
	
	setBorder: function(borderDesc) {
		this.styleDesc.border = this.styleDesc.border || borderDesc || {}
		this.styleDesc.border.width = borderDesc.width
		this.styleDesc.border.color = borderDesc.color
		this.styleDesc.border.dashArray = borderDesc.dashArray
		
		updateElBorder(this.raphaelEl, this.styleDesc)
		
		return this
	},
	
	destroy: function() {
		if (this.isHighLighted) {
			this.setHighLight(false);
		}
		
		this.raphaelEl && this.raphaelEl.remove()
		this.titleEl && this.titleEl.remove()
		this.overlayTextEl && this.overlayTextEl.remove();
		
		this.floorPlan = null;
		
		this._click = null;
		this._hover = null;
		this._mouseOut = null;
		this.raphaelEl = null;
		this.titleEl = null;
		this.overlayTextEl = null;
		this.styleDesc = null;
	},
	
	getStyle: function() {
		return this.styleDesc
	},
	
	setOverlayText: function(content, relativePosition, style) {
		style = style || {}
		
		this.overlayTextEl.attr({ text: content, cursor:"pointer",
			"font-size": (style.size || 16) * this.getFloorPlan().getIconScale(), "font-weight":"bold",
			fill: style.color || "#ff0000"})
		
		var pos = calculateRelativePosition(this, relativePosition, this.overlayTextEl.getBBox().height)
		
		this.overlayTextEl.attr({x: this.point.x, y: pos.y})
		this.overlayTextEl.insertAfter(this.raphaelEl)
		
		return this
	},
	
	setGlow: function(glow) {
		var iScale = this.getFloorPlan().getIconScale()
		
		if (glow) {
			this.raphaelEl.data("glowed", true).attr({fill: "red", "fill-opacity": 0.6})
		} else {
			updateElBorder(this.raphaelEl, this.styleDesc, {x: iScale, y:iScale})
			this.raphaelEl.data("glowed", null)
		}
		
		return this
	},
	
	isGlowed: function() {
		return this.raphaelEl.data("glowed") || false
	},
	
	onClick: function() {
		var self = this
		
		var func = [].shift.call(arguments)
		var newArgs = arguments
		
		var wrapper = function(args) {
			if (typeof(func) == "function") {
				func.apply(this, args)
			}
		}
		
		this._click = wrapper
		
		this.raphaelEl.click(function() {
			self._click(newArgs)
		})
		
		this.overlayTextEl.click(function() {
			self._click(newArgs)
		})
	},
	
	onHover: function(mouseOver, mouseOut) {
		var self = this
		
		this._hover = mouseOver
		this._mouseOut = mouseOut
		
		this.raphaelEl.hover(function() {
			self._hover()
		}, function() {
			self._mouseOut()
		})
		
		this.overlayTextEl.hover(function() {
			self._hover()
		}, function() {
			self._mouseOut()
		})
	},
	
	click: function() {
		this.raphaelEl.trigger("click")
	}
}

self.MarkersGroup = function(position, floorPlan) {
	this.markers = []
	this.size = 64
	
	this.id = "_markers_" + Math.random().toString(10).substr(2)
	
	if (floorPlan == null) {
		throw new Error("Floor plan should not be null")
	}
	this.floorPlan = floorPlan
	
	if (position == null || position.x == null || position.y == null) {
		throw new Error("position should be {x, y}")
	}
	
	var iconScale = this.floorPlan.getIconScale()
	
	this.point = floorPlan.translate(position.x, position.y);
	this.point.oX = position.x;
	this.point.oY = position.y

	this.marker = this._render()
	
	this.group_menu = new self.OverlayElement($("#popup" + this.id).css("cursor", "default").draggable()[0])
	$(this.group_menu.domE).find(".close_btn").remove()
	this.group_menu.setMarker(this.marker)
	
	this.titleBgEl = this.floorPlan.getPaper().circle(this.point.x + (this.size/2 - 5) * iconScale, this.point.y + this.size/2 * iconScale, 12 * iconScale);
	updateElBorder(this.titleBgEl, {fillColor: "#ff0000", opacity: 1,border: {width:1, color:"#ffff00"}}, {x: iconScale, y: iconScale})
	this.titleEl = this.floorPlan.getPaper().text(this.point.x + (this.size/2 - 5) * iconScale, this.point.y + this.size/2 * iconScale, "")
	
	this.visibilityState = true;
	this.menuVisibility = false;
	
	var me = this
	
	this._click = function() {
		$(this.floorPlan.paper.canvas.parentNode).trigger("click")
		
		this.menuVisibility = !this.menuVisibility
		
		this.group_menu.setVisibility(this.menuVisibility)
	}
	
	this._hover = null;
	this._mouseOut = null;
}

self.MarkersGroup.prototype = {
	_render: function() {
		var me = this
		
		$(this.floorPlan.paper.canvas.parentNode).on("click", function() { me.hidePopup() })
		
		$("body").append("<div id=\"popup" + this.id + "\" style=\"display:none; width: 300px; background-color:rgb(234, 255, 200); padding: 10px;\">"
						+ "<center><h4>Together</h4></center>"
						+ "<div id=\"markers_container\" style=\"max-height:250px; overflow:auto\"></div></div>")
		
		var m = new self.Marker({
			symbol:"rect",
			size: {width: this.size, height: this.size, scale: "icon"},
			fillColor: "#00daff", opacity: 0.15,
			corner: 10 * this.floorPlan.getIconScale(), border: {width:2, color:"#ffff00", noScale:true}
 		}, {x:this.point.oX, y: this.point.oY}, this.floorPlan)
		
		var w = m.styleDesc.size.width/4;
		var h = m.styleDesc.size.height/4;
		
		this.grid = [this.floorPlan.reverseTranslate(this.point.x - w, this.point.y - h),	// Top left
		             this.floorPlan.reverseTranslate(this.point.x + w, this.point.y - h),	// Top right
		             this.floorPlan.reverseTranslate(this.point.x + w, this.point.y + h),	// Bottom right
		             this.floorPlan.reverseTranslate(this.point.x - w, this.point.y + h)]	// Bottom left
		
		m.raphaelEl.click(function(event) {
			event.stopPropagation();
			me._click()
		})
		
		return m;
	},
	
	destroy: function() {
		$("body").find("#popup" + this.id).remove()
		this.markers = [];
		this.marker && this.marker.destroy()
		try { this.titleBgEl && this.titleBgEl.destroy() } catch(err) {	console.log(err) }
		try { this.titleEl && this.titleEl.destroy() } catch(err) {	console.log(err) }
//		this.titleEl && this.titleEl.destroy()
		
		this.titleBgEl = null;
		this.titleEl = null;
		this._click = null;
		this._hover = null;
	},
	
	showMarker: function(markerId) {
		$.each(this.markers, function(idx, marker) {
			if (marker.id == markerId) {
				marker.raphaelEl.trigger("click", marker, null)
				
				return false;
			}
		})
	},
	
	hidePopup: function() {
		this.menuVisibility = false;
		this.group_menu.setVisibility(false)
	},
	
	setVisibility: function(isDisplayed, includeTitle) {
		this.visibilityState = isDisplayed
		
		if (this.markers.length < 2) {
			isDisplayed = false;
			includeTitle = true;
		}
		
		this.marker.setVisibility(isDisplayed)
		
		if (includeTitle) {
			this.setTitleVisibility(isDisplayed)
		}
		
		var self = this
		$.each(this.markers, function(idx, marker) {
			marker.setVisibility(self.visibilityState, !isDisplayed || false)
		})
		
		return this
	},
	
	setTitleVisibility: function(visibility) {
		if (visibility) {
			this.titleBgEl.show()
			this.titleEl.show()
		} else {
			this.titleBgEl.hide()
			this.titleEl.hide()
		}
	},
		
	toFront: function() {
		this.marker.toFront()
		this.titleBgEl.insertAfter(this.marker.raphaelEl)
		this.titleEl.insertAfter(this.titleBgEl)
		
		return this
	},
	
	_setTitle: function(title) {
		this.titleEl.attr({
			text:title,
			"font-size": 16 * this.floorPlan.getIconScale(), "font-weight":"bold",
			fill:"#ffff00"})
			
		this.titleEl.toFront()

		return this
	},
		
	moveTo: function(x, y, callbackFunc) {
		this.point = this.floorPlan.translate(x, y)
		this.point.oX = x;
		this.point.oY = y;

		this.marker.moveTo(x, y, callbackFunc)
	},
	
	_redraw: function() {
		this._setTitle(this.markers.length)
		
		this.setVisibility(this.visibilityState, true)
		
		if (this.markers.length == 1) {
			this.markers[0].setVisibility(this.visibilityState, true).showTitle(this.visibilityState).raphaelEl.transform("")
			this.group_menu.setVisibility(false)
		} else if (this.markers.length > 1) {
			this.markers[0].showTitle(false).raphaelEl.transform("S0.5")
			this.group_menu.setVisibility(this.menuVisibility)
		} else {
			this.group_menu.setVisibility(false)
		}
	},
	
	redraw: function(marker) {
		if (this.markers.length > 1) {
			marker.showTitle(false).raphaelEl.transform("S0.5")
		}
		
		this.toFront()
	},
	
	addMarker: function(marker) {
		var me = this

		if (this.markers.indexOf(marker) == -1) {
			var pos = this.grid[me.markers.length % 4]
			
			me.markers.push(marker)
			marker.group = me;
			
			$(me.group_menu.domE).find("#markers_container")
			.append("<span class=\"marker_avatar\" id=\"" + marker.id + "\" style=\"display:block; clear:both; margin:5px; cursor:pointer\">"
				+ "<img src=\"" + marker.styleDesc.src + "\" style=\"float:left;max-width:32px; height:auto\">"
				+ "<span><span style=\"display:block\">&nbsp&nbsp&nbsp&nbsp" + marker.title.text + "</span><span style=\"display:block\">&nbsp&nbsp&nbsp&nbsp</span></span>"
				+ "</span>").find("#" + marker.id).on("click", function() {
					me.menuVisibility = false;
					me.group_menu.setVisibility(false);
					me.showMarker($(this).attr('id'));
				})
				
			me.group_menu.updatePosition()
			
			marker.setVisibility(this.visibilityState, true).showTitle(false).toBack(this.marker)
			marker.moveTo(pos.x, pos.y, function() {
				this.raphaelEl.transform("S0.5")
				me._redraw()
			})
		}
	},
	
	removeMarker: function(marker, destroy, updateMarkers) {
		var me = this;
		
		idx = this.markers.indexOf(marker)
		if (idx > -1) {
			destroy === true && marker.setVisibility(false, true);
			
			marker.raphaelEl.transform("")
			this.markers.splice(idx, 1)
			marker.group = null;
			
			$(this.group_menu.domE).find("#markers_container").find("#" + marker.id).remove()
			this.group_menu.updatePosition()
			
			if(updateMarkers && this.markers.length > 0) {
				for (var i = 0; i < this.markers.length; ++i) {
					var pos = this.grid[i % 4]
					this.markers[i].raphaelEl.transform("")
					this.markers[i].moveTo(pos.x, pos.y, function() {
						if (me.markers.length > 1) {			// Should check this since it may run after this._redraw() (due to animation)
							this.raphaelEl.transform("S0.5")
						}
					});
				}
			}
			
			this._redraw()
		}
	},
	
	removeAllMarkers: function() {
		while(this.markers.length != 0) {
			this.removeMarker(this.markers[0]);
		}
	}
}

/**
 * 
 * Lines
 * 
 */

Connection = function(floorPlan, obj1, obj2, line) {
	this.from = obj1
	this.to = obj2
	
	var self = this
	
    var bb1 = obj1.getRaphaelEl().getBBox(),
        bb2 = obj2.getRaphaelEl().getBBox(),
        p = [{x: bb1.x + bb1.width / 2, y: bb1.y - 1},
        {x: bb1.x + bb1.width / 2, y: bb1.y + bb1.height + 1},
        {x: bb1.x - 1, y: bb1.y + bb1.height / 2},
        {x: bb1.x + bb1.width + 1, y: bb1.y + bb1.height / 2},
        {x: bb2.x + bb2.width / 2, y: bb2.y - 1},
        {x: bb2.x + bb2.width / 2, y: bb2.y + bb2.height + 1},
        {x: bb2.x - 1, y: bb2.y + bb2.height / 2},
        {x: bb2.x + bb2.width + 1, y: bb2.y + bb2.height / 2}],
        d = {}, dis = [];
    for (var i = 0; i < 4; i++) {
        for (var j = 4; j < 8; j++) {
            var dx = Math.abs(p[i].x - p[j].x),
                dy = Math.abs(p[i].y - p[j].y);
            if ((i == j - 4) || (((i != 3 && j != 6) || p[i].x < p[j].x) && ((i != 2 && j != 7) || p[i].x > p[j].x) && ((i != 0 && j != 5) || p[i].y > p[j].y) && ((i != 1 && j != 4) || p[i].y < p[j].y))) {
                dis.push(dx + dy);
                d[dis[dis.length - 1]] = [i, j];
            }
        }
    }
    if (dis.length == 0) {
        var res = [0, 4];
    } else {
    	dis.sort(function(a, b) {return a < b ? -1 : 1})
    	res = d[dis[1] || dis[0]];
//        res = d[Math.min.apply(Math, dis)];
    }
    var x1 = p[res[0]].x,
        y1 = p[res[0]].y,
        x4 = p[res[1]].x,
        y4 = p[res[1]].y;
//    dx = Math.max(Math.abs(x1 - x4) / 2, 10);
//    dy = Math.max(Math.abs(y1 - y4) / 2, 10);
//    var x2 = [x1, x1, x1 - dx, x1 + dx][res[0]].toFixed(3),
//        y2 = [y1 - dy, y1 + dy, y1, y1][res[0]].toFixed(3),
//        x3 = [0, 0, 0, 0, x4, x4, x4 - dx, x4 + dx][res[1]].toFixed(3),
//        y3 = [0, 0, 0, 0, y1 + dy, y1 - dy, y4, y4][res[1]].toFixed(3);
    var path = ["M", x1.toFixed(3), y1.toFixed(3), x4.toFixed(3), y4.toFixed(3)].join(",");
//	    var path = ["M", x1.toFixed(3), y1.toFixed(3), "C", x2, y2, x3, y3, x4.toFixed(3), y4.toFixed(3)].join(",");
    var color = typeof line == "string" ? line : "#000";
    this.connLine = floorPlan.getPaper().path(path).attr({cursor:"hand", stroke: line.split("|")[0], fill: "none", "stroke-width": line.split("|")[1] || 3})
    this.connLine.click(function() {
    	if (self._click != null) {
    		self._click()
    	}
    })
    
    this.isHighLighted = false;
    this._click = null;
}

Connection.prototype = {
	setVisibility: function(visibility) {
		if (visibility) {
			this.connLine.show()
		} else {
			this.connLine.hide()
		}
	},
	
	destroy: function() {
		this.connLine.remove();
		this.connLine = null;
	},
	
	getVisibility: function() {
		return this.connLine.node.style.display !== "none"
	},
	
	onClick: function(func) {
		this._click = func
	},
	
	toFront: function() {
		this.connLine.toFront()
	},
	
	toggleHighLight: function() {
		if (!this.isHighLighted) {
			this.from.toFront().setGlow(true)
			this.to.toFront().setGlow(true)
		} else {
			this.from.toFront().setGlow(false)
			this.to.toFront().setGlow(false)
		}
		
		this.toFront()
		this.isHighLighted = !this.isHighLighted
	}
}

self.MarkersConnection = function(floorPlan) {
	this.floorPlan = floorPlan
	
	this.connections = []
	
	this.markers = []
}

self.MarkersConnection.prototype = {
	setVisibility: function(visibility) {
		for (var i = 0; i < this.connections.length; ++i) {
			this.connections[i].setVisibility(visibility)
		}
	},
	
	getVisibility: function() {
		if (this.connections.length == 0 || this.connections[0].getVisibility()) return true;
		return false;
	},
	
	addMarker:function(marker, lineStyle) {
		this.markers.push(marker)
		
		lineStyle = lineStyle || {color: "#fff000", width:2}
		var line = (lineStyle.color || "#fff000") + "|" + (lineStyle.width || 2)
		
		var len = this.markers.length
		if (len > 1) {
			var connection = new Connection(this.floorPlan, this.markers[len - 2], this.markers[len - 1], line)
			this.connections.push(connection)
			
			return connection
		}
	},
	
	removeMarker:function(marker) {
		
	},
	
	toFront: function() {
		for (var i = 0; i < this.connections.length; ++i) {
			this.connections[i].toFront()
		}
	},
	
	destroy: function() {
		for (var i = 0; i < this.connections.length; ++i) {
			this.connections[i].destroy()
		}
		
		this.connections = []
		this._click = null;
	},
	
	getMarkers:function() {
		return this.markers;
	},
	
	setLineStyle:function(style) {
		
	}
	
}


/**
 * 
 * Overlay Element
 * 
 */

self.OverlayElement = function(domElement) {
	var self = this
	
	this.domE = domElement;
	
	$(this.domE).on("drag", function() {
		self.fixed = false;
	}).append("<div class=\"close_btn\" title=\"Click to close\" style=\"position:absolute; right:5px; top:5px;\">X</div>")
		.find(".close_btn").click(function() {
			self.setVisibility(false)
		})

	this.fixed = true;
	this.marker = null;
}

self.OverlayElement.prototype = {
	
	setMarker: function(marker) {
		try {
			if (this.marker.getId() != marker.getId()) {
				this.setVisibility(false)
			}
		} catch(err) {}
		
		this.marker = marker
	},
	
	getMarker: function() {
		return this.marker;
	},
	
	close: function() {
		$(this.domE).find(".close_btn").trigger("click")
	},
	
	setVisibility: function(visibility) {
		raphaelEl = this.marker != null ? this.marker.getRaphaelEl() : null;
		if (raphaelEl == null) {return}
		
		if(visibility) {
			clientRect = raphaelEl.node.getBoundingClientRect()
			
			$domE = $(this.domE).show()
			var top = clientRect.top
				,left = clientRect.right
			if (top > this.domE.offsetHeight) {
				top = top - this.domE.offsetHeight
			}
			if ($(window).width() - left < this.domE.offsetWidth) {
				left = clientRect.left - this.domE.offsetWidth
			}
			
			top += $(document).scrollTop();
			
			$domE.css("position", "absolute").css("z-index", 1000)
				.css("left", left)
				.css("top", top)
				.css("box-shadow", "2px 2px 2px #888888")
				
			this.fixed = true;
		} else {
			$(this.domE).hide()
		}
	},
	
	getVisibility: function() {
		return $(this.domE).is(":visible")
	},
	
	updatePosition: function() {
		if (this.getVisibility() && this.fixed) {
			this.setVisibility(true)
		}
	}
}

self.random = function(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

})();

