steal('jquery').then(
		'ui/cms/design/jui/js/jquery-ui-1.9.2.min.js').then(
		'ui/cms/design/jui/jquery-ui.custom.min.js',
		'./authentication_api.js'
).then(
	function(){
		
		AuthenticationManager = {
			filterAuthentication: true,
				
			loginPage: '/server/admin/login/index.html',
			
			showSessionExpired: function() {
				var self = this
				var dialogBox = $("#global-dialog")
				dialogBox.html("Your session has been timed out. You have to login again.")
				dialogBox.dialog({
			        autoOpen: true,
			        title: "Session Timeout",
			        modal: true,
			        postition:'center',
			        width: "400",
			        resizable:false,
			        buttons: [{
			            text: "OK",
			            click: function () {
			                $(this).dialog("close");
			            }
			        }],
			        close:function() {
			            window.location = self.loginPage;
			        }
			    })
			},
			
			_authorizationCheck: function(jqXHR) {
				var validate = this.filterAuthentication;
				this.filterAuthentication = true;
				
				if (validate && (jqXHR.status == 401)) {
					$.cookie("sensolus-lastpage", window.location.pathname, { path: '/' })
					this.showSessionExpired()
					return true;
				}
				
				return false;
			},
			
			authenticate:function(success, failed){
				var self = this
				
				AuthenticationAPI.checkIfAuthenticated(
						// success
						function(){
							// add token to all ajax calls
				    		var token = loginInfo.token;
			    			$.ajaxPrefilter(function (options, originalOptions, jqXHR) {
			    				var originalError = options.error
			    				options.error = function(jqXHR, textStatus, errorThrown) {
			    					!self._authorizationCheck(jqXHR) && originalError && originalError(jqXHR, textStatus, errorThrown);
			    				}
			    				
			    				// filter: only for rest calls inside sensolus && token not defined
			    				if((options.url.indexOf("rest") !== -1) && (options.url.indexOf('token') === -1)){
		    				    	options.url +=(options.url.indexOf('?') === -1)?'?':'&'
		    				        options.url += 'token='+token;
			    				}
				    		});
			    			
			    			success && success();
						},
						// not logged in
						function(){
							window.location = self.loginPage;
						},
						// auth timed out
						function(){
							self.showSessionExpired();
						}    
				)
			},
			
			logout:function(){
				var self = this
				
				AuthenticationAPI.logout(function(status){
					if (status.type=='ok') {
						window.location = self.loginPage;
					}
				})
			},
			getLoginInfo:function() {
				return $.parseJSON($.cookie("sensolus-session"));
			},
			updateLoginInfo: function(fullName, avatar) {
				loginInfo.fullName = fullName;
				avatar != null && (loginInfo.image = avatar);
				
				$.cookie("sensolus-session",$.toJSON(loginInfo), { path: '/' });
			},
			hasAnyRole:function(roles) {
				var loginInfo = $.parseJSON($.cookie("sensolus-session"));
			    var i, j;
			    for (i = 0; i < loginInfo.roles.length; i++) {
			        for (j = 0; j < roles.length; ++j) {
			            if (loginInfo.roles[i] == roles[j]) {
			            	return true;
			            }
			        }
			    }
			    
			    return false;
			}
		}
	}
)