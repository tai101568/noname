steal('jquery').then(
		'sensolus/js/authentication/authentication_manager.js')
.then(

function(){

	RealTimeDataAPI = {
			
		sessionTimeOut: false,
		
		validateSession: function(xhr, fe) {
    		fe(xhr)
    		if (xhr.status == 401 && this.sessionTimeOut == false) {
    			this.sessionTimeOut = true;
    			AuthenticationManager.authenticate();
    		}
		},
	        
	    pollDataFeedAlive: function(feedID, f, fe) {
	    	$.getJSON('/server/rest/datafeeds/' + feedID+"/alive", f).error(fe);
	    },
	    
	    pollDataFeedLastValue: function(feedID, f, fe) {
	    	self = this
	    	$.getJSON('/server/rest/datafeeds/' + feedID+"/data/lastvalue", f).error(function(xhr) {
	    		self.validateSession(xhr, fe)
	    	});
	    },
	    
	    pollConnectedNodeAlive: function(compID, f, fe) {
	    	$.getJSON('/server/rest/connectednodes/' + compID+"/alive", f).error(fe);
	    },
	
	    pollConnectedNodeLastValues: function(compID, f, fe) {
	    	self = this
	    	$.getJSON('/server/rest/connectednodes/' + compID+"/data/laststatus", f).error(function(xhr) {
	    		self.validateSession(xhr, fe)
	    	});
	    },
	    
	    pollTemplatedApplicationsLastStatus: function(compID, f, fe) {
	    	self = this
	    	$.getJSON('/server/rest/templatedapplications/' + compID+"/data/laststatus", f).error(function(xhr) {
	    		self.validateSession(xhr, fe)
	    	});
	    },
	    
	    pollGatewayAlive: function(gatewayID, f, fe) {
	    	$.getJSON('/server/rest/gateways/' + gatewayID+"/alive", f).error(fe);
	    },
	}
})