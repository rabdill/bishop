function goTo(target) {
	console.log("GOING TO", target);
	console.log(nodes);
	var targetIndex = _.findIndex(nodes, {"id": target});
	console.log("targetIndex=", targetIndex);
	if(targetIndex === -1) throw "goTo function invoked with non-existent node.";

	currentLocation = target;
	if(nodes[targetIndex].type === "room") processChanges(nodes[targetIndex]);
	current = nodes[targetIndex];
	document.getElementById('description').innerHTML = current.entrance
};

function processChanges(node) {
	_(node.changes).forEach(function(f) {
		console.log("CHANGING", f);
		f();
	});
};

function initialize() {
	document.getElementById("gameName").innerHTML = game.settings.title;
	goTo(currentLocation);
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

	console.log("COMMAND", command);
	if(command[0] === "go") {
		if(current.exits[command[1]]) goTo(current.exits[command[1]]);
	}
};

// load everything up:
window.addEventListener("load", initialize);
// setup the listener so we know when the user hits enter:
document.getElementById("sendCommand").addEventListener("click", processCommand);
