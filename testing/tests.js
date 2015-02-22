function runTests() {
	game = {};

	sessionStorage.results = "";
	
	sessionStorage.startTime = new Date().getTime();
	record("Test suite loaded.", "new")

	toTest = [
		"checkBuiltIns",
		"initialize",
		"detokenize",
		"stripArticles"
	]

	for (var i = 0; i < toTest.length; i++) {
		eval("test_" + toTest[i] + "();");
	};
}

function record(text,parameter) {
	switch (parameter) {
		case "new":
			currentTime = new Date().getTime();
			var timestamp = (currentTime - sessionStorage.startTime)/1000.0
			sessionStorage.results += "</ul><p>" + timestamp + " seconds: " + text + "<ul>";
			break;
		case "fail":
			sessionStorage.results += "<li class='fail'> " + text;
			break;
		case "pass":
			sessionStorage.results += "<li class='pass'>" + text;
			break;
		default:
			sessionStorage.results += "<li>" + text;
			break;
	}
	document.getElementById('test-results').innerHTML = sessionStorage.results;
}

function defineGame() {
	currentLocation = "lobby";

	player={
		"inventory" : {},
		"carrying" : {}
	};
	game = {
		"title" : "My Cool Game Title",
		"hometown" : "Delran",
		"favorite cheese" : "brie"
	}
	rooms = {
		"lobby" : {
			"type" : "room",
			"name" : "the game lobby",
			"look" : "It's the lobby! It's so good.",
			"exits": {
				"north" : "closet",
				"south" : "town square"
			},
			"entrance text" : "You are in the first room of the new, data-driven world we are creating in an attempt to be a halfway intelligent human."
		},
		"closet" : {
			"type" : "room",
			"name" : "the coat closet",
			"exits": {
				"south" : "lobby"
			},
			"entrance text" : "A little room full of musty old coats.",
			"items" : {
				"stole" : {
					"name" : "mink stole",
					"status" : "default",
					"take" : {
						"default" : "You gently lift the stole and wrap it around your neck."
					},
					"states" : {
						"default" : {
							"descriptor" : "There is a delicate mink stole stuffed in the corner."
						}
					}
				}
			}
		},
		"town square" : {
			"type" : "room",
			"name" : "the @hometown@ town square",
			"exits": {
				"north" : "lobby"
			},
			"entrance text" : "The rustic @hometown@ town square. It smells faintly of @favorite cheese@."
		}
	}
}


/*************************************************** */
function test_initialize() {
	var errored = false;

	record("Testing 'initialize()'...", "new");

	defineGame();

	try {initialize();}
	catch(err) {
		record(err,"fail");
		errored = true;
	}

	// If the title of the game is in the headline
	if (document.getElementById("gameName").innerHTML == game["title"]) {
		record("Title changed successfully.","pass")
	} else {
		record("Title unchanged in header.","fail");
		errored = true;
	}

	// If the starting room is now loaded
	if (current == rooms[currentLocation]) {
		record("Room loaded successfully.","pass")
	} else {
		record("Room not loaded into object 'current': <ul><li>Should have been '" + rooms[currentLocation]["name"] + "' but is actually '" + current["name"] + "'.</ul>","fail");
		errored = true;
	}

	// Testing farther than this is essentially just testing the "printer"
	// function.
	if (errored) {
		record("<strong>initialize() did not meet expectations.</strong>","fail");
	} else {
		record("<strong>initialize() fulfilled expectations.</strong>","pass");
	}
}

function test_detokenize() {
	var errored = false;

	record("Testing 'detokenize(text)'...", "new");

	defineGame();

	text = "Your hometown is @hometown@, and your favorite cheese is @favorite cheese@. @hometown@ and @favorite cheese@.";

	try {newText = detokenize(text);}
	catch(err) {
		record(err,"fail");
		errored = true;
	}


	stringTests = {
		"First string substitution": {
			"start" : 0,
			"stop" : 23,
			"criteria" : "Your hometown is Delran"
		},
		"Second string substitution" : {
			"start" : 23,
			"stop" : 57,
			"criteria" : ", and your favorite cheese is brie"
		},
		"Second substitution of first string" : {
			"start" : 57,
			"stop" : 65,
			"criteria" : ". Delran"
		},
		"Second substitution of second string" : {
			"start" : 65,
			"stop" : 74,
			"criteria" : " and brie"
		}
	}

	for (conditions in stringTests) {
		test = stringTests[conditions];

		if (newText.substring(test["start"], test["stop"]) == test["criteria"]) {
			record(conditions + " successful.", "pass");
		} else {
			record(conditions + " failed:<ul><li>Should have been '" + test["criteria"] + "' but was actually '" + newText.substring(test["start"], test["stop"]) + "'</ul>","fail");
			errored = true;
		}
	}


	if (errored) {
		record("<strong>detokenize() did not meet expectations.</strong>","fail");
	} else {
		record("<strong>detokenize() fulfilled expectations.</strong>","pass");
	}
}

