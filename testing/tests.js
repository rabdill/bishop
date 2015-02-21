function runTests() {
	game = {};

	sessionStorage.results = "";
	
	sessionStorage.startTime = new Date().getTime();
	record("Test suite loaded.", true)

	toTest = [
		"initialize"
	]

	for (var i = 0; i < toTest.length; i++) {
		eval("test_" + toTest[i] + "();");
	};
}

document.getElementById("start").addEventListener("click", runTests);

function clearResults() {
	record();
}

document.getElementById("clear").addEventListener("click", clearResults);

function record(text,freshPgraph) {
	if (text != undefined) {
		if(freshPgraph) {
			currentTime = new Date().getTime();
			var timestamp = (currentTime - sessionStorage.startTime)/1000.0
			sessionStorage.results += "</ul><p>" + timestamp + " seconds: " + text + "<ul>";
		} else {
			sessionStorage.results += "<li>" + text;
		}
	}
	else sessionStorage.results = "";
	document.getElementById('test-results').innerHTML = sessionStorage.results;
}



function test_initialize() {
	record("Testing 'initialize'...", true);
	game["title"] = "My Cool Game Title";

	try {initialize();}
	catch(err) {}

	if (document.getElementById("gameName").innerHTML == game["title"]) {
		record("Title changed successfully.")
	} else {
		record("TITLE FAILURE");
	}
}

function test_detokenize() {
	
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