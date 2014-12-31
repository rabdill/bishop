function initialize() {
	document.getElementById("gameName").innerHTML = game["title"];
	newPrompt="";
	newDescription="";
	// to to wherever the gamedata says to start:
	moveRooms(rooms[currentRoom]);

	// either do the tests or start the game
	//	(defined in testing.js)
	proceed();
}


function process() {
	// reset any errors displayed from the last command
	error("");
	if (current["type"] == "room") processRoom();
}


function processRoom() {
	command = document.getElementById("command").value.split(" ");
	
	// if you're trying to travel
	if (command[0] ==  "go") {
		if (current["directions"][command[1]] != undefined) {
			result = rooms[current["directions"][command[1]]];
			moveRooms(result); // takes an object, like a room
		}
		else error("You are unable to travel " + command[1]+".");
	}

	// if there are items in the room
	else if ("items" in current) {
		if (command[1] in current["items"]) { // and the direct object is one of them
			// if the action can be taken against that item:
			if (command[0] in current["items"][command[1]]["states"]) {
				//if the item can be put into the proposed state from its current state, do it:
                if (current["items"][command[1]]["status"] in current["items"][command[1]]["states"][command[0]]["from"]) {
					message(current["items"][command[1]]["states"][command[0]]["from"][current["items"][command[1]]["status"]]);
					current["items"][command[1]]["status"] = command[0];

					// also, if it's "take," add it to inventory:
					if (command[0] == "take") {
						inventory_add(current["items"][command[1]]["name"], 1)
					}
				}
			}
		} 
	}
}


function moveRooms(subject) {
	try {
		if (subject["type"] == "room") {
			newDescription = subject["entrance text"];
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


function error(text) {
	//clear the message field:
	message("");

	//print the error:
	document.getElementById("error").innerHTML = text;
}
function message(message) {
	document.getElementById("message").innerHTML = message;
}


function inventory_add(item, qty) {
	if (item in player["inventory"]) {
		player["inventory"][item]++;
		console.log("Adding 1 to inventory for " + item + ".")
	}
	else {
		player["inventory"][item] = qty;
		console.log("Adding " + item + " to player inventory.")
	}
}