var HistoricalDataAPI = {
        
    getHistoricalFeedData: function(nodeID,outputRefName, f, fe) {
    	$.getJSON('/server/rest/historicaldata/' + nodeID+"/"+outputRefName + "/all", f).error(fe);
    }
}