function test_stripArticles() {
	var errored = false;

	record("Testing 'stripArticles(text)'...", "new");

	commands = {
		"No substitution" : {
			"before" : "kick pumpkin",
			"after" : "kick pumpkin"
		},
		"Removing 'the'" : {
			"before" : "stab the porkchop",
			"after" : "stab porkchop"
		},
		"Removing 'a'" : {
			"before" : "throw a baseball",
			"after" : "throw baseball"
		},
		"Removing 'an'" : {
			"before" : "eat an egg",
			"after" : "eat egg"
		},
		"Removing 'to on'" : {
			"before" : "this to on test",
			"after" : "this test"
		},
		"Removing 'the on at a'" : {
			"before" : "verb the on at a noun",
			"after" : "verb noun"
		}
	}

	for (test in commands) {
		try {after = stripArticles(commands[test]["before"]);}
		catch(err) {
			record(err,"fail");
			errored = true;
		}

		if (after == commands[test]["after"]) {
			record(test + " successful.", "pass");
		} else {
			record(test + " failed:<ul><li>Should have been '" + commands[test]["after"] + "' but was actually '" + after + "'</ul>","fail");
			errored = true;
		}
	}

	if (errored) {
		record("<strong>stripArticles() did not meet expectations.</strong>","fail");
	} else {
		record("<strong>stripArticles() fulfilled expectations.</strong>","pass");
	}
}

