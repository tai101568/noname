/**
 * raphael.pan-zoom plugin 0.2.1
 * Copyright (c) 2012 @author Juan S. Escobar
 * Modified by Long Nguyen
 * https://github.com/escobar5
 *
 * licensed under the MIT license
 */
 
(function () {
    'use strict';
    /*jslint browser: true*/
    /*global Raphael*/
    
    function findPos(obj) {
        var posX = obj.offsetLeft, posY = obj.offsetTop, posArray;
        while (obj.offsetParent) {
            if (obj === document.getElementsByTagName('body')[0]) {
                break;
            } else {
                posX = posX + obj.offsetParent.offsetLeft;
                posY = posY + obj.offsetParent.offsetTop;
                obj = obj.offsetParent;
            }
        }
        posArray = [posX, posY];
        return posArray;
    }
    
    function getRelativePosition(e, obj) {
        var x, y, pos;
        if (e.pageX || e.pageY) {
            x = e.pageX;
            y = e.pageY;
        } else {
            x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }

        pos = findPos(obj);
        x -= pos[0];
        y -= pos[1];

        return { x: x, y: y };
    }

    var panZoomFunctions = {
        enable: function () {
            this.enabled = true;
        },

        disable: function () {
            this.enabled = false;
        },

        zoomIn: function (steps) {
            this.applyZoom(steps);
        },

        zoomOut: function (steps) {
            this.applyZoom(steps > 0 ? steps * -1 : steps);
        },
        
        zoomFit: function() {
        	this.applyZoom(-this.currZoom);
        },

        pan: function (deltaX, deltaY) {
            this.applyPan(deltaX * -1, deltaY * -1);
        },
        
        center:function(x, y) {
        	var newWidth = this.newWidth || this.contentWidth
        	var newHeight = this.newHeight || this.contentHeight
        	
        	this.pan(-(Math.abs(this.currPos.x - x) - newWidth/2), -(Math.abs(this.currPos.y - y) - newHeight/2))
        },

        isDragging: function () {
            return this.dragTime > this.dragThreshold;
        },

        getCurrentPosition: function () {
            return this.currPos;
        },

        getCurrentZoom: function () {
            return this.currZoom;
        },
        
        paperSizeChanged: function() {
             this.applyPan(0, 0, true)
        }
    },

        PanZoom = function (el, options) {
            var paper = el,
                container = paper.canvas.parentNode,
                me = this,
                settings = {},
                initialPos = { x: 0, y: 0 },
                deltaX = 0,
                deltaY = 0,
                mousewheelevt = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel";

            this.enabled = false;
            this.dragThreshold = 5;
            this.dragTime = 0;
    
            options = options || {};
            if (options.contentSize == null) {
            	options.contentSize = {width:paper.width, height:paper.height}
            }
            
            this.contentWidth = options.contentSize.width;
            this.contentHeight = options.contentSize.height;
    
            settings.maxZoom = options.maxZoom || 9;
            settings.minZoom = options.minZoom || 0;
            settings.zoomStep = options.zoomStep || 0.1;
            settings.initialZoom = options.initialZoom || 0;
            settings.initialPosition = options.initialPosition || { x: 0, y: 0 };
    
            this.currZoom = settings.initialZoom;
            this.currPos = settings.initialPosition;
            
            function repaint() {
                me.currPos.x = me.currPos.x + deltaX;
                me.currPos.y = me.currPos.y + deltaY;
    
                me.newWidth = me.contentWidth * (1 - (me.currZoom * settings.zoomStep)),
                me.newHeight = me.contentHeight * (1 - (me.currZoom * settings.zoomStep));
    
                if (me.currPos.x < 0) {
                    me.currPos.x = 0;
                } else if (me.currPos.x > (me.contentWidth * me.currZoom * settings.zoomStep)) {
                    me.currPos.x = (me.contentWidth * me.currZoom * settings.zoomStep);
                }
    
                if (me.currPos.y < 0) {
                    me.currPos.y = 0;
                } else if (me.currPos.y > (me.contentHeight * me.currZoom * settings.zoomStep)) {
                    me.currPos.y = (me.contentHeight * me.currZoom * settings.zoomStep);
                }
                paper.setViewBox(me.currPos.x, me.currPos.y, me.newWidth, me.newHeight, false);
                paper.canvas.setAttribute('preserveAspectRatio', 'xMidYMin meet');
                $(container).trigger("viewPortChanged")
            }
            
            function dragging(e) {
                if (!me.enabled) {
                    return false;
                }
                var evt = window.event || e,
                    newWidth = me.contentWidth * (1 - (me.currZoom * settings.zoomStep)),
                    newHeight = me.contentHeight * (1 - (me.currZoom * settings.zoomStep)),
                    newPoint = getRelativePosition(evt, container);
    
                var dX = (newWidth * (newPoint.x - initialPos.x) / me.contentWidth) * -2;
                var dY = (newHeight * (newPoint.y - initialPos.y) / me.contentHeight) * -2;
                
                if (deltaX != dX || deltaY != dY) {
                	deltaX = dX;
                	deltaY = dY;
                	
                	initialPos = newPoint;
                    
                    repaint();
                    me.dragTime += 1;
                }
                if (evt.preventDefault) {
                    evt.preventDefault();
                } else {
                    evt.returnValue = false;
                }
                return false;
            }
            
            function applyZoom(val, centerPoint) {
                if (!me.enabled) {
                    return false;
                }

                var temp = me.currZoom
                me.currZoom += val;
                if (me.currZoom < settings.minZoom) {
                    me.currZoom = settings.minZoom;
                } else if (me.currZoom > settings.maxZoom) {
                    me.currZoom = settings.maxZoom;
                }
                
                if (temp != me.currZoom) {	// temp == me.currZoom means me.currZoom already reach max/min level  
                    centerPoint = centerPoint || { x: me.contentWidth / 2, y: me.contentHeight / 2 };
    
                    deltaX = ((me.contentWidth * settings.zoomStep) * (centerPoint.x / me.contentWidth)) * val;
                    deltaY = (me.contentHeight * settings.zoomStep) * (centerPoint.y / me.contentHeight) * val;
                    
                    repaint();
                }
            }
    
            this.applyZoom = applyZoom;
            
            function applyPan(dX, dY, force) {
            	if (force || deltaX != dX || deltaY != dY) {
	                deltaX = dX;
	                deltaY = dY;
	                repaint();
            	}
            }
            
            this.applyPan = applyPan;
            
            function handleScroll(e) {
                if (!me.enabled) {
                    return false;
                }
                var evt = window.event || e,
                    delta = evt.detail || evt.wheelDelta * -1,
                    zoomCenter = getRelativePosition(evt, container);
    
                if (delta > 0) {
                    delta = -0.5;
                } else if (delta < 0) {
                    delta = 0.5;
                }
                
                applyZoom(delta, zoomCenter);
                if (evt.preventDefault) {
                    evt.preventDefault();
                } else {
                    evt.returnValue = false;
                }
                return false;
            }
            
            repaint();
    
            container.onmousedown = function (e) {
                var evt = window.event || e;
                if (!me.enabled) {
                    return false;
                }
                
                $(container).css("cursor", "move")
                
                me.dragTime = 0;
                initialPos = getRelativePosition(evt, container);
                container.className += " grabbing";
                container.onmousemove = dragging;
                document.onmousemove = function () { return false; };
                if (evt.preventDefault) {
                    evt.preventDefault();
                } else {
                    evt.returnValue = false;
                }
                return false;
            };
    
            document.onmouseup = function (e) {
                //Remove class framework independent
                document.onmousemove = null;
                
                $(container).css("cursor", "default")
                
                container.className = container.className.replace(/(?:^|\s)grabbing(?!\S)/g, '');
                container.onmousemove = null;
            };
    
            if (container.attachEvent) {//if IE (and Opera depending on user setting)
                container.attachEvent("on" + mousewheelevt, handleScroll);
            } else if (container.addEventListener) {//WC3 browsers
                container.addEventListener(mousewheelevt, handleScroll, false);
            }
        };

    PanZoom.prototype = panZoomFunctions;

    Raphael.fn.panzoom = {};

    Raphael.fn.panzoom = function (options) {
        var paper = this;
        return new PanZoom(paper, options);
    };

}());
