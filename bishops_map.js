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
	if (current["type"] == "room") processRoom();
}


function processRoom() {
	command = document.getElementById("command").value.split(" ");

	// if there are items in the room and the direct object is one of them
	if ("items" in current && command[1] in current["items"]) {
		// if the action can be taken against that item:
		if (command[0] in current["items"][command[1]]["states"]) {
			//if the item can be put into the proposed state from its current state, do it:
            if (current["items"][command[1]]["status"] in current["items"][command[1]]["states"][command[0]]["from"]) {
				message(current["items"][command[1]]["states"][command[0]]["from"][current["items"][command[1]]["status"]]);
				current["items"][command[1]]["status"] = command[0];

				// also, if it's "take," add it to inventory:
				if (command[0] == "take") {
					inventory_add(current["items"][command[1]]["name"], 1);
				}
			}
			else {
				error("You can't " + command[0] + " that after you " + current["items"][command[1]]["status"] + " it.");
			}
		}
		else {
			error("You can't " + command[0] + " the " + command[1] + ".");
		}
	}
	
	// if you're trying to travel
	else if (command[0] ==  "go") {
		if (current["directions"][command[1]] != undefined) {
			result = rooms[current["directions"][command[1]]];
			moveRooms(result); // takes an object, like a room
		}
		else error("You are unable to travel to the " + command[1]+".");
	}
	else if (command[0] == "view") {
		if (command[1] == "inventory") {
			print_inventory();
		}
	}
}


function moveRooms(subject) {
	try {
		if (subject["type"] == "room") {
			if (subject["title"] != undefined) {
				newDescription = "<strong>" + subject["title"] + "</strong><br>" + subject["entrance text"];
			}
			else newDescription = subject["entrance text"];

			// adding the descriptors of any objects in the room:
			for (var item in subject["items"]) {
				if (subject["items"][item]["states"][subject["items"][item]["status"]]["descriptor"] != "") {
					newDescription += "<br>" + subject["items"][item]["states"][subject["items"][item]["status"]]["descriptor"];
				}
			}

			newPrompt = subject["prompt"];

			// Setting the room that we're dealing with going forward
			// to the one we are moving into right now:
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
	clearCommand();

	//clear the error box:
	error("");
}


function printDirections(room) {
	result = "<ul>";
	for (var direction in room["directions"]) {
		result += "<li>To the " + direction + " is " + rooms[room["directions"][direction]]["name"] + ".";
	}

	document.getElementById("directions").innerHTML = result;
}


function error(text) {
	document.getElementById("error").innerHTML = text;
	clearCommand();
}
function message(message) {
	error("");
	document.getElementById("description").innerHTML = message;
	clearCommand();
}


function clearCommand() {
	document.getElementById("command").value = "";
	document.getElementById("command").focus();
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


function print_inventory() {
	toPrint="<strong>Inventory</strong><br>";
	hasItems = false;

	for (var item in player["inventory"]) {
		//if you have at least one of the thing:
		if (player["inventory"][item] > 0 ) {
			toPrint += item + " x " + player["inventory"][item] + "<br>";
			// player has at least one item
			hasItems = true;
		}
	}

	if(hasItems) {
		message(toPrint);
	}
	else {
		error("Inventory empty.")
	}
}