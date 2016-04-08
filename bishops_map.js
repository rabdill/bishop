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
	clearMessage();
	clearError();
	newDescription = current.entrance;
	newDescription += "<div>";
	for (var i=0, item; item = (current.items || [])[i]; i++) {
		newDescription += item.states[item.state || 'default'].descriptor + "<br>";
	}
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
	printRoom();	// has to happen first so it doesn't wipe out the message
	document.getElementById('message').innerHTML = message;
}
function clearMessage() {
	document.getElementById('message').innerHTML = "";
};

function printError(message) {
	printRoom();
	document.getElementById('error').innerHTML = message;
}
function clearError() {
	document.getElementById('error').innerHTML = "";
};

function initialize() {
	document.getElementById("gameName").innerHTML = game.settings.title;
	goTo(currentLocation);
	startAutomation();
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
			break;
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
			break;
		case "view":
			if(noun === "inventory") {
				printInventory();
				return true;
			}
			break;
	}
	return false;

};

function addToInventory(item) {
	player.inventory.push(item);
};

function printInventory() {
	var inv = "You open your pack:<ul>";
	for(var i=0, item; item = player.inventory[i]; i++) {
		inv += "<li>" + item.name;
	}
	inv += "</ul>";
	printMessage(inv);
};

function parseSynonyms(item, verb) {
	// if the verb doesn't need to be converted, or there aren't synonyms:
	if(!item.synonyms || item.synonyms[verb]) return verb;
	for(state in item.synonyms) {
		if(_(item.synonyms[state]).includes(verb)) return state;
	}
};

function checkRoomCommands(c) {
	var verb = c[0];
	var noun = c[1] || false;

	for(var i=0, item; item = (current.items || [])[i]; i++) {
		if(!item.state) item.state = 'default';
		if(_(item.nouns).includes(noun)) {
			verb = parseSynonyms(item, verb);
			if(verb === "take") {
				if((item.take || {})[item.state]) { // if "take" is specified in the item
					addToInventory(item);
					current.items.splice(i, 1);	// remove it from the room
					printMessage(item.take[item.state]);
					return true;
				}
				else {
					return false;	// if the item exists but you can't take it
				}
			}

			if(item.states[verb]) {
				if(item.states[verb].requires) {	// if it has requirements
					var passes = item.states[verb].requires(c);
					if(typeof passes === 'string') { // rejected with message
						printMessage(passes);
						return true;	// it's settled; no need to keep searching
					}
				}

				transition = item.states[verb].transition(item.state);
				if(transition) {
					item.state = verb;
					printMessage(transition);
					return true;
				}
				else {	// if the transition function rejects the request to transition
					return false;
				}
			}

			if(item.states[item.state].responses[verb]) { // if the verb has a response
				printMessage(item.states[item.state].responses[verb]);
				return true;
			}
			break;	// regardless, we can bail on the loop once we find the item
		}
	}
	return false;
};

function processCommand(command) {
	// if called by the listener, "command" will be a mouse event:
	if (typeof command !== "string") {
		command = document.getElementById("command").value;
		document.getElementById("command").value = "";	// clear it out of the text box
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
