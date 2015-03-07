// Makes sure some necessary variables are set
// to prevent messiness elsewhere
function setDefaults() {
	required = {
		"allow text to speech" : false,
		"allow speech to text" : false,
		"print directions" : true,
		"allow default synonyms" : true
	};

	defaultSynonyms = {
		"actions" : {
			"take" : ["get","steal"],
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
	for (var parameter in required) {
		if (parameter in game){
			console.log(parameter + " is defined.");
		}
		else {
			console.log("\"" + parameter + "\" is NOT defined, setting to "+ required[parameter]);
			game[parameter] = required[parameter];
		}
	}

	//setting each item state to "default", room types, etc:
	for (var room in rooms) {
		if ("type" in rooms[room] === false) {
			rooms[room]["type"] = "room";
		}
		if ("items" in rooms[room]) {
			for (item in rooms[room]["items"]) {
				if ("status" in rooms[room]["items"][item] === false) {
					rooms[room]["items"][item]["status"] = "default";
				}
			}
		}
	}
	for (var menu in menus) {
		if ("type" in menus[menu] === false) {
			menus[menu]["type"] = "menu";
		}
	}
}

function initialize() {
	document.getElementById("gameName").innerHTML = game["title"];
	newPrompt = "";
	newDescription = "";
	setDefaults();

	
	// to to wherever the gamedata says to start:
	nextMove(currentLocation);

	// either do the tests or start the game
	//	(defined in testing.js)
	startAutomation();
}

function detokenize(text) {
	for (parameter in game) {
		searchString = new RegExp("@" + parameter + "@","g");
		text = text.replace(searchString,game[parameter]);
	}
	return text;
}

//  **** start of processing commands in rooms
function stripArticles(command) {
	//strip out the articles:
	var articles = [" the ", " a ", " an ", " to ", " at ", " on ", " with "];
	var i;	// loop iterator

	for (i = 0; i < articles.length; i++) {
		command = command.replace(articles[i], " ");
	}

	return command;
}

function checkBuiltIns(command) {
	switch(command[0]) {
		case "go":
			if (current["exits"][command[1]] != undefined) {
				nextMove(current["exits"][command[1]][0]);
				return false;
			}
			break;
		case "view":
			if (command[1] === "inventory") {
				print_inventory();
				return false;
			}
			break;
		case "look":
			if (command[1] === "around") {
				printer(current); //just reprint the current location
				return false;
			} else if (command[1] in current['exits']) {
				if ("look" in rooms[current['exits'][command[1]]]) {
					message("You look to the " + command[1] + ": " + rooms[current["exits"][command[1]]]["look"]);
					return false;
				} else {
					message("You don't see anything in particular.");
					return false;
				}
			} else {
				error("You can't look that way.");
				return false;
			}
			break;
		case "take":
			//if the item exists, you can take it, and you can take it from the state that it's in
			if (command[1] in current["items"] && "take" in current["items"][command[1]] && current["items"][command[1]]["status"] in current["items"][command[1]]["take"]) {
				// we need to save the transition message before we add the item
				// to the inventory because then we'll end up losing the message before
				// it can be printed:
				var transMessage = current["items"][command[1]]["take"][current["items"][command[1]]["status"]];
				
				inventory_add(command[1], current["items"][command[1]], 1);
				message(transMessage);
				return false;
			} else if (command[1] in current["items"] && "messages" in current["items"][command[1]]["states"][current["items"][command[1]]["status"]] && "take" in current["items"][command[1]]["states"][current["items"][command[1]]["status"]]["messages"]) {
					message(current["items"][command[1]]["states"][current["items"][command[1]]["status"]]["messages"]["take"]);
					return false;
			} else {
				message("You can't take that.");
			}
			break;
		case "drop":
			if (command[1] in player["carrying"]) {
				inventory_remove(player["carrying"][command[1]]["name"], 1);
				current["items"][command[1]] = player["carrying"][command[1]];
				message("You drop the " + player["carrying"][command[1]]["name"] + ".");
				return false;
			}
		default:
			return true;
			break;
	}
	// if the verb matches a built-in but the other tests inside of it fail:
	return true;
}

function checkAction(command) {
	// check the room's possible actions
	if ("actions" in current && command[0] in current["actions"]) {
		// if the verb is in the room,
		// check if the verb can be applied to the specified object
		if (command[1] in current["actions"][command[0]]) {
			// implement any changes
			processChanges(current["actions"][command[0]][command[1]]);

			// print out a message, if there is one
			if ("print" in current["actions"][command[0]][command[1]]) {
				current["message"] = current["actions"][command[0]][command[1]]["print"];
				printer(current);
				return false;
			}
			// otherwise if the result is a move, go there:
			else if ("move" in current["actions"][command[0]][command[1]]) {
				nextMove(current["actions"][command[0]][command[1]]["move"]);
				return false;
			}
		}
		// check if the target of the action might be a synonym
		// ** direct objects and items are stored IN THE SAME SYNONYM GROUP **
		else {
			if (findSynonyms(command, "items")) {
				return false;
			}
		// (if findSynonyms returns true, that means it found a synonym
		// and we can stop looking)
		}
	}

	//check to see if the action verb is a synonym of a defined one:
	else {
		if (findSynonyms(command, "actions")) {
			return false;
		}
	}
	// if we made it here, we have to keep looking:
	return true;
}

function findSynonyms(command,category) {
	//"category" is what type of synonym we're looking for.
	//"searchPosition" is which word in the command we're trying
	//	  to replace.
	switch(category) {
		case "items":
			searchPosition = 1;
			break;
		case "actions":
			searchPosition = 0;
			break;
		default:
			console.log("Synonym search error: Unrecognized category specified.");
			break;
	}

	if ("synonyms" in current && category in current["synonyms"]) {
		//check the room:
		for (object in current["synonyms"][category]) {
			if (current["synonyms"][category][object].indexOf(command[searchPosition]) >= 0) {
				if (searchPosition === 0) {
					processCommand(object + " " + command[1]);
				}
				else {
				   processCommand(command[0] + " " + object);
				}
				return true;
			}
		}
	}
	//check the defaults:
	if(game["allow default synonyms"]) {
		for (object in defaultSynonyms[category]) {
			if (defaultSynonyms[category][object].indexOf(command[searchPosition]) >= 0) {
				if (searchPosition === 0) {
					processCommand(object + " " + command[1]);
				}
				else {
				   processCommand(command[0] + " " + object);
				}
				return true;
			}
		}
	}
	// if we didn't find a synonym
	return false;
}

function message(text) {
	current["message"] = text;
	printer(current);
}
function error(text) {
	var toPrint = {};
	toPrint["type"] = "error";
	toPrint["text"] = text;
	printer(toPrint);
}

function checkItems(command) {
	// if there are items in the room and the direct object is one of them
	if ("items" in current && command[1] in current["items"]) {
		// if the action can be taken against that item:
		if (command[0] in current["items"][command[1]]["states"]) {
			//if the item can be put into the proposed state from its current state:
			if (current["items"][command[1]]["status"] in current["items"][command[1]]["states"][command[0]]["from"]) {
				// if it meets any requirements:
				if (("requires" in current["items"][command[1]]["states"][command[0]] === false) || current["items"][command[1]]["states"][command[0]]["requires"] === command[2]) {
					// record what the transition message should be:
					transMessage = current["items"][command[1]]["states"][command[0]]["from"][current["items"][command[1]]["status"]];
					// (this has to be saved here because the state of the item is about
					//  to change, which will change all the messages around. We need
					//  the one in effect BEFORE the shift.)

					// if it has any changes associated with it:
					processChanges(current["items"][command[1]]["states"][command[0]]);

					// and switch to the new state:
					current["items"][command[1]]["status"] = command[0];

					// print the transition message from the old state:
					message(transMessage);

					return false;
				}
			}
		}
		// if the item state isn't found, check if it's a synonym of one
		// note: **item states are recorded in the same synonym group
		// as actions**
		if (findSynonyms(command, "actions")) {return false;}
		// check if the response is just a message:
		if ("messages" in current["items"][command[1]]["states"][current["items"][command[1]]["status"]] && command[0] in current["items"][command[1]]["states"][current["items"][command[1]]["status"]]["messages"]) {
			message(current["items"][command[1]]["states"][current["items"][command[1]]["status"]]["messages"][command[0]]);
			return false;
		}
	}
	// if the player referenced an item by a synonym:
	if (findSynonyms(command, "items")) {return false;}

	//if we have to keep looking:
	return true;
}

function commandInRoom(command) {
	var searching = true;
	// "searching" is used to keep track of whether or not a command
	// has been processed, to prevent it from getting accepted from
	// one section and rejected by another.

	//check the built-in commands:
	searching = checkBuiltIns(command);

	// check the room's possible actions:
	if (searching) {
		searching = checkAction(command);
	}
	// check the room's possible items:
	if (searching) {
		searching = checkItems(command);
	}

	// otherwise, you're SOL:
	if (searching) {
		error("Error: Invalid or impossible command.");
	}
}
//  **** end of processing commands in rooms

function commandInMenu(command) {
	var toPrint = {};
	command--;	//because the array starts at #0 but the option numbers start at 1
	if (command < current["choices"].length) { //make sure it's an option
		// if the player is supposed to move to a new location:
		if (current["choices"][command]["response type"] === "move") {
			// if the destination's description has to be changed:
			if ("description" in current["choices"][command]) {
				if (current["choices"][command]["destination"] in rooms) {
					rooms[current["choices"][command]["destination"]]["entrance text"] = current["choices"][command]["description"];
				}
				else if (current["choices"][command]["destination"] in menus) {
					menus[current["choices"][command]["destination"]]["description"] = current["choices"][command]["description"];
				}
			}

			// if there's a message to display before the move
			if ("premessage" in current["choices"][command]) {
				toPrint["text"] = current["choices"][command]["premessage"];
				toPrint["type"] = "premessage";
				toPrint["destination"] = current["choices"][command]["destination"];
				printer(toPrint);
			}
			else {
				nextMove(current["choices"][command]["destination"]);
			}
		}
	}
	else {
		error("Error: Choice out of bounds.");
	}
}

function singletonCommand(command) {
	// translates one-word shorthand commands into full ones
	switch(command) {
		case "l":
			processCommand("look around");
			break;
		case "i":
			processCommand("view inventory");
			break;
		default:
			processCommand("go " + command);
			break;
	}
}

function processCommand(command) {
	// if nothing is passed to the function, just grab the typed command:
	// will happen almost every time.
	// (when will this NOT happen? i never noted.)
	if (typeof command !== "string") {
		command = document.getElementById("command").value;
	}

	command = stripArticles(command).split(" ");
	// fix the array in case the command for some reason starts with a space:
	if (command[0] === "") {
		var j;
		for (j = 1; j < command.length; j++) {
			command[j-1] = command[j];
		}
	}
	
	switch (command.length) {
		case 1:
			if (current["type"] === "menu") {
				commandInMenu(command[0]);
			} else {
				singletonCommand(command[0]);
			}
			break;
		case 2:
			if (current["type"] === "room") {
				commandInRoom(command);
			} else {
				if (current["type"] === "menu") {
					commandInMenu(command);
				}
			}
			break;
		case 3:
			if (command[2] in player["carrying"] === false) {
				error("No " + command[2] + " in your inventory.");
			} else {
				if (current["type"] === "room") {
					commandInRoom(command);
				} else {
					if (current["type"] === "menu") {
						commandInMenu(command);
					}
				}
			}
			break;
		default:
			error("Command too long.");
			break;
	}
}

//******* printer functions:
function describeRoom(target) {
	// slap a headline on the top if there's one specified:
	if (target["title"] !== undefined) {
		newDescription = "<strong>" + target["title"] + "</strong><br>" + target["entrance text"];
	}
	else {
		newDescription = target["entrance text"];
	}

	// adding the descriptors of any objects in the room:
	for (var item in target["items"]) {
		if (target["items"][item]["states"][target["items"][item]["status"]]["descriptor"] !== "") {
			newDescription += "<br>" + target["items"][item]["states"][target["items"][item]["status"]]["descriptor"];
		}
	}

	// print out the exits
	if (game["print directions"]) {
		newDescription += "<ul>";
		for (var exit in target["exits"]) {
			newDescription += "<li>To the " + exit + " is ";
			//if there's a description specified in the room:
			if (target["exits"][exit].length > 1) {
				newDescription += target["exits"][exit][1];
			} else {
				newDescription += rooms[target["exits"][exit][0]]["name"];
			}

			newDescription += ".";
		}
		newDescription += "</ul>";
	}

	if ("prompt" in target) {
		printDescription({"newDescription" : newDescription, "newPrompt" : target["prompt"]});
	} else {
		printDescription({"newDescription" : newDescription});
	}
}

function describeMenu(target) {
	newDescription = "";
	if (target["type"] === "premessage") {
		newDescription = target["premessage"] + "<br><br>";
		if (target["destination"] in rooms) {
			target = rooms[target["destination"]];
		}
		else if (target["destination"] in menus) {
			target = menus[target["destination"]];
		}
	}

	// if the player is being sent to a menu:
	if (target["type"] === "menu") {
		// then add whatever the menu's full description is now:
		newDescription += target["description"];

		//lining up the menu's text
		// to print either way:
		newDescription += "<ol>";
		for (var i = 0; i < target["choices"].length; i++) {
			if (target["choices"][i] != undefined) {
				newDescription += "<li>" + target["choices"][i]["choice"];
			}
		}
		newDescription += "</ol>"; 
	}
	//if they're being sent to a room:
	else if (target["type"] === "room") {
		newDescription += target["entrance text"];
	}

	if ("prompt" in target) {
		printDescription({"newDescription" : newDescription, "newPrompt" : target["prompt"]});
	}
	else {
		printDescription({"newDescription" : newDescription});
	}
}

function printDescription(toPrint) {
	// print everything out (rooms *and* menus)
	if ("newPrompt" in toPrint) {
		newPrompt = detokenize(toPrint["newPrompt"]);
		document.getElementById("prompt").innerHTML = newPrompt;
	}

	//sub out variables in description:
	if ("newDescription" in toPrint) {
		newDescription = detokenize(toPrint["newDescription"]);
		document.getElementById("description").innerHTML = newDescription;

		if (game["allow text to speech"]) {
			console.log("TTS: " + game["allow text to speech"]);
			say(newDescription);
		}
		clearFields();
	}
}

function printer(target) {
	// print a message, if there is one, then forget it exists:
	if (target["message"] === undefined) {
		target["message"] = "";
	}
	document.getElementById("message").innerHTML = detokenize(target["message"]);
	target["message"] = "";
	// (this also serves an added bonus of erasing any leftover
	//  messages for when we print the next thing, whatever it is)

	switch(target["type"]) {
		case "premessage":
			nextMove(target["destination"]);
			document.getElementById("message").innerHTML = detokenize(target["text"]);
			break;
		case "error":
			clearFields();
			document.getElementById("error").innerHTML = target["text"];
			if (game["allow text to speech"]) {
				say(text);
			}
			break;
		case "room":
			describeRoom(target);
			break;
		case "menu":
			describeMenu(target);
			break;
		default:
			console.log("Printer error: Unrecognized type.");
			break;
	}
}

function nextMove(target) {
	currentLocation = target;
	// if it's a room:
	if (target in rooms) {
		processChanges(rooms[target]);
		current = rooms[target];
	}
	else if (target in menus) {
		processChanges(menus[target]);
		current = menus[target];
	}
	printer(current);
}

function processChanges(thing) {
	if ("changes" in thing) {
		for (i = 0; i < thing["changes"].length; i++) {
			change = thing["changes"][i];
			// determine if the new value
			// is just a value, or if it's a reference
			// to something elsewhere in the game:
			if (typeof change[change.length-1] === 'object' && "reference" in change[change.length-1]) {
				// grab the array that's stored in the "reference" object:
				result = change[change.length-1]["reference"];
				if (result[0] === "rooms") {
					switch(result.length) {
						case 3:
							finalValue = rooms[result[1]][result[2]];
							break;
						case 4:
							finalValue = rooms[result[1]][result[2]][result[3]];
							break;
						case 5:
							finalValue = rooms[result[1]][result[2]][result[3]][result[4]];
							break;
						case 6:
							finalValue = rooms[result[1]][result[2]][result[3]][result[4]][result[5]];
							break;
						case 7:
							finalValue = rooms[result[1]][result[2]][result[3]][result[4]][result[5]][result[6]];
							break;
						case 8:
							finalValue = rooms[result[1]][result[2]][result[3]][result[4]][result[5]][result[6]][result[7]];
							break;
						case 9:
							finalValue = rooms[result[1]][result[2]][result[3]][result[4]][result[5]][result[6]][result[7]][result[8]];
							break;
						default:
							console.log("Change-processing error: Unrecognized length of result reference.");
							break;
					}
				}
				else if (result[0] === "menus") {
					switch(result.length) {
						case 3:
							finalValue = menus[result[1]][result[2]];
							break;
						case 4:
							finalValue = menus[result[1]][result[2]][result[3]];
							break;
						case 5:
							finalValue = menus[result[1]][result[2]][result[3]][result[4]];
							break;
						case 6:
							finalValue = menus[result[1]][result[2]][result[3]][result[4]][result[5]];
							break;
						case 7:
							finalValue = menus[result[1]][result[2]][result[3]][result[4]][result[5]][result[6]];
							break;
						case 8:
							finalValue = menus[result[1]][result[2]][result[3]][result[4]][result[5]][result[6]][result[7]];
							break;
						case 9:
							finalValue = menus[result[1]][result[2]][result[3]][result[4]][result[5]][result[6]][result[7]][result[8]];
							break;
						default:
							console.log("Change-processing error: Unrecognized length of result reference.");
							break;
					}
				}
			} else {
				finalValue = change[change.length-1];
			}
			if (change[0] === "rooms") {
				switch(change.length) {
					case 4:
						rooms[change[1]][change[2]] = finalValue;
						console.log("Setting " + change[1] + " " + change[2] + " to " + change[3]);
						break;
					case 5:
						rooms[change[1]][change[2]][change[3]] = finalValue;
						break;
					case 6:
						rooms[change[1]][change[2]][change[3]][change[4]] = finalValue;
						break;
					case 7:
						rooms[change[1]][change[2]][change[3]][change[4]][change[5]] = finalValue;
						break;
					case 8:
						rooms[change[1]][change[2]][change[3]][change[4]][change[5]][change[6]] = finalValue;
						break;
					case 9:
						rooms[change[1]][change[2]][change[3]][change[4]][change[5]][change[6]][change[7]] = finalValue;
						break;
					default:
						console.log("Change-processing error: Unrecognized length.");
						break;
				}
			}
			else if (change[0] === "menus") {
				switch(change.length) {
					case 4:
						menus[change[1]][change[2]] = finalValue;
						break;
					case 5:
						menus[change[1]][change[2]][change[3]] = finalValue;
						break;
					case 6:
						menus[change[1]][change[2]][change[3]][change[4]] = finalValue;
						break;
					case 7:
						menus[change[1]][change[2]][change[3]][change[4]][change[5]] = finalValue;
						break;
					case 8:
						menus[change[1]][change[2]][change[3]][change[4]][change[5]][change[6]] = finalValue;
						break;
					case 9:
						menus[change[1]][change[2]][change[3]][change[4]][change[5]][change[6]][change[7]] = finalValue;
						break;
					default:
						console.log("Change-processing error: Unrecognized length.");
						break;
				}
			}
		}
	}
}

function clearFields() {
	document.getElementById("command").value = "";
	document.getElementById("error").innerHTML = "";
	document.getElementById("command").focus();
}

function inventory_add(name, item, qty) {
	// if the player already has one, add another:
	if (item["name"] in player["inventory"]) {
		player["inventory"][item["name"]] += qty;
		console.log("Adding " + qty + " to inventory for " + item["name"] + ".");
	}
	// otherwise add the entry:
	else {
		player["inventory"][item["name"]] = qty;
		console.log("Adding " + item["name"] + " to player inventory.");
	}

	// add the item to the "carrying" array:
	player["carrying"][name] = item;

	// and take it out of the room:
	for (var roomItem in current["items"]) {
		if (current["items"][roomItem]["id"] === item["id"]) {
			delete current["items"][roomItem];
		}
	}
}

function inventory_remove(name, qty) {
	console.log("Removing " + qty + " from inventory for " + name + ".");
	player["inventory"][name] -= qty;

	delete player["carrying"][name];
}

function print_inventory() {
	var toPrint = "<strong>Inventory</strong><br>";
	var hasItems = false;
	for (var item in player["inventory"]) {
		//if you have at least one of the thing:
		if (player["inventory"][item] > 0 ) {
			toPrint += item + " x " + player["inventory"][item] + "<br>";
			// player has at least one item
			hasItems = true;
		}
	}
	if(hasItems) {
		current["message"] = toPrint;
		printer(current);
	}
	else {
		toPrint = {
			"type" : "error",
			"text" : "Inventory empty."
		};
		printer(toPrint);
	}
}

// connect the code to the DOM, check if it's the code-testing page:
	// if we aren't doing a run through the unit tests:
if (document.getElementsByClassName("TESTRESULT").length === 0) {
	window.addEventListener("load", initialize);
}

document.getElementById("sendCommand").addEventListener("click", processCommand);