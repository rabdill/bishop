// Makes sure some necessary variables are set
// to prevent messiness elsewhere

required = {
	"allow text to speech" : false,
	"print directions" : true
}


// this just loops through the defaults, no need to fiddle with it:
for (var parameter in required) {
	if (parameter in game){
		console.log(parameter + " is defined.");
	}
	else {
		console.log("\"" + parameter + "\" is NOT defined, setting to "+ required[parameter]);
		game[parameter] = required[parameter];
	}
}