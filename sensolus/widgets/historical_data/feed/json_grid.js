steal( 'jquery/controller',
	   'ui/cms/modules/data_grid')
.then( 
       function($){


$.Controller('Sensolus.Widgets.HistoricalData.Feed.JSONGrid',
/** @Static */
{
	defaults : {
		
		feedID:null
		
	}
},
/** @Prototype */
{

	dataGrid:null,

	gridElID:null,
	
	init : function(){
		var self = this
		// create custom div for grid
		var crud_el_id = this.element.attr('id');
		this.gridElID = crud_el_id+"_grid";
		this.element.append("<div id=\""+this.gridElID +"\"><div>")
		
		// define params that should be passed when model.findAll/One are called
		var findRestCallParams={
			feedID:this.options.feedID
		}
		
		
		this.dataGrid = $("#"+this.gridElID).ui_cms_modules_data_grid({
			model: Sensolus.Models.HistoricalFeedData,
			loadAtInit:false,
			columns:[	
		           {title:"Recording time" , renderData:function(dataItem){ return self.formatTimestamp(dataItem.timestamp) } , dtParams:[{sClass: "center"}]},
			       {title:"Data value" , refName:"content" , dtParams:null}	   
			    ],
			sorting:[[ 0, "desc" ]],
			allowDelete:false,
			allowEdit:false,
			allowNew:false,
			allowView:false,
			widgetTitle: "Historical feed data",
			widgetIconClass: "icon-broadcast",
			loadingErrorMsg:"An error occured while loading historical data"
				
		});
	},
	
	loadFeed:function(node,output,loaded){
		this.dataGrid.controller().setFindRestCallParams({feedID:feedID})
		this.dataGrid.controller().reloadData(loaded)
	},
	
	reset:function(){
	},
	
	formatTimestamp:function(timestamp){
		 var a = new Date(timestamp);
		 var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	     var year = a.getFullYear();
	     var month = months[a.getMonth()];
	     var date = a.getDate();
	     var hour = a.getHours();
	     var min = a.getMinutes();
	     var sec = a.getSeconds();
	     var time = hour+':'+min+':'+sec +"  - "+date+' '+month+' '+year;
	     return time;
	}
	
});

});