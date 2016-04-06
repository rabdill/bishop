function goTo(target) {
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
	writeRoom();
};

function room(id) {
	return nodes[_.findIndex(nodes, {"id": id})];
};

function writeRoom() {
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

function initialize() {
	document.getElementById("gameName").innerHTML = game.settings.title;
	goTo(currentLocation);
};

function checkBuiltins(c) {
	// checks the standard commands to see if there's anything that can be done
	if(c[0] === "go") {
		if(current.exits[c[1]]) goTo(current.exits[c[1]]);
	}
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

	checkBuiltins(command);
};

// load everything up:
window.addEventListener("load", initialize);
// setup the listener so we know when the user hits enter:
document.getElementById("sendCommand").addEventListener("click", processCommand);
