steal( 'sensolus/js/dialog.js',
		'jquery/controller',
	   'jquery/view/ejs',
	   'jquery/controller/view',
	   'sensolus/models', 
	   'jquery/lang/string')
.then( 
       function($){
    	   
    	  


$.Controller('Sensolus.Widgets.Component.GraphComponentSelectionList',
/** @Static */
{
	defaults : {
		// structure
		model:Sensolus.Models.GraphComponent,
		columns:[],
		findRestCallParams:{}, // params that are passed when model.findOne/All are called
		loadAtInit:true, // call load method when the grid is initialized
		sorting:[],
		//messages
		widgetTitle: "[Define grid title]",
		widgetIconClass: "icon-table",
		loadingErrorMsg:"An error occured while loading 'data items'",
	}
},
/** @Prototype */
{
	
	table:null,
	
	init : function(){
		var self = this;
		
		self.options.columns.unshift(self.createSelectionColumn())
		// load view
//		this.element.html(this.view('graph_component_selection_list',{
//				columns:this.options.columns, 
//				widgetTitle:this.options.widgetTitle,
//				widgetIconClass:this.options.widgetIconClass}) )
		self.element.html(self.view('//sensolus/widgets/component/views/graph_component_selection_list.ejs',{
			columns:this.options.columns, 
			widgetTitle:this.options.widgetTitle,
			widgetIconClass:this.options.widgetIconClass}))
		
		// compose datatable colums
		var aoColumns = [];
		$.each(this.options.columns, function(i, column){
			aoColumns.push(self.options.columns.dtParams)
		})
		
		// create datatable
		var tableElement = self.element.find('table');
		this.table = tableElement.dataTable({
			"aaSorting": self.options.sorting,
			"aoColumns": aoColumns,
            sPaginationType: "full_numbers"
        });
		
		// load model items
		if(this.options.loadAtInit)
			this.loadData();
		
	},
	
	createSelectionColumn:function(){		
		var self = this
		return {title:"selected" , renderData:function(dataItem){ return "<input type=\"checkbox\" name=\"tracking_sensor_slection\" value=\""+dataItem.id+"\">" } , dtParams:null}
	},
	
//	deleteItem:function(dataItemID, onSuccess, onError) {
//		self = this
//		
//		var item = new this.options.model({id:dataItemID})
//		item.destroy(function(success) {
//			self.reloadData()
//			if (onSuccess != null) onSuccess();
//		}, function(error) {
//			if (onError != null) onError(error);
//		});
//	},
//	
	
	loadData:function(loaded){		
		var self = this
		this.options.model.findAll(this.options.findRestCallParams, function(dataItems){
			self.dataLoaded(dataItems);
			if(loaded)
				loaded(dataItems)
		},this.callback('loadingError') );
	},
	
	reloadData:function(loaded){
		this.loadData(loaded);
	},
	
	setFindRestCallParams:function(findRestCallParams){
		this.options.findRestCallParams=findRestCallParams
	},
	
	// callbacks
	dataLoaded : function( dataItems ){
		var self = this;
    	$("#grid-warning-panel").hide();
    	var redraw=false
    	if(dataItems.count==0)
    		redraw=true
		self.table.fnClearTable(redraw);  
		$.each(dataItems, function(i, dataItem){   
			self.addDataItemToGrid(dataItem);
		});
	},
	
	addDataItemToGrid:function(dataItem){
		var self = this;
	
		// compose data array
		var data = [];
		$.each(self.options.columns, function(i, column){
			if(column.refName!=null){
				data.push(dataItem.attr(column.refName));
			}else{
				data.push(column.renderData(dataItem));
			}
		});
		
		// add data to table
		self.table.fnAddData(data);
		
	},
	
	loadingError : function(jqXHR, exception, thrownError) {
		$.showErrorMessages(jqXHR, exception, thrownError,"#grid-warning-panel",this.options.loadingErrorMsg)
	},
	
	
	getSelectedGraphComponentIDs: function( el ){
		var self = this
		return self.element.find("input[name=tracking_sensor_slection]:checked").map(function(){
										      return $(this).val();
									    }).get(); 
	},
	
	setSelectedGraphComponentIDs: function( selectedGraphCompIDs ){
		var self = this
		$.each(selectedGraphCompIDs, function(i, compID){
			self.element.find("input[value='"+compID+"']").prop('checked', true);
		});
	},

	extractSelectedModelFromClass:function(className){
		var modelName = jQuery.String.underscore(this.options.model.fullName.replace(/\./g, "_"))
		var classList =className.split(/\s+/);
		for (var i=0;i<classList.length;i++){
			var classItem = classList[i];
			if (classItem.indexOf(modelName) >= 0){
				var dataItemID = classItem.replace(modelName+"_","");
				return dataItemID;
		    }
		}		
	},
	
	extractSelectedModel:function(el){
		return this.extractSelectedModelFromClass(el.attr('class'))
	}

});

});