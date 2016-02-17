steal(
		'jquery').then(
		    'sensolus/js/authentication/authentication_api.js',
			'sensolus/js/authentication/jquery.session.js'
).then(
			
	function() {
		var token = $.cookie('sensolus-token');
		
		AuthenticationAPI.isTokenValid(token, function(loginInfo){
			window.swaggerUi = new SwaggerUi({
			      url: window.location.origin + "/server/rest/api-docs",
			      dom_id: "swagger-ui-container",
			      supportedSubmitMethods: ['get', 'post', 'put', 'delete'],
			      onComplete: function(swaggerApi, swaggerUi){
			        if(console) {
			          console.log("Loaded SwaggerUI")
			          
			          var token = $.cookie('sensolus-token');
					  $("input[name=token]").val(token)
			        }
			        $('pre code').each(function(i, e) {hljs.highlightBlock(e)});
			      },
			      onFailure: function(data) {
			        if(console) {
			          console.log("Unable to Load SwaggerUI");
			          console.log(data);
			        }
			      },
			      docExpansion: "list"
			    });
			      
			    var apikey = $.cookie('sensolus-token');
		    	window.authorizations.add("key", new ApiKeyAuthorization("api_key", apikey, "header"));
		    	$('#input_apiKey').val(apikey)
			    
			    window.swaggerUi.load();
			
		}, function(xhr){
			if(xhr.status==401){
				window.alert("You're not logged in. Please login first!");
			}else{
				window.alert("Error with server. Please try again later.");
			}
			
			$.session("sensolus-lastpage", "../../rest-api-browser")
			window.location = "../admin/login/index.html";
		})
	}
)