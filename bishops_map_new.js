function goTo(target) {
	// move to a certain location in the game
	var targetIndex = _.findIndex(nodes, {"id": target});
	if(targetIndex === -1) throw "goTo function invoked with non-existent node.";

	currentLocation = target;

	// process any changes that happen on entering the room
	if(nodes[targetIndex].changes) {
		_(nodes[targetIndex].changes.onEnter).forEach(function(f) {
			f();
		});
		nodes[targetIndex].changes.onEnter = [];
	}

	current = nodes[targetIndex];
	printRoom();
};

function room(id) {
	// turns a room ID into a room
	return nodes[_.findIndex(nodes, {"id": id})];
};

function printRoom() {
	printMessage();
	printError();
	newDescription = current.entrance;
	newDescription += "<ul>";
	for (var exit in current.exits) {
		newDescription += "<li>To the " + exit + " is ";
		newDescription += room(current.exits[exit]).name;
		newDescription += ".";
	}
	newDescription += "</ul>";

	document.getElementById('description').innerHTML = newDescription;
}

function printMessage(message) {
	document.getElementById('message').innerHTML = message;
	document.getElementById('error').innerHTML = "";
}

function printError(message) {
	if(!message) message = "";
	document.getElementById('error').innerHTML = message;
	document.getElementById('message').innerHTML = "";
}

function initialize() {
	document.getElementById("gameName").innerHTML = game.settings.title;
	goTo(currentLocation);
};

function look(roomId) {
	// prints out a description of the room
	// IDEA: Print different descriptions based on where they're looking from?
	printMessage(room(roomId).look || "You don't see anything in particular.");
}

function checkBuiltins(c) {
	// returns whether it found a match or not.
	var verb = c[0];
	var noun = c[1];
	// checks the standard commands to see if there's anything that can be done
	switch(verb) {
		case "go":
			if(current.exits[noun]) {
				goTo(current.exits[noun]);
				return true;
			}
			else {
				printError("You can't go that way.");
				return true;
			}
		case "look":
			if(current.exits[noun]) {
				look(current.exits[noun]);
				return true;
			}
			else if(noun === "around") {
				printRoom();
				return true;
			}
			else {
				printError("You can't look that way.");
				return true;
			}
		default:
			return false;

	}
};

function checkRoomCommands(c) {
	console.log("Checking...");
	var verb = c[0];
	var noun = c[1];

	for(var i=0, item; item = (current.items || [])[i]; i++) {
		if(_(item.nouns).includes(noun)) {
			if(item.states[verb]) {
				transition = item.states[verb].transition(item.state || 'default');
				if(transition) {
					console.log("It worked!");
					printMessage(transition);
					item.state = verb;
					return true;
				}
			}
		}
	}
	return false;
};

function processCommand(command) {
	// if called by the listener, "command" will be a mouse event:
	if (typeof command !== "string") {
		command = document.getElementById("command").value;
	}
	// trim is used here because array gets blank elements if there are extra spaces
	command = _.trim(command).split(" ");
	// strip out articles:
	var articles = ["the", "a", "an", "to", "at", "on", "with"];
	command = _.difference(command, articles);

	if(!checkRoomCommands(command) && !checkBuiltins(command)) {
		printError('Sorry, unrecognized command.');
	}
};

// load everything up:
window.addEventListener("load", initialize);
// setup the listener so we know when the user hits enter:
document.getElementById("sendCommand").addEventListener("click", processCommand);
