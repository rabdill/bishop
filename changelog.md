## v0.1

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