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

function detokenize(text) {
    for (parameter in game) {
        text = text.replace("@"+parameter+"@",game[parameter]);
    }
    return text;
}

//  **** start of processing commands in rooms
function stripArticles(command) {
    //strip out the articles:
    var articles = [" the ", " a ", " an ", " to ", " at ", " on "];
    var i;    // loop iterator

    for (i = 0; i < articles.length; i++) {
        command = command.replace(articles[i], " ");
    }

    return command;
}

function checkBuiltIns(command) {
    if (command[0] ==  "go") {
        if (current["exits"][command[1]] != undefined) {
            nextMove(current["exits"][command[1]]);
            return false;
        }
    }
    if (command[0] == "view") {
        if (command[1] == "inventory") {
            print_inventory();
            return false;
        }
    }
    if (command[0] == "look") {
        if (command[1] == "around") {
            printer(current); //just reprint the current location
            return false;
        }
        else if (command[1] in current['exits']) {
            toPrint = {
                "message" : "You look to the " + command[1] + ": " + rooms[current["exits"][command[1]]]["look"]
            };
            printer(toPrint);
            return false;
        }
    }

    //if we have to keep looking:
    return true;
}

function checkAction(command) {
    // check the room's possible actions
    if ("actions" in current && command[0] in current["actions"]) {
        // if the verb is in the room,
        // check if the verb can be applied to the specified object
        if (command[1] in current["actions"][command[0]]) {
            // implement any changes
            processChanges(current["actions"][command[0]][command[1]])

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
        else if (findSynonyms(command, "items")) return false;
        // (if findSynonyms returns true, that means it found a synonym
        // and we can stop looking)
    }

    //check to see if the action verb is a synonym of a defined one:
    else if (findSynonyms(command, "actions")) return false;

    // if we have to keep looking:
    else return true;
}

function findSynonyms(command,category) {
    //"category" is what type of synonym we're looking for.
    //"searchPosition" is which word in the command we're trying
    //      to replace.
    switch(category) {
        case "items":
            searchPosition = 1;
            break;
        case "actions":
            searchPosition = 0;
            break;
        case "item states":
            searchPosition = 0;
            break;
        default:
            console.log("Synonym search error: Unrecognized category specified.");
            break;
    }

    if ("synonyms" in current && category in current["synonyms"]) {
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
    // if we didn't find a synonym
    return false;
}

function checkItems(command) {
    // if there are items in the room and the direct object is one of them
    if ("items" in current && command[1] in current["items"]) {
        // if the action can be taken against that item:
        if (command[0] in current["items"][command[1]]["states"]) {
            //if the item can be put into the proposed state from its current state:
            if (current["items"][command[1]]["status"] in current["items"][command[1]]["states"][command[0]]["from"]) {
                // record what the transition message should be:
                transMessage = current["items"][command[1]]["states"][command[0]]["from"][current["items"][command[1]]["status"]];
                // (this has to be saved here because the state of the item is about
                //  to change, which will change all the messages around. We need
                //  the one in effect BEFORE the shift.)

                // if it has any changes associated with it:
                processChanges(current["items"][command[1]]["states"][command[0]])

                // and switch to the new state:
                current["items"][command[1]]["status"] = command[0];

                // also, if it's "take," add it to inventory:
                if (command[0] == "take") {
                    inventory_add(current["items"][command[1]]["name"], 1);
                }

                // print the transition message from the old state:
                current["message"] = transMessage;

                // and reprint the room, to make sure the changes are displayed:
                printer(current);

                return false;
            }
        }
        // if the action isn't found, check if it's a synonym of one:
        else if (findSynonyms(command, "item states")) return false;
    }
    // if the player referenced an item by a synonym:
    if (findSynonyms(command, "items")) return false;

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
    if (searching) searching = checkAction(command);

    // check the room's possible items:
    if (searching) searching = checkItems(command);

    // otherwise, you're SOL:
    if (searching) {
        toPrint = {
            "type" : "error",
            "text" : "Error: Invalid or impossible command."
        };
        printer(toPrint);
    }
}
//  **** end of processing commands in rooms

function commandInMenu(command) {
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
    else printer({"type" : "error", "text" : "Error: Choice out of bounds."});
}

function processCommand(command) {
    // if nothing is passed to the function, just grab the typed command:
    // will happen almost every time.
    // (when will this NOT happen? i never noted.)
    if (typeof command !== "string") command = document.getElementById("command").value;
    
    command = stripArticles(command);
    command = command.split(" ");
    // fix the array in case the command for some reason starts with a space:
    if (command[0] == "") {
        var j;
        for (j = 1; j < command.length; j++) {
            command[j-1] = command[j];
        }
    }

    if (current["type"] == "room") commandInRoom(command);
    else if (current["type"] == "menu") commandInMenu(command);
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
            newDescription += "<li>To the " + exit + " is " + rooms[target["exits"][exit]]["name"] + ".";
        }
        newDescription += "</ul>";
    }

    if ("prompt" in target) {
        printDescription({"newDescription" : newDescription, "newPrompt" : target["prompt"]});
    }
    else printDescription({"newDescription" : newDescription});
}

function describeMenu(target) {
    newDescription = "";
    if (target["type"] == "premessage") {
        newDescription = target["premessage"] + "<br><br>";
        if (target["destination"] in rooms) {
            target = rooms[target["destination"]];
        }
        else if (target["destination"] in menus) {
            target = menus[target["destination"]];
        }
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

    if ("prompt" in target) {
        printDescription({"newDescription" : newDescription, "newPrompt" : target["prompt"]});
    }
    else printDescription({"newDescription" : newDescription});
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
    document.getElementById("message").innerHTML = target["message"];
    target["message"] = "";
    // (this also serves an added bonus of erasing any leftover
    //  messages for when we print the next thing, whatever it is)

    switch(target["type"]) {
        case "error":
            clearFields();
            document.getElementById("error").innerHTML = target["text"];
            if (game["allow text to speech"]) say(text);
            break;
        case "room":
            describeRoom(target);
            break;
        case "premessage":
            describeMenu(target);
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
            if (change[0] == "rooms") {
                switch(change.length) {
                    case 4:
                        rooms[change[1]][change[2]] = change[3];
                        console.log("Setting " + change[1] + " " + change[2] + " to " + change[3]);
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
        toPrint = {
            "type" : "error",
            "text" : "Inventory empty."
        };
        printer(toPrint);
    }
}

// connect the code to the DOM:
window.addEventListener("load", initialize);
document.getElementById("sendCommand").addEventListener("click", processCommand);