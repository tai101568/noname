steal( 'jquery')
.then(
	   'jquery/controller',
	   'jquery/view/ejs',
	   'jquery/controller/view',
	   'sensolus/models',
	   'sensolus/js/dialog.js',
	   'jquery/lang/string')
.then(
	   'sensolus/js/raphael/raphael-min.js')
.then(
	   'sensolus/js/raphael/raphael.pan-zoom.js')
.then('sensolus/widgets/apps/indoortracking/interactivefloorplan.js',
	  './control_panel/objects_mgmnt.js',
	  './control_panel/density_location_visit.js',
	  './control_panel/layers_mgmnt.js',
	  './feedbacks.js')
.then( function($){
    	   
    	  

/** 
 * Data grid widget module
 * 
 *  
 *  */
$.Controller('Sensolus.Widgets.IndoorTrackingApp',
/** @Static */
{
	defaults : {
		applicationId: null,
		applicationType: "indoorTrackingApplication"
	}
},
/** @Prototype */
{
	floorPlan: null,
	objectMenu:null,
	
	relativePath: "/server/sensolus/widgets/apps/indoortracking/",
	
	controlPanels: {},
	
	_loadApplicationInfo: function() {
		
	},
	
	init : function(){
		var self = this
		
		this.element.html(this.view('//sensolus/widgets/apps/indoortracking/widget_views/widget.ejs', {}))
		
		this.objectMenu = new visualization.floorplan.OverlayElement(this.element.find("#object_menu")[0])
		this.element.find("#floorplan-container").bind("viewPortChanged", function() {
			self.element.find(".tracking_control_panel").trigger("viewPortChanged")
		})
		
		self.element.find("#setting_panel").tabs({
			active: 0,
			activate: function( event, ui ) {
				if (ui.oldPanel != null && self.controlPanels[ui.oldPanel[0].id] != null) {
					self.controlPanels[ui.oldPanel[0].id].controller().deactive()
				}
				self.controlPanels[ui.newPanel[0].id].controller().active()
			}
		}).addClass("ui-tabs-vertical ui-helper-clearfix");
		
		this.element.find(".feedback-label").sensolus_widgets_indoor_tracking_app_feedbacks();
	},
	
	_loadControls: function(locations, beaconsDef) {
		var self = this
		
		if (locations.locations.length == 0) {
			dialog.show("No locations defined in this app", {
		        title: "Error",
		        postition:'center',
		        width: "400",
		        closeOnEscape: false,
		        buttons: [{
		            text: "OK",
		            click: function () {
		                $(this).dialog("close");
		            }
		        }]
			})
    				
    		return;
		} else if (beaconsDef.beacons.length == 0) {
			dialog.show("No beacons defined in this app", {
		        title: "Error",
		        postition:'center',
		        width: "400",
		        closeOnEscape: false,
		        buttons: [{
		            text: "OK",
		            click: function () {
		                $(this).dialog("close");
		            }
		        }]
			})
			
			return;
		}
		
		if (self.controlPanels["tabs-objects_mgmnt_panel"] != null) {
			self.controlPanels["tabs-objects_mgmnt_panel"].controller().destroy()
		}
		self.controlPanels["tabs-objects_mgmnt_panel"] = self.element.find("#tabs-objects_mgmnt_panel")
			.sensolus_widgets_indoor_tracking_app_control_panel_objects_mgmnt({appWidget: self, locationsDef:locations, beaconsDef: beaconsDef})

		if (self.controlPanels["tabs-density_location_visits"] != null) {
			self.controlPanels["tabs-density_location_visits"].controller().destroy()
		}
		self.controlPanels["tabs-density_location_visits"] = self.element.find("#tabs-density_location_visits")
			.sensolus_widgets_indoor_tracking_app_control_panel_density_location_visits({appWidget: self, locationsDef:locations, beaconsDef: beaconsDef})
	
		if (self.controlPanels["tabs-layers-visibility"] != null) {
			self.controlPanels["tabs-layers-visibility"].controller().destroy()
		}
		self.controlPanels["tabs-layers-visibility"] = self.element.find("#tabs-layers-visibility")
			.sensolus_widgets_indoor_tracking_app_control_panel_layers({appWidget: self, locationsDef:locations})
			
		this.controlPanels["tabs-objects_mgmnt_panel"].controller().active()
	},
	
	reload: function(appid) {
		var self = this
		
		if (appid == null) {
			return
		}
		
		this.options.applicationId = appid
		
		Sensolus.Models.TemplatedApplication.findOne({id:this.options.applicationId},function(indoorTrackingApp) {
			var floorPlanSettings = $.parseJSON(indoorTrackingApp.defaultInputValues.floor_plan_settings)
			
			var dlg = loadingDialog.show("Loading, please wait...")
			
			var backgroundImage = $('<img />').attr('src', floorPlanSettings.floorPlanUrl).load(function() {
				self.floorPlan = new visualization.floorplan.FloorPlan(floorPlanSettings.floorPlanUrl,
							this.width, this.height,
							floorPlanSettings.x_img_offset,	floorPlanSettings.y_img_offset,
							floorPlanSettings.scale_x, floorPlanSettings.scale_y)
				self.floorPlan.render(self.element.find("#floorplan-container").html("")[0])
				dlg.dialog("close")
				
				self._loadControls($.parseJSON(indoorTrackingApp.defaultInputValues.config_locations_definitions),
								   $.parseJSON(indoorTrackingApp.defaultInputValues.config_used_beacons))
			}).error(function() {
				dialog.show("Could not load background!\nPlease refesh to retry",
        				{
        			        title: "Background Error",
        			        postition:'center',
        			        width: "400",
        			        buttons: [{
        			            text: "OK",
        			            click: function () {
        			            	$(this).dialog("close");
        			            }
        			        }]
        				})
			})
			
		},function(){console.error("error occured while loading the indoor tracking applications")} );
	}
// end controller	
});

// end steal then
});