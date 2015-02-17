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
        var searching = true;
        // "searching" is used to keep track of whether or not a command
        // has been processed, to prevent it from getting accepted from
        // one section and rejected by another.
        if (command[0] ==  "go") {
            if (current["exits"][command[1]] != undefined) {
                searching = false;
                nextMove(current["exits"][command[1]]);
            }
        }
        if (command[0] == "view" && searching) {
            if (command[1] == "inventory") {
                searching = false;
                print_inventory();
            }
        }
        if (command[0] == "look" && searching) {
            if (command[1] == "around") {
                searching = false;
                printer(current); //just reprint the current location
            }
        }
        // check the room's possible actions
        if ("actions" in current && command[0] in current["actions"] && searching) {
            // if the verb is in the room,
            // check if the verb can be applied to the specified object
            if (command[1] in current["actions"][command[0]]) {
                // implement any changes
                if ("changes" in current["actions"][command[0]][command[1]]) {
                    for (i = 0; i < current["actions"][command[0]][command[1]]["changes"].length; i++) {
                        searching = false;
                        processChange(current["actions"][command[0]][command[1]]["changes"][i]);
                    }
                }
                // print out a message, if there is one
                if ("print" in current["actions"][command[0]][command[1]]) {
                    searching = false;
                    current["message"] = current["actions"][command[0]][command[1]]["print"];
                    printer(current);
                }
                // otherwise if the result is a move, go there:
                else if ("move" in current["actions"][command[0]][command[1]]) {
                    searching = false;
                    nextMove(current["actions"][command[0]][command[1]]["move"]);
                }
            }
            // check if the target of the action might be a synonym
            // ** direct objects and items are stored IN THE SAME SYNONYM GROUP **
            else if ("synonyms" in current && "items" in current["synonyms"]) {
                for (object in current["synonyms"]["items"]) {
                    if (current["synonyms"]["items"][object].indexOf(command[1]) >= 0) {
                        searching = false;
                        processCommand(command[0] + " " + object);
                    }
                }
            }
        }
        if ("synonyms" in current && "actions" in current["synonyms"] && searching) {
            // look in all the item synonym lists
            for (action in current["synonyms"]["actions"]) {
                // if the specified action is in a synonym list, swap it out for the
                // real name of the action and re-process the command:
                if (current["synonyms"]["actions"][action].indexOf(command[0]) >= 0) {
                    searching = false;
                    processCommand(action + " " + command[1]);
                }
            }
        }
        // if there are items in the room and the direct object is one of them
        if ("items" in current && command[1] in current["items"] && searching) {
            // if the action can be taken against that item:
            if (command[0] in current["items"][command[1]]["states"]) {
                //if the item can be put into the proposed state from its current state:
                if (current["items"][command[1]]["status"] in current["items"][command[1]]["states"][command[0]]["from"]) {
                    // record what the transition message should be:
                    transMessage = current["items"][command[1]]["states"][command[0]]["from"][current["items"][command[1]]["status"]];
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
                    // and switch to the new state:
                    current["items"][command[1]]["status"] = command[0];

                    // also, if it's "take," add it to inventory:
                    if (command[0] == "take") {
                        inventory_add(current["items"][command[1]]["name"], 1);
                    }
                    searching = false;

                    // print the transition message from the old state:
                    current["message"] = transMessage;
                    printer(current);
                    // (this gets printed after everything else because the 
                    // room's description gets re-printed when the message is
                    // displayed, so we have to make all the descriptive changes
                    // before it's printed. otherwise, we'll get stuck with
                    // things like "You smashed the pumpkin. There is a pumpkin here.")
                }
            }
            // if the action isn't found, check if it's a synonym of one:
            else if ("synonyms" in current && "item states" in current["synonyms"] && command[1] in current["synonyms"]["item states"]) {
                for (state in current["synonyms"]["item states"][command[1]]) {
                    if (current["synonyms"]["item states"][command[1]][state].indexOf(command[0]) >= 0) {
                        searching = false;
                        processCommand(state + " " + command[1]);
                    }
                }
            }
        }
        // if the player referenced an item by a synonym:
        if ("synonyms" in current && "items" in current["synonyms"] && searching) {
            // look in all the item synonym lists
            for (item in current["synonyms"]["items"]) {
                // if the specified item is in a synonym list, swap it out for the
                // real name of the item and re-process the command:
                if (current["synonyms"]["items"][item].indexOf(command[1]) >= 0) {
                    searching = false;
                    processCommand(command[0] + " " + item)
                }
            }
        }
        if (searching) {
            error("Error: Invalid or impossible command.");
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
    if (target["message"] === undefined) {
        target["message"] = "";
    }
    document.getElementById("message").innerHTML = target["message"];
    target["message"] = "";

    console.log("Printing description for " + target["name"]);
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
        if (game["print directions"]) {
            console.log("PRINTING DIRECTIONZ");
            newDescription += "<ul>";
            for (var exit in target["exits"]) {
                newDescription += "<li>To the " + exit + " is " + rooms[target["exits"][exit]]["name"] + ".";
            }
            newDescription += "</ul>";
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
        }
        //if they're being sent to a room:
        else if (target["type"] == "room") {
            newDescription += target["entrance text"];
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
        console.log("TTS: " + game["allow text to speech"]);
        say(newDescription);
    }

    clearFields();
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
    clearFields();
    document.getElementById("error").innerHTML = text;
    
    // read the error aloud if everything else is getting read:
    if (game["allow text to speech"]) {
        say(text);
    }
}


function clearFields() {
    document.getElementById("command").value = "";
    document.getElementById("error").innerHTML = "";
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
        current["message"] = toPrint;
        printer(current);
    }
    else {
        error("Inventory empty.");
    }
}

// connect the code to the DOM:
window.addEventListener("load", initialize);
document.getElementById("sendCommand").addEventListener("click", processCommand);