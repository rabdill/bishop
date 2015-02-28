## v0.2
Released: n/a

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

* Items can now have responses associated with them that do not modify their state: `smell pumpkin`, for example, will no longer move "pumpkin" into a state called "smell." (Unless you want it to.) Authors can specify any response to any verb they want with this feature.

* Changes can now refer to values elsewhere in the game. For example: Instead of saying "set the entrance text of the lobby to 'This is the text!'," you can say "set the entrance text of the lobby to whatever the entrance text is of the third dungeon hallway."

* Transactional messages are now printed in a separate text box, rather than erasing the description of the current room.

* Players can now use the `look` command to get hints about what the scenery looks like in different directions.

* Players can now `drop` items that they've picked up.

* Authors can now dictate that certain actions can only be taken against an item if the player is carrying a particular item in inventory.

* Authors can turn off the feature that tells the player the exits from their current location.

### Project progress

* Basic unit testing has been implemented to allow developers working on the Bishop's Map codebase to make sure their code isn't introducing wonky side-effects.

* File organization has been improved to reduce the number of components required to get a game working.


### Bug fixes

* Default settings are actually set now, rather than being pretty much ignored.

## v0.1
Released: Feb. 15, 2015

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
