function proceed() {
	// ** EDIT THIS LINE TO ENTER DEBUG MODE **
	debugMode = true;

	if (debugMode) {
		console.log("DEBUG MODE: Sending simulated actions.");
		commands = [
		// Enter the commands to be entered sequentially here:
			"go south",
			"go east"
		];
		for (var i = 0; i < commands.length; i++) {
			console.log("DEBUG MODE: Sending command \"" + commands[i] + "\"");
			document.getElementById("command").value = commands[i];
			document.getElementById("submit").click();
		}
		console.log("DEBUG MODE: Simulated actions complete.")
	}
}