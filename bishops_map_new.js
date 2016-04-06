function goTo(target) {
	console.log("GOING TO", target);
	console.log(nodes);
	var targetIndex = _.findIndex(nodes, {"id": target});
	if(targetIndex === null) throw "goTo function invoked with non-existent node.";

	currentLocation = target;
	if(nodes[targetIndex].type === "room") processChanges(nodes[targetIndex]);
	document.getElementById('description').innerHTML = nodes[targetIndex].entrance
};

function processChanges(node) {
	//TODO
};

function initialize() {
	document.getElementById("gameName").innerHTML = game.settings.title;

	// make sure all the default settings are configured:
	var required = {
		"allow text to speech" : false,
		"allow speech to text" : false,
		"print directions" : true,
		"allow default synonyms" : true
	};

	var defaultSynonyms = {
		"actions" : {
			"take" : ["get","steal","t"],
			"examine" : ["inspect","look","x"],
			"look" : ["l"],
			"smash" : ["break"],
			"smell" : ["sniff"],
			"taste" : ["lick"]
		},
		"items" : {
			"photo" : ["picture"],
			"north" : ["n"],
			"east" : ["e"],
			"south" : ["s"],
			"west" : ["w"]
		}
	};

	game.settings = _.assign({}, required, game.settings);

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
};

// load everything up:
window.addEventListener("load", initialize);
// setup the listener so we know when the user hits enter:
document.getElementById("sendCommand").addEventListener("click", processCommand);
