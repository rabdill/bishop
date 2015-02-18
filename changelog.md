## v0.2
Released: n/a

### Breaking changes

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

* Transactional messages are now printed in a separate text box, rather than erasing the description of the current room.

* Players can now use the `look` command to get hints about what the scenery looks like in different directions.

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
