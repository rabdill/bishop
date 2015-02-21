function runTests() {
	game = {};

	sessionStorage.results = "";
	
	sessionStorage.startTime = new Date().getTime();
	record("Test suite loaded.", "new")

	toTest = [
		"initialize",
		"detokenize"
	]

	for (var i = 0; i < toTest.length; i++) {
		eval("test_" + toTest[i] + "();");
	};
}

function clearResults() {
	sessionStorage.results = "";
	document.getElementById('test-results').innerHTML = sessionStorage.results;
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

document.getElementById("start").addEventListener("click", runTests);
document.getElementById("clear").addEventListener("click", clearResults);


function defineGame() {
	currentLocation = "lobby";

	game = {
		"title" : "My Cool Game Title",
		"hometown" : "Delran",
		"favorite cheese" : "brie"
	}
	rooms = {
		"lobby" : {
			"type" : "room",
			"name" : "the game lobby",
			"exits": {
				"south": "town square"
			},
			"entrance text" : "You are in the first room of the new, data-driven world we are creating in an attempt to be a halfway intelligent human."
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
		record("Room not loaded into object 'current': <ul><li>" + current["name"] + " is not equal to " + rooms[currentLocation]["name"] + "</ul>","fail");
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
	
}

function test_checkBuiltIns() {
	
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
//window.addEventListener("load", runTests);
document.getElementById("sendCommand").addEventListener("click", processCommand);