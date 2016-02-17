steal( 'jquery/dom/form_params',
	   'jquery/lang/json',
	   'ui/cms/design/jui/js/jquery-ui-1.9.2.min.js').then(
	   'ui/cms/design/jui/jquery-ui.custom.min.js').then(
	   'ui/cms/design/plugins/validate/jquery.validate-min.js',
	   'sensolus/models/sensolus_datetime.js')
.then( function($){
    	   

$.Controller('Sensolus.Widgets.IndoorTrackingApp.Feedbacks',
/** @Static */
{
	defaults : {
		applicationId: null
	}
},
/** @Prototype */
{
	container: null,
	
	init : function() {
		var self = this
		
		this.container = $('<div style="display:none;"></div>')
		this.container.html(this.view('//sensolus/widgets/apps/indoortracking/widget_views/feedbacks.ejs'))
		
		$("body").append(this.container);
		
		this.container.dialog({
			title: "Feedbacks",
			postition:'top',
			width: "650",
			autoOpen: false,
			modal: true,
			resizable: false,		// This version of graph doesn't support reflow, so disable resize
			closeOnEscape: true,
			buttons: [{
				text: "Submit",
				click: function () {
					$(this).find('form#feedbacks').submit();
				}
			}]
		})
		
		this.element.on("click", function() {
			self.container.dialog("open")
		})
		
		// Validation
		this.container.find("form#feedbacks").on("submit", function(evt) {
			evt.preventDefault();
			console.log($(evt.target).formParams())
        	
			self.container.dialog("close")
        	
			dialog.show('Thanks for submitting feedback!<br/>Feedback is mailed to <i>support@sensolus.com</i>', {
				title: "Thank you!",
				postition:'center',
				width: "400",
				closeOnEscape: false,
				buttons: [{
					text: "Close",
					click: function () {
						$(this).dialog("close");
					}
				}]
			})
		}).validate({
			invalidHandler: function (form, validator) {
				var errors = validator.numberOfInvalids();
				if (errors) {
					var message = errors == 1 ? 'You missed 1 field. It has been highlighted' : 'You missed ' + errors + ' fields. They have been highlighted';
					self.container.find("#mws-validate-error").html(message).show();
				} else {
					self.container.find("#mws-validate-error").hide();
				}
			}
		});
	}
// end controller	
});

// end steal then
});