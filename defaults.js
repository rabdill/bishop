// Makes sure some necessary variables are set
// to prevent messiness elsewhere

required = {
	"allow text to speech" : false
}


// this just loops through the defaults, no need to fiddle with it:
for (var parameter in required) {
	if (parameter in game){
		console.log(parameter + " is defined");
		pass;
	}
	else {
		console.log("\"" + parameter + "\" is NOT defined, setting to "+ required[parameter]);
		game["allow text to speech"] = required[parameter];
	}
}