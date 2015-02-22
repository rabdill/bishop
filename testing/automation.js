function startAutomation() {
	// ** EDIT THIS LINE TO ENTER DEBUG MODE **
	debugMode = false;

	// Edit this line to start the game in a different location:
	moveLocation="";
	commands = [
	// Enter the test commands to be entered sequentially here:
		"go south",
		"take pumpkin"
	];

	if (debugMode) {
		if (moveLocation != undefined) {
			console.log("DEBUG MODE: Moving player to " + moveLocation + ".");
			nextMove(moveLocation);
		}
		console.log("DEBUG MODE: Sending simulated actions.");
		
		for (var i = 0; i < commands.length; i++) {
			console.log("DEBUG MODE: Sending command \"" + commands[i] + "\"");
			document.getElementById("command").value = commands[i];
			document.getElementById("sendCommand").click();
		}
		console.log("DEBUG MODE: Simulated actions complete.")
	}
}