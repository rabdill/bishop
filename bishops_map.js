function initialize() {
	document.getElementById("gameName").innerHTML = game["title"];
	newPrompt="";
	newDescription="";
	// to to wherever the gamedata says to start:
	moveRooms(rooms[currentRoom]);
}


function process() {
	// reset any errors displayed from the last command
	throwError("");

	if (current["type"] == "room") {
		command = document.getElementById("command").value.split(" ");
		if (command[0] ==  "go") {
			if (current["directions"][command[1]] != undefined) {
				result = rooms[current["directions"][command[1]]];
				moveRooms(result); // takes an object, like a room
			}
			else throwError("You are unable to travel " + command[1]+".");
		}
	}
}


function moveRooms(subject) {
	try {
		if (subject["type"] == "room") {
			newDescription = subject["description"];
			newPrompt = subject["prompt"];

			// Noting that we are moving into a room:
			current=subject;
		}

		// if it's not a room:
		else newDescription = "La de da";
	}

	catch(err) {
		newDescription = "ERROR EEEEEEEEEEE";
	}

	// print everything out
	if (newPrompt != undefined) {
		document.getElementById("prompt").innerHTML = newPrompt;
	}
	document.getElementById("description").innerHTML = newDescription;
	printDirections(subject);
	document.getElementById("command").value = "";
	document.getElementById("command").focus();
}


function printDirections(room) {
	result = "<ul>";
	for (var direction in room["directions"]) {
		result += "<li>To the " + direction + " is " + rooms[room["directions"][direction]]["name"] + ".";
	}

	document.getElementById("directions").innerHTML = result;
}

function throwError(text) {
	document.getElementById("error").innerHTML = text;
}