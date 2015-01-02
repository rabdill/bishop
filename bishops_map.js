function initialize() {
	document.getElementById("gameName").innerHTML = game["title"];
	newPrompt="";
	newDescription="";
	// to to wherever the gamedata says to start:
	nextMove(currentLocation);

	// either do the tests or start the game
	//	(defined in testing.js)
	runTests();
}


function processCommand() {
	command = document.getElementById("command").value.split(" ");
	if (current["type"] == "room") {
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
		

		else if (command[0] ==  "go") {
			if (current["directions"][command[1]] != undefined) {
				result = current["directions"][command[1]];
				nextMove(result);
			}
			else error("You are unable to travel " + command[1]+".");
		}
		else if (command[0] == "view") {
			if (command[1] == "inventory") {
				print_inventory();
			}
		}
		else if (command[0] == "look") {
			if (command[1] == "around") {
				printer(current);
			}
		}

		// check the room's possible actions
		else if ("actions" in current && command[0] in current["actions"]) {
			// check if the verb can be applied to the specified object
			if (command[1] in current["actions"][command[0]]) {
				// implement the specified consequences
				if ("move" in current["actions"][command[0]][command[1]]) {
					nextMove(current["actions"][command[0]][command[1]]["move"])
				}
			}
		}
		else error("Sorry, unrecognized command.")
	}
	else if (current["type"] == "menu") {
		command--;	//because the array starts at #0
		if (command < current["choices"].length) { //make sure it's an option
			if (current["choices"][command]["response type"] == "loop") {
				var toPrint = {};
				toPrint["type"] = "menuLoop";
				toPrint["origin"] = current["name"];
				toPrint["text"] = current["choices"][command]["response text"];
				toPrint["description"] = current["choices"][command]["description"];
				printer(toPrint);
			}
		}
	}
}


function nextMove(target) {
	if (target in rooms) printer(rooms[target]);
	else if (target in menus) printer(menus[target]);
}


function printer(target) {
	if (target["type"] == "room") {
		if (target["title"] != undefined) {
			newDescription = "<strong>" + target["title"] + "</strong><br>" + target["entrance text"];
		}
		else newDescription = target["entrance text"];

		// adding the descriptors of any objects in the room:
		for (var item in target["items"]) {
			if (target["items"][item]["states"][target["items"][item]["status"]]["descriptor"] != "") {
				newDescription += "<br>" + target["items"][item]["states"][target["items"][item]["status"]]["descriptor"];
			}
		}
		newPrompt = target["prompt"];
		printDirections(target);
	}

	else if (target["type"] == "menu" || target["type"] == "menuLoop") {
		// If it's a menuLoop response, inject the response at the beginning
		// of reprinting the menu:
		if (target["type"] == "menuLoop") {
			// makes the original menu the "target"
			// and stores just the loop stuff in "loopInfo":
			loopInfo = target;
			target = current;
			// start off the new description with the new message
			newDescription = loopInfo["text"] + "<br><br>";

			// if the original menu's description should change, change it:
			if (loopInfo["description"] != undefined) {
				target["description"] = loopInfo["description"];
			}
		}
		// if it's a regular menu:
		else {
			newDescription = "";
			newPrompt = target["prompt"];
		}

		// then add whatever the menu's full description is now:
		newDescription += target["description"];

		//lining up the menu's text
		// to print either way:
		newDescription += "<ol>";
		for (var i = 0; i < target["choices"].length; i++) {
			newDescription += "<li>" + target["choices"][i]["choice"];
		}
		newDescription += "</ol>";
		printDirections("");	
	}

	// print everything out (rooms *and* menus)
	if (newPrompt != undefined) {
		document.getElementById("prompt").innerHTML = newPrompt;
	}
	document.getElementById("description").innerHTML = newDescription;
	clearCommand();
	//clear the error box:
	error("");
	current = target;	// required to be able to reference "current"
						// elsewhere
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