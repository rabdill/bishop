// Makes sure some necessary variables are set
// to prevent messiness elsewhere
function setDefaults() {
	required = {
		"allow text to speech" : false,
		"allow speech to text" : false,
		"print directions" : true,
		"allow default synonyms" : true
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
}

setDefaults();