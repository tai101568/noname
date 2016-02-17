steal('jquery').then(
		'sensolus/js/authentication/authentication_manager.js')
.then(

function(){
		
	IndoorTrackingAPI = {
	    
		beacon2LogicalNameMap:null,
			
		loadBeacon2LogicalNameMap: function(f, fe) {
			// TODO.. extract project name
	    	$.getJSON('/server/rest/indoortracking/johans_home/beacons', f).error(fe);
	    },
	    
	    getLogicalBeaconName: function(beaconID){
	    	var self = this
	    	if(self.beacon2LogicalNameMap!=null){
	    		return (self.beacon2LogicalNameMap[beaconID]!=null)?self.beacon2LogicalNameMap[beaconID]:beaconID;
	    	}else{
	    		self.loadBeacon2LogicalNameMap(function(info){
	    				self.beacon2LogicalNameMap=info;
	    				return self.getLogicalBeaconName(beaconID);
	    			}, function(error){
	    				console.log(error)
	    				self.beacon2LogicalNameMap={};
	    				return beaconID;
	    			})
	    	}
	    },
	    
		loadLocations: function(projectName, f, fe) {
	    	$.getJSON('/server/rest/indoortracking/'+projectName+'/locations', f).error(function(xhr) {
	    		RealTimeDataAPI.validateSession(xhr, fe)
	    	});
	    },
	    
	    loadTrackingSensors: function(projectId, f, fe) {
	    	$.getJSON('/server/rest/indoortrackingapps/'+projectId+'/trackingsensors', f).error(function(xhr) {
	    		RealTimeDataAPI.validateSession(xhr, fe)
	    	});
	    },
	    
	    loadHistoricLocations: function(projectName, date, beacons, f, fe) {
	    	var beacons = beacons || ["all"]
	    	var dateStr = (date == "now" ? "now" : encodeURIComponent(SensolusDatetime.format(date, 'server')))
	    	var beaconString = ""
	    	$.each(beacons, function(idx, beacon) { beaconString += "&beacon_ids=" + beacon	})
	    	
	    	$.getJSON('/server/rest/indoortrackinganalytics/'+projectName+'/locationhistorybydate?date=' + dateStr + beaconString, f).error(function(xhr) {
	    		RealTimeDataAPI.validateSession(xhr, fe)
	    	});
	    },
	    
	    loadBeaconHistoricLocations: function(projectName, fromDate, toDate, beacon, f, fe) {
	    	var fromDStr = encodeURIComponent(SensolusDatetime.format(fromDate, 'server'))
	    	var toDStr = encodeURIComponent(SensolusDatetime.format(toDate, 'server'))
	    	
	    	$.getJSON('/server/rest/indoortrackinganalytics/'+projectName+'/locationhistorybybeacon/' + beacon + '?since_date=' + fromDStr + "&to_date=" + toDStr, f).error(function(xhr) {
	    		RealTimeDataAPI.validateSession(xhr, fe)
	    	});
	    },
	    
	    loadLocationDensity: function(projectName, locID, fromDate, toDate, beacons, f, fe) {
	    	var fromDStr = encodeURIComponent(SensolusDatetime.format(fromDate, 'server'))
	    	var toDStr = encodeURIComponent(SensolusDatetime.format(toDate, 'server'))
	    	
	    	var selection = "";
	    	$.each(beacons, function(idx, beacon) {	selection += "&beacon_ids=" + beacon })
	    	
	    	$.getJSON('/server/rest/indoortrackinganalytics/'+projectName+'/locationdensity/' + locID + '/?since_date=' + fromDStr + "&to_date=" + toDStr + selection, f).error(function(xhr) {
	    		RealTimeDataAPI.validateSession(xhr, fe)
	    	});
	    },
	    
	    summaryLocationVisits: function(projectName, locID, fromDate, toDate, beacons, f, fe) {
	    	var fromDStr = encodeURIComponent(SensolusDatetime.format(fromDate, 'server'))
	    	var toDStr = encodeURIComponent(SensolusDatetime.format(toDate, 'server'))
	    	
	    	var selection = "";
	    	$.each(beacons, function(idx, beacon) {	selection += "&beacon_ids=" + beacon })
	    	
	    	$.getJSON('/server/rest/indoortrackinganalytics/'+projectName+'/locationvisitssummary/' + locID + '/?since_date=' + fromDStr + "&to_date=" + toDStr + selection, f).error(function(xhr) {
	    		RealTimeDataAPI.validateSession(xhr, fe)
	    	});
	    },
	    
	    loadLocationsDensity: function(projectName, fromDate, toDate, locations, beacons, f, fe) {
	    	var selection = "";
	    	$.each(locations, function(idx, location) {	selection += "&location_ids=" + location })
	    	$.each(beacons, function(idx, beacon) {	selection += "&beacon_ids=" + beacon })
	    	
	    	var fromDStr = encodeURIComponent(SensolusDatetime.format(fromDate, 'server'))
	    	var toDStr = encodeURIComponent(SensolusDatetime.format(toDate, 'server'))
	    	
	    	$.getJSON('/server/rest/indoortrackinganalytics/'+projectName+'/locationdensity/?since_date=' + fromDStr + "&to_date=" + toDStr + selection, f).error(function(xhr) {
	    		RealTimeDataAPI.validateSession(xhr, fe)
	    	});
	    }
	}
})

