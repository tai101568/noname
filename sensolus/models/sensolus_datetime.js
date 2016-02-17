steal('jquery')
	.then('sensolus/js/moment.min.js')
	.then(

function(){
	
	SensolusDatetime = {
		FORMAT_SERVER: "YYYY-MM-DD HH:mm:ss ZZ",
		FORMAT_CLIENT: "YYYY-MM-DD HH:mm:ss",
			
		parse: function(str, selection) {
			return selection == null || selection == "client"
					? moment(str, this.FORMAT_CLIENT)
					: moment(str, this.FORMAT_SERVER)
		},
		
		format: function(datetime, selection) {
			if (datetime == null) {
				datetime = moment()
			} else if (!moment.isMoment(datetime)) {
				datetime = moment(datetime)
			}
			
			return selection == null || selection == "client"
				? datetime.format(this.FORMAT_CLIENT)
				: datetime.format(this.FORMAT_SERVER)
		},
		
		msToTime: function(duration, format) {
			 var d, h, m, s;
			 
			 var days = {'s': 'd ', 'l': ' days '}
			 var hours = {'s': 'h ', 'l': ' hours '}
			 var mins = {'s': 'm ', 'l': ' mins '}
			 
			 format = format || 's';
			 
			 s = Math.floor(duration / 1000);
			 m = Math.floor(s / 60);
			 s = s % 60;
			 h = Math.floor(m / 60);
			 m = m % 60;
			 d = Math.floor(h / 24);
			 h = h % 24;

		    return (d == 0?"":d + days[format])
		    		+ (h == 0?"":h + hours[format])
		    		+ (m == 0?"":m + mins[format])
		    		+ (s == 0 && (m != 0 || h != 0 || d != 0)
		    				|| d !=0 ?"":s + "s");
		}
	}
})
