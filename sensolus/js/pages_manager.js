steal(
	'jquery'
).then(
	function(){
			
		lastVisitedPage=null,
		
		// helper methods
		showPage = function (page, menuItemToHighlight) {
				// shut down last visited page
				if(lastVisitedPage)
					lastVisitedPage.controller().reset();
				lastVisitedPage=page
				
				// set navigation highlighting
				$("#mws-navigation").find('li').each(function(index){
					$(this).removeClass('active')
				});
				$(".mws-nav-menu-title").find(".parent").html($("#"+menuItemToHighlight).addClass('active').find("a").first().text())
				
				// show page, hide others
				$('.page').each( function(index){  
					$(this).hide();
				});
				page.controller().reset();
				page.show();
				if(page.controller().onFocus)
					page.controller().onFocus();
				
				// check if auth timed out
				AuthenticationManager.authenticate()
			}
		}
)