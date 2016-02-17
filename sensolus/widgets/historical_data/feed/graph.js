steal( 'sensolus/js/authentication/authentication_manager.js')
.then('jquery/controller',
	   'sensolus/models/historical_data.js',
	   'sensolus/js/lib/highstock/highstock.js').then( // TODO change to minimized code
	   'sensolus/js/lib/highstock/modules/exporting.js')
.then( 
       function($){


$.Controller('Sensolus.Widgets.HistoricalData.Feed.Graph',
/** @Static */
{
},
/** @Prototype */
{

	
	charts:[],
	
	init : function(){
		var self = this	
		Highcharts.setOptions({
	        global: {
	            useUTC: false
	        }
	    });
	},
	
	loadGraphs:function(node,output,loaded){
		AuthenticationManager.authenticate()
		
		var self = this
		try{
			var dataTypeSchema = $.secureEvalJSON(output.dataType.jsonSchema)
			var dataTypeSchemaProps=[]
			$.each(dataTypeSchema.properties, function(key, property){  
				dataTypeSchemaProps.push({key:key,description:property.description})				
			});
			self.element.html(self.view('//sensolus/widgets/historical_data/feed/views/graph.ejs',{dataTypeProperties:dataTypeSchemaProps}))
//			$.fn.tabs && $(".mws-tabs").tabs();
			self.drawGraphs(node,output, dataTypeSchema);

			if(loaded)
				loaded()
		}catch(e){
			console.log(e)
			alert("Syntax error in datatype json schema")
		}
	},
	
	destroyGraphs:function() {
		$.each(this.charts, function(index, chart){  
			chart && chart.destroy();
			chart = null;			
		});
		this.charts=[]
	},
	
	drawGraphs:function(node,output,dataTypeSchema){
		var self=this;
		// destroy old graphs
		this.destroyGraphs();
		// generate data array for each property
		var data = []
		$.each(dataTypeSchema.properties, function(key, property){  
			data[key]=[]				
		});
		// load data and compose data matrix
		HistoricalDataAPI.getHistoricalFeedData(node.id,output.referenceName, function(searchResult){
				$.each(searchResult.data, function(i, dataItem){  
					try{
						var content = $.secureEvalJSON(dataItem.content)
						$.each(dataTypeSchema.properties, function(key, property){  
							data[key].push([
										dataItem.timestamp,
										self.convertValue(content[key])
									])				
						});
					}catch(e){
					}
				});
				
				$(self.element.find("#loading-indicator")).hide()
				var tabs = $(self.element.find(".mws-tabs"))
				tabs.show()
				
				// draw graphs
				$.each(dataTypeSchema.properties, function(key, property){
					if (property.type != "string") {
						self.drawGraph(key, property.description, data[key], self.buildSeries(data[key], property),property)
					}
				});
				$.fn.tabs && tabs.tabs();
			},self.callback('loadingError') 
		);

	},
	

	drawGraph : function( key, description, data, series,schemaProperty){
		// create the chart
		var stockChart = {
			chart : {
				renderTo : 'graph_container_'+key
			},

			title: {
				text: description+' over time'
			},
			
			xAxis: {
				ordinal: false
			},
			
			rangeSelector : {
				buttons : [{
					type : 'hour',
					count : 1,
					text : '1h'
				}, {
					type : 'day',
					count : 1,
					text : '1D'
				}, {
					type : 'week',
					count : 1,
					text : '1W'
				}, {
					type : 'all',
					count : 1,
					text : 'All'
				}],
				selected : 1,
				inputEnabled : false
			},
			
			series : series
		}
		if(schemaProperty.type == "boolean"){
			stockChart.yAxis= {
			      allowDecimals:false,
			      min:0,
			      max:1.3
			}
			stockChart.plotOptions={}
			stockChart.plotOptions.series={}
			stockChart.plotOptions.series.dataGrouping={}
			stockChart.plotOptions.series.dataGrouping.enabled=false
		}
		this.charts[key] = new Highcharts.StockChart(stockChart);
	},
	
	loadingError : function(jqXHR, exception, thrownError) {
		//$.showErrorMessages(jqXHR, exception, thrownError,"#grid-warning-panel",this.options.loadingErrorMsg)
		console.log(jqXHr)
	},
	

	reset:function(){
		this.destroyGraphs();
		this.element.html("")
	},
	
	convertValue:function(input) {
		if (typeof input == 'boolean') {
			if (input == false) return 0
			else return 1;
		}
		
		return input
	},
	
	buildSeries:function(data, schemaProperty) {
		var serie1={
			name : schemaProperty.description,
			type: 'line',
			data : data,
			//step: schemaProperty.type == "boolean",
			tooltip: {
				valueDecimals: 2
			}
		}
		if(schemaProperty.type == "boolean"){
			serie1.step= true,
			serie1.marker = {
				enabled : true,
				radius : 2
			}
		}
		var series = [serie1]
		
		return series
	}
	
});

// steal then
});