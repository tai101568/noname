steal('jquery','jquery/lang/json'
).then('../jquery.cookie.js'
).then(function(){
		
		loginInfo=null,
		
		AuthenticationAPI = {
	        
			url: '/server/rest/authentication/login/',
			
		    login: function(username,password, f, fe) {
		    	var self =  this
		    	
		    	$.ajax({
		            type: "POST",
		            url: self.url + username,
		            dataType: "json",
		            contentType: "text/plain",
		            data: password,
		            success: function (loginInfo) {
			    		$.cookie("sensolus-session",$.toJSON(loginInfo), { path: '/' });
			    		$.cookie('sensolus-token', loginInfo.token, { path: '/' });
			    		
			    		f(loginInfo);
		            },
		            error: fe
		        });    	
		    },
		  
		    logout: function( f, fe) {
		    	$.removeCookie('sensolus-session', { path: '/' });
		    	
		    	if(loginInfo!=null){
		    		$.getJSON("/server/rest/authentication/logout?token="+loginInfo.token, function(result) {
		    			f(result);
		    		}).error(fe);
		    	};
		    },
	     
		    isTokenValid: function(token, f, fe) {
		    	$.get("/server/rest/authentication/validatetoken/"+token,f).error(fe);
		    },    	
	    
		    checkIfAuthenticated:function(success, not_logged_in, auth_timed_out){
		    	loginInfo = $.parseJSON($.cookie("sensolus-session"));
		    	$.cookie("sensolus-lastpage", window.location.pathname, { path: '/' });
		    	
		    	if(loginInfo == null || loginInfo === '') {
		    		not_logged_in();
		    	} else { 
		    		this.isTokenValid(loginInfo.token,function(){
	    				success(loginInfo);
		    		},function(){
		    			auth_timed_out();
			    	});
		    	};
		    }
		}
})