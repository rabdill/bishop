function initialize() {
	currentMenu="room";
	newPrompt="";
	newDescription="";
}

function process() {
	if (currentMenu == "room") {
		command = document.getElementById("command").value.split(" ");
		result = rooms[command[1]];
		printer(result);
	}
}

function printer(subject) {
	try {
		if (subject["type"] == "room") {
			newDescription = subject["description"];
			newPrompt = subject["prompt"];

			// Noting that we are moving into a room:
			currentMenu="room";
		}

		// if it's not a room:
		else toPrint = "La de fuckin da";
	}

	catch(err) {
		newDescription = "ERROR EEEEEEEEEEE";
	}

	// print everything out
	if (newPrompt != undefined) {
		document.getElementById("prompt").innerHTML = newPrompt;
	}
	document.getElementById("description").innerHTML = newDescription;
}