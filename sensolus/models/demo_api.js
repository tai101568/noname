var DemoAPI = {
        

	getKvvNodeAnalyticsDataFeed: function(nodeID,kvvNodeOutputRefName,analyticsOutputRefName, f, fe) {
    	$.getJSON('/server/rest/demo/getKvvnodesAnalyticsDataFeeds?kvvNodeID=' + nodeID+"&kvvNodeOutputRefName="+kvvNodeOutputRefName+"&analyticsOutputRefName="+analyticsOutputRefName, f).error(fe);
    },
    
	getDataFeed: function(nodeID,outputRefName, f, fe) {
    	$.getJSON('/server/rest/demo/getDatafeed?componentID=' + nodeID+"&outputRefName"+outputRefName, f).error(fe);
    },
}