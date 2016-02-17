(function($) {
	$.fn.delayKeyup = function(callback, ms){
	    var timer = 0;
	    var el = $(this);
	    
	    $(this).keyup(function(){
	    	el.addClass("spinner")
	    	
	    	clearTimeout (timer);
	    	timer = setTimeout(function() {
	    		el.removeClass("spinner")
	    		callback(el)
	        }, ms);
	    });
	    
	    return $(this);
	};
})(jQuery);