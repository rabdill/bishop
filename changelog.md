## v0.3
Released n/a

### Breaking changes
#### Item messages now depend on the state it's in
"messages" is no longer a top-level property of an item -- it's now a property that's listed alongside the potential states of the item, to allow for messages and descriptions to change when an item's state changes. `examine pumpkin` would elicit far different responses after you put it in the `smash` state, for example.

Before:
```json
"town square" : {
    ...
    "items" : {
        "pumpkin" : {
            "messages" : {
                "examine" : "It's big and round and beautiful!"
            },
            "states" : {
                "default" : {
                    "descriptor" : "There's a pumpkin here."
                },
                "smash" : {
                    "descriptor" : "There's a smushed-up gloppy pumpkin thing on the ground."
                }
            }
        }
    }
}
```
In the scenario above, if you `smash the pumpkin` and then `examine pumpkin`, the game would tell you that the smashed-up gloppy pumpkin thing was "big and round and beautiful!" The new way gets around that:
```json
"town square" : {
    ...
    "items" : {
        "pumpkin" : {
            "states" : {
                "default" : {
                    "descriptor" : "There's a pumpkin here.",
                    "messages" : {
                        "examine" : "It's big and round and beautiful!"
                    }
                },
                "smash" : {
                    "descriptor" : "There's a smushed-up gloppy pumpkin thing on the ground.",
                    "messages" : {
                        "examine" : "It's gross, there's just mush left now."
                    },
                }
            }
        }
    }
}
```

#### Specifying precise descriptions of exits
Previously, exits were described using the "name" parameter of whatever room was in that direction -- "To the west is the living room," for example. Now, authors can specify descriptions for rooms based on where the player is coming from, by a modification made to the "exits" property of rooms. For example, if you wanted to specify how that living room was described:
```json
"lobby" : {
    "name" : "lobby",
    "exits" : {
        "west" : ["living room","a big smelly living room, I think"]
    }
    ...
}
```
This will simplify the description of things that have contextual differences, like "steps leading upward" and "steps leading down to the kitchen." As a consequence, **authors must change all "exits" properties** so that the destination associated with a direction is an array instead of a string. In the above example, this is how it would have looked before:
```json
"lobby" : {
    "name" : "lobby",
    "exits" : {
        "west" : "living room"
    }
    ...
}
```
But now, *even if you don't want a custom description*, you need to wrap that "living room" specification like this:
```json
"lobby" : {
    "name" : "lobby",
    "exits" : {
        "west" : ["living room"]
    }
    ...
}
```

#### "take" properties for each status now contain an object
Previously, the "take" property that was set for objects was structured this way:
```
"items" : {
    "book" : {
        [...]
        "take" : {
            "default" : "You put the key in your pocket."
        }
    }
}
```
In this example, one of the book's properties was "take," which tells the engine that the item can be added the player's inventory. The "default" property inside of "take" signifies that the item can be taken when it's in the "default" state, and that "You put the key in your pocket." should be printed when it happens.

Now, however, it will be specified this way:
```
"items" : {
    "book" : {
        [...]
        "take" : {
            "default" : {"message" : "You put the key in your pocket."}
        }
    }
}
```
It adds another level of complexity, but it will allow more precise specification for things to happen when an item is taken:
```
"items" : {
    "book" : {
        [...]
        "take" : {
            "default" : {
                "message" : "You put the key in your pocket.",
                "changes" : ["room","foyer","items","book","states","default","messages","examine","There used to be a key hidden in here."]
            }
        }
    }
}
```

#### Using tools now extends to consumable items
As it stood in v0.2, this is how you would require an item be used to move an item between states:
```
[...]
"items" : {
    "pile" : {
        "name" : "pile of junk",
        "id" : "living room pile",
        "states" : {
            [...]
            "move" : {
                "descriptor" : "Trash and drywall is strewn around in front of the doorway.",
                "requires" : "shovel",
                "from" : {
                    "default" : "You slowly push your way through the junk, tossing the little stuff aside and shoving the big pieces with your foot. Soon, the doorway is opened up."
                }
            }
        }
    }
}
```

