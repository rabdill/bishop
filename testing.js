function proceed() {
	// ** EDIT THIS LINE TO ENTER DEBUG MODE **
	debugMode = true;

	if (debugMode) {
		console.log("Entering debug mode");
		commands = [
		// Enter the commands to be entered sequentially here:
			"go south",
			"go east",
			"take hammer"
		];
		for (var i = 0; i < commands.length; i++) {
			console.log("Sending command \"" + commands[i] + "\"");
			document.getElementById("command").value = commands[i];
			document.getElementById("submit").click();
		}
	}
}