function test_checkBuiltIns() {
	var errored = false;
	defineGame();
	initialize();

	record("Testing 'test_checkBuiltIns(array)'...", "new");

	//*******************************************
	record("Testing 'go' command.");
	// processing command to 'go' in an invalid direction
	try {result = checkBuiltIns(["go","east"]);}
	catch(err) {
		record(err,"fail");
		errored = true;
	}
	if (result) {
		record("Invalid 'go' command rejected successfully.", "pass");
	} else {
		record("Invalid 'go' command returned as valid.", "fail");
		errored = true;
	}

	// processing command to 'go' in a valid direction
	try {result = checkBuiltIns(["go","north"]);}
	catch(err) {
		record(err,"fail");
		errored = true;
	}

	if (result == false) {
		record("Valid 'go' command accepted.", "pass");
	} else {
		record("Valid 'go' command not accepted.", "fail");
		errored = true;
	}

	if (current == rooms['closet']) {
		record("'go north' processed successfully.","pass")
	} else {
		record("Incorrect room loaded via 'go north' command: <ul><li>Should have been '" + rooms['closet']['name'] + "'' but is actually '" + current["name"] + "'.</ul>","fail");
		errored = true;
	}


	//************************************
	record("Testing 'view' command.");
	// processing command to 'view' an invalid target
	try {result = checkBuiltIns(["view","butt"]);}
	catch(err) {
		record(err,"fail");
		errored = true;
	}
	if (result) {
		record("Invalid 'view' command rejected successfully.", "pass");
	} else {
		record("Invalid 'view' command returned as valid.", "fail");
		errored = true;
	}

	// processing command to 'view inventory'
	try {result = checkBuiltIns(["view","inventory"]);}
	catch(err) {
		record(err,"fail");
		errored = true;
	}

	if (result == false) {
		record("Valid 'view' command accepted.", "pass");
	} else {
		record("Valid 'view' command not accepted.", "fail");
		errored = true;
	}
	if (document.getElementById("error").innerHTML == "Inventory empty.") {
		record("'view inventory' command processed successfully.", "pass");
	} else {
		record("'view inventory' command processed incorrectly:<ul><li>Message should be 'Inventory empty' but is actually '" + document.getElementById("error").innerHTML + "' </ul>.", "fail");
		errored = true;
	}

	//*******************************
	record("Testing 'look' command.");
	// processing command to 'look' an invalid target
	try {result = checkBuiltIns(["look","butt"]);}
	catch(err) {
		record(err,"fail");
		errored = true;
	}
	if (result) {
		record("Invalid 'look' command rejected successfully.", "pass");
	} else {
		record("Invalid 'look' command returned as valid.", "fail");
		errored = true;
	}

	// processing command to 'look around'
	try {result = checkBuiltIns(["look","around"]);}
	catch(err) {
		record(err,"fail");
		errored = true;
	}

	if (result == false) {
		record("Valid 'look' command accepted.", "pass");
	} else {
		record("Valid 'look' command not accepted.", "fail");
		errored = true;
	}
	// make sure the current room's description is included in the 
	// "description" paragraph:
	if (document.getElementById("description").innerHTML.search(current["entrance text"]) >= 0) {
		record("'look around' command processed successfully.", "pass");
	} else {
		record("'look around' command processed incorrectly:<ul><li>Message should include'" + current["entrance text"] + "' but is actually '" + document.getElementById("description").innerHTML + "'</ul>.", "fail");
		errored = true;
	}

	// processing command to look at another room
	
	try {result = checkBuiltIns(["look","south"]);}
	catch(err) {
		record(err,"fail");
		errored = true;
	}

	if (result == false) {
		record("Valid 'look south' command accepted.", "pass");
	} else {
		record("Valid 'look south' command not accepted.", "fail");
		errored = true;
	}

	if (document.getElementById("message").innerHTML == "You look to the south: It's the lobby! It's so good.") {
		record("'look south' command processed successfully.", "pass");
	} else {
		record("'look south' command processed incorrectly:<ul><li>Message should be 'You look to the south: It's the lobby! It's so good.' but is actually '" + document.getElementById("message").innerHTML + "'</ul>.", "fail");
		errored = true;
	}

	//************************************
	record("Testing 'take' command.");
	// processing command to 'view' an invalid target
	try {result = checkBuiltIns(["take","butt"]);}
	catch(err) {
		record(err,"fail");
		errored = true;
	}
	if (result) {
		record("Invalid 'take' command rejected successfully.", "pass");
	} else {
		record("Invalid 'take' command returned as valid.", "fail");
		errored = true;
	}

	// processing command to 'take stole'
	try {result = checkBuiltIns(["take","stole"]);}
	catch(err) {
		record(err,"fail");
		errored = true;
	}

	if (result == false) {
		record("Valid 'take' command accepted.", "pass");
	} else {
		record("Valid 'take' command not accepted.", "fail");
		errored = true;
	}
	if (player["inventory"]["mink stole"] == 1) {
		record("Item added to player inventory successfully.", "pass");
	} else {
		record("Taken item not added to player inventory.", "fail");
		errored = true;
	}

	// make sure the description of the item is removed from the room:
	if (document.getElementById("description").innerHTML.search("mink stole") == -1) {
		record("Item description removed from room.", "pass");
	} else {
		record("Item description not removed from room.", "fail");
		errored = true;
	}

	// make sure the transitory "take" message is prined:
	if (document.getElementById("message").innerHTML == "You gently lift the stole and wrap it around your neck.") {
		record("Item 'take' message printed successfully.", "pass");
	} else {
		record("Item 'take' message not printed:<ul><li>It should have been 'You gently lift the stole and wrap it around your neck.' but was actually '" + document.getElementById("message").innerHTML + "'.</ul>", "fail");
		errored = true;
	}



	if (errored) {
		record("<strong>checkBuiltIns() did not meet expectations.</strong>","fail");
	} else {
		record("<strong>checkBuiltIns() fulfilled expectations.</strong>","pass");
	}
}

function test_checkAction() {
	
}

function test_findSynonyms() {
	
}

function test_message() {
	
}

function test_checkItems() {
	
}

function test_commandInRoom() {
	
}

function test_commandInMenu() {
	
}

function test_processCommand() {
	
}

function test_describeRoom() {
	
}

function test_describeMenu() {
	
}

function test_printDescription() {
	
}

function test_printer() {
	
}

function test_nextMove() {
	
}

function test_processChanges() {
	
}

function test_clearFields() {
	
}

function test_inventory_add() {
	
}

function test_inventory_remove() {
	
}

function test_print_inventory() {
	
}

// connect the code to the DOM:
window.addEventListener("load", runTests);
document.getElementById("sendCommand").addEventListener("click", processCommand);