steal('jquery').then(
		'ui/cms/design/jui/js/jquery-ui-1.9.2.min.js').then(
		'ui/cms/design/jui/jquery-ui.custom.min.js'
).then(
	function(){
		
		dialog = {
			show:function(content, options) {
				var dialogBox = $("#global-dialog")
				dialogBox.html(content)
				
				options.autoOpen = true;
				options.modal = true;
				options.resizable = false;
				
				dialogBox.dialog(options)
				
				return dialogBox
			}
		},
		
		loadingDialog = {
			create: function(content) {
				var dialogBox = $("#global-dialog")
				dialogBox.html(content)
				
				dialogBox.dialog({
					title: "Loading",
			        postition:'center',
			        width: "400",
			        autoOpen: false,
			        modal: true,
			        resizable: false,
			        closeOnEscape: false,
			        open: function(event, ui) {
			        	  $(this).closest('.ui-dialog').find('.ui-dialog-titlebar-close').hide();
			        	}
				})
				
				return dialogBox
			},
				
			show: function(content) {
				var dlg = this.create(content);
				dlg.dialog("open");
				
				return dlg;
			}
		}
	}
)