Now, however, the "requires" property should be passed an object instead of an item name. This way, you can specify items be used that are then *also removed from the player's inventory*. Like this:
```
[...]
"items" : {
    "stairs" : {
        "name" : "stairs",
        "id" : "broken stairs",
        "states" : {
            "default" : {
                "descriptor" : "",
                "messages" : {
                    "examine" : "They look stable, for the most part, but there's a hefty gap right in the middle that's going to keep you from climbing up... for now.",
                    "repair" : "It doesn't look tricky to repair, if you had something to bridge the gap..."
                }
            },
            "repair" : {
                "descriptor" : "Some beautiful, repaired steps are right here man, oh yeah.",
                "requires" : {
                    "item" : "wood",
                    "consumed" : true
                },
                "from" : {
                    "default" : "You lean one end of the plywood on the step and let it fall over the gap. It covers the gap perfectly."
                }
            }
        }
    }
}
```

### New features

* Authors no longer need to specify `"status" : "default"` when setting up new items in a room. It's now... the default. The same goes for setting `"type" : "room"` for rooms and `"type" : "menu"` for menus.

### Project progress

### Bug fixes


## v0.2
Released 28 Feb 2015

### Breaking changes

#### More specific implementation of "take" command
Players using the "take" command on an item will no longer be putting the item into a state called "take" -- instead, they will actually remove the item from the room in its current state, so that dropping it elsewhere will preserve its description.

Because of this, authors should avoid specifying "take" as a state, instead listing it as a property directly inside the item's entry in the room, like this:
```json
"town square": {
    ...
    "items" : {
        "pumpkin" : {
            "name" : "pumpkin",
            "status" : "default",
            "take" : {
                "default" : "You take the pumpkin."
            },
            "states" : {
                "default" : {
                    "descriptor" : "A large pumpkin sits by the door."
                },
                "smash" : {...}
            }
        }
    }
}
```

#### Item state synonyms
Synonyms for "item states" are no longer nested inside of an item for which they are a state. Whereas before you would need something like this:
```json
"synonyms" : {
    "item states" : {
        "frog" : {
            "pet" : ["tickle", "touch"]
        }
    }
}
```
Now, you can (and must) do this instead:
```json
"synonyms" : {
    "item states" : {
        "pet" : ["tickle", "touch"]
    }
}
```

### New features

* One-word commands and shortcuts (`i` for `view inventory`, `s` for `go south`, etc.) are now allowed.

* Items can now have responses associated with them that do not modify their state: `smell pumpkin`, for example, will no longer move "pumpkin" into a state called "smell." (Unless you want it to.) Authors can specify any response to any verb they want with this feature.

* Changes can now refer to values elsewhere in the game. For example: Instead of saying "set the entrance text of the lobby to 'This is the text!'," you can say "set the entrance text of the lobby to whatever the entrance text is of the third dungeon hallway."

* Transactional messages are now printed in a separate text box, rather than erasing the description of the current room.

* Players can now use the `look` command to get hints about what the scenery looks like in different directions.

* Players can now `drop` items that they've picked up.

* Authors can now dictate that certain actions can only be taken against an item if the player is carrying a particular item in inventory.

* Authors can turn off the feature that tells the player the exits from their current location.

### Project progress

* The early stages of basic unit testing have been implemented to allow developers working on the Bishop's Map codebase to make sure their code isn't introducing wonky side-effects.

* File organization has been improved to reduce the number of components required to get a game working.

* A minified version of bishops_map.js should now be available with each release.


### Bug fixes

* Default settings are actually set now, rather than being pretty much ignored.

* Printing now works right for transactional messages printed upon moving the player from a menu to a room.

* String substitution in transactional messages now works like it does in room descriptions.

## v0.1
Released: 15 Feb 2015

### New features

* Parser can recognize commands with two operative words ("talk to the man" === "talk man")
* Two room types: "room," for free-form use of the parser, and "menu," for multiple choice-based decision-making.
* Players can travel between rooms in any direction defined by the author.
* A player's options in a given room are defined by either "actions" or "items," which are elements that can be moved between states by referring to them with a verb.
* Authors can define synonyms for items, item states, actions, and the direct objects of actions.
* Players have an inventory, consisting of all the items they have picked up. (There is currently no use for inventory items or any way to act upon them.)
* Basic change-processing has been implemented, so that menu selections, taking actions, acting on an item, or entering rooms can trigger changes to any value stored elsewhere in the game.
* Basic speech synthesis and speech-to-text capabilities have been added, allowing Google Chrome users the ability to issue commands with their voice and hear descriptions of the rooms read aloud.
* Authors can "fast-forward" through a long series of test commands using *testing.js*
* Rooms can be given "headlines" to be displayed at the top of the 
* Error messages are displayed in a separate field from messages and descriptions.
* Transactional messages ("You pick up the gourd.") are displayed in the same text area in which rooms are described.
