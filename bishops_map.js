function initialize() {
    document.getElementById("gameName").innerHTML = game["title"];
    newPrompt = "";
    newDescription = "";
    // to to wherever the gamedata says to start:
    nextMove(currentLocation);

    // either do the tests or start the game
    //    (defined in testing.js)
    runTests();
}

function processCommand(command) {
    // if nothing is passed to the function, just grab the typed command:
    // (will happen almost every time)
    if (typeof command !== "string") command = document.getElementById("command").value;
    
    //strip out the articles:
    var articles = [" the ", " a ", " an ", " to ", " at ", " on "];
    var i;    // loop iterator

    for (i = 0; i < articles.length; i++) {
        command = command.replace(articles[i], " ");
    }

    command = command.split(" ");
    // fix the array in case the command for some reason starts with a space:
    if (command[0] == "") {
        var j;
        for (j = 1; j < command.length; j++) {
            command[j-1] = command[j];
        }

    }
    if (current["type"] == "room") {
        if (command[0] ==  "go") {
            if (current["exits"][command[1]] != undefined) {
                nextMove(current["exits"][command[1]]);
            }
            else {
                error("You are unable to travel " + command[1]+".");
            }
        }
        else if (command[0] == "view") {
            if (command[1] == "inventory") {
                print_inventory();
            }
        }
        else if (command[0] == "look") {
            if (command[1] == "around") {
                printer(current); //just reprint the current location
            }
        }
        // check the room's possible actions
        else if ("actions" in current && command[0] in current["actions"]) {
            // check if the verb can be applied to the specified object
            if (command[1] in current["actions"][command[0]]) {
                if ("changes" in current["actions"][command[0]][command[1]]) {
                    for (i = 0; i < current["actions"][command[0]][command[1]]["changes"].length; i++) {
                        processChange(current["actions"][command[0]][command[1]]["changes"][i]);
                    }
                }
                // implement the specified consequences
                if ("print" in current["actions"][command[0]][command[1]]) {
                    message(current["actions"][command[0]][command[1]]["print"]);
                }
                else if ("move" in current["actions"][command[0]][command[1]]) {
                    nextMove(current["actions"][command[0]][command[1]]["move"]);
                }
            }
        }
        // if there are items in the room and the direct object is one of them
        else if ("items" in current && command[1] in current["items"]) {
            // if the action can be taken against that item:
            if (command[0] in current["items"][command[1]]["states"]) {
                //if the item can be put into the proposed state from its current state:
                if (current["items"][command[1]]["status"] in current["items"][command[1]]["states"][command[0]]["from"]) {
                    // print the transition message:
                    message(current["items"][command[1]]["states"][command[0]]["from"][current["items"][command[1]]["status"]]);
                    // if it has any changes associated with it:
                    if ("changes" in current["items"][command[1]]["states"][command[0]]) {
                        // if it has any changes coming from its current state into the new one:
                        if (current["items"][command[1]]["status"] in current["items"][command[1]]["states"][command[0]]["changes"]) {
                            //make all the changes:
                            for (i = 0; i < current["items"][command[1]]["states"][command[0]]["changes"][current["items"][command[1]]["status"]].length; i++) {
                                processChange(current["items"][command[1]]["states"][command[0]]["changes"][current["items"][command[1]]["status"]][i]);
                            }
                        }
                    }
                    // switch to the new state:
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
            // if the action isn't found, check if it's a synonym of one:
            else if ("synonyms" in current && "item states" in current["synonyms"]) {
                for (item in current["synonyms"]["item states"]) {
                    for (state in current["synonyms"]["item states"][item]) {
                        if (current["synonyms"]["item states"][item][state].indexOf(command[0]) >= 0) {
                            processCommand(state + " " + command[1]);
                        }
                    }
                }
            }

            else {
                error("You can't " + command[0] + " the " + command[1] + ".");
            }
        }
        // if the player referenced an item by a synonym:
        else if ("synonyms" in current && "items" in current["synonyms"]) {
            var unfound = true
            // look in all the item synonym lists
            for (item in current["synonyms"]["items"]) {
                // if the specified item is in a synonym list, swap it out for the
                // real name of the item and re-process the command:
                if (current["synonyms"]["items"][item].indexOf(command[1]) >= 0) {
                    processCommand(command[0] + " " + item)
                    var unfound = false
                }
            }
            //if we didn't find the item in any lis of synonyms:
            if (unfound) error("Sorry, unrecognized command: |" + command[0] + "|" + command[1] + "|");
        }
        else {
        	error("Sorry, unrecognized command: |" + command[0] + "|" + command[1] + "|");
        }
    }
    else if (current["type"] == "menu") {
        var toPrint = {};
        command--;    //because the array starts at #0 but the option numbers start at 1
        if (command < current["choices"].length) { //make sure it's an option
            // if the player is supposed to move to a new location:
            if (current["choices"][command]["response type"] == "move") {
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
                    toPrint["type"] = "premessage";
                    toPrint["premessage"] = current["choices"][command]["premessage"];
                    toPrint["destination"] = current["choices"][command]["destination"];
                    printer(toPrint);
                }
                else {
                	nextMove(current["choices"][command]["destination"]);
                }
            }
        }
    }
}

function printer(target) {
    var newDescription;
    if (target["type"] == "room") {
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
        var newPrompt = target["prompt"];

        // print out the exits
        newDescription += "<ul>";
        for (var exit in target["exits"]) {
            newDescription += "<li>To the " + exit + " is " + rooms[target["exits"][exit]]["name"] + ".";
        }
    }

    // if it's one of the menu response types:
    else if (["menu", "premessage"].indexOf(target["type"]) >= 0) {
        if (target["type"] == "premessage") {
            newDescription = target["premessage"] + "<br><br>";
            if (target["destination"] in rooms) {
            	target = rooms[target["destination"]];
            }
            else if (target["destination"] in menus) {
            	target = menus[target["destination"]];
            }
        }
        // if it's a regular menu:
        else {
            newDescription = "";
            newPrompt = target["prompt"];
        }

        // if the player is being sent to a menu:
        if (target["type"] == "menu") {
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
            printDirections("");    
        }
        //if they're being sent to a room:
        else if (target["type"] == "room") {
            newDescription += target["entrance text"];
            printDirections(target);
        }
    }

    // print everything out (rooms *and* menus)
    if (newPrompt != undefined) {
        // replace any variables in the strings
        for (var parameter in game) {
            newPrompt = newPrompt.replace("@"+parameter+"@",game[parameter]);
        }
        document.getElementById("prompt").innerHTML = newPrompt;
    }
    for (parameter in game) {
        newDescription = newDescription.replace("@"+parameter+"@",game[parameter]);
    }
    document.getElementById("description").innerHTML = newDescription;

    if (game["allow text to speech"]) {
        say(newDescription);
    }
    clearCommand();
    //clear the error box:
    error("");
    current = target;
}


function nextMove(target) {
    currentLocation = target;
    if (target in rooms) {
        if ("changes" in rooms[target]) {
            for (i = 0; i < rooms[target]["changes"].length; i++) {
                processChange(rooms[target]["changes"][i]);
            }
        }
        current = rooms[target];
    }
    else if (target in menus) {
        if ("changes" in menus[target]) {
            for (var i = 0; i < menus[target]["changes"].length; i++) {
                processChange(menus[target]["changes"][i]);
            }
        }
        current = menus[target];
    }
    printer(current);
}


function processChange(change) {
    if (change[0] == "rooms") {
        switch(change.length) {
            case 4:
                rooms[change[1]][change[2]] = change[3];
                break;
            case 5:
                rooms[change[1]][change[2]][change[3]] = change[4];
                break;
            case 6:
                rooms[change[1]][change[2]][change[3]][change[4]] = change[5];
                break;
            case 7:
                rooms[change[1]][change[2]][change[3]][change[4]][change[5]] = change[6];
                break;
            case 8:
                rooms[change[1]][change[2]][change[3]][change[4]][change[5]][change[6]] = change[7];
                break;
            default:
                console.log("Change-processing error: Unrecognized length.");
                break;
        }
    }
    else if (change[0] == "menus") {
        switch(change.length) {
            case 4:
                menus[change[1]][change[2]] = change[3];
                break;
            case 5:
                menus[change[1]][change[2]][change[3]] = change[4];
                break;
            case 6:
                menus[change[1]][change[2]][change[3]][change[4]] = change[5];
                break;
            case 7:
                menus[change[1]][change[2]][change[3]][change[4]][change[5]] = change[6];
                break;
            case 8:
                menus[change[1]][change[2]][change[3]][change[4]][change[5]][change[6]] = change[7];
                break;
            default:
                console.log("Change-processing error: Unrecognized length.");
                break;
        }
    }
}


function error(text) {
    document.getElementById("error").innerHTML = text;
    clearCommand();

    // read the error aloud if everything else is getting read:
    if (game["allow text to speech"]) {
        say(text);
    }
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
        console.log("Adding 1 to inventory for " + item + ".");
    }
    else {
        player["inventory"][item] = qty;
        console.log("Adding " + item + " to player inventory.");
    }
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
        message(toPrint);
    }
    else {
        error("Inventory empty.");
    }
}

// connect the code to the DOM:
window.addEventListener("load", initialize);
document.getElementById("button1").addEventListener("click", processCommand);