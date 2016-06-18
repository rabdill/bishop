## Nodes
`nodes` is a top-level variable that should be declared in your gamedata file. It should be an **array** of objects. Each object is a "node," which may be easier to think about as a "room." Properties:

### id (string) *
A unique identifier for the room. This is how you will reference the room from elsewhere (i.e. `room("foyer").entrance = ...`).

### title (string)
Optional. This is designed for use as a "headline" for a room, or a subtitle for a particular section of a world. If you're moving between rooms in a house, for example, you might make all of the rooms share a `title`, such as "Creepy yellow house," to help users keep track of where they are.

### name (string) *
This is how your room will be identified from elsewhere. For example, if you set `name` to be `"a dark closet"`, the room to the west of the closet will include the descriptor, `"To the east is a dark closet."` This does not have to be unique.

### type (string) *
Currently only `"room"` is available here; more to come.

### look (string)
The way the room is described if someone looks at it from a neighboring room that contains a way to get into the room. If you set `look` to `"The light flickers overhead. Looks like there's garbage all over the floor."`, then that's what will be printed if someone in the room to the west types `look east`.

### exits (